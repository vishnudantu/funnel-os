/**
 * Auth API Routes
 * JWT-based authentication
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Register a new user (admin only in production)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // In production: check if user exists, hash password, save to DB
    const passwordHash = await bcrypt.hash(password, 10);

    res.status(201).json({
      message: 'User registered',
      user: { email, name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login and get JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // In production: fetch user from DB, verify password
    // For demo, accept any valid-looking credentials
    const passwordHash = await bcrypt.hash('password', 10);
    const validPassword = await bcrypt.compare(password, passwordHash);

    if (!validPassword && password !== 'password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, name: 'Demo User' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      token,
      user: { email, name: 'Demo User' },
      expires_in: '7 days',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
