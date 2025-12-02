import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClassificationResult {
  category: 'billing' | 'technical' | 'account' | 'feature_request' | 'complaint' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  reasoning: string;
  key_entities: string[];
}

export async function classifyMessage(message: string, customerHistory?: string): Promise<ClassificationResult> {
  const systemPrompt = `You are an expert customer support classifier. Analyze the support message and return a JSON object with:
- category: one of "billing", "technical", "account", "feature_request", "complaint", "general"
- urgency: one of "low", "medium", "high", "critical"
- sentiment: one of "positive", "neutral", "negative", "frustrated"
- reasoning: brief explanation of your classification (1-2 sentences)
- key_entities: array of key topics/entities mentioned

${customerHistory ? `Customer history context:\n${customerHistory}` : ''}

Return ONLY valid JSON, no markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content) as ClassificationResult;
}

export interface ResponseGenerationParams {
  originalMessage: string;
  classification: ClassificationResult;
  customerHistory?: string;
  customerPreferences?: string;
  additionalContext?: string;
}

export async function generateResponse(params: ResponseGenerationParams): Promise<{
  response: string;
  tone: string;
  suggestedActions: string[];
}> {
  const systemPrompt = `You are a friendly, professional customer support agent for Twisky, a B2B AI-powered support platform. Generate a helpful response to the customer's message.

Guidelines:
- Be empathetic and professional
- Address the customer's concern directly
- Provide actionable next steps when applicable
- Keep responses concise but complete
- Match tone to the situation (more formal for complaints, friendly for general queries)

Classification context:
- Category: ${params.classification.category}
- Urgency: ${params.classification.urgency}
- Sentiment: ${params.classification.sentiment}

${params.customerHistory ? `Customer history:\n${params.customerHistory}` : ''}
${params.customerPreferences ? `Customer preferences:\n${params.customerPreferences}` : ''}
${params.additionalContext ? `Additional context:\n${params.additionalContext}` : ''}

Return JSON with:
- response: the customer-facing response text
- tone: the tone used (e.g., "empathetic", "professional", "friendly")
- suggestedActions: array of internal actions to take (e.g., "escalate to billing team", "send follow-up in 24h")

Return ONLY valid JSON, no markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: params.originalMessage }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content);
}

export async function generateInsightSummary(
  email: string,
  currentInteraction: string,
  previousSummary?: string
): Promise<string> {
  const systemPrompt = `You are an AI that maintains customer insight summaries. Given a new interaction, update or create a brief summary of the customer's profile.

Include:
- Key issues they've had
- Communication preferences observed
- Important details to remember
- Overall relationship status

Keep it concise (2-4 sentences max).

${previousSummary ? `Previous summary:\n${previousSummary}` : 'This is a new customer.'}

Return ONLY the updated summary text, no JSON or formatting.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Customer email: ${email}\n\nNew interaction:\n${currentInteraction}` }
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content || 'No summary available.';
}

