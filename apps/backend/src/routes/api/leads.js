/**
 * Leads API Routes
 * Organization-scoped lead management
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import knex from '../../db/connection.js';
import { authenticate } from '../../middleware/auth.js';
import { getProvider } from '../../services/ai/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  source: z.string().default('manual'),
  deal_value: z.number().optional(),
});

/**
 * GET /api/leads
 * List leads scoped to current organization
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, source, stage, search } = req.query;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');
    const offset = (page - 1) * limit;

    let query = knex('leads').where('organization_id', orgId);

    // Apply filters
    if (source) {
      query = query.where('source', source);
    }

    if (search) {
      query = query.where((builder) => {
        builder.where('name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`)
          .orWhere('phone', 'like', `%${search}%`);
      });
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult.count);

    // Get leads with scores
    const leads = await query
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc')
      .select('leads.*');

    // Get AI scores for each lead
    const leadsWithScores = await Promise.all(
      leads.map(async (lead) => {
        const score = await knex('ai_scores')
          .where('lead_id', lead.id)
          .orderBy('created_at', 'desc')
          .first();

        return {
          id: Buffer.from(lead.id).toString('hex'),
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          deal_value: lead.deal_value,
          ai_score: score ? {
            score: score.score,
            reasoning: score.reasoning,
            priority: score.priority,
          } : null,
          created_at: lead.created_at,
        };
      })
    );

    res.json({
      data: leadsWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error('List leads error:', error);
    res.status(500).json({ error: 'Failed to list leads' });
  }
});

/**
 * GET /api/leads/:id
 * Get a single lead with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    const lead = await knex('leads')
      .where('id', Buffer.from(id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get AI score
    const score = await knex('ai_scores')
      .where('lead_id', lead.id)
      .orderBy('created_at', 'desc')
      .first();

    // Get messages
    const messages = await knex('messages')
      .where('lead_id', lead.id)
      .orderBy('created_at', 'desc')
      .limit(50);

    // Get events
    const events = await knex('lead_events')
      .where('lead_id', lead.id)
      .orderBy('timestamp', 'desc')
      .limit(50);

    // Get current stage
    const stage = await knex('lead_stages')
      .where('lead_id', lead.id)
      .where('is_current', true)
      .leftJoin('funnel_stages', 'lead_stages.stage_id', 'funnel_stages.id')
      .select('funnel_stages.*')
      .first();

    res.json({
      id: Buffer.from(lead.id).toString('hex'),
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      deal_value: lead.deal_value,
      ai_score: score ? {
        score: score.score,
        reasoning: score.reasoning,
        priority: score.priority,
      } : null,
      stage: stage ? {
        id: Buffer.from(stage.id).toString('hex'),
        name: stage.name,
        color: stage.color,
      } : null,
      messages: messages.map((m) => ({
        id: Buffer.from(m.id).toString('hex'),
        direction: m.direction,
        body: m.body,
        channel: m.channel,
        status: m.status,
        created_at: m.created_at,
      })),
      events: events.map((e) => ({
        id: Buffer.from(e.id).toString('hex'),
        event_type: e.event_type,
        payload: e.payload,
        timestamp: e.timestamp,
      })),
      created_at: lead.created_at,
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to get lead' });
  }
});

/**
 * POST /api/leads
 * Create a new lead
 */
router.post('/', async (req, res) => {
  try {
    const body = createLeadSchema.parse(req.body);
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    const result = await knex.transaction(async (trx) => {
      const leadId = uuidv4().replace(/-/g, '');

      // Create lead
      await trx('leads').insert({
        id: Buffer.from(leadId, 'hex'),
        organization_id: orgId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        deal_value: body.deal_value || null,
      });

      // Score the lead with AI
      const aiProvider = getProvider();
      const score = await aiProvider.scoreLead({
        id: leadId,
        ...body,
      });

      // Save AI score
      await trx('ai_scores').insert({
        id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
        lead_id: Buffer.from(leadId, 'hex'),
        organization_id: orgId,
        score: score.score,
        reasoning: score.reasoning,
        model_used: process.env.AI_PROVIDER || 'ollama',
      });

      // Create lead event
      await trx('lead_events').insert({
        id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
        lead_id: Buffer.from(leadId, 'hex'),
        organization_id: orgId,
        event_type: 'lead_created',
        payload: { source: body.source },
      });

      // Assign to first funnel stage
      const firstStage = await trx('funnel_stages')
        .where('organization_id', orgId)
        .orderBy('order')
        .first();

      if (firstStage) {
        await trx('lead_stages').insert({
          id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
          lead_id: Buffer.from(leadId, 'hex'),
          organization_id: orgId,
          stage_id: firstStage.id,
          is_current: true,
        });
      }

      return { leadId, score };
    });

    res.status(201).json({
      id: result.leadId,
      ...body,
      ai_score: result.score,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create lead error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
});

/**
 * POST /api/leads/:id/score
 * Re-score a lead with AI
 */
router.post('/:id/score', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    const lead = await knex('leads')
      .where('id', Buffer.from(id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const aiProvider = getProvider();
    const score = await aiProvider.scoreLead({
      id: Buffer.from(lead.id).toString('hex'),
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
    });

    // Save new score
    await knex('ai_scores').insert({
      id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
      lead_id: lead.id,
      organization_id: orgId,
      score: score.score,
      reasoning: score.reasoning,
      model_used: process.env.AI_PROVIDER || 'ollama',
    });

    res.json({
      lead_id: Buffer.from(lead.id).toString('hex'),
      score,
      scored_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Score lead error:', error);
    res.status(500).json({ error: 'Failed to score lead' });
  }
});

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');
    const { name, email, phone, deal_value, source, stage_id } = req.body;

    const lead = await knex('leads')
      .where('id', Buffer.from(id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await knex.transaction(async (trx) => {
      // Update lead details
      await trx('leads')
        .where('id', Buffer.from(id, 'hex'))
        .update({
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(deal_value !== undefined && { deal_value }),
          ...(source && { source }),
          updated_at: knex.fn.now(),
        });

      // Update stage if provided
      if (stage_id) {
        const stageBuffer = Buffer.from(stage_id, 'hex');
        // Update current stage to false
        await trx('lead_stages')
          .where('lead_id', Buffer.from(id, 'hex'))
          .update({ is_current: false });

        // Create new stage assignment
        await trx('lead_stages').insert({
          id: Buffer.from(require('crypto').randomUUID().replace(/-/g, ''), 'hex'),
          lead_id: Buffer.from(id, 'hex'),
          organization_id: orgId,
          stage_id: stageBuffer,
          is_current: true,
        });

        // Create event for stage change
        await trx('lead_events').insert({
          id: Buffer.from(require('crypto').randomUUID().replace(/-/g, ''), 'hex'),
          lead_id: Buffer.from(id, 'hex'),
          organization_id: orgId,
          event_type: 'stage_changed',
          payload: { new_stage_id: stage_id },
        });
      }
    });

    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    const lead = await knex('leads')
      .where('id', Buffer.from(id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await knex('leads')
      .where('id', Buffer.from(id, 'hex'))
      .del();

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
