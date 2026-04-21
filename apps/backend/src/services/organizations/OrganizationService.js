/**
 * OrganizationService
 * Handles organization CRUD, memberships, and invitations
 */

import { v4 as uuidv4 } from 'uuid';
import knex from '../../db/connection.js';

/**
 * Generate a unique slug from organization name
 * @param {string} name
 */
async function generateSlug(name) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);

  // Check uniqueness and append suffix if needed
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await knex('organizations')
      .where('slug', slug)
      .first();

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Create a new organization
 * @param {Object} data
 * @param {string} data.name - Organization name
 * @param {string} data.slug - Optional slug (auto-generated if not provided)
 * @param {string} data.plan - Plan type (free/pro/enterprise)
 * @returns {Promise<Object>} Created organization
 */
export async function createOrganization({ name, slug, plan = 'free' }) {
  const organizationId = uuidv4().replace(/-/g, '');

  if (!slug) {
    slug = await generateSlug(name);
  }

  await knex('organizations').insert({
    id: Buffer.from(organizationId, 'hex'),
    name,
    slug,
    plan,
    status: 'active',
  });

  return getOrganizationById(organizationId);
}

/**
 * Get organization by ID
 * @param {string} organizationId - UUID without hyphens
 * @returns {Promise<Object|null>}
 */
export async function getOrganizationById(organizationId) {
  const org = await knex('organizations')
    .where('id', Buffer.from(organizationId, 'hex'))
    .first();

  if (!org) return null;

  return {
    id: organizationId,
    name: org.name,
    slug: org.slug,
    status: org.status,
    plan: org.plan,
    settings: org.settings,
    created_at: org.created_at,
    updated_at: org.updated_at,
  };
}

/**
 * Get organization by slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getOrganizationBySlug(slug) {
  const org = await knex('organizations')
    .where('slug', slug)
    .first();

  if (!org) return null;

  const organizationId = Buffer.from(org.id).toString('hex');

  return {
    id: organizationId,
    name: org.name,
    slug: org.slug,
    status: org.status,
    plan: org.plan,
    settings: org.settings,
    created_at: org.created_at,
    updated_at: org.updated_at,
  };
}

/**
 * Update organization
 * @param {string} organizationId - UUID without hyphens
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
export async function updateOrganization(organizationId, data) {
  const allowedFields = ['name', 'slug', 'settings'];
  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return getOrganizationById(organizationId);
  }

  await knex('organizations')
    .where('id', Buffer.from(organizationId, 'hex'))
    .update(updates);

  return getOrganizationById(organizationId);
}

/**
 * Soft delete organization
 * @param {string} organizationId - UUID without hyphens
 * @returns {Promise<void>}
 */
export async function deleteOrganization(organizationId) {
  await knex('organizations')
    .where('id', Buffer.from(organizationId, 'hex'))
    .update({ status: 'deleted' });
}

/**
 * Suspend organization
 * @param {string} organizationId - UUID without hyphens
 * @returns {Promise<void>}
 */
export async function suspendOrganization(organizationId) {
  await knex('organizations')
    .where('id', Buffer.from(organizationId, 'hex'))
    .update({ status: 'suspended' });
}

/**
 * Restore suspended organization
 * @param {string} organizationId - UUID without hyphens
 * @returns {Promise<void>}
 */
export async function restoreOrganization(organizationId) {
  await knex('organizations')
    .where('id', Buffer.from(organizationId, 'hex'))
    .update({ status: 'active' });
}

/**
 * Get all organizations (for super admin)
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<Object>}
 */
