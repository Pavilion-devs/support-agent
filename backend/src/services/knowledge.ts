/**
 * Knowledge Base Service
 * Uses Letta's Archival Memory for storing and retrieving product knowledge
 * API Reference: https://docs.letta.com/guides/agents/archival-memory/
 */

const LETTA_BASE_URL = process.env.LETTA_BASE_URL || 'https://api.letta.com';
const LETTA_API_KEY = process.env.LETTA_API_KEY || '';

// Cache the agent ID
let cachedAgentId: string | null = null;

export interface KnowledgeDocument {
  id?: string;
  title: string;
  content: string;
  category: 'faq' | 'pricing' | 'features' | 'policies' | 'troubleshooting' | 'general';
  tags?: string[];
  created_at?: string;
}

interface ArchivalMemory {
  id: string;
  text: string;
  created_at: string;
}

interface ArchivalSearchResult {
  results: Array<{
    timestamp: string;
    content: string;
    tags: string[];
  }>;
  count: number;
}

async function lettaFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${LETTA_BASE_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${LETTA_API_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  console.log(`[LettaFetch] Requesting: ${options.method || 'GET'} ${url}`);
  console.log(`[LettaFetch] Auth Header: ${headers['Authorization'].substring(0, 20)}...`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Letta Knowledge API error: ${response.status}`, error);
    throw new Error(`Letta API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get the first available agent ID
 */
async function getAgentId(): Promise<string> {
  if (cachedAgentId) {
    return cachedAgentId;
  }

  try {
    const agents = await lettaFetch('/v1/agents', { method: 'GET' });
    
    if (agents && agents.length > 0) {
      cachedAgentId = agents[0].id;
      console.log(`Using Letta agent for knowledge: ${cachedAgentId}`);
      return cachedAgentId;
    }
    
    throw new Error('No Letta agents available');
  } catch (error) {
    console.error('Failed to get Letta agent:', error);
    throw error;
  }
}

/**
 * Store a knowledge document in Letta's archival memory
 */
export async function storeKnowledge(doc: KnowledgeDocument): Promise<{ id: string } | null> {
  console.log(`[Knowledge] Attempting to store document: "${doc.title}"`);
  console.log(`[Knowledge] LETTA_API_KEY present: ${!!LETTA_API_KEY}, length: ${LETTA_API_KEY.length}`);
  
  try {
    const agentId = await getAgentId();
    console.log(`[Knowledge] Using agent ID: ${agentId}`);
    
    // Format document for storage with clear markers
    const formattedContent = `[KNOWLEDGE_BASE | category: ${doc.category} | title: ${doc.title}${doc.tags?.length ? ` | tags: ${doc.tags.join(', ')}` : ''}]

${doc.content}`;

    console.log(`[Knowledge] Making POST request to archival-memory...`);
    const result = await lettaFetch(`/v1/agents/${agentId}/archival-memory`, {
      method: 'POST',
      body: JSON.stringify({ text: formattedContent }),
    });
    
    // API returns an array with the created memory
    const memory = Array.isArray(result) ? result[0] : result;
    console.log(`✓ Stored knowledge document: "${doc.title}" (${memory?.id || 'unknown'})`);
    return { id: memory?.id || 'stored' };
  } catch (error) {
    console.error('[Knowledge] Failed to store knowledge in Letta:', error);
    return null;
  }
}

/**
 * Search knowledge base for relevant information
 */
export async function searchKnowledge(query: string, limit = 5): Promise<string> {
  try {
    const agentId = await getAgentId();
    
    // Search with knowledge context
    const searchQuery = `KNOWLEDGE_BASE ${query}`;
    
    const result: ArchivalSearchResult = await lettaFetch(
      `/v1/agents/${agentId}/archival-memory/search?query=${encodeURIComponent(searchQuery)}&limit=${limit}`,
      { method: 'GET' }
    );
    
    if (!result.results || result.results.length === 0) {
      console.log('No knowledge found for query:', query);
      return '';
    }

    console.log(`Found ${result.count} knowledge entries for query: "${query}"`);
    
    // Format knowledge for AI context
    const knowledgeContext = result.results
      .map((r, i) => `[Knowledge ${i + 1}]\n${r.content}`)
      .join('\n\n---\n\n');

    return `Relevant Product Knowledge:\n${knowledgeContext}`;
  } catch (error) {
    console.error('Failed to search knowledge base:', error);
    return '';
  }
}

/**
 * Get all knowledge documents (for listing in UI)
 */
export async function listKnowledge(): Promise<KnowledgeDocument[]> {
  try {
    const agentId = await getAgentId();
    
    const result = await lettaFetch(
      `/v1/agents/${agentId}/archival-memory?limit=100`,
      { method: 'GET' }
    );
    
    const memories: ArchivalMemory[] = Array.isArray(result) ? result : [];
    
    // Filter to only knowledge base entries
    const knowledgeDocs = memories
      .filter(m => m.text.includes('[KNOWLEDGE_BASE'))
      .map(m => parseKnowledgeDocument(m));
    
    console.log(`Found ${knowledgeDocs.length} knowledge documents`);
    return knowledgeDocs;
  } catch (error) {
    console.error('Failed to list knowledge:', error);
    return [];
  }
}

/**
 * Parse a stored memory back into a KnowledgeDocument
 */
function parseKnowledgeDocument(memory: ArchivalMemory): KnowledgeDocument {
  const text = memory.text;
  
  // Extract metadata from the header line
  const headerMatch = text.match(/\[KNOWLEDGE_BASE \| category: (\w+) \| title: ([^|\]]+)(?:\| tags: ([^\]]+))?\]/);
  
  let category: KnowledgeDocument['category'] = 'general';
  let title = 'Untitled';
  let tags: string[] = [];
  let content = text;
  
  if (headerMatch) {
    category = headerMatch[1] as KnowledgeDocument['category'];
    title = headerMatch[2].trim();
    if (headerMatch[3]) {
      tags = headerMatch[3].split(',').map(t => t.trim());
    }
    // Content is everything after the header
    content = text.split(']\n\n')[1] || text;
  }
  
  return {
    id: memory.id,
    title,
    content,
    category,
    tags,
    created_at: memory.created_at,
  };
}

/**
 * Delete a knowledge document
 */
export async function deleteKnowledge(id: string): Promise<boolean> {
  try {
    const agentId = await getAgentId();
    
    await lettaFetch(`/v1/agents/${agentId}/archival-memory/${id}`, {
      method: 'DELETE',
    });
    
    console.log(`Deleted knowledge document: ${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete knowledge:', error);
    return false;
  }
}

// Pre-built knowledge templates for quick setup
export const knowledgeTemplates: KnowledgeDocument[] = [
  {
    title: 'Pricing Plans',
    category: 'pricing',
    tags: ['pricing', 'plans', 'subscription', 'cost'],
    content: `Twisky offers three pricing tiers:

**Starter (Free)**
- 100 AI responses/month
- Slack + Email channels
- 1 knowledge source
- Basic escalation

**Pro ($99/month)**
- Unlimited AI responses
- Slack, Email, WhatsApp support
- 5 knowledge sources
- Conversation summaries
- Priority support

**Enterprise (Custom)**
- Unlimited everything
- Custom integrations
- Advanced analytics
- Dedicated support manager
- SOC 2 + GDPR compliance

To upgrade: Go to Settings > Billing > Change Plan`
  },
  {
    title: 'How to Reset Password',
    category: 'troubleshooting',
    tags: ['password', 'reset', 'login', 'account'],
    content: `To reset your password:

1. Go to the login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for reset link (check spam folder)
5. Click the link and create a new password

Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one number

If you don't receive the email within 5 minutes, contact support.`
  },
  {
    title: 'Billing & Refund Policy',
    category: 'policies',
    tags: ['billing', 'refund', 'charges', 'subscription'],
    content: `**Billing Information:**
- Subscriptions are billed monthly on the anniversary of signup
- Invoices are sent via email 3 days before charge
- Payment methods: Credit card, PayPal, Bank transfer (Enterprise)

**Refund Policy:**
- Full refund within 14 days of first purchase
- Prorated refunds for annual plans cancelled mid-term
- No refunds for monthly plans after billing date
- Duplicate charges are refunded within 3-5 business days

**To request a refund:**
Contact billing@twisky.com with your account email and reason`
  },
  {
    title: 'Integration Setup',
    category: 'features',
    tags: ['integration', 'slack', 'whatsapp', 'email', 'setup'],
    content: `**Slack Integration:**
1. Go to Settings > Integrations > Slack
2. Click "Add to Slack"
3. Authorize Twisky in your workspace
4. Select the channel for escalations

**WhatsApp Integration (Pro+):**
1. Go to Settings > Integrations > WhatsApp
2. Connect your WhatsApp Business account
3. Verify your phone number
4. Configure auto-replies

**Email Integration:**
1. Go to Settings > Integrations > Email
2. Add forwarding address: support@yourcompany.twisky.com
3. Configure SMTP for outbound replies`
  }
];
