/**
 * Funnel Stages API Routes
 */

import { Router } from 'express';
import knex from '../../db/connection.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/funnel-stages
 * List all funnel stages for current organization
 */
router.get('/', async (req, res) => {
  try {
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    const stages = await knex('funnel_stages')
      .where('organization_id', orgId)
      .orderBy('order');

    res.json(stages.map((stage) => ({
      id: Buffer.from(stage.id).toString('hex'),
      name: stage.name,
      order: stage.order,
      color: stage.color,
      auto_action: stage.auto_action,
    })));
  } catch (error) {
    console.error('List funnel stages error:', error);
    res.status(500).json({ error: 'Failed to list funnel stages' });
  }
});

export default router;