export async function listOrganizations({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const query = knex('organizations')
    .orderBy('created_at', 'desc');

  const totalResult = await query.clone().count('* as count').first();
  const total = parseInt(totalResult.count);

  const orgs = await query
    .offset(offset)
    .limit(limit)
    .select('*');

  return {
    data: orgs.map((org) => ({
      id: Buffer.from(org.id).toString('hex'),
      name: org.name,
      slug: org.slug,
      status: org.status,
      plan: org.plan,
      created_at: org.created_at,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user's organizations
 * @param {string} userId - UUID without hyphens
 * @returns {Promise<Array>}
 */
export async function getUserOrganizations(userId) {
  const memberships = await knex('organization_memberships')
    .where('user_id', Buffer.from(userId, 'hex'))
    .where('accepted_at', 'is not', null)
    .leftJoin(
      'organizations',
      'organization_memberships.organization_id',
      'organizations.id'
    )
    .select('organizations.*', 'organization_memberships.role');

  return memberships.map((m) => ({
    id: Buffer.from(m.id).toString('hex'),
    name: m.name,
    slug: m.slug,
    status: m.status,
    plan: m.plan,
    role: m.role,
  }));
}

/**
 * Get organization members
 * @param {string} organizationId - UUID without hyphens
 * @returns {Promise<Array>}
 */
export async function getOrganizationMembers(organizationId) {
  const members = await knex('organization_memberships')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .where('accepted_at', 'is not', null)
    .leftJoin('users', 'organization_memberships.user_id', 'users.id')
    .select(
      'users.id as user_id',
      'users.email',
      'users.name',
      'users.role as user_role',
      'organization_memberships.role as membership_role',
      'organization_memberships.accepted_at'
    );

  return members.map((m) => ({
    userId: Buffer.from(m.user_id).toString('hex'),
    email: m.email,
    name: m.name,
    membershipRole: m.membership_role,
    acceptedAt: m.accepted_at,
  }));
}

/**
 * Add member to organization
 * @param {string} organizationId - UUID without hyphens
 * @param {string} userId - UUID without hyphens
 * @param {string} role - Membership role
 * @returns {Promise<void>}
 */
export async function addMember(organizationId, userId, role) {
  await knex('organization_memberships').insert({
    id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
    organization_id: Buffer.from(organizationId, 'hex'),
    user_id: Buffer.from(userId, 'hex'),
    role,
    accepted_at: knex.fn.now(),
  });
}

/**
 * Remove member from organization
 * @param {string} organizationId - UUID without hyphens
 * @param {string} userId - UUID without hyphens
 * @returns {Promise<void>}
 */
export async function removeMember(organizationId, userId) {
  await knex('organization_memberships')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .where('user_id', Buffer.from(userId, 'hex'))
    .del();
}

/**
 * Update member role
 * @param {string} organizationId - UUID without hyphens
 * @param {string} userId - UUID without hyphens
 * @param {string} role - New role
 * @returns {Promise<void>}
 */
export async function updateMemberRole(organizationId, userId, role) {
  await knex('organization_memberships')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .where('user_id', Buffer.from(userId, 'hex'))
    .update({ role });
}

/**
 * Create invitation
 * @param {Object} data
 * @param {string} data.organizationId
 * @param {string} data.email
 * @param {string} data.role
 * @param {string} data.invitedBy - User ID
 * @returns {Promise<Object>}
 */
export async function createInvitation({ organizationId, email, role, invitedBy }) {
  const invitationId = uuidv4().replace(/-/g, '');
  const token = uuidv4().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await knex('invitations').insert({
    id: Buffer.from(invitationId, 'hex'),
    organization_id: Buffer.from(organizationId, 'hex'),
    email,
    role,
    invited_by: invitedBy ? Buffer.from(invitedBy, 'hex') : null,
    token,
    expires_at: expiresAt,
    status: 'pending',
  });

  return {
    id: invitationId,
    token,
    email,
    role,
    expires_at: expiresAt,
  };
}

/**
 * Get invitation by token
 * @param {string} token
 * @returns {Promise<Object|null>}
 */
export async function getInvitationByToken(token) {
  const invitation = await knex('invitations')
    .where('token', token)
    .where('status', 'pending')
    .where('expires_at', '>', knex.fn.now())
    .leftJoin(
      'organizations',
      'invitations.organization_id',
      'organizations.id'
    )
    .select('invitations.*', 'organizations.name as organization_name')
    .first();

  if (!invitation) return null;

  return {
    id: Buffer.from(invitation.id).toString('hex'),
    organizationId: Buffer.from(invitation.organization_id).toString('hex'),
    organizationName: invitation.organization_name,
    email: invitation.email,
    role: invitation.role,
    expires_at: invitation.expires_at,
  };
}

/**
 * Accept invitation
 * @param {string} token
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function acceptInvitation(token, userId) {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }

  await knex.transaction(async (trx) => {
    // Add membership
    await trx('organization_memberships').insert({
      id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
      organization_id: invitation.organization_id,
      user_id: Buffer.from(userId, 'hex'),
      role: invitation.role,
      accepted_at: trx.fn.now(),
    });

    // Update invitation status
    await trx('invitations')
      .where('token', token)
      .update({
        status: 'accepted',
        accepted_at: trx.fn.now(),
      });
  });
}

/**
 * Revoke invitation
 * @param {string} invitationId
 * @returns {Promise<void>}
 */
export async function revokeInvitation(invitationId) {
  await knex('invitations')
    .where('id', Buffer.from(invitationId, 'hex'))
    .update({ status: 'revoked' });
}

/**
 * Get pending invitations for organization
 * @param {string} organizationId
 * @returns {Promise<Array>}
 */
export async function getOrganizationInvitations(organizationId) {
  const invitations = await knex('invitations')
    .where('organization_id', Buffer.from(organizationId, 'hex'))
    .where('status', 'pending')
    .select('*');

  return invitations.map((inv) => ({
    id: Buffer.from(inv.id).toString('hex'),
    email: inv.email,
    role: inv.role,
    expires_at: inv.expires_at,
    created_at: inv.created_at,
  }));
}
