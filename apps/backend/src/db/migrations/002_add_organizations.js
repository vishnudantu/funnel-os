/**
 * Migration 002: Multi-Tenancy Support
 * Adds organizations table and organization_id to all data tables
 */

/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // 1. Create organizations table
  await knex.schema.createTable('organizations', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.string('name', 255).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.enum('status', ['active', 'suspended', 'deleted']).defaultTo('active');
    table.enum('plan', ['free', 'pro', 'enterprise']).defaultTo('free');
    table.json('settings').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('slug');
    table.index('status');
  });

  // 2. Create organization_memberships table
  await knex.schema.createTable('organization_memberships', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.binary('user_id', 16).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['owner', 'admin', 'member', 'viewer']).notNullable();
    table.binary('invited_by', 16).nullable().references('id').inTable('users');
    table.timestamp('invited_at').defaultTo(knex.fn.now());
    table.timestamp('accepted_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['organization_id', 'user_id']);
    table.index('user_id');
    table.index('organization_id');
  });

  // 3. Create invitations table
  await knex.schema.createTable('invitations', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.enum('role', ['admin', 'member', 'viewer']).notNullable();
    table.binary('invited_by', 16).nullable().references('id').inTable('users');
    table.string('token', 255).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('accepted_at').nullable();
    table.enum('status', ['pending', 'accepted', 'expired', 'revoked']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('organization_id');
    table.index('email');
    table.index('token');
    table.index('status');
  });

  // 4. Create subscriptions table
  await knex.schema.createTable('subscriptions', (table) => {
    table.binary('id', 16).primary().defaultTo(knex.raw('generate_uuid()'));
    table.binary('organization_id', 16).notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('stripe_customer_id', 255).nullable();
    table.string('stripe_subscription_id', 255).nullable();
    table.enum('plan', ['free', 'pro', 'enterprise']).notNullable().defaultTo('free');
    table.enum('status', ['active', 'past_due', 'canceled', 'trialing']).defaultTo('active');
    table.timestamp('trial_ends_at').nullable();
    table.timestamp('current_period_ends_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique('organization_id');
    table.index('status');
  });

  // 5. Add organization_id to existing tables

  // leads
  await knex.schema.table('leads', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index(['organization_id', 'created_at'], 'idx_org_leads');
  });

  // lead_events
  await knex.schema.table('lead_events', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index(['organization_id', 'timestamp'], 'idx_org_events');
  });

  // ai_scores
  await knex.schema.table('ai_scores', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index(['organization_id', 'created_at'], 'idx_org_scores');
  });

  // funnel_stages
  await knex.schema.table('funnel_stages', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index(['organization_id', 'order'], 'idx_org_stages');
  });

  // lead_stages
  await knex.schema.table('lead_stages', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index('organization_id');
  });

  // messages
  await knex.schema.table('messages', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index(['organization_id', 'created_at'], 'idx_org_messages');
  });

  // provider_configs
  await knex.schema.table('provider_configs', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index('organization_id');
    // Remove global unique on active, make it per-org
    table.dropUnique('active');
    table.index(['organization_id', 'active'], 'idx_org_provider_active');
  });

  // api_integrations
  await knex.schema.table('api_integrations', (table) => {
    table.binary('organization_id', 16).notNullable().after('id').defaultTo(knex.raw('(SELECT id FROM organizations LIMIT 1)'));
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.index('organization_id');
  });

  // 6. Add super_admin flag to users table
  await knex.schema.table('users', (table) => {
    table.boolean('is_super_admin').defaultTo(false).after('role');
    table.index('is_super_admin');
  });

  // 7. Create default organization for existing data
  const defaultOrgId = Buffer.from(knex.raw('generate_uuid()')[0].replace(/-/g, ''), 'hex');
  await knex('organizations').insert({
    id: defaultOrgId,
    name: 'Default Organization',
    slug: 'default',
    status: 'active',
    plan: 'free',
  });

  // 8. Update all existing records to point to default organization
  await knex('leads').update({ organization_id: defaultOrgId });
  await knex('lead_events').update({ organization_id: defaultOrgId });
  await knex('ai_scores').update({ organization_id: defaultOrgId });
  await knex('funnel_stages').update({ organization_id: defaultOrgId });
  await knex('lead_stages').update({ organization_id: defaultOrgId });
  await knex('messages').update({ organization_id: defaultOrgId });
  await knex('provider_configs').update({ organization_id: defaultOrgId });
  await knex('api_integrations').update({ organization_id: defaultOrgId });

  // 9. Create membership for existing users
  const users = await knex('users').select('id');
  for (const user of users) {
    await knex('organization_memberships').insert({
      organization_id: defaultOrgId,
      user_id: user.id,
      role: 'owner',
      accepted_at: knex.fn.now(),
    });
  }

  // 10. Mark first user as super admin (for initial setup)
  if (users.length > 0) {
    await knex('users').where('id', users[0].id).update({ is_super_admin: true });
  }
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  // Remove organization_id from tables
  await knex.schema.table('api_integrations', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('provider_configs', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('messages', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('lead_stages', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('funnel_stages', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('ai_scores', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('lead_events', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  await knex.schema.table('leads', (table) => {
    table.dropForeign(['organization_id']);
    table.dropColumn('organization_id');
  });

  // Drop new tables
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('invitations');
  await knex.schema.dropTableIfExists('organization_memberships');
  await knex.schema.dropTableIfExists('organizations');

  // Remove super_admin flag
  await knex.schema.table('users', (table) => {
    table.dropColumn('is_super_admin');
  });
}
