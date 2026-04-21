/**
 * Initial FunnelOS Schema
 * Uses UUIDs for all primary keys
 * Every table has created_at and updated_at
 */

/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Enable UUID extension for MariaDB
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_uuid()
    RETURNS BINARY(16)
    DETERMINISTIC
    BEGIN
      RETURN UNHEX(REPLACE(CONCAT(
        SUBSTRING(CAST(UUID() AS CHAR), 1, 8),
        SUBSTRING(CAST(UUID() AS CHAR), 10, 4),
        SUBSTRING(CAST(UUID() AS CHAR), 15, 4),
        SUBSTRING(CAST(UUID() AS CHAR), 20, 4),
        SUBSTRING(CAST(UUID() AS CHAR), 25, 12)
      ), '-', ''));
    END
  `);

  // Leads table - core entity
  await knex.schema.createTable('leads', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('source', 50).notNullable();
    table.string('phone', 20).notNullable();
    table.string('email', 255).notNullable();
    table.string('name', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('phone');
    table.index('email');
    table.index('source');
    table.index('created_at');
  });

  // Lead events - immutable event log
  await knex.schema.createTable('lead_events', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('lead_id', 16).notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.string('event_type', 100).notNullable();
    table.json('payload').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());

    table.index('lead_id');
    table.index('event_type');
    table.index('timestamp');
  });

  // AI scores - track all scoring history
  await knex.schema.createTable('ai_scores', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('lead_id', 16).notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.text('reasoning').notNullable();
    table.string('model_used', 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('lead_id');
    table.index('score');
  });

  // Funnel stages - configurable pipeline
  await knex.schema.createTable('funnel_stages', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('name', 100).notNullable();
    table.integer('order').notNullable();
    table.string('color', 7).notNullable(); // hex color
    table.boolean('auto_action').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique('order');
  });

  // Lead-stage assignments
  await knex.schema.createTable('lead_stages', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('lead_id', 16).notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.binary('stage_id', 16).notNullable().references('id').inTable('funnel_stages');
    table.timestamp('entered_at').defaultTo(knex.fn.now());
    table.boolean('is_current').defaultTo(true);

    table.unique(['lead_id', 'is_current']);
    table.index('stage_id');
  });

  // Messages - all communications
  await knex.schema.createTable('messages', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('lead_id', 16).notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.string('channel', 50).notNullable();
    table.enum('direction', ['inbound', 'outbound']).notNullable();
    table.text('body').notNullable();
    table.enum('status', ['pending', 'sent', 'delivered', 'failed']).defaultTo('pending');
    table.timestamp('sent_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('lead_id');
    table.index('channel');
    table.index('status');
    table.index('created_at');
  });

  // Provider configs - AI provider credentials
  await knex.schema.createTable('provider_configs', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('provider_type', 50).notNullable();
    table.text('credentials_encrypted').notNullable();
    table.boolean('active').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('provider_type');
    table.index('active');
  });

  // API integrations - external connections
  await knex.schema.createTable('api_integrations', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('name', 100).notNullable();
    table.string('type', 50).notNullable();
    table.json('config_json').notNullable();
    table.boolean('enabled').defaultTo(false);
    table.timestamp('last_ping').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('type');
    table.index('enabled');
  });

  // Users - for auth
  await knex.schema.createTable('users', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255).notNullable();
    table.enum('role', ['admin', 'user', 'viewer']).defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Sessions - JWT token tracking
  await knex.schema.createTable('sessions', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('user_id', 16).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('token_hash');
  });
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('api_integrations');
  await knex.schema.dropTableIfExists('provider_configs');
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('lead_stages');
  await knex.schema.dropTableIfExists('funnel_stages');
  await knex.schema.dropTableIfExists('ai_scores');
  await knex.schema.dropTableIfExists('lead_events');
  await knex.schema.dropTableIfExists('leads');
  await knex.raw('DROP FUNCTION IF EXISTS generate_uuid');
}
