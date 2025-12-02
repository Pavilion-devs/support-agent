import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { initializeDatabase } from './db.js';
import apiRoutes from './routes/api.js';
import * as agent from './services/agent-stateless.js';
import * as knowledge from './services/knowledge.js';
import * as letta from './services/letta.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', '*'], // Allow Verisense
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// MCP SSE Endpoint - Verisense connects here
app.get('/mcp', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  res.write(': connected\n\n');
  
  const tools = {
    jsonrpc: '2.0',
    id: null,
    result: {
      tools: [
        {
          name: 'process_support_ticket',
          description: 'Full AI pipeline: classify message, search knowledge, generate response',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Customer support message' },
              customer_email: { type: 'string', description: 'Customer email address' },
              subject: { type: 'string', description: 'Optional subject line' },
            },
            required: ['message', 'customer_email'],
          },
        },
        {
          name: 'classify_message',
          description: 'Classify a support message without generating response',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Message to classify' },
            },
            required: ['message'],
          },
        },
        {
          name: 'get_customer_insights',
          description: 'Get customer history and context from Letta Memory',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Customer email address' },
            },
            required: ['email'],
          },
        },
        {
          name: 'add_knowledge',
          description: 'Add product documentation to knowledge base',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              category: { type: 'string', enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'] },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'content', 'category'],
          },
        },
        {
          name: 'search_knowledge',
          description: 'Search product knowledge base',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['query'],
          },
        },
      ],
    },
  };
  
  res.write(`data: ${JSON.stringify(tools)}\n\n`);
  
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });
});

// MCP HTTP Endpoints for Verisense Network
app.post('/mcp/tools', async (req, res) => {
  try {
    const { tool, arguments: args } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: tool',
      });
    }

    let result;

    switch (tool) {
      case 'process_support_ticket':
        if (!args?.message || !args?.customer_email) {
          return res.status(400).json({
            success: false,
            error: 'Missing required arguments: message, customer_email',
          });
        }
        result = await agent.processTicket(
          args.message,
          args.customer_email,
          args.subject
        );
        break;

      case 'classify_message':
        if (!args?.message) {
          return res.status(400).json({
            success: false,
            error: 'Missing required argument: message',
          });
        }
        result = await agent.classifyMessage(args.message);
        break;

      case 'get_customer_insights':
        if (!args?.email) {
          return res.status(400).json({
            success: false,
            error: 'Missing required argument: email',
          });
        }
        result = await letta.getCustomerContext(args.email);
        break;

      case 'add_knowledge':
        if (!args?.title || !args?.content || !args?.category) {
          return res.status(400).json({
            success: false,
            error: 'Missing required arguments: title, content, category',
          });
        }
        result = await knowledge.storeKnowledge({
          title: args.title,
          content: args.content,
          category: args.category,
          tags: args.tags || [],
        });
        break;

      case 'search_knowledge':
        if (!args?.query) {
          return res.status(400).json({
            success: false,
            error: 'Missing required argument: query',
          });
        }
        result = await knowledge.searchKnowledge(args.query, args.limit || 5);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown tool',
          available_tools: [
            'process_support_ticket',
            'classify_message',
            'get_customer_insights',
            'add_knowledge',
            'search_knowledge',
          ],
        });
    }

    res.json({
      success: true,
      tool,
      result,
    });
  } catch (error) {
    console.error('MCP tool error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List available MCP tools
// Returns SSE if Accept header includes text/event-stream (for Verisense)
// Otherwise returns JSON (for testing)
app.get('/mcp/tools', (req, res) => {
  const acceptsSSE = req.headers.accept?.includes('text/event-stream');
  
  if (acceptsSSE) {
    // Return SSE for Verisense
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    res.write(': connected\n\n');
    
    const tools = {
      jsonrpc: '2.0',
      id: null,
      result: {
        tools: [
          {
            name: 'process_support_ticket',
            description: 'Full AI pipeline: classify message, search knowledge, generate response',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Customer support message' },
                customer_email: { type: 'string', description: 'Customer email address' },
                subject: { type: 'string', description: 'Optional subject line' },
              },
              required: ['message', 'customer_email'],
            },
          },
          {
            name: 'classify_message',
            description: 'Classify a support message without generating response',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Message to classify' },
              },
              required: ['message'],
            },
          },
          {
            name: 'get_customer_insights',
            description: 'Get customer history and context from Letta Memory',
            inputSchema: {
              type: 'object',
              properties: {
                email: { type: 'string', description: 'Customer email address' },
              },
              required: ['email'],
            },
          },
          {
            name: 'add_knowledge',
            description: 'Add product documentation to knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                category: { type: 'string', enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'] },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'content', 'category'],
            },
          },
          {
            name: 'search_knowledge',
            description: 'Search product knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                limit: { type: 'number' },
              },
              required: ['query'],
            },
          },
        ],
      },
    };
    
    res.write(`data: ${JSON.stringify(tools)}\n\n`);
    
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
    return;
  }
  
  // Return JSON for regular requests
  res.json({
    success: true,
    tools: [
      {
        name: 'process_support_ticket',
        description: 'Full AI pipeline: classify message, search knowledge, generate response',
        parameters: {
          message: { type: 'string', required: true, description: 'Customer support message' },
          customer_email: { type: 'string', required: true, description: 'Customer email address' },
          subject: { type: 'string', required: false, description: 'Optional subject line' },
        },
      },
      {
        name: 'classify_message',
        description: 'Classify a support message without generating response',
        parameters: {
          message: { type: 'string', required: true, description: 'Message to classify' },
        },
      },
      {
        name: 'get_customer_insights',
        description: 'Get customer history and context from Letta Memory',
        parameters: {
          email: { type: 'string', required: true, description: 'Customer email address' },
        },
      },
      {
        name: 'add_knowledge',
        description: 'Add product documentation to knowledge base',
        parameters: {
          title: { type: 'string', required: true },
          content: { type: 'string', required: true },
          category: { type: 'string', required: true, enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'] },
          tags: { type: 'array', required: false, items: { type: 'string' } },
        },
      },
      {
        name: 'search_knowledge',
        description: 'Search product knowledge base',
        parameters: {
          query: { type: 'string', required: true },
          limit: { type: 'number', required: false, default: 5 },
        },
      },
    ],
  });
});

