/**
 * Super Admin Initialization Script
 *
 * Creates the first super admin user
 * Usage: node scripts/init-super-admin.js <email> <password> <name>
 */

import knex from 'knex';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
const uuidv4 = () => randomUUID();
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'funnelos',
  },
});

async function createSuperAdmin(email, password, name) {
  try {
    // Check if user already exists
    const existing = await db('users').where({ email }).first();
    if (existing) {
      console.error('Error: User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4().replace(/-/g, '');

    await db('users').insert({
      id: Buffer.from(userId, 'hex'),
      name,
      email,
      password_hash: passwordHash,
      is_super_admin: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create default organization
    const orgId = uuidv4().replace(/-/g, '');

    await db('organizations').insert({
      id: Buffer.from(orgId, 'hex'),
      name: 'Default Organization',
      slug: 'default-org',
      status: 'active',
      plan: 'pro',
      settings: {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create membership
    const membershipId = uuidv4().replace(/-/g, '');

    await db('organization_memberships').insert({
      id: Buffer.from(membershipId, 'hex'),
      organization_id: Buffer.from(orgId, 'hex'),
      user_id: Buffer.from(userId, 'hex'),
      role: 'owner',
      invited_by: Buffer.from(userId, 'hex'),
      invited_at: new Date(),
      accepted_at: new Date(),
    });

    console.log('✓ Super admin created successfully!');
    console.log('');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Organization: Default Organization');
    console.log('Role: Owner + Super Admin');
    console.log('');
    console.log('You can now login at: http://localhost:5173');

    await db.destroy();
  } catch (error) {
    console.error('Error creating super admin:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

// Parse command line arguments
const [,, email, password, name] = process.argv;

if (!email || !password || !name) {
  console.log('Usage: node scripts/init-super-admin.js <email> <password> <name>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/init-super-admin.js admin@example.com SecurePass123 "Admin User"');
  process.exit(1);
}

createSuperAdmin(email, password, name);
