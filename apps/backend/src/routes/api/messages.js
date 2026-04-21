/**
 * Messages API Routes
 * WhatsApp and other channel messaging
 * Organization-scoped
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

const sendMessageSchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(['whatsapp', 'sms', 'email']),
  body: z.string().min(1).max(1600),
});

/**
 * GET /api/messages
 * List messages for a lead (scoped to organization)
 */
router.get('/', async (req, res) => {
  const { lead_id, limit = 50 } = req.query;
  const orgId = Buffer.from(req.auth.organizationId, 'hex');

  if (!lead_id) {
    return res.status(400).json({ error: 'lead_id required' });
  }

  try {
    // Verify lead belongs to org
    const lead = await knex('leads')
      .where('id', Buffer.from(lead_id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const messages = await knex('messages')
      .where('lead_id', lead.id)
      .where('organization_id', orgId)
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .select('*');

    res.json({
      messages: messages.map((m) => ({
        id: Buffer.from(m.id).toString('hex'),
        lead_id: lead_id,
        channel: m.channel,
        direction: m.direction,
        body: m.body,
        status: m.status,
        sent_at: m.sent_at,
        created_at: m.created_at,
      })),
      pagination: {
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ error: 'Failed to list messages' });
  }
});

/**
 * POST /api/messages/send
 * Send a message via configured channel
 */
router.post('/send', async (req, res) => {
  try {
    const { lead_id, channel, body } = sendMessageSchema.parse(req.body);
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    // Verify lead belongs to org
    const lead = await knex('leads')
      .where('id', Buffer.from(lead_id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (channel === 'whatsapp') {
      // Send via WhatsApp Cloud API
      const result = await sendWhatsAppMessage(lead, body, orgId);
      return res.json(result);
    }

    res.status(400).json({ error: `Channel ${channel} not configured` });
  } catch (error) {
    console.error('Send message error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
});

/**
 * POST /api/messages/draft
 * Draft a message using AI
 */
router.post('/draft', async (req, res) => {
  try {
    const { lead_id, context } = req.body;
    const orgId = Buffer.from(req.auth.organizationId, 'hex');

    if (!lead_id) {
      return res.status(400).json({ error: 'lead_id required' });
    }

    // Fetch lead from DB
    const lead = await knex('leads')
      .where('id', Buffer.from(lead_id, 'hex'))
      .where('organization_id', orgId)
      .first();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const provider = getProvider();
    const draft = await provider.draftMessage(
      {
        id: lead_id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
      },
      context
    );

    res.json({
      draft,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Draft message error:', error);
    res.status(500).json({ error: 'Failed to draft message' });
  }
});

/**
 * Send WhatsApp message via Cloud API
 * @param {Object} lead - Lead object
 * @param {string} body - Message body
 * @param {Buffer} orgId - Organization ID buffer
 */
async function sendWhatsAppMessage(lead, body, orgId) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  let messageRecord;

  try {
    // Create message record (pending)
    const messageId = uuidv4().replace(/-/g, '');
    await knex('messages').insert({
      id: Buffer.from(messageId, 'hex'),
      lead_id: lead.id,
      organization_id: orgId,
      channel: 'whatsapp',
      direction: 'outbound',
      body,
      status: 'pending',
    });

    // Call WhatsApp API (mock for now)
    const whatsappResult = {
      success: true,
      message_id: 'wamid_' + Date.now(),
      status: 'sent',
    };

    // Update message record
    await knex('messages')
      .where('id', Buffer.from(messageId, 'hex'))
      .update({
        status: 'sent',
        sent_at: knex.fn.now(),
      });

    // Create lead event
    await knex('lead_events').insert({
      id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
      lead_id: lead.id,
      organization_id: orgId,
      event_type: 'message_sent',
      payload: {
        channel: 'whatsapp',
        message_id: messageId,
      },
    });

    return {
      success: true,
      message_id: messageId,
      status: 'sent',
      channel: 'whatsapp',
      whatsapp_message_id: whatsappResult.message_id,
    };
  } catch (error) {
    // Update message record as failed
    if (messageRecord) {
      await knex('messages')
        .where('id', Buffer.from(messageRecord.id, 'hex'))
        .update({ status: 'failed' });
    }

    throw error;
  }
}

export default router;
