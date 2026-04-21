/**
 * Super Admin API Routes
 * Platform oversight, organization management, user management
 */

import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../../middleware/auth.js';
import * as OrganizationService from '../../services/organizations/OrganizationService.js';
import knex from '../../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../middleware/auth.js';

const router = Router();

// All admin routes require authentication + super admin role
router.use(authenticate);
router.use(requireSuperAdmin);

/**
 * GET /api/admin/organizations
 * List all organizations (paginated)
 */
router.get('/organizations', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;

    let query = knex('organizations').orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    const offset = (page - 1) * limit;
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult.count);

    const orgs = await query.offset(offset).limit(limit).select('*');

    res.json({
      organizations: orgs.map((org) => ({
        id: Buffer.from(org.id).toString('hex'),
        name: org.name,
        slug: org.slug,
        status: org.status,
        plan: org.plan,
        created_at: org.created_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin list orgs error:', error);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
});

/**
 * GET /api/admin/organizations/:id
 * Get full organization details including all data
 */
router.get('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const org = await knex('organizations')
      .where('id', Buffer.from(id, 'hex'))
      .first();

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get all related data
    const [members, leads, messages, subscriptions] = await Promise.all([
      knex('organization_memberships')
        .where('organization_id', Buffer.from(id, 'hex'))
        .leftJoin('users', 'organization_memberships.user_id', 'users.id')
        .select('users.*', 'organization_memberships.role as membership_role'),

      knex('leads')
        .where('organization_id', Buffer.from(id, 'hex'))
        .count('* as count')
        .first(),

      knex('messages')
        .where('organization_id', Buffer.from(id, 'hex'))
        .count('* as count')
        .first(),

      knex('subscriptions')
        .where('organization_id', Buffer.from(id, 'hex'))
        .first(),
    ]);

    res.json({
      organization: {
        id: Buffer.from(org.id).toString('hex'),
        name: org.name,
        slug: org.slug,
        status: org.status,
        plan: org.plan,
        settings: org.settings,
        created_at: org.created_at,
        updated_at: org.updated_at,
      },
      stats: {
        members: members.length,
        leads: parseInt(leads.count),
        messages: parseInt(messages.count),
      },
      subscription: subscriptions ? {
        plan: subscriptions.plan,
        status: subscriptions.status,
        trial_ends_at: subscriptions.trial_ends_at,
      } : null,
      members: members.map((m) => ({
        id: Buffer.from(m.id).toString('hex'),
        email: m.email,
        name: m.name,
        role: m.membership_role,
      })),
    });
  } catch (error) {
    console.error('Admin get org error:', error);
    res.status(500).json({ error: 'Failed to get organization details' });
  }
});

/**
 * POST /api/admin/organizations
 * Create organization manually (for enterprise onboarding)
 */
router.post('/organizations', async (req, res) => {
  try {
    const { name, slug, plan = 'enterprise', adminEmail, adminName, adminPassword } = req.body;

    if (!name || !adminEmail) {
      return res.status(400).json({ error: 'name and adminEmail required' });
    }

    const result = await knex.transaction(async (trx) => {
      // Create organization
      const orgId = uuidv4().replace(/-/g, '');
      await trx('organizations').insert({
        id: Buffer.from(orgId, 'hex'),
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        plan,
        status: 'active',
      });

      // Create admin user if provided
      let userId = null;
      if (adminEmail && adminPassword) {
        userId = uuidv4().replace(/-/g, '');
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await trx('users').insert({
          id: Buffer.from(userId, 'hex'),
          email: adminEmail,
          name: adminName || adminEmail.split('@')[0],
          password_hash: passwordHash,
          role: 'user',
        });

        // Create membership
        await trx('organization_memberships').insert({
          id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
          organization_id: Buffer.from(orgId, 'hex'),
          user_id: Buffer.from(userId, 'hex'),
          role: 'owner',
          accepted_at: trx.fn.now(),
        });
      }

      // Create subscription
      await trx('subscriptions').insert({
        id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
        organization_id: Buffer.from(orgId, 'hex'),
        plan,
        status: 'active',
      });

      return { orgId, userId };
    });

    res.status(201).json({
      organization: {
        id: result.orgId,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      adminUser: result.userId ? {
        id: result.userId,
        email: adminEmail,
      } : null,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Admin create org error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * PUT /api/admin/organizations/:id
 * Update any organization
 */
router.put('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, status, settings } = req.body;

    const org = await OrganizationService.updateOrganization(id, {
      name,
      slug,
      settings,
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Update plan and status directly
    if (plan || status) {
      await knex('organizations')
        .where('id', Buffer.from(id, 'hex'))
        .update({
          ...(plan && { plan }),
          ...(status && { status }),
        });
    }

    res.json({
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Admin update org error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * POST /api/admin/organizations/:id/suspend
 * Suspend an organization
 */
router.post('/organizations/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;

    await OrganizationService.suspendOrganization(id);

    res.json({
      message: 'Organization suspended successfully',
    });
  } catch (error) {
    console.error('Admin suspend org error:', error);
    res.status(500).json({ error: 'Failed to suspend organization' });
  }
});

/**
 * POST /api/admin/organizations/:id/restore
 * Restore a suspended organization
 */
router.post('/organizations/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    await OrganizationService.restoreOrganization(id);

    res.json({
      message: 'Organization restored successfully',
    });
  } catch (error) {
    console.error('Admin restore org error:', error);
    res.status(500).json({ error: 'Failed to restore organization' });
  }
});

/**
 * DELETE /api/admin/organizations/:id
 * Hard delete an organization
 */
router.delete('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await knex('organizations')
      .where('id', Buffer.from(id, 'hex'))
      .del();

    res.json({
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete org error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const totalResult = await knex('users').count('* as count').first();
    const total = parseInt(totalResult.count);

    const users = await knex('users')
      .offset(offset)
      .limit(limit)
      .select('id', 'email', 'name', 'role', 'is_super_admin', 'created_at');

    res.json({
      users: users.map((u) => ({
        id: Buffer.from(u.id).toString('hex'),
        email: u.email,
        name: u.name,
        role: u.role,
        isSuperAdmin: !!u.is_super_admin,
        created_at: u.created_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * GET /api/admin/users/:id/orgs
 * Get user's organization memberships
 */
router.get('/users/:id/orgs', async (req, res) => {
  try {
    const { id } = req.params;

    const memberships = await knex('organization_memberships')
      .where('user_id', Buffer.from(id, 'hex'))
      .leftJoin('organizations', 'organization_memberships.organization_id', 'organizations.id')
      .select('organizations.*', 'organization_memberships.role', 'organization_memberships.accepted_at');

    res.json({
      memberships: memberships.map((m) => ({
        organization: {
          id: Buffer.from(m.id).toString('hex'),
          name: m.name,
          slug: m.slug,
          status: m.status,
          plan: m.plan,
        },
        role: m.role,
        accepted_at: m.accepted_at,
      })),
    });
  } catch (error) {
    console.error('Admin get user orgs error:', error);
    res.status(500).json({ error: 'Failed to get user memberships' });
  }
});

/**
 * POST /api/admin/users/:id/impersonate
 * Generate token to impersonate a user (for support)
 */
router.post('/users/:id/impersonate', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.body;

    // Get user
    const user = await knex('users').where('id', Buffer.from(id, 'hex')).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's orgs
    const orgs = await OrganizationService.getUserOrganizations(id);

    // Use provided org or first org
    const targetOrg = organizationId || (orgs[0] && orgs[0].id);

    if (!targetOrg) {
      return res.status(400).json({ error: 'User has no organizations' });
    }

    // Generate impersonation token
    const token = generateToken(
      {
        id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      targetOrg,
      false // Never impersonate as super admin
    );

    // Log impersonation (audit trail)
    console.log(`IMPERSONATION: Admin ${req.auth.userEmail} impersonating user ${user.email} in org ${targetOrg}`);

    res.json({
      token,
      user: {
        id,
        email: user.email,
        name: user.name,
      },
      organization: { id: targetOrg },
      warning: 'This is an impersonation session. All actions are logged.',
    });
  } catch (error) {
    console.error('Admin impersonate error:', error);
    res.status(500).json({ error: 'Failed to impersonate user' });
  }
});

/**
 * GET /api/admin/metrics
 * Platform-wide metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      totalLeads,
      totalMessages,
      mrrData,
    ] = await Promise.all([
      knex('organizations').count('* as count').first(),
      knex('organizations').where('status', 'active').count('* as count').first(),
      knex('users').count('* as count').first(),
      knex('leads').count('* as count').first(),
      knex('messages').count('* as count').first(),
      knex('subscriptions')
        .select('plan')
        .sum('case when status = \'active\' then 1 else 0 end as active_count')
        .groupBy('plan'),
    ]);

    // Calculate MRR (simplified - in production, use actual pricing)
    const pricing = { free: 0, pro: 99, enterprise: 499 };
    const mrr = mrrData.reduce((sum, row) => {
      return sum + (parseInt(row.active_count) || 0) * (pricing[row.plan] || 0);
    }, 0);

    res.json({
      organizations: {
        total: parseInt(totalOrgs.count),
        active: parseInt(activeOrgs.count),
      },
      users: {
        total: parseInt(totalUsers.count),
      },
      leads: {
        total: parseInt(totalLeads.count),
      },
      messages: {
        total: parseInt(totalMessages.count),
      },
      billing: {
        mrr,
        byPlan: mrrData.map((row) => ({
          plan: row.plan,
          count: parseInt(row.active_count),
        })),
      },
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

export default router;
