/**
 * Auth API Routes
 * JWT-based authentication with organization support
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import knex from '../../db/connection.js';
import { generateToken } from '../../middleware/auth.js';
import * as OrganizationService from '../../services/organizations/OrganizationService.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organizationName: z.string().min(1),
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * POST /api/auth/register
 * Register a new user with a new organization
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, organizationName } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await knex('users')
      .where('email', email)
      .first();

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
        code: 'USER_EXISTS',
      });
    }

    // Create user and organization in transaction
    const result = await knex.transaction(async (trx) => {
      // Create organization
      const orgId = uuidv4().replace(/-/g, '');
      await trx('organizations').insert({
        id: Buffer.from(orgId, 'hex'),
        name: organizationName,
        slug: await OrganizationService.generateSlug(organizationName),
        plan: 'free',
        status: 'active',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
      });

      // Create user
      const userId = uuidv4().replace(/-/g, '');
      const passwordHash = await bcrypt.hash(password, 10);

      await trx('users').insert({
        id: Buffer.from(userId, 'hex'),
        email,
        password_hash: passwordHash,
        name,
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

      // Create subscription (trial)
      await trx('subscriptions').insert({
        id: Buffer.from(uuidv4().replace(/-/g, ''), 'hex'),
        organization_id: Buffer.from(orgId, 'hex'),
        plan: 'pro',
        status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      return { userId, orgId, email, name };
    });

    // Generate token
    const token = generateToken(
      { id: result.userId, email: result.email, name: result.name, role: 'user' },
      result.orgId
    );

    res.status(201).json({
      token,
      user: {
        id: result.userId,
        email: result.email,
        name: result.name,
      },
      organization: {
        id: result.orgId,
        name: organizationName,
      },
      expires_in: '7 days',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login and get JWT token with organization context
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await knex('users').where('email', email).first();

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Get user's organizations
    const organizations = await OrganizationService.getUserOrganizations(
      Buffer.from(user.id).toString('hex')
    );

    if (organizations.length === 0) {
      return res.status(403).json({
        error: 'No active organizations found',
        code: 'NO_ORGANIZATIONS',
      });
    }

    // If user has only one org, use it; otherwise return list for selection
    const defaultOrg = organizations[0];

    const token = generateToken(
      {
        id: Buffer.from(user.id).toString('hex'),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      defaultOrg.id,
      user.is_super_admin
    );

    res.json({
      token,
      user: {
        id: Buffer.from(user.id).toString('hex'),
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: !!user.is_super_admin,
      },
      organization: defaultOrg,
      organizations,
      requires_org_selection: organizations.length > 1,
      expires_in: '7 days',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/switch-org
 * Switch to a different organization
 */
router.post('/switch-org', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId required' });
    }

    // Verify user has access to this org
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(organizationId, 'hex'))
      .where('user_id', Buffer.from(decoded.userId, 'hex'))
      .first();

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied to this organization',
        code: 'ACCESS_DENIED',
      });
    }

    // Generate new token with new org context
    const newToken = generateToken(
      {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
      organizationId,
      decoded.isSuperAdmin
    );

    const org = await OrganizationService.getOrganizationById(organizationId);

    res.json({
      token: newToken,
      organization: org,
    });
  } catch (error) {
    console.error('Switch org error:', error);
    res.status(500).json({ error: 'Failed to switch organization' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info with organization context
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);

    const organizations = await OrganizationService.getUserOrganizations(decoded.userId);
    const currentOrg = await OrganizationService.getOrganizationById(decoded.organizationId);

    res.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        isSuperAdmin: decoded.isSuperAdmin,
      },
      organization: currentOrg,
      organizations,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * POST /api/auth/invite
 * Create an invitation
 */
router.post('/invite', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'email and role required' });
    }

    // Check permissions
    const membership = await knex('organization_memberships')
      .where('organization_id', Buffer.from(decoded.organizationId, 'hex'))
      .where('user_id', Buffer.from(decoded.userId, 'hex'))
      .first();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const invitation = await OrganizationService.createInvitation({
      organizationId: decoded.organizationId,
      email,
      role,
      invitedBy: decoded.userId,
    });

    // In production: send email with invitation link
    // const invitationUrl = `https://app.funnelos.com/invite/${invitation.token}`;
    // await sendInvitationEmail(email, invitationUrl);

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
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

/**
 * GET /api/auth/invite/:token
 * Get invitation details
 */
router.get('/invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await OrganizationService.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invalid or expired invitation',
        code: 'INVALID_INVITATION',
      });
    }

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organizationName,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Invite lookup error:', error);
    res.status(500).json({ error: 'Failed to get invitation' });
  }
});

/**
 * POST /api/auth/accept-invite
 * Accept an invitation (requires registration first)
 */
router.post('/accept-invite', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }

    const jwt = require('jsonwebtoken');
    const tokenValue = authHeader.split(' ')[1];
    const decoded = jwt.verify(tokenValue, JWT_SECRET);

    await OrganizationService.acceptInvitation(token, decoded.userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: error.message || 'Failed to accept invitation' });
  }
});

export default router;
