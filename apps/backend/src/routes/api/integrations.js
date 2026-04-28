/**
 * Integrations API Routes
 * Manage API integrations, webhooks, and sync operations
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as IntegrationService from '../../services/integrations/IntegrationService.js';
import knex from '../../db/connection.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/integrations
 * List all integrations for current organization
 * Query: ?type=lead-source&status=active
 */
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    const integrations = await IntegrationService.listIntegrations(req.auth.organizationId, { type, status });

    res.json({ integrations });
  } catch (error) {
    console.error('List integrations error:', error);
    res.status(500).json({ error: 'Failed to list integrations' });
  }
});

/**
 * GET /api/integrations/templates
 * Get available integration templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        provider: 'meta',
        name: 'Meta Lead Ads',
        type: 'lead-source',
        description: 'Import leads from Facebook & Instagram Lead Ads',
        config_schema: {
          page_access_token: { type: 'string', required: true, label: 'Page Access Token' },
          ad_account_id: { type: 'string', required: true, label: 'Ad Account ID' },
        },
        webhook_support: true,
      },
      {
        provider: 'google',
        name: 'Google Ads',
        type: 'lead-source',
        description: 'Import leads from Google Ads lead form extensions',
        config_schema: {
          developer_token: { type: 'string', required: true, label: 'Developer Token' },
          customer_id: { type: 'string', required: true, label: 'Customer ID' },
          refresh_token: { type: 'string', required: true, label: 'Refresh Token' },
        },
        webhook_support: true,
      },
      {
        provider: 'whatsapp',
        name: 'WhatsApp Cloud API',
        type: 'messaging',
        description: 'Send and receive WhatsApp messages via Meta Cloud API',
        config_schema: {
          access_token: { type: 'string', required: true, label: 'Access Token' },
          phone_number_id: { type: 'string', required: true, label: 'Phone Number ID' },
          business_account_id: { type: 'string', required: true, label: 'Business Account ID' },
        },
        webhook_support: true,
      },
      {
        provider: 'twilio',
        name: 'Twilio SMS',
        type: 'messaging',
        description: 'Send and receive SMS messages via Twilio',
        config_schema: {
          account_sid: { type: 'string', required: true, label: 'Account SID' },
          auth_token: { type: 'string', required: true, label: 'Auth Token' },
          phone_number: { type: 'string', required: true, label: 'Twilio Phone Number' },
        },
        webhook_support: true,
      },
      {
        provider: 'slack',
        name: 'Slack Notifications',
        type: 'notification',
        description: 'Get notified in Slack when high-score leads come in',
        config_schema: {
          webhook_url: { type: 'string', required: true, label: 'Incoming Webhook URL' },
          channel: { type: 'string', required: false, label: 'Channel (default: #leads)' },
        },
        webhook_support: false,
      },
      {
        provider: 'calendly',
        name: 'Calendly',
        type: 'scheduling',
        description: 'Auto-schedule meetings with qualified leads',
        config_schema: {
          api_key: { type: 'string', required: true, label: 'API Key' },
          organization: { type: 'string', required: true, label: 'Organization URL' },
        },
        webhook_support: true,
      },
      {
        provider: 'zapier',
        name: 'Zapier Webhook',
        type: 'automation',
        description: 'Connect FunnelOS to 5000+ apps via Zapier',
        config_schema: {
          webhook_url: { type: 'string', required: true, label: 'Zapier Webhook URL' },
          trigger_events: { type: 'array', required: false, label: 'Trigger Events' },
        },
        webhook_support: true,
      },
      {
        provider: 'make',
        name: 'Make (Integromat)',
        type: 'automation',
        description: 'Connect FunnelOS to 1000+ apps via Make',
        config_schema: {
          webhook_url: { type: 'string', required: true, label: 'Make Webhook URL' },
        },
        webhook_support: true,
      },
      {
        provider: 'salesforce',
        name: 'Salesforce',
        type: 'crm',
        description: 'Sync leads with Salesforce CRM',
        config_schema: {
          instance_url: { type: 'string', required: true, label: 'Instance URL' },
          consumer_key: { type: 'string', required: true, label: 'Consumer Key' },
          consumer_secret: { type: 'string', required: true, label: 'Consumer Secret' },
          access_token: { type: 'string', required: true, label: 'Access Token' },
        },
        webhook_support: false,
      },
      {
        provider: 'hubspot',
        name: 'HubSpot',
        type: 'crm',
        description: 'Sync leads with HubSpot CRM',
        config_schema: {
          access_token: { type: 'string', required: true, label: 'Private App Access Token' },
        },
        webhook_support: true,
      },
      {
        provider: 'custom',
        name: 'Custom API Integration',
        type: 'custom',
        description: 'Custom API integration with webhook support',
        config_schema: {
          base_url: { type: 'string', required: true, label: 'Base API URL' },
          auth_type: { type: 'string', required: true, label: 'Auth Type', options: ['bearer', 'basic', 'api-key', 'none'] },
          api_key: { type: 'string', required: false, label: 'API Key' },
          username: { type: 'string', required: false, label: 'Username (for basic auth)' },
          password: { type: 'string', required: false, label: 'Password (for basic auth)' },
          headers: { type: 'object', required: false, label: 'Custom Headers (JSON)' },
        },
        webhook_support: true,
        webhook_config_schema: {
          endpoint: { type: 'string', required: false, label: 'Webhook Endpoint Path' },
          verify_signature: { type: 'boolean', required: false, label: 'Verify Signature' },
          signature_header: { type: 'string', required: false, label: 'Signature Header Name' },
        },
        field_mapping_support: true,
      },
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get integration templates' });
  }
});

/**
 * GET /api/integrations/:id
 * Get integration details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await IntegrationService.getIntegration(id, req.auth.organizationId);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ integration });
  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to get integration' });
  }
});

/**
 * POST /api/integrations
 * Create a new integration
 */
