/**
 * Messages API Routes
 * WhatsApp and other channel messaging
 */

import { Router } from 'express';
import { z } from 'zod';
import { getProvider } from '../../services/ai/index.js';

const router = Router();

const sendMessageSchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(['whatsapp', 'sms', 'email']),
  body: z.string().min(1).max(1600),
});

/**
 * GET /api/messages
 * List messages for a lead
 */
router.get('/', async (req, res) => {
  const { lead_id } = req.query;

  if (!lead_id) {
    return res.status(400).json({ error: 'lead_id required' });
  }

  try {
    // In production, fetch from database
    res.json({
      messages: [],
      pagination: {
        total: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/messages/send
 * Send a message via configured channel
 */
router.post('/send', async (req, res) => {
  try {
    const { lead_id, channel, body } = sendMessageSchema.parse(req.body);

    // Validate channel is configured
    // In production, check provider_configs table

    if (channel === 'whatsapp') {
      // Send via WhatsApp Cloud API
      const result = await sendWhatsAppMessage(lead_id, body);
      return res.json(result);
    }

    res.status(400).json({ error: `Channel ${channel} not configured` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: error.message });
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

    if (!lead_id) {
      return res.status(400).json({ error: 'lead_id required' });
    }

    // In production, fetch lead from DB
    const lead = {
      id: lead_id,
      name: 'Sample Lead',
      email: 'lead@example.com',
      phone: '+1234567890',
      source: 'website',
    };

    const provider = getProvider();
    const draft = await provider.draftMessage(lead, context);

    res.json({
      draft,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send WhatsApp message via Cloud API
 * @param {string} leadId
 * @param {string} body
 */
async function sendWhatsAppMessage(leadId, body) {
  // In production:
  // 1. Get lead phone from database
  // 2. Get WhatsApp credentials from provider_configs
  // 3. Call WhatsApp Cloud API

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Mock response
  return {
    success: true,
    message_id: 'wamid_' + Date.now(),
    status: 'sent',
    channel: 'whatsapp',
  };

  // Real implementation:
  /*
  const response = await fetch(
    `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: leadPhone,
        type: 'text',
        text: { body },
      }),
    }
  );

  return response.json();
  */
}

export default router;
