/**
 * AIProvider Interface Definition
 * All AI providers must implement these four methods
 */

/**
 * @typedef {Object} LeadScoreResult
 * @property {number} score - 0-100 lead score
 * @property {string} reasoning - Explanation of score
 * @property {'low'|'medium'|'high'|'urgent'} priority
 */

/**
 * @typedef {Object} DraftMessageResult
 * @property {string} message - Drafted message content
 * @property {string} tone - Message tone (professional, friendly, etc.)
 * @property {string} suggestedTime - Best time to send
 */

/**
 * @typedef {Object} ThreadSummaryResult
 * @property {string} summary - Summary of conversation
 * @property {string} nextAction - Recommended next step
 */

/**
 * @typedef {Object} IntentClassificationResult
 * @property {string} intent - Classified intent
 * @property {number} confidence - 0-1 confidence score
 */

/**
 * @interface AIProvider
 */
export class AIProvider {
  /**
   * Score a lead based on their profile and activity
   * @param {import('@funnelos/shared').Lead} lead
   * @returns {Promise<LeadScoreResult>}
   */
  async scoreLead(lead) {
    throw new Error('scoreLead must be implemented by subclass');
  }

  /**
   * Draft a message for a lead
   * @param {import('@funnelos/shared').Lead} lead
   * @param {string} [context] - Additional context for drafting
   * @returns {Promise<DraftMessageResult>}
   */
  async draftMessage(lead, context) {
    throw new Error('draftMessage must be implemented by subclass');
  }

  /**
   * Summarize a message thread
   * @param {import('@funnelos/shared').Message[]} messages
   * @returns {Promise<ThreadSummaryResult>}
   */
  async summarizeThread(messages) {
    throw new Error('summarizeThread must be implemented by subclass');
  }

  /**
   * Classify the intent of a message
   * @param {string} text
   * @returns {Promise<IntentClassificationResult>}
   */
  async classifyIntent(text) {
    throw new Error('classifyIntent must be implemented by subclass');
  }
}
