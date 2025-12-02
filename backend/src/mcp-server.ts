#!/usr/bin/env node
/**
 * Support Orchestrator MCP Server
 * Stateless AI-powered customer support processing
 * 
 * Tools:
 * - process_support_ticket: Full AI pipeline (classify → knowledge → respond)
 * - classify_message: Classify a message without response generation
 * - get_customer_insights: Get customer history from memory
 * - add_knowledge: Add product documentation to knowledge base
 * - search_knowledge: Search product knowledge base
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as agent from './services/agent-stateless.js';
import 'dotenv/config';

// Create MCP server
const server = new Server(
  {
    name: 'support-orchestrator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schemas
const ProcessTicketSchema = z.object({
  message: z.string().describe('The customer support message to process'),
  customer_email: z.string().email().describe('The customer email address'),
  subject: z.string().optional().describe('Optional subject line'),
  workspace_id: z.string().optional().describe('Optional workspace ID for multi-tenant isolation'),
});

const ClassifyMessageSchema = z.object({
  message: z.string().describe('The message to classify'),
});

const GetCustomerInsightsSchema = z.object({
  email: z.string().email().describe('Customer email to look up'),
});

const AddKnowledgeSchema = z.object({
  title: z.string().describe('Title of the knowledge document'),
  content: z.string().describe('The content/body of the document'),
  category: z.enum(['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'])
    .describe('Category of the document'),
  tags: z.array(z.string()).optional().describe('Optional tags for better search'),
});

const SearchKnowledgeSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().optional().describe('Maximum number of results (default: 5)'),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'process_support_ticket',
        description: 'Process a customer support ticket through the full AI pipeline. Searches knowledge base, retrieves customer history, classifies the message, and generates a contextual response. Stateless - does not store tickets locally.',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'The customer support message to process' },
            customer_email: { type: 'string', description: 'The customer email address' },
            subject: { type: 'string', description: 'Optional subject line' },
            workspace_id: { type: 'string', description: 'Optional workspace ID for multi-tenant isolation' },
          },
          required: ['message', 'customer_email'],
        },
      },
      {
        name: 'classify_message',
        description: 'Classify a support message without generating a response. Returns category, urgency, sentiment, and reasoning.',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'The message to classify' },
          },
          required: ['message'],
        },
      },
      {
        name: 'get_customer_insights',
        description: 'Retrieve customer history and insights from memory.',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Customer email to look up' },
          },
          required: ['email'],
        },
      },
      {
        name: 'add_knowledge',
        description: 'Add a product knowledge document to the knowledge base. This helps the AI provide accurate, product-specific responses.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title of the document' },
            content: { type: 'string', description: 'The content of the document' },
            category: { 
              type: 'string', 
              enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'],
              description: 'Category of the document' 
            },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Optional tags for search' 
            },
          },
          required: ['title', 'content', 'category'],
        },
      },
      {
        name: 'search_knowledge',
        description: 'Search the product knowledge base for relevant information.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            category: { 
              type: 'string',
              enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'],
              description: 'Optional category filter'
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_knowledge',
        description: 'List all documents in the knowledge base.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_knowledge_templates',
        description: 'Get pre-built knowledge document templates for quick setup.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'process_support_ticket': {
        const parsed = ProcessTicketSchema.parse(args);
        const result = await agent.processTicket(
          parsed.message,
          parsed.customer_email,
          parsed.subject,
          parsed.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                ...result,
              }, null, 2),
            },
          ],
        };
      }

      case 'classify_message': {
        const parsed = ClassifyMessageSchema.parse(args);
        const result = await agent.classifyMessage(parsed.message);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                classification: result,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_customer_insights': {
        const parsed = GetCustomerInsightsSchema.parse(args);
        const result = await agent.getCustomerInsights(parsed.email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                insights: result,
              }, null, 2),
            },
          ],
        };
      }

      case 'add_knowledge': {
        const parsed = AddKnowledgeSchema.parse(args);
        const result = await agent.addKnowledge(parsed);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: !!result,
                message: result ? 'Knowledge document added successfully' : 'Failed to add document',
                document_id: result?.id,
              }, null, 2),
            },
          ],
        };
      }

      case 'search_knowledge': {
        const parsed = SearchKnowledgeSchema.parse(args);
        const result = await agent.searchKnowledgeBase(parsed.query, parsed.limit || 5);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                results: result || 'No matching documents found',
              }, null, 2),
            },
          ],
        };
      }

      case 'list_knowledge': {
        const result = await agent.listKnowledgeBase();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                documents: result,
                total: result.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_knowledge_templates': {
        const templates = agent.getKnowledgeTemplates();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                templates,
                total: templates.length,
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` }),
            },
          ],
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: errorMessage }),
        },
      ],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Support Orchestrator MCP Server running on stdio (stateless mode)');
}

main().catch(console.error);
