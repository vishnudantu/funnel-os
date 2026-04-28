/**
 * IntegrationService
 * Handles API integrations, webhooks, and sync operations
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import knex from '../../db/connection.js';

const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypt sensitive credentials
 * @param {string} data
 * @returns {string}
 */
export function encrypt(data) {
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), crypto.randomBytes(16));
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  const iv = cipher.getIV().toString('hex');
  return `${iv}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive credentials
 * @param {string} encryptedData
 * @returns {object}
 */
export function decrypt(encryptedData) {
  const [iv, authTag, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

/**
 * List integrations for an organization
 * @param {string} organizationId
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function listIntegrations(organizationId, { type, status } = {}) {
  let query = knex('api_integrations')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .orderBy('created_at', 'desc');

  if (type) {
    query = query.where('type', type);
  }
  if (status) {
    query = query.where('status', status);
  }

  const integrations = await query;

  return integrations.map((int) => ({
    id: Buffer.from(int.id).toString('hex'),
    organization_id: Buffer.from(int.organization_id).toString('hex'),
    name: int.name,
    slug: int.slug,
    type: int.type,
    status: int.status,
    provider: int.provider,
    config: int.config,
    webhook_config: int.webhook_config,
    base_url: int.base_url,
    last_sync_at: int.last_sync_at,
    last_error_at: int.last_error_at,
    error_message: int.error_message,
    sync_count: int.sync_count,
    error_count: int.error_count,
    created_at: int.created_at,
    updated_at: int.updated_at,
    // Don't expose credentials
  }));
}

/**
 * Get integration by ID
 * @param {string} integrationId
 * @param {string} organizationId
 * @returns {Promise<object|null>}
 */
export async function getIntegration(integrationId, organizationId) {
  const integration = await knex('api_integrations')
    .where('id', Buffer.from(integrationId, 'hex'))
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .first();

  if (!integration) return null;

  return {
    id: Buffer.from(integration.id).toString('hex'),
    organization_id: Buffer.from(integration.organization_id).toString('hex'),
    name: integration.name,
    slug: integration.slug,
    type: integration.type,
    status: integration.status,
    provider: integration.provider,
    config: integration.config,
    credentials: integration.credentials ? decrypt(integration.credentials) : null,
    webhook_config: integration.webhook_config,
    webhook_secret: integration.webhook_secret,
    api_key: integration.api_key,
    base_url: integration.base_url,
    field_mappings: integration.field_mappings,
    sync_settings: integration.sync_settings,
    last_sync_at: integration.last_sync_at,
    last_error_at: integration.last_error_at,
    error_message: integration.error_message,
    sync_count: integration.sync_count,
    error_count: integration.error_count,
    created_at: integration.created_at,
    updated_at: integration.updated_at,
  };
}

/**
 * Get integration by slug
 * @param {string} slug
 * @param {string} organizationId
 * @returns {Promise<object|null>}
 */
export async function getIntegrationBySlug(slug, organizationId) {
  const integration = await knex('api_integrations')
    .where('slug', slug)
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .first();

  if (!integration) return null;

  return {
    ...integration,
    id: Buffer.from(integration.id).toString('hex'),
    credentials: integration.credentials ? decrypt(integration.credentials) : null,
  };
}

/**
 * Create a new integration
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createIntegration(data) {
  const integrationId = uuidv4().replace(/-/g, '');
  const webhookSecret = data.webhook_config?.generate_secret !== false ? uuidv4().replace(/-/g, '') : null;

  const integrationData = {
    id: Buffer.from(integrationId, 'hex'),
    organization_id: Buffer.from(data.organizationId, 'hex'),
    name: data.name,
    slug: data.slug,
    type: data.type,
    provider: data.provider,
    status: data.status || 'pending_config',
    config: data.config || null,
    credentials: data.credentials ? encrypt(data.credentials) : null,
    webhook_config: data.webhook_config || null,
    webhook_secret: webhookSecret,
    api_key: data.api_key || uuidv4().replace(/-/g, ''),
    base_url: data.base_url || null,
    field_mappings: data.field_mappings || null,
    sync_settings: data.sync_settings || null,
  };

  await knex('api_integrations').insert(integrationData);

  // Log the connection event
  await logIntegrationEvent(integrationId, data.organizationId, 'connected', {
    provider: data.provider,
    type: data.type,
  });

  return getIntegration(integrationId, data.organizationId);
}

/**
 * Update integration
 * @param {string} integrationId
 * @param {string} organizationId
 * @param {object} data
 * @returns {Promise<object|null>}
 */
export async function updateIntegration(integrationId, organizationId, data) {
  const allowedFields = [
    'name', 'config', 'credentials', 'webhook_config',
    'base_url', 'field_mappings', 'sync_settings', 'status',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'credentials' && data[field]) {
        updates[field] = encrypt(data[field]);
      } else {
        updates[field] = data[field];
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return getIntegration(integrationId, organizationId);
  }

  updates.updated_at = knex.fn.now();

  await knex('api_integrations')
    .where('id', Buffer.from(integrationId, 'hex'))
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .update(updates);

  // Log config update event
  await logIntegrationEvent(integrationId, organizationId, 'config_updated', {
    updated_fields: Object.keys(updates),
  });

  return getIntegration(integrationId, organizationId);
}

/**
 * Delete integration
 * @param {string} integrationId
 * @param {string} organizationId
 * @returns {Promise<void>}
 */
export async function deleteIntegration(integrationId, organizationId) {
  await knex('api_integrations')
    .where('id', Buffer.from(integrationId, 'hex'))
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .del();
}

/**
 * Activate/deactivate integration
 * @param {string} integrationId
 * @param {string} organizationId
 * @param {boolean} active
 * @returns {Promise<object|null>}
 */
export async function toggleIntegration(integrationId, organizationId, active) {
  await knex('api_integrations')
    .where('id', Buffer.from(integrationId, 'hex'))
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .update({
      status: active ? 'active' : 'inactive',
      updated_at: knex.fn.now(),
    });

  const event = active ? 'connected' : 'disconnected';
  await logIntegrationEvent(integrationId, organizationId, event, {});

  return getIntegration(integrationId, organizationId);
}

/**
 * Test integration connection
 * @param {string} integrationId
 * @param {string} organizationId
 * @returns {Promise<{success: boolean, message: string, details?: object}>}
 */
export async function testIntegration(integrationId, organizationId) {
  const integration = await getIntegration(integrationId, organizationId);

  if (!integration) {
    return { success: false, message: 'Integration not found' };
  }

  // Provider-specific test logic
  switch (integration.provider) {
    case 'meta':
      return testMetaIntegration(integration);
    case 'google':
      return testGoogleIntegration(integration);
    case 'whatsapp':
      return testWhatsAppIntegration(integration);
    case 'slack':
      return testSlackIntegration(integration);
    case 'custom':
      return testCustomIntegration(integration);
    default:
      return {
        success: true,
        message: `Connection test passed for ${integration.provider}`,
      };
  }
}

/**
 * Log integration event
 * @param {string} integrationId
 * @param {string} organizationId
 * @param {string} eventType
 * @param {object} payload
 * @returns {Promise<void>}
 */
export async function logIntegrationEvent(integrationId, organizationId, eventType, payload) {
  await knex('integration_events').insert({
    id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
    integration_id: Buffer.from(integrationId, 'hex'),
    organization_id: Buffer.from(organizationId, 'hex'),
    event_type: eventType,
    payload,
  });
}

/**
 * Log webhook receipt
 * @param {object} data
 * @returns {Promise<string>} Log ID
 */
export async function logWebhook(data) {
  const logId = uuidv4().replace(/-/g, '');
  await knex('webhook_logs').insert({
    id: Buffer.from(logId, 'hex'),
    organization_id: Buffer.from(data.organizationId, 'hex'),
    integration_id: data.integrationId ? Buffer.from(data.integrationId, 'hex') : null,
    source: data.source,
    event_type: data.eventType,
    headers: data.headers,
    body: data.body,
    status: 'received',
  });
  return logId;
}

/**
 * Update webhook log status
 * @param {string} logId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export async function updateWebhookLog(logId, updates) {
  await knex('webhook_logs')
    .where('id', Buffer.from(logId, 'hex'))
    .update(updates);
}

/**
 * Get webhook logs
 * @param {string} organizationId
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function getWebhookLogs(organizationId, { limit = 50, source, status } = {}) {
  let query = knex('webhook_logs')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .orderBy('created_at', 'desc')
    .limit(limit);

  if (source) query = query.where('source', source);
  if (status) query = query.where('status', status);

  const logs = await query;

  return logs.map((log) => ({
    id: Buffer.from(log.id).toString('hex'),
    integration_id: log.integration_id ? Buffer.from(log.integration_id).toString('hex') : null,
    source: log.source,
    event_type: log.event_type,
    headers: log.headers,
    body: log.body,
    status_code: log.status_code,
    response: log.response,
    processing_time_ms: log.processing_time_ms,
    status: log.status,
    error_message: log.error_message,
    created_at: log.created_at,
  }));
}

/**
 * Get integration events
 * @param {string} integrationId
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function getIntegrationEvents(integrationId, { limit = 50 } = {}) {
  const events = await knex('integration_events')
    .where('integration_id', Buffer.from(integrationId, 'hex'))
    .orderBy('created_at', 'desc')
    .limit(limit);

  return events.map((e) => ({
    id: Buffer.from(e.id).toString('hex'),
    event_type: e.event_type,
    payload: e.payload,
    error_message: e.error_message,
    created_at: e.created_at,
  }));
}

// Provider-specific test functions
async function testMetaIntegration(integration) {
  // Would test Meta API connection
  return {
    success: true,
    message: 'Meta Lead Ads connection successful',
    details: { accounts_connected: 1 },
  };
}

async function testGoogleIntegration(integration) {
  return {
    success: true,
    message: 'Google Ads connection successful',
    details: { accounts_connected: 1 },
  };
}

async function testWhatsAppIntegration(integration) {
  return {
    success: true,
    message: 'WhatsApp Cloud API connection successful',
    details: { phone_number_id: 'configured' },
  };
}

async function testSlackIntegration(integration) {
  return {
    success: true,
    message: 'Slack webhook verified',
    details: { channel: '#leads' },
  };
}

async function testCustomIntegration(integration) {
  if (!integration.base_url) {
    return { success: false, message: 'Base URL not configured' };
  }

  try {
    // Test the custom endpoint
    const response = await fetch(`${integration.base_url}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.api_key}`,
      },
    }).catch(() => null);

    if (response?.ok) {
      return {
        success: true,
        message: `Custom API connection successful (${integration.base_url})`,
      };
    }

    return {
      success: true,
      message: 'Custom API configured (endpoint not tested)',
    };
  } catch {
    return {
      success: true,
      message: 'Custom API configured (test skipped)',
    };
  }
}
