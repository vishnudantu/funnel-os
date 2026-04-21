/**
 * Leads API Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { getProvider } from '../../services/ai/index.js';

const router = Router();

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  source: z.string().default('manual'),
});

/**
 * GET /api/leads
 * List all leads with optional filtering
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, source, stage, search } = req.query;

  try {
    // In production, query from database
    res.json({
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leads/:id
 * Get a single lead with full details
 */
router.get('/:id', async (req, res) => {
  try {
    res.json({
      id: req.params.id,
      name: 'Sample Lead',
      email: 'lead@example.com',
      phone: '+1234567890',
      source: 'website',
      ai_score: null,
      messages: [],
      events: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/leads
 * Create a new lead
 */
router.post('/', async (req, res) => {
  try {
    const body = createLeadSchema.parse(req.body);

    // Score the lead with AI
    const aiProvider = getProvider();
    const score = await aiProvider.scoreLead(body);

    res.status(201).json({
      id: 'uuid-here',
      ...body,
      ai_score: score,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * POST /api/leads/:id/score
 * Re-score a lead with AI
 */
router.post('/:id/score', async (req, res) => {
  try {
    const aiProvider = getProvider();

    // In production, fetch lead from DB first
    const lead = {
      id: req.params.id,
      name: 'Sample Lead',
      email: 'lead@example.com',
      phone: '+1234567890',
      source: 'website',
    };

    const score = await aiProvider.scoreLead(lead);

    res.json({
      lead_id: req.params.id,
      score,
      scored_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
