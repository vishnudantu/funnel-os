/**
 * Meta Lead Gen Webhook Handler
 * Handles leads from Facebook/Instagram lead ads
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProvider } from '../../services/ai/index.js';

const router = Router();

/**
 * Meta webhook verification (GET request with challenge)
 */
router.get('/', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Meta webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

/**
 * Meta webhook event handler
 */
router.post('/', async (req, res) => {
  const body = req.body;

  // Acknowledge receipt immediately
  res.status(200).send('EVENT_RECEIVED');

  // Process async
  try {
    await handleMetaEvent(body);
  } catch (error) {
    console.error('Error processing Meta event:', error);
  }
});

/**
 * @param {any} body
 */
async function handleMetaEvent(body) {
  if (!body.entry || !Array.isArray(body.entry)) {
    return;
  }

  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      if (change.field === 'leads') {
        await processLead(change.value);
      }
    }
  }
}

/**
 * @param {any} leadData
 */
async function processLead(leadData) {
  const { lead_id, form_id, ad_id, adset_id, campaign_id } = leadData;

  // Normalize to standard LeadEvent
  const event = {
    id: uuidv4(),
    lead_id,
    event_type: 'meta_lead_generated',
    payload: {
      form_id,
      ad_id,
      adset_id,
      campaign_id,
      raw_data: leadData,
    },
    timestamp: new Date().toISOString(),
  };

  // Log raw payload (in production, send to object storage like S3)
  console.log('Meta lead event:', JSON.stringify(event, null, 2));

  // Queue for processing (Redis in production)
  // await redisQueue.push(event);

  // For now, just log
  console.log(`Lead ${lead_id} queued for processing`);
}

export default router;
