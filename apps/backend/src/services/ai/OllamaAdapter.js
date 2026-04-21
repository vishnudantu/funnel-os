/**
 * OllamaAdapter - AI Provider for local Ollama models
 * Uses Ollama REST API for all AI operations
 */

import { AIProvider } from './AIProvider.js';

export class OllamaAdapter extends AIProvider {
  constructor() {
    super();
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:72b';
  }

  /**
   * @param {string} endpoint
   * @param {any} body
   */
  async #request(endpoint, body) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * @param {import('@funnelos/shared').Lead} lead
   */
  async scoreLead(lead) {
    const prompt = `Score this sales lead from 0-100 and provide reasoning. Consider:
- Contact completeness (phone, email, name)
- Lead source quality
- Engagement signals

Lead:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Source: ${lead.source}

Respond in JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "priority": "<low|medium|high|urgent>"
}`;

    const result = await this.#request('/api/generate', {
      model: this.model,
      prompt,
      stream: false,
      format: 'json',
    });

    try {
      const parsed = JSON.parse(result.response);
      return {
        score: Math.min(100, Math.max(0, parsed.score)),
        reasoning: parsed.reasoning || 'No reasoning provided',
        priority: ['low', 'medium', 'high', 'urgent'].includes(parsed.priority)
          ? parsed.priority
          : 'medium',
      };
    } catch {
      return {
        score: 50,
        reasoning: 'Unable to parse AI response, defaulting to medium score',
        priority: 'medium',
      };
    }
  }

  /**
   * @param {import('@funnelos/shared').Lead} lead
   * @param {string} [context]
   */
  async draftMessage(lead, context) {
    const prompt = `Draft a personalized WhatsApp message for this lead.
Keep it friendly, professional, and under 160 characters if possible.

Lead: ${lead.name}
Source: ${lead.source}
${context ? `Context: ${context}` : ''}

Respond in JSON format:
{
  "message": "<draft message>",
  "tone": "<professional|friendly|casual>",
  "suggestedTime": "<best time to send>"
}`;

    const result = await this.#request('/api/generate', {
      model: this.model,
      prompt,
      stream: false,
      format: 'json',
    });

    try {
      return JSON.parse(result.response);
    } catch {
      return {
        message: `Hi ${lead.name.split(' ')[0]}! Thanks for your interest. How can we help you today?`,
        tone: 'friendly',
        suggestedTime: 'business hours',
      };
    }
  }

  /**
   * @param {import('@funnelos/shared').Message[]} messages
   */
  async summarizeThread(messages) {
    const threadText = messages
      .map((m) => `${m.direction === 'inbound' ? 'Lead' : 'Us'}: ${m.body}`)
      .join('\n');

    const prompt = `Summarize this conversation thread and suggest next action.

${threadText}

Respond in JSON format:
{
  "summary": "<2-3 sentence summary>",
  "nextAction": "<recommended next step>"
}`;

    const result = await this.#request('/api/generate', {
      model: this.model,
      prompt,
      stream: false,
      format: 'json',
    });

    try {
      return JSON.parse(result.response);
    } catch {
      return {
        summary: `Thread with ${messages.length} messages`,
        nextAction: 'Continue conversation',
      };
    }
  }

  /**
   * @param {string} text
   */
  async classifyIntent(text) {
    const prompt = `Classify the intent of this message.
Common intents: inquiry, complaint, purchase_intent, support_request, general

Message: ${text}

Respond in JSON format:
{
  "intent": "<classified intent>",
  "confidence": <number 0-1>
}`;

    const result = await this.#request('/api/generate', {
      model: this.model,
      prompt,
      stream: false,
      format: 'json',
    });

    try {
      const parsed = JSON.parse(result.response);
      return {
        intent: parsed.intent || 'general',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      };
    } catch {
      return {
        intent: 'general',
        confidence: 0.5,
      };
    }
  }

  /**
   * Test connection to Ollama
   * @returns {Promise<{ok: boolean, latency: number, model: string}>}
   */
  async testConnection() {
    const start = Date.now();
    try {
      await this.#request('/api/tags', {});
      return {
        ok: true,
        latency: Date.now() - start,
        model: this.model,
      };
    } catch (error) {
      return {
        ok: false,
        latency: Date.now() - start,
        error: error.message,
      };
    }
  }
}
