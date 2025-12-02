/**
 * Stateless Agent Service
 * Pure AI processing without database dependencies
 * Designed for MCP server deployment
 */

import * as openai from './openai.js';
import * as letta from './letta.js';
import * as knowledge from './knowledge.js';

export interface ProcessingStep {
  step: string;
  status: 'completed' | 'error';
  details?: string;
  timestamp: string;
}

export interface TicketProcessingResult {
  classification: {
    category: string;
    urgency: string;
    sentiment: string;
    reasoning: string;
    key_entities: string[];
  };
  response: {
    text: string;
    tone: string;
    suggested_actions: string[];
  };
  context: {
    customer_history: string;
    knowledge_used: string;
  };
  processing_steps: ProcessingStep[];
}

/**
 * Process a support ticket - stateless version
 * Returns AI classification and response without storing anything locally
 */
export async function processTicket(
  message: string,
  customerEmail: string,
  subject?: string,
  workspaceId?: string // Optional workspace ID for multi-tenant Letta isolation
): Promise<TicketProcessingResult> {
  const processingSteps: ProcessingStep[] = [];

  const addStep = (step: string, details?: string) => {
    processingSteps.push({
      step,
      status: 'completed',
      details,
      timestamp: new Date().toISOString(),
    });
  };

  // Step 1: Search knowledge base for relevant product info
  addStep('search_knowledge', 'Searching product knowledge base');
  let knowledgeContext = '';
  try {
    // Extract key topics from message for better search
    const searchQuery = `${subject || ''} ${message}`.substring(0, 200);
    knowledgeContext = await knowledge.searchKnowledge(searchQuery);
    if (knowledgeContext) {
      addStep('knowledge_found', `Found relevant product documentation`);
    }
  } catch (error) {
    addStep('knowledge_search_failed', 'No knowledge base results');
  }

  // Step 2: Retrieve customer history from Letta
  addStep('retrieve_memory', 'Searching for customer history');
  let customerHistory = '';
  try {
    customerHistory = await letta.getCustomerContext(customerEmail);
    addStep('memory_retrieved', customerHistory.includes('No previous') 
      ? 'New customer' 
      : 'Found customer history');
  } catch (error) {
    customerHistory = 'No previous interactions found.';
    addStep('memory_not_found', 'New customer');
  }

  // Step 3: Classify the message
  addStep('classify_message', 'Analyzing with AI');
  const classification = await openai.classifyMessage(
    message, 
    `${customerHistory}\n\n${knowledgeContext}`
  );
  addStep('classification_complete', 
    `Category: ${classification.category}, Urgency: ${classification.urgency}`
  );

  // Step 4: Generate response with knowledge context
  addStep('generate_response', 'Crafting response');
  const responseResult = await openai.generateResponse({
    originalMessage: message,
    classification,
    customerHistory,
    additionalContext: knowledgeContext, // Include knowledge base info
  });
  addStep('response_generated', `Tone: ${responseResult.tone}`);

  // Step 5: Store interaction in Letta for future reference
  addStep('store_memory', 'Saving to memory');
  try {
    const summary = `Customer: ${customerEmail}\n${subject || 'Support ticket'}: ${classification.category} issue (${classification.urgency}). Resolution: ${responseResult.response.substring(0, 200)}...`;
    await letta.storeMemory(summary, {
      customer_email: customerEmail,
      classification: classification.category,
      urgency: classification.urgency,
      workspace_id: workspaceId,
    });
    addStep('memory_stored', 'Interaction saved for future reference');
  } catch (error) {
    addStep('memory_store_failed', 'Memory storage skipped');
  }

  return {
    classification: {
      category: classification.category,
      urgency: classification.urgency,
      sentiment: classification.sentiment,
      reasoning: classification.reasoning,
      key_entities: classification.key_entities,
    },
    response: {
      text: responseResult.response,
      tone: responseResult.tone,
      suggested_actions: responseResult.suggestedActions,
    },
    context: {
      customer_history: customerHistory,
      knowledge_used: knowledgeContext ? 'Yes - product documentation referenced' : 'No knowledge base match',
    },
    processing_steps: processingSteps,
  };
}

/**
 * Classify a message only - no response generation
 */
export async function classifyMessage(message: string): Promise<openai.ClassificationResult> {
  // Try to find relevant knowledge for better classification
  let context = '';
  try {
    context = await knowledge.searchKnowledge(message.substring(0, 200));
  } catch (e) {
    // Ignore knowledge search errors
  }
  
  return openai.classifyMessage(message, context);
}

/**
 * Get customer insights from Letta
 */
export async function getCustomerInsights(email: string): Promise<{
  history: string;
  interaction_count: number;
}> {
  const history = await letta.getCustomerContext(email);
  const isNew = history.includes('No previous');
  
  return {
    history,
    interaction_count: isNew ? 0 : -1, // -1 means "has history but count unknown"
  };
}

/**
 * Store knowledge document
 */
export async function addKnowledge(doc: {
  title: string;
  content: string;
  category: 'faq' | 'pricing' | 'features' | 'policies' | 'troubleshooting' | 'general';
  tags?: string[];
}) {
  return knowledge.storeKnowledge(doc);
}

/**
 * Search knowledge base
 */
export async function searchKnowledgeBase(query: string, limit?: number) {
  return knowledge.searchKnowledge(query, limit);
}

/**
 * List all knowledge documents
 */
export async function listKnowledgeBase() {
  return knowledge.listKnowledge();
}

/**
 * Get knowledge templates for quick setup
 */
export function getKnowledgeTemplates() {
  return knowledge.knowledgeTemplates;
}

