/**
 * Organizations API Routes
 * Organization management, members, invitations
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as OrganizationService from '../../services/organizations/OrganizationService.js';
import knex from '../../db/connection.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/organizations
 * List current user's organizations
 */
router.get('/', async (req, res) => {
  try {
    const organizations = await OrganizationService.getUserOrganizations(req.auth.userId);

    res.json({
      organizations,
    });
  } catch (error) {
    console.error('List orgs error:', error);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
});

/**
 * POST /api/organizations
 * Create a new organization
 */
router.post('/', async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const org = await OrganizationService.createOrganization({ name, slug });

    // Add current user as owner
    await OrganizationService.addMember(org.id, req.auth.userId, 'owner');

    res.status(201).json({
      organization: org,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Create org error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * GET /api/organizations/:id
 * Get organization details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const org = await OrganizationService.getOrganizationById(id);

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      organization: org,
      membership: {
        role: membership.role,
      },
    });
  } catch (error) {
    console.error('Get org error:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
});

/**
 * PUT /api/organizations/:id
 * Update organization
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify admin/owner access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, slug, settings } = req.body;

    const org = await OrganizationService.updateOrganization(id, {
      name,
      slug,
      settings,
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      organization: org,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Update org error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * DELETE /api/organizations/:id
 * Soft delete organization (owner only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify owner access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Owner access required' });
    }

    await OrganizationService.deleteOrganization(id);

    res.json({
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Delete org error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

/**
 * GET /api/organizations/:id/members
 * List organization members
 */
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await OrganizationService.getOrganizationMembers(id);
    const invitations = await OrganizationService.getOrganizationInvitations(id);

    res.json({
      members,
      invitations,
    });
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
});

/**
 * POST /api/organizations/:id/members
 * Invite a new member
 */
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Verify admin/owner access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!email || !role) {
      return res.status(400).json({ error: 'email and role required' });
    }

    const invitation = await OrganizationService.createInvitation({
      organizationId: id,
      email,
      role,
      invitedBy: req.auth.userId,
    });

    res.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
      message: 'Invitation created. In production, an email would be sent.',
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

/**
 * DELETE /api/organizations/:id/members/:userId
 * Remove a member
 */
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Verify admin/owner access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Can't remove owners
    const targetMembership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(userId, 'hex'))
      .first();

    if (!targetMembership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (targetMembership.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove owner' });
    }

    await OrganizationService.removeMember(id, userId);

    res.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/**
 * PUT /api/organizations/:id/members/:userId/role
 * Update member role
 */
router.put('/:id/members/:userId/role', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    // Verify owner access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Owner access required' });
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await OrganizationService.updateMemberRole(id, userId, role);

    res.json({
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

/**
 * GET /api/organizations/:id/subscription
 * Get subscription info
 */
router.get('/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify access
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(id, 'hex'))
      .where('user_id', Buffer.from(req.auth.userId, 'hex'))
      .first();

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const subscription = await knex('subscriptions')
      .where('organization_id', Buffer.from(id, 'hex'))
      .first();

    res.json({
      subscription: subscription ? {
        id: Buffer.from(subscription.id).toString('hex'),
        plan: subscription.plan,
        status: subscription.status,
        trial_ends_at: subscription.trial_ends_at,
        current_period_ends_at: subscription.current_period_ends_at,
      } : null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

export default router;
