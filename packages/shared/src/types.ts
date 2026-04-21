// Core types for FunnelOS

export interface Lead {
  id: string;
  source: string;
  phone: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface AIScore {
  id: string;
  lead_id: string;
  score: number;
  reasoning: string;
  model_used: string;
  created_at: Date;
}

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  color: string;
  auto_action: boolean;
}

export interface Message {
  id: string;
  lead_id: string;
  channel: string;
  direction: 'inbound' | 'outbound';
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at: Date | null;
}

export interface ProviderConfig {
  id: string;
  provider_type: string;
  credentials_encrypted: string;
  active: boolean;
}

export interface ApiIntegration {
  id: string;
  name: string;
  type: string;
  config_json: Record<string, unknown>;
  enabled: boolean;
  last_ping: Date | null;
}

// AI Provider interface
export interface AIProvider {
  scoreLead(lead: Lead): Promise<LeadScoreResult>;
  draftMessage(lead: Lead, context?: string): Promise<DraftMessageResult>;
  summarizeThread(messages: Message[]): Promise<ThreadSummaryResult>;
  classifyIntent(text: string): Promise<IntentClassificationResult>;
}

export interface LeadScoreResult {
  score: number;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DraftMessageResult {
  message: string;
  tone: string;
  suggestedTime: string;
}

export interface ThreadSummaryResult {
  summary: string;
  nextAction: string;
}

export interface IntentClassificationResult {
  intent: string;
  confidence: number;
}

// Frontend types
export interface LeadCardData extends Lead {
  ai_score?: AIScore;
  stage_id: string;
  last_activity: Date | null;
  deal_value?: number;
}

export interface PipelineColumn {
  stage: FunnelStage;
  leads: LeadCardData[];
  total_value: number;
}
