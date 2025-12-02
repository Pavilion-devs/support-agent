/**
 * Letta Memory Service
 * Uses Letta's Archival Memory API for storing and retrieving memories
 * API Reference: https://docs.letta.com/guides/agents/archival-memory/
 */

const LETTA_BASE_URL = process.env.LETTA_BASE_URL || 'https://api.letta.com';
const LETTA_API_KEY = process.env.LETTA_API_KEY || '';

// Cache the agent ID to avoid repeated lookups
let cachedAgentId: string | null = null;

interface ArchivalMemory {
  id: string;
  text: string;
  created_at: string;
  metadata?: Record<string, unknown>;
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
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LETTA_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Letta API error: ${response.status}`, error);
    throw new Error(`Letta API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get the first available agent ID (or create one if needed)
 */
async function getAgentId(): Promise<string> {
  if (cachedAgentId) {
    return cachedAgentId;
  }

  try {
    const agents = await lettaFetch('/v1/agents', { method: 'GET' });
    
    if (agents && Array.isArray(agents) && agents.length > 0 && agents[0]?.id) {
      const agentId = agents[0].id;
      if (typeof agentId === 'string') {
        cachedAgentId = agentId;
        console.log(`Using Letta agent: ${cachedAgentId}`);
        return cachedAgentId;
      }
    }
    
    throw new Error('No Letta agents available');
  } catch (error) {
    console.error('Failed to get Letta agent:', error);
    throw error;
  }
}

/**
 * Store a memory in Letta's archival memory
 */
export async function storeMemory(
  content: string,
  metadata?: Record<string, unknown>
): Promise<ArchivalMemory | null> {
  try {
    const agentId = await getAgentId();
    
    // Format content with metadata
    const formattedContent = metadata 
      ? `[${Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join(' | ')}]\n${content}`
      : content;
    
    const result = await lettaFetch(`/v1/agents/${agentId}/archival-memory`, {
      method: 'POST',
      body: JSON.stringify({ text: formattedContent }),
    });
    
    // API returns an array with the created memory
    const memory = Array.isArray(result) ? result[0] : result;
    console.log(`Stored memory in Letta archival: ${memory?.id || 'unknown'}`);
    return memory;
  } catch (error) {
    console.error('Failed to store memory in Letta:', error);
    return null;
  }
}

/**
 * Search archival memory for relevant content
 */
export async function searchMemories(
  query: string,
  limit = 5
): Promise<string[]> {
  try {
    const agentId = await getAgentId();
    
    const result: ArchivalSearchResult = await lettaFetch(
      `/v1/agents/${agentId}/archival-memory/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { method: 'GET' }
    );
    
    if (!result.results || result.results.length === 0) {
      return [];
    }

    return result.results.map(r => r.content);
  } catch (error) {
    console.error('Failed to search Letta memories:', error);
    return [];
  }
}

/**
 * Get all archival memories
 */
export async function getAllMemories(limit = 100): Promise<ArchivalMemory[]> {
  try {
    const agentId = await getAgentId();
    
    const result = await lettaFetch(
      `/v1/agents/${agentId}/archival-memory?limit=${limit}`,
      { method: 'GET' }
    );
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to get Letta memories:', error);
    return [];
  }
}

/**
 * Store a customer interaction summary
 */
export async function storeCustomerInteraction(
  customerEmail: string,
  ticketId: string,
  summary: string,
  classification: string,
  resolution: string
): Promise<ArchivalMemory | null> {
  const content = `Customer Interaction Summary:
Customer: ${customerEmail}
Ticket ID: ${ticketId}
Category: ${classification}
Summary: ${summary}
Resolution: ${resolution}
Date: ${new Date().toISOString()}`;

  return storeMemory(content, {
    type: 'customer_interaction',
    customer: customerEmail,
    ticket_id: ticketId,
    classification,
  });
}

/**
 * Get customer context from previous interactions
 */
export async function getCustomerContext(customerEmail: string): Promise<string> {
  try {
    const memories = await searchMemories(`customer ${customerEmail}`, 5);
    
    if (memories.length === 0) {
      return 'No previous interactions found for this customer.';
    }

    return `Previous customer interactions (${memories.length} found):\n${memories.map((m, i) => `[${i + 1}] ${m}`).join('\n\n')}`;
  } catch (error) {
    console.error('Error getting customer context:', error);
    return 'Unable to retrieve customer history.';
  }
}

/**
 * Delete a memory from archival
 */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  try {
    const agentId = await getAgentId();
    
    await lettaFetch(`/v1/agents/${agentId}/archival-memory/${memoryId}`, {
      method: 'DELETE',
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete memory:', error);
    return false;
  }
}

/**
 * Check if Letta is configured and available
 */
export async function checkLettaHealth(): Promise<boolean> {
  if (!LETTA_API_KEY) {
    console.warn('Letta not configured - API key missing');
    return false;
  }

  try {
    await getAgentId();
    return true;
  } catch {
    console.warn('Letta health check failed');
    return false;
  }
}
