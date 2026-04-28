/**
 * Migration 003: Enhanced Integrations Support
 * Adds api_integrations table with webhook support and custom fields
 */

/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Drop existing api_integrations if it exists with old schema
  await knex.schema.dropTableIfExists('api_integrations');

  // Create enhanced api_integrations table
  await knex.schema.createTable('api_integrations', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('slug', 100).notNullable(); // unique per org
    table.enum('type', [
      'lead-source',      // Meta, Google Ads, etc.
      'messaging',        // WhatsApp, SMS, Email
      'notification',     // Slack, Teams
      'scheduling',       // Calendly, Cal.com
      'automation',       // Zapier, Make
      'crm',             // Salesforce, HubSpot
      'analytics',       // Google Analytics, Mixpanel
      'custom',          // Custom API integration
    ]).notNullable();
    table.enum('status', ['active', 'inactive', 'error', 'pending_config']).defaultTo('pending_config');
    table.string('provider', 100).notNullable(); // meta, google, slack, custom, etc.
    table.json('config').nullable(); // Provider-specific config
    table.json('credentials').nullable(); // Encrypted credentials
    table.json('webhook_config').nullable(); // Webhook settings
    table.string('webhook_secret', 255).nullable(); // For verifying incoming webhooks
    table.string('api_key', 255).nullable(); // Outgoing API key for this integration
    table.string('base_url', 500).nullable(); // Base URL for custom APIs
    table.json('field_mappings').nullable(); // Field mapping config
    table.json('sync_settings').nullable(); // Sync frequency, filters, etc.
    table.timestamp('last_sync_at').nullable();
    table.timestamp('last_error_at').nullable();
    table.text('error_message').nullable();
    table.integer('sync_count').defaultTo(0);
    table.integer('error_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['organization_id', 'type']);
    table.index(['organization_id', 'status']);
    table.index('slug');
    table.index('provider');
    table.unique(['organization_id', 'slug'], 'unique_org_slug');
  });

  // Create integration_events table for tracking integration activity
  await knex.schema.createTable('integration_events', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('integration_id', 16).notNullable().references('id').inTable('api_integrations').onDelete('CASCADE');
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.enum('event_type', [
      'connected',
      'disconnected',
      'sync_started',
      'sync_completed',
      'sync_failed',
      'webhook_received',
      'webhook_processed',
      'webhook_failed',
      'config_updated',
      'credentials_updated',
      'error',
    ]).notNullable();
    table.json('payload').nullable();
    table.text('error_message').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['integration_id', 'created_at']);
    table.index(['organization_id', 'created_at']);
    table.index('event_type');
  });

  // Create webhook_logs table for debugging
  await knex.schema.createTable('webhook_logs', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.binary('integration_id', 16).nullable().references('id').inTable('api_integrations').onDelete('SET NULL');
    table.string('source', 100).notNullable(); // meta, whatsapp, custom, etc.
    table.string('event_type', 100).nullable();
    table.json('headers').nullable();
    table.json('body').notNullable();
    table.integer('status_code').defaultTo(200);
    table.text('response').nullable();
    table.integer('processing_time_ms').nullable();
    table.enum('status', ['received', 'processed', 'failed', 'ignored']).defaultTo('received');
    table.text('error_message').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['organization_id', 'created_at']);
    table.index(['integration_id', 'created_at']);
    table.index('source');
    table.index('status');
  });

  // Insert default integration templates
  const defaultIntegrations = [
    { name: 'Meta Lead Ads', slug: 'meta-lead-ads', type: 'lead-source', provider: 'meta' },
    { name: 'Google Ads', slug: 'google-ads', type: 'lead-source', provider: 'google' },
    { name: 'WhatsApp Cloud API', slug: 'whatsapp-cloud', type: 'messaging', provider: 'whatsapp' },
    { name: 'Twilio SMS', slug: 'twilio-sms', type: 'messaging', provider: 'twilio' },
    { name: 'Slack Notifications', slug: 'slack-notifications', type: 'notification', provider: 'slack' },
    { name: 'Microsoft Teams', slug: 'teams-notifications', type: 'notification', provider: 'microsoft' },
    { name: 'Calendly', slug: 'calendly', type: 'scheduling', provider: 'calendly' },
    { name: 'Cal.com', slug: 'cal-com', type: 'scheduling', provider: 'cal-com' },
    { name: 'Zapier Webhook', slug: 'zapier-webhook', type: 'automation', provider: 'zapier' },
    { name: 'Make (Integromat)', slug: 'make-webhook', type: 'automation', provider: 'make' },
    { name: 'Salesforce', slug: 'salesforce', type: 'crm', provider: 'salesforce' },
    { name: 'HubSpot', slug: 'hubspot', type: 'crm', provider: 'hubspot' },
    { name: 'Google Analytics', slug: 'google-analytics', type: 'analytics', provider: 'google' },
    { name: 'Custom API', slug: 'custom-api', type: 'custom', provider: 'custom' },
  ];

  const defaultOrg = await knex('organizations').where('slug', 'default').first();
  if (defaultOrg) {
    for (const integration of defaultIntegrations) {
      await knex('api_integrations').insert({
        id: knex.raw('generate_uuid()'),
        organization_id: defaultOrg.id,
        ...integration,
        status: 'pending_config',
        config: knex.raw(`json_build_object(
          'template', true,
          'description', '${getDescription(integration.provider)}'
        )`),
      });
    }
  }
}

function getDescription(provider) {
  const descriptions = {
    meta: 'Import leads from Facebook & Instagram Lead Ads',
    google: 'Import leads from Google Ads lead form extensions',
    whatsapp: 'Send and receive WhatsApp messages via Meta Cloud API',
    twilio: 'Send and receive SMS messages via Twilio',
    slack: 'Get notified in Slack channels about lead activity',
    microsoft: 'Get notified in Microsoft Teams about lead activity',
    calendly: 'Auto-schedule meetings with qualified leads',
    'cal-com': 'Open-source scheduling integration',
    zapier: 'Connect to 5000+ apps via Zapier webhooks',
    make: 'Connect to 1000+ apps via Make (Integromat)',
    salesforce: 'Sync leads with Salesforce CRM',
    hubspot: 'Sync leads with HubSpot CRM',
    'google-analytics': 'Track conversion events in Google Analytics',
    custom: 'Custom API integration with webhook support',
  };
  return descriptions[provider] || 'Integration template';
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('webhook_logs');
  await knex.schema.dropTableIfExists('integration_events');
  await knex.schema.dropTableIfExists('api_integrations');
}