router.post('/', async (req, res) => {
  try {
    const { name, slug, type, provider, config, credentials, webhook_config, base_url, field_mappings, sync_settings } = req.body;

    if (!name || !slug || !type || !provider) {
      return res.status(400).json({
        error: 'name, slug, type, and provider are required',
      });
    }

    // Check if slug already exists
    const existing = await IntegrationService.getIntegrationBySlug(slug, req.auth.organizationId);
    if (existing) {
      return res.status(409).json({ error: 'Integration with this slug already exists' });
    }

    const integration = await IntegrationService.createIntegration({
      organizationId: req.auth.organizationId,
      name,
      slug,
      type,
      provider,
      config,
      credentials,
      webhook_config,
      base_url,
      field_mappings,
      sync_settings,
    });

    res.status(201).json({
      integration,
      message: 'Integration created successfully',
    });
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

/**
 * PUT /api/integrations/:id
 * Update integration
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { config, credentials, webhook_config, base_url, field_mappings, sync_settings, name, status } = req.body;

    const integration = await IntegrationService.updateIntegration(id, req.auth.organizationId, {
      config,
      credentials,
      webhook_config,
      base_url,
      field_mappings,
      sync_settings,
      name,
      status,
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({
      integration,
      message: 'Integration updated successfully',
    });
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

/**
 * DELETE /api/integrations/:id
 * Delete integration
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await IntegrationService.deleteIntegration(id, req.auth.organizationId);

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

/**
 * POST /api/integrations/:id/toggle
 * Activate/deactivate integration
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    const integration = await IntegrationService.toggleIntegration(id, req.auth.organizationId, active);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({
      integration,
      message: `Integration ${active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle integration error:', error);
    res.status(500).json({ error: 'Failed to toggle integration' });
  }
});

/**
 * POST /api/integrations/:id/test
 * Test integration connection
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await IntegrationService.testIntegration(id, req.auth.organizationId);

    res.json(result);
  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

/**
 * GET /api/integrations/:id/events
 * Get integration event logs
 */
router.get('/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    const events = await IntegrationService.getIntegrationEvents(id, { limit: parseInt(limit) });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get integration events' });
  }
});

