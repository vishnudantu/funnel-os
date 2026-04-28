/**
 * Saleduct Super Admin Initialization Script
 *
 * Creates the initial super admin user for the Saleduct platform
 * Usage: node scripts/init-super-admin.js
 *
 * Default credentials (for development only):
 *   Email: admin@saleduct.com
 *   Password: Saleduct@2026!SecureAdmin
 */

import knex from 'knex';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
const uuidv4 = () => randomUUID();
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to load environment files in order
const envFiles = ['.env', '.env.development', '.env.production'];
let loaded = false;
for (const file of envFiles) {
  try {
    dotenv.config({ path: path.resolve(__dirname, '..', file) });
    if (process.env.DB_HOST) {
      loaded = true;
      break;
    }
  } catch {}
}

if (!loaded) {
  console.log('⚠️  No .env file found. Using default database settings.');
}

const DB_CONFIG = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'saleduct',
  },
};

const db = knex(DB_CONFIG);

// Default super admin credentials
const DEFAULT_ADMIN = {
  name: 'Super Administrator',
  email: 'admin@saleduct.com',
  password: 'Saleduct@2026!SecureAdmin',
};

async function createSuperAdmin(email, password, name) {
  try {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         Saleduct Super Admin Initialization              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    // Check database connection
    console.log('📡 Checking database connection...');
    const connectionTest = await db.raw('SELECT 1 as test').catch(() => null);
    if (!connectionTest) {
      console.error('❌ Cannot connect to database.');
      console.error('');
      console.error('Please ensure:');
      console.error('   1. MySQL/MariaDB server is running');
      console.error('   2. Database "' + (process.env.DB_NAME || 'saleduct') + '" exists');
      console.error('   3. Credentials in .env file are correct');
      console.error('');
      console.error('Create database: CREATE DATABASE saleduct;');
      process.exit(1);
    }
    console.log('   ✓ Database connected');

    // Check if migrations have been run
    console.log('📋 Checking database schema...');
    const hasUsersTable = await db.schema.hasTable('users');
    const hasOrgsTable = await db.schema.hasTable('organizations');
    const hasMembershipsTable = await db.schema.hasTable('organization_memberships');

    if (!hasUsersTable || !hasOrgsTable || !hasMembershipsTable) {
      console.error('❌ Database tables not found. Please run migrations first:');
      console.error('');
      console.error('   npm run db:migrate');
      console.error('');
      process.exit(1);
    }
    console.log('   ✓ Schema verified');

    // Check if super admin already exists
    const existingAdmin = await db('users').where('email', email).first();
    if (existingAdmin) {
      console.log('⚠️  Super admin user already exists!');
      console.log('   Email: ' + email);
      console.log('');
      console.log('   To reset password, run:');
      console.log('   UPDATE users SET password_hash = ? WHERE email = ?;', await bcrypt.hash('newpassword', 10), email);
      return;
    }

    // Check if default organization exists
    let defaultOrg = await db('organizations').where('slug', 'default').first();

    if (!defaultOrg) {
      console.log('📦 Creating default organization...');
      const orgId = uuidv4().replace(/-/g, '');
      await db('organizations').insert({
        id: Buffer.from(orgId, 'hex'),
        name: 'Saleduct Platform',
        slug: 'default',
        plan: 'enterprise',
        status: 'active',
        settings: JSON.stringify({
          features: {
            ai_scoring: true,
            whatsapp_integration: true,
            custom_integrations: true,
            advanced_analytics: true,
            multi_tenant: true,
          },
          limits: {
            max_users: 100,
            max_leads: 100000,
            max_integrations: 50,
          },
        }),
      });
      defaultOrg = { id: orgId, name: 'Saleduct Platform' };
      console.log('   ✓ Default organization created');
    } else {
      console.log('   ✓ Default organization exists');
    }

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const userId = uuidv4().replace(/-/g, '');
    const passwordHash = await bcrypt.hash(password, 12);

    await db('users').insert({
      id: Buffer.from(userId, 'hex'),
      email: email,
      password_hash: passwordHash,
      name: name,
      role: 'admin',
      is_super_admin: true,
    });
    console.log('   ✓ User created: ' + email);

    // Create organization membership
    console.log('🔗 Linking user to organization...');
    await db('organization_memberships').insert({
      id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
      organization_id: Buffer.from(defaultOrg.id, 'hex'),
      user_id: Buffer.from(userId, 'hex'),
      role: 'owner',
      accepted_at: db.fn.now(),
    });
    console.log('   ✓ Membership created');

    // Create subscription if not exists
    const hasSubscription = await db('subscriptions').where('organization_id', Buffer.from(defaultOrg.id, 'hex')).first();
    if (!hasSubscription) {
      console.log('💳 Creating enterprise subscription...');
      await db('subscriptions').insert({
        id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
        organization_id: Buffer.from(defaultOrg.id, 'hex'),
        plan: 'enterprise',
        status: 'active',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day trial
      });
      console.log('   ✓ Subscription created');
    }

    // Create default funnel stages if not exist
    const hasStages = await db('funnel_stages').where('organization_id', Buffer.from(defaultOrg.id, 'hex')).first();
    if (!hasStages) {
      console.log('📊 Creating default funnel stages...');
      const stages = [
        { name: 'New Lead', order: 1, color: '#3B82F6', auto_action: false },
        { name: 'Contacted', order: 2, color: '#8B5CF6', auto_action: false },
        { name: 'Qualified', order: 3, color: '#10B981', auto_action: true },
        { name: 'Proposal', order: 4, color: '#F59E0B', auto_action: false },
        { name: 'Negotiation', order: 5, color: '#EF4444', auto_action: false },
        { name: 'Closed Won', order: 6, color: '#22C55E', auto_action: true },
        { name: 'Closed Lost', order: 7, color: '#6B7280', auto_action: true },
      ];

      for (const stage of stages) {
        await db('funnel_stages').insert({
          id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
          organization_id: Buffer.from(defaultOrg.id, 'hex'),
          ...stage,
        });
      }
      console.log('   ✓ Funnel stages created (' + stages.length + ' stages)');
    }

    // Create sample integrations
    const hasIntegrations = await db('api_integrations').where('organization_id', Buffer.from(defaultOrg.id, 'hex')).first();
    if (!hasIntegrations) {
      console.log('🔌 Creating integration templates...');
      const integrations = [
        { name: 'Meta Lead Ads', slug: 'meta-lead-ads', type: 'lead-source', provider: 'meta' },
        { name: 'Google Ads', slug: 'google-ads', type: 'lead-source', provider: 'google' },
        { name: 'WhatsApp Cloud API', slug: 'whatsapp-cloud', type: 'messaging', provider: 'whatsapp' },
        { name: 'Slack Notifications', slug: 'slack-notifications', type: 'notification', provider: 'slack' },
        { name: 'Zapier Webhook', slug: 'zapier-webhook', type: 'automation', provider: 'zapier' },
        { name: 'Custom API', slug: 'custom-api', type: 'custom', provider: 'custom' },
      ];

      for (const int of integrations) {
        await db('api_integrations').insert({
          id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
          organization_id: Buffer.from(defaultOrg.id, 'hex'),
          ...int,
          status: 'pending_config',
          config: JSON.stringify({ template: true }),
          api_key: uuidv4().replace(/-/g, ''),
        });
      }
      console.log('   ✓ Integration templates created (' + integrations.length + ' integrations)');
    }

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           ✅ Super Admin Created Successfully!           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║  Login Credentials (Change Immediately!):                ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Email:    ${email.padEnd(42)}║`);
    console.log(`║  Password: ${password.padEnd(42)}║`);
    console.log('║                                                           ║');
    console.log('║  Access URL: http://localhost:5173                        ║');
    console.log('║                                                           ║');
    console.log('║  ⚠️  SECURITY WARNING:                                    ║');
    console.log('║      Change the password immediately after first login    ║');
    console.log('║      via Settings > Account Security.                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Interactive prompt or command line arguments
const args = process.argv.slice(2);

if (args.length >= 3) {
  // Command line arguments provided
  const [email, password, ...nameParts] = args;
  createSuperAdmin(email, password, nameParts.join(' '));
} else {
  // Use defaults for development
  console.log('');
  console.log('Using default development credentials:');
  console.log('  Email: ' + DEFAULT_ADMIN.email);
  console.log('  Password: ' + DEFAULT_ADMIN.password);
  console.log('');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...');

  setTimeout(() => {
    createSuperAdmin(DEFAULT_ADMIN.email, DEFAULT_ADMIN.password, DEFAULT_ADMIN.name);
  }, 3000);
}
