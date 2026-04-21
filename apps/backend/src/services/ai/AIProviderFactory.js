/**
 * AIProviderFactory
 * Creates and returns the appropriate AI provider based on environment config
 */

import { OllamaAdapter } from './OllamaAdapter.js';
import { ClaudeAdapter } from './ClaudeAdapter.js';

/**
 * Cache of provider instances (singleton pattern)
 */
const providerCache = new Map();

/**
 * Get an AI provider instance based on environment configuration
 * @returns {OllamaAdapter | ClaudeAdapter}
 */
export function getProvider() {
  const providerType = process.env.AI_PROVIDER || 'ollama';

  if (providerCache.has(providerType)) {
    return providerCache.get(providerType);
  }

  let provider;

  switch (providerType) {
    case 'claude':
      provider = new ClaudeAdapter();
      break;
    case 'ollama':
    default:
      provider = new OllamaAdapter();
      break;
  }

  providerCache.set(providerType, provider);
  return provider;
}

/**
 * Get a specific provider by type (for testing provider switching)
 * @param {string} type
 * @returns {OllamaAdapter | ClaudeAdapter}
 */
export function getProviderByType(type) {
  if (providerCache.has(type)) {
    return providerCache.get(type);
  }

  let provider;

  switch (type) {
    case 'claude':
      provider = new ClaudeAdapter();
      break;
    case 'ollama':
    default:
      provider = new OllamaAdapter();
      break;
  }

  providerCache.set(type, provider);
  return provider;
}

/**
 * List all available providers
 * @returns {string[]}
 */
export function getAvailableProviders() {
  return ['ollama', 'claude'];
}

/**
 * Clear provider cache (useful for testing)
 */
export function clearProviderCache() {
  providerCache.clear();
}