/**
 * GET /api/webhooks/logs
 * Get webhook logs
 */
router.get('/webhooks/logs', async (req, res) => {
  try {
    const { limit = 50, source, status } = req.query;
    const logs = await IntegrationService.getWebhookLogs(req.auth.organizationId, {
      limit: parseInt(limit),
      source,
      status,
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({ error: 'Failed to get webhook logs' });
  }
});

/**
 * POST /api/webhooks/:provider
 * Generic webhook handler for all providers
 */
router.post('/webhooks/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { source, event_type, integration_slug } = req.query;
    const body = req.body;
    const headers = req.headers;

    // Log the webhook
    const logId = await IntegrationService.logWebhook({
      organizationId: req.auth?.organizationId || 'system',
      source: source || provider,
      eventType: event_type,
      headers: sanitizeHeaders(headers),
      body,
    });

    console.log(`[Webhook] Received ${provider} webhook:`, { event_type, source });

    // Process based on provider
    switch (provider) {
      case 'meta':
        await handleMetaWebhook(req, logId);
        break;
      case 'whatsapp':
        await handleWhatsAppWebhook(req, logId);
        break;
      case 'zapier':
        await handleZapierWebhook(req, logId);
        break;
      case 'make':
        await handleMakeWebhook(req, logId);
        break;
      case 'custom':
        await handleCustomWebhook(req, logId);
        break;
      default:
        await IntegrationService.updateWebhookLog(logId, { status: 'ignored' });
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    res.json({ received: true, log_id: logId });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
function sanitizeHeaders(headers) {
  const sensitive = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!sensitive.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

async function handleMetaWebhook(req, logId) {
  // Handle Meta (Facebook/Instagram) lead webhooks
  const { entry } = req.body;
  if (!entry) throw new Error('Invalid Meta webhook payload');

  // Process lead data
  for (const e of entry) {
    if (e.changes?.[0]?.field === 'leadgen') {
      const leadData = e.changes[0].value;
      console.log('[Meta] New lead:', leadData.leadgen_id);
      // Here you would create/update the lead in your system
    }
  }

  await IntegrationService.updateWebhookLog(logId, { status: 'processed', processing_time_ms: Date.now() });
}

async function handleWhatsAppWebhook(req, logId) {
  // Handle WhatsApp message webhooks
  const { entry } = req.body;
  if (!entry) throw new Error('Invalid WhatsApp webhook payload');

  for (const e of entry) {
    if (e.changes?.[0]?.value?.messages) {
      const messages = e.changes[0].value.messages;
      console.log('[WhatsApp] Received messages:', messages.length);
      // Process incoming messages
    }
  }

  await IntegrationService.updateWebhookLog(logId, { status: 'processed', processing_time_ms: Date.now() });
}

async function handleZapierWebhook(req, logId) {
  // Handle Zapier webhook - can be any payload
  const data = req.body;
  console.log('[Zapier] Webhook received:', Object.keys(data));

  // Check if this is a lead import
  if (data.lead || data.contact) {
    // Process as lead
    console.log('[Zapier] New lead from Zapier');
  }

  await IntegrationService.updateWebhookLog(logId, { status: 'processed', processing_time_ms: Date.now() });
}

async function handleMakeWebhook(req, logId) {
  // Handle Make (Integromat) webhook
  const data = req.body;
  console.log('[Make] Webhook received:', Object.keys(data));

  await IntegrationService.updateWebhookLog(logId, { status: 'processed', processing_time_ms: Date.now() });
}

async function handleCustomWebhook(req, logId) {
  // Handle custom webhook - log and process based on config
  const { integration_slug } = req.query;

  if (integration_slug) {
    const integration = await IntegrationService.getIntegrationBySlug(integration_slug, req.auth?.organizationId);
    if (integration?.webhook_config?.handler) {
      // Custom handler would be configured per integration
      console.log('[Custom] Processing with custom handler');
    }
  }

  await IntegrationService.updateWebhookLog(logId, { status: 'processed', processing_time_ms: Date.now() });
}

export default router;
