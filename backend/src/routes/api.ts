import { Router, Request, Response } from 'express';
import * as agent from '../services/agent.js';
import * as db from '../db.js';
import * as knowledge from '../services/knowledge.js';

const router = Router();

/**
 * POST /api/tickets
 * Create and process a new support ticket
 */
router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const { message, customer_email, subject } = req.body;

    if (!message || !customer_email) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: message and customer_email',
      });
      return;
    }

    const result = await agent.processTicket(message, customer_email, subject);

    res.json({
      success: true,
      data: {
        ticket: result.ticket,
        classification: result.classification,
        ai_response: result.aiResponse,
        tone: result.tone,
        suggested_actions: result.suggestedActions,
        customer_context: result.customerContext,
        processing_steps: result.processingSteps,
      },
    });
  } catch (error) {
    console.error('Error processing ticket:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process ticket',
    });
  }
});

/**
 * GET /api/tickets
 * List all tickets with optional filters
 */
router.get('/tickets', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string | undefined;

    let tickets: db.Ticket[];
    if (status) {
      tickets = db.getTicketsByStatus(status);
    } else {
      tickets = db.getAllTickets(limit);
    }

    res.json({
      success: true,
      data: tickets,
      total: tickets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
    });
  }
});

/**
 * GET /api/tickets/:id
 * Get a specific ticket with processing logs
 */
router.get('/tickets/:id', (req: Request, res: Response) => {
  try {
    const ticket = db.getTicket(req.params.id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
      return;
    }

    const processingLogs = db.getProcessingLogs(req.params.id);

    res.json({
      success: true,
      data: {
        ticket,
        processing_logs: processingLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
    });
  }
});

/**
 * POST /api/classify
 * Classify a message without creating a ticket
 */
router.post('/classify', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: message',
      });
      return;
    }

    const classification = await agent.classifyOnly(message);

    res.json({
      success: true,
      data: classification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to classify message',
    });
  }
});

/**
 * GET /api/customers/:email/insights
 * Get customer insights from memory
 */
router.get('/customers/:email/insights', async (req: Request, res: Response) => {
  try {
    const insights = await agent.getCustomerInsights(req.params.email);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer insights',
    });
  }
});

/**
 * GET /api/analytics
 * Get analytics summary
 */
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const analytics = db.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
});

/**
 * GET /api/knowledge
 * List all knowledge documents
 */
router.get('/knowledge', async (req: Request, res: Response) => {
  try {
    const docs = await knowledge.listKnowledge();
    res.json({
      success: true,
      data: docs,
      total: docs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base',
    });
  }
});

/**
 * POST /api/knowledge
 * Add a new knowledge document
 */
router.post('/knowledge', async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: title, content, category',
      });
      return;
    }

    const validCategories = ['faq', 'pricing', 'features', 'policies', 'troubleshooting', 'general'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
      return;
    }

    const result = await knowledge.storeKnowledge({
      title,
      content,
      category,
      tags: tags || [],
    });

    res.json({
      success: !!result,
      data: result,
      message: result ? 'Knowledge document added successfully' : 'Failed to add document',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add knowledge document',
    });
  }
});

/**
 * POST /api/knowledge/search
 * Search the knowledge base
 */
router.post('/knowledge/search', async (req: Request, res: Response) => {
  try {
    const { query, category } = req.body;

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: query',
      });
      return;
    }

    const results = await knowledge.searchKnowledge(query, category);

    res.json({
      success: true,
      data: results || 'No matching documents found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search knowledge base',
    });
  }
});

/**
 * DELETE /api/knowledge/:id
 * Delete a knowledge document
 */
router.delete('/knowledge/:id', async (req: Request, res: Response) => {
  try {
    const success = await knowledge.deleteKnowledge(req.params.id);

    res.json({
      success,
      message: success ? 'Document deleted' : 'Failed to delete document',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
});

/**
 * GET /api/knowledge/templates
 * Get pre-built knowledge templates
 */
router.get('/knowledge/templates', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: knowledge.knowledgeTemplates,
  });
});

/**
 * POST /api/knowledge/templates/install
 * Install all pre-built templates
 */
router.post('/knowledge/templates/install', async (req: Request, res: Response) => {
  try {
    const results = await Promise.all(
      knowledge.knowledgeTemplates.map(template => knowledge.storeKnowledge(template))
    );

    const successCount = results.filter(r => r !== null).length;

    res.json({
      success: true,
      message: `Installed ${successCount} of ${knowledge.knowledgeTemplates.length} templates`,
      installed: successCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to install templates',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;

