import { v4 as uuidv4 } from 'uuid';
import * as db from '../db.js';
import * as openai from './openai.js';
import * as letta from './letta.js';
import * as knowledge from './knowledge.js';

export interface ProcessTicketResult {
  ticket: db.Ticket;
  classification: openai.ClassificationResult;
  aiResponse: string;
  tone: string;
  suggestedActions: string[];
  customerContext: string;
  knowledgeContext: string;
  processingSteps: ProcessingStep[];
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  timestamp: string;
}

/**
 * Main agent pipeline - processes a support ticket end-to-end
 */
export async function processTicket(
  message: string,
  customerEmail: string,
  subject?: string
): Promise<ProcessTicketResult> {
  const ticketId = uuidv4();
  const processingSteps: ProcessingStep[] = [];

  const addStep = (step: string, status: ProcessingStep['status'], details?: string) => {
    const entry: ProcessingStep = {
      step,
      status,
      details,
      timestamp: new Date().toISOString(),
    };
    processingSteps.push(entry);
    db.addProcessingLog(ticketId, step, details || '');
    console.log(`[${ticketId}] ${step}: ${status}${details ? ` - ${details}` : ''}`);
    return entry;
  };

  // Step 1: Create ticket in database
  addStep('create_ticket', 'running', 'Initializing ticket record');
  const ticket = db.createTicket({
    id: ticketId,
    customer_email: customerEmail,
    subject,
    message,
  });
  addStep('create_ticket', 'completed', `Ticket ${ticketId} created`);

  // Step 2: Retrieve customer history from Letta + Local DB
  addStep('retrieve_memory', 'running', 'Searching for customer history');
  let customerContext = '';
  try {
    // First try Letta
    const lettaContext = await letta.getConversationContext(customerEmail);
    
    // Also get local ticket history
    const allTickets = db.getAllTickets(100);
    const customerTickets = allTickets.filter(t => t.customer_email === customerEmail && t.id !== ticketId);
    const localInsight = db.getCustomerInsight(customerEmail);
    
    // Build context from both sources
    if (customerTickets.length > 0) {
      const localHistory = customerTickets.slice(0, 5).map(t => 
        `- ${t.created_at}: ${t.classification} issue (${t.urgency} urgency) - "${t.subject || t.message.substring(0, 50)}..."`
      ).join('\n');
      customerContext = `Previous interactions (${customerTickets.length} found):\n${localHistory}`;
      if (localInsight?.history_summary) {
        customerContext += `\n\nProfile: ${localInsight.history_summary}`;
      }
      addStep('retrieve_memory', 'completed', `Found ${customerTickets.length} previous tickets`);
    } else if (lettaContext && !lettaContext.includes('No previous interactions')) {
      customerContext = lettaContext;
      addStep('retrieve_memory', 'completed', `Found context from Letta`);
    } else {
      customerContext = 'This appears to be a new customer with no previous interactions.';
      addStep('retrieve_memory', 'completed', 'No previous history found (new customer)');
    }
  } catch (error) {
    addStep('retrieve_memory', 'completed', 'No previous history found (new customer)');
    customerContext = 'This appears to be a new customer with no previous interactions.';
  }

  // Step 3: Search knowledge base for relevant product info
  addStep('search_knowledge', 'running', 'Searching product knowledge base');
  let knowledgeContext = '';
  try {
    const searchQuery = `${subject || ''} ${message}`.substring(0, 200);
    knowledgeContext = await knowledge.searchKnowledge(searchQuery);
    if (knowledgeContext) {
      addStep('search_knowledge', 'completed', 'Found relevant product documentation');
    } else {
      addStep('search_knowledge', 'completed', 'No matching knowledge found');
    }
  } catch (error) {
    addStep('search_knowledge', 'completed', 'Knowledge search skipped');
  }

  // Step 4: Classify the message using OpenAI
  addStep('classify_message', 'running', 'Analyzing message with OpenAI');
  const fullContext = `${customerContext}\n\n${knowledgeContext}`;
  const classification = await openai.classifyMessage(message, fullContext);
  addStep('classify_message', 'completed', 
    `Category: ${classification.category}, Urgency: ${classification.urgency}, Sentiment: ${classification.sentiment}`
  );

  // Step 4: Update ticket with classification
  db.updateTicket(ticketId, {
    classification: classification.category,
    urgency: classification.urgency,
    sentiment: classification.sentiment,
    reasoning: classification.reasoning,
    status: 'classified',
  });

  // Step 5: Generate AI response
  addStep('generate_response', 'running', 'Crafting personalized response');
  const responseResult = await openai.generateResponse({
    originalMessage: message,
    classification,
    customerHistory: customerContext,
    additionalContext: knowledgeContext, // Include knowledge base info
  });
  addStep('generate_response', 'completed', `Tone: ${responseResult.tone}`);

  // Step 6: Update ticket with response
  db.updateTicket(ticketId, {
    ai_response: responseResult.response,
    actions_taken: JSON.stringify(responseResult.suggestedActions),
    status: 'processed',
    processed_at: new Date().toISOString(),
  });

  // Step 7: Store insights in Letta for future reference
  addStep('store_memory', 'running', 'Saving insights to Letta Memory');
  try {
    const insightSummary = await openai.generateInsightSummary(
      customerEmail,
      `Subject: ${subject || 'N/A'}\nMessage: ${message}\nClassification: ${classification.category}\nResolution: ${responseResult.response.substring(0, 200)}`,
      customerContext !== 'This appears to be a new customer with no previous interactions.' ? customerContext : undefined
    );

    await letta.storeConversationSummary(
      ticketId,
      customerEmail,
      insightSummary,
      classification.category,
      responseResult.response.substring(0, 500)
    );
    addStep('store_memory', 'completed', 'Customer insights stored for future interactions');
  } catch (error) {
    addStep('store_memory', 'completed', 'Memory storage skipped (Letta unavailable)');
  }

  // Step 8: Update customer insights in local DB
  addStep('update_local_insights', 'running', 'Updating local customer profile');
  db.upsertCustomerInsight({
    email: customerEmail,
    history_summary: `Last interaction: ${classification.category} ticket (${classification.urgency} urgency)`,
  });
  addStep('update_local_insights', 'completed', 'Local profile updated');

  // Get final ticket state
  const finalTicket = db.getTicket(ticketId)!;

  return {
    ticket: finalTicket,
    classification,
    aiResponse: responseResult.response,
    tone: responseResult.tone,
    suggestedActions: responseResult.suggestedActions,
    customerContext,
    knowledgeContext: knowledgeContext || 'No knowledge base match',
    processingSteps,
  };
}

/**
 * Classify a message without full processing
 */
export async function classifyOnly(message: string): Promise<openai.ClassificationResult> {
  return openai.classifyMessage(message);
}

/**
 * Get customer insights from both local DB and Letta
 */
export async function getCustomerInsights(email: string): Promise<{
  local: db.CustomerInsight | null;
  memories: string;
  ticketHistory: db.Ticket[];
}> {
  const local = db.getCustomerInsight(email) || null;
  const memories = await letta.getConversationContext(email);
  
  // Get ticket history from local DB
  const allTickets = db.getAllTickets(100);
  const ticketHistory = allTickets.filter(t => t.customer_email === email);

  return {
    local,
    memories,
    ticketHistory,
  };
}

/**
 * Get processing logs for a ticket
 */
export function getTicketProcessingLogs(ticketId: string) {
  return db.getProcessingLogs(ticketId);
}

