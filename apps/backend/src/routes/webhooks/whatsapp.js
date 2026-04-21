/**
 * WhatsApp Cloud API Webhook Handler
 * Handles inbound messages and status updates
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProvider } from '../../services/ai/index.js';

const router = Router();

/**
 * WhatsApp webhook verification
 */
router.get('/', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

/**
 * WhatsApp webhook event handler
 */
router.post('/', async (req, res) => {
  const body = req.body;

  // Acknowledge immediately (WhatsApp requires 20s response)
  res.status(200).send('EVENT_RECEIVED');

  try {
    await handleWhatsAppEvent(body);
  } catch (error) {
    console.error('Error processing WhatsApp event:', error);
  }
});

/**
 * @param {any} body
 */
async function handleWhatsAppEvent(body) {
  if (!body.entry || !Array.isArray(body.entry)) {
    return;
  }

  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      const value = change.value;

      // Handle inbound messages
      if (value.messages && Array.isArray(value.messages)) {
        for (const message of value.messages) {
          await processInboundMessage(message, value.contacts);
        }
      }

      // Handle status updates (delivered, read, etc.)
      if (value.statuses && Array.isArray(value.statuses)) {
        for (const status of value.statuses) {
          await processStatusUpdate(status);
        }
      }
    }
  }
}

/**
 * @param {any} message
 * @param {any[]} contacts
 */
async function processInboundMessage(message, contacts) {
  const from = message.from;
  const contact = contacts?.find((c) => c.wa_id === from);

  // Normalize phone to E.164
  const phone = normalizePhone(from);

  // Extract message content
  let body = '';
  if (message.type === 'text') {
    body = message.text?.body || '';
  } else if (message.type === 'button') {
    body = message.button?.text || '';
  } else if (message.type === 'interactive') {
    body = JSON.stringify(message.interactive);
  }

  const event = {
    id: uuidv4(),
    lead_id: null, // Will be resolved by identity service
    event_type: 'whatsapp_message_inbound',
    payload: {
      phone,
      name: contact?.profile?.name || 'Unknown',
      message_type: message.type,
      body,
      raw_message: message,
    },
    timestamp: new Date(message.timestamp ? message.timestamp * 1000 : Date.now()).toISOString(),
  };

  console.log('WhatsApp inbound:', JSON.stringify(event, null, 2));

  // Identity resolution happens in the main handler
  // await resolveAndUpsert(phone, event);
}

/**
 * @param {any} status
 */
async function processStatusUpdate(status) {
  const event = {
    id: uuidv4(),
    lead_id: null,
    event_type: `whatsapp_status_${status.status}`,
    payload: {
      phone: normalizePhone(status.recipient_id),
      message_id: status.id,
      timestamp: status.timestamp,
    },
    timestamp: new Date().toISOString(),
  };

  console.log('WhatsApp status:', event.event_type);
}

/**
 * Normalize phone number to E.164 format
 * @param {string} phone
 */
function normalizePhone(phone) {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  return cleaned;
}

export default router;
