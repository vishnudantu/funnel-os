/**
 * FunnelOS Backend
 * AI-native sales funnel OS
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRoutes } from './routes/api/auth.js';
import { leadsRoutes } from './routes/api/leads.js';
import { aiRoutes } from './routes/api/ai.js';
import { messagesRoutes } from './routes/api/messages.js';
import { metaWebhook, whatsappWebhook } from './routes/webhooks/index.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    ai_provider: process.env.AI_PROVIDER || 'ollama',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messagesRoutes);

// Webhook routes (no rate limiting for webhooks)
app.use('/api/webhooks/meta', metaWebhook);
app.use('/api/webhooks/whatsapp', whatsappWebhook);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    FunnelOS Backend                        ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(45)}║
║  AI Provider: ${(process.env.AI_PROVIDER || 'ollama').padEnd(45)}║
║  Port:        ${String(PORT).padEnd(45)}║
║  URL:         ${`http://localhost:${PORT}`.padEnd(45)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
