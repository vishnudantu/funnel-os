/**
 * ClaudeAdapter - AI Provider for Anthropic Claude
 * Uses official Anthropic SDK
 */

import { AIProvider } from './AIProvider.js';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAdapter extends AIProvider {
  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  }

  /**
   * @param {string} prompt
   */
  async #generate(prompt) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
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

Respond ONLY with valid JSON (no markdown, no code blocks):
{"score": 85, "reasoning": "Complete contact info from high-quality source", "priority": "high"}`;

    try {
      const response = await this.#generate(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);

      return {
        score: Math.min(100, Math.max(0, parsed.score)),
        reasoning: parsed.reasoning || 'No reasoning provided',
        priority: ['low', 'medium', 'high', 'urgent'].includes(parsed.priority)
          ? parsed.priority
          : 'medium',
      };
    } catch (error) {
      console.error('ClaudeAdapter.scoreLead error:', error);
      return {
        score: 50,
        reasoning: 'Unable to parse AI response',
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
Keep it friendly, professional, and concise.

Lead: ${lead.name}
Source: ${lead.source}
${context ? `Context: ${context}` : ''}

Respond ONLY with valid JSON:
{"message": "Hi...", "tone": "friendly", "suggestedTime": "business hours"}`;

    try {
      const response = await this.#generate(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (error) {
      console.error('ClaudeAdapter.draftMessage error:', error);
      return {
        message: `Hi ${lead.name.split(' ')[0]}! Thanks for your interest. How can we help?`,
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

    const prompt = `Summarize this conversation and suggest next action.

${threadText}

Respond ONLY with valid JSON:
{"summary": "...", "nextAction": "..."}`;

    try {
      const response = await this.#generate(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (error) {
      console.error('ClaudeAdapter.summarizeThread error:', error);
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
    const prompt = `Classify this message's intent.

Message: ${text}

Respond ONLY with valid JSON:
{"intent": "inquiry", "confidence": 0.95}`;

    try {
      const response = await this.#generate(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);

      return {
        intent: parsed.intent || 'general',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      };
    } catch (error) {
      console.error('ClaudeAdapter.classifyIntent error:', error);
      return {
        intent: 'general',
        confidence: 0.5,
      };
    }
  }

  /**
   * Test connection to Anthropic API
   */
  async testConnection() {
    const start = Date.now();
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
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