// MCP SSE Endpoint for Verisense (Server-Sent Events)
// Verisense expects GET /mcp/tools to return text/event-stream
app.get('/mcp/tools', (req, res, next) => {
  // Check if client accepts SSE
  const acceptsSSE = req.headers.accept?.includes('text/event-stream');
  
  if (acceptsSSE) {
    // Return SSE format for Verisense
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial connection
    res.write(': connected\n\n');
    
    // Send tools list as SSE data
    const tools = {
      jsonrpc: '2.0',
      id: null,
      result: {
        tools: [
          {
            name: 'process_support_ticket',
            description: 'Full AI pipeline: classify message, search knowledge, generate response',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Customer support message' },
                customer_email: { type: 'string', description: 'Customer email address' },
                subject: { type: 'string', description: 'Optional subject line' },
              },
              required: ['message', 'customer_email'],
            },
          },
          {
            name: 'classify_message',
            description: 'Classify a support message without generating response',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Message to classify' },
              },
              required: ['message'],
            },
          },
          {
            name: 'get_customer_insights',
            description: 'Get customer history and context from Letta Memory',
            inputSchema: {
              type: 'object',
              properties: {
                email: { type: 'string', description: 'Customer email address' },
              },
              required: ['email'],
            },
          },
          {
            name: 'add_knowledge',
            description: 'Add product documentation to knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                category: { type: 'string', enum: ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'] },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'content', 'category'],
            },
          },
          {
            name: 'search_knowledge',
            description: 'Search product knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                limit: { type: 'number' },
              },
              required: ['query'],
            },
          },
        ],
      },
    };
    
    res.write(`data: ${JSON.stringify(tools)}\n\n`);
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
  } else {
    // Return JSON for regular requests (testing)
    next();
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Support Orchestrator API',
    version: '1.0.0',
    description: 'Autonomous Customer Support Agent powered by OpenAI and Letta Memory',
    endpoints: {
      'POST /api/tickets': 'Create and process a new support ticket',
      'GET /api/tickets': 'List all tickets',
      'GET /api/tickets/:id': 'Get ticket details with processing logs',
      'POST /api/classify': 'Classify a message without creating a ticket',
      'GET /api/customers/:email/insights': 'Get customer insights',
      'GET /api/analytics': 'Get analytics summary',
      'GET /api/health': 'Health check',
    },
    mcp: {
      note: 'MCP endpoints for Verisense Network',
      'POST /mcp/tools': 'Execute MCP tool',
      'GET /mcp/tools': 'List available MCP tools',
      tools: [
        'process_support_ticket',
        'classify_message',
        'get_customer_insights',
        'add_knowledge',
        'search_knowledge',
      ],
    },
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🤖 Support Orchestrator API Server                          ║
║                                                               ║
║   Server running at: http://localhost:${PORT}                   ║
║                                                               ║
║   Environment Checks:                                         ║
║   • LETTA_API_KEY: ${process.env.LETTA_API_KEY ? 'Set ✅' : 'Missing ❌'}              ║
║   • LETTA_BASE_URL: ${process.env.LETTA_BASE_URL || 'Default'}                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
