/**
 * AI API Routes
 * Provider switching, testing, and direct AI operations
 */

import { Router } from 'express';
import {
  getProvider,
  getProviderByType,
  getAvailableProviders,
  clearProviderCache,
} from '../../services/ai/index.js';

const router = Router();

/**
 * GET /api/ai/providers
 * List all available AI providers
 */
router.get('/providers', async (req, res) => {
  const providers = getAvailableProviders();
  const currentProvider = process.env.AI_PROVIDER || 'ollama';

  res.json({
    providers,
    current: currentProvider,
  });
});

/**
 * POST /api/ai/test-provider
 * Test connection to a specific provider
 */
router.post('/test-provider', async (req, res) => {
  const { providerType } = req.body;
  const type = providerType || process.env.AI_PROVIDER || 'ollama';

  try {
    const provider = getProviderByType(type);

    if (!provider.testConnection) {
      return res.status(400).json({ error: 'Provider does not support testConnection' });
    }

    const result = await provider.testConnection();

    res.json({
      provider: type,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      provider: type,
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/set-provider
 * Switch the active AI provider
 */
router.post('/set-provider', async (req, res) => {
  const { providerType } = req.body;
  const available = getAvailableProviders();

  if (!available.includes(providerType)) {
    return res.status(400).json({
      error: `Unknown provider. Available: ${available.join(', ')}`,
    });
  }

  // Clear cache so new provider is instantiated
  clearProviderCache();

  // In production, update environment or config
  // For now, just acknowledge
  res.json({
    success: true,
    provider: providerType,
    message: `Provider switched to ${providerType}`,
  });
});

/**
 * POST /api/ai/score
 * Score a lead (direct AI call)
 */
router.post('/score', async (req, res) => {
  try {
    const { lead } = req.body;

    if (!lead) {
      return res.status(400).json({ error: 'Lead object required' });
    }

    const provider = getProvider();
    const result = await provider.scoreLead(lead);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/draft-message
 * Draft a message for a lead
 */
router.post('/draft-message', async (req, res) => {
  try {
    const { lead, context } = req.body;

    if (!lead) {
      return res.status(400).json({ error: 'Lead object required' });
    }

    const provider = getProvider();
    const result = await provider.draftMessage(lead, context);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/classify
 * Classify intent of a message
 */
router.post('/classify', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const provider = getProvider();
    const result = await provider.classifyIntent(text);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
