/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user + organization context
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Extract and validate JWT token from request
 * Attaches auth context to req.auth
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate token structure
    if (!decoded.userId || !decoded.organizationId) {
      return res.status(401).json({
        error: 'Invalid token structure',
        code: 'INVALID_TOKEN',
      });
    }

    // Attach auth context to request
    req.auth = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      userEmail: decoded.email,
      userName: decoded.name,
      role: decoded.role,
      isSuperAdmin: decoded.isSuperAdmin || false,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Optional authentication - attaches auth if token present, but doesn't require it
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.auth = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.auth = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      userEmail: decoded.email,
      userName: decoded.name,
      role: decoded.role,
      isSuperAdmin: decoded.isSuperAdmin || false,
    };
  } catch {
    req.auth = null;
  }

  next();
}

/**
 * Require super admin role
 * Must be used after authenticate middleware
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  if (!req.auth.isSuperAdmin) {
    return res.status(403).json({
      error: 'Super admin access required',
      code: 'INSUFFICIENT_PERMISSIONS',
    });
  }

  next();
}

/**
 * Generate JWT token for user
 *
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @param {string} user.role - User role
 * @param {string} organizationId - Organization ID
 * @param {boolean} isSuperAdmin - Is super admin
 * @returns {string} JWT token
 */
export function generateToken(user, organizationId, isSuperAdmin = false) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId,
      isSuperAdmin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
