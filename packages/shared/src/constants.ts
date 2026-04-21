// FunnelOS Constants

export const COLORS = {
  accent: '#2563EB',
  sidebar: '#0F172A',
  contentBg: '#F8FAFC',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const FUNNEL_STAGES = {
  NEW_LEAD: 'new-lead',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed-won',
  CLOSED_LOST: 'closed-lost',
} as const;

export const LEAD_SOURCES = {
  META_ADS: 'meta-ads',
  WHATSAPP: 'whatsapp',
  WEBSITE: 'website',
  MANUAL: 'manual',
  IMPORT: 'import',
} as const;

export const MESSAGE_CHANNELS = {
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  EMAIL: 'email',
  WEB_CHAT: 'web-chat',
} as const;

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  CLAUDE: 'claude',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  GROQ: 'groq',
} as const;

export const SCORE_THRESHOLDS = {
  URGENT: 80,
  HIGH: 60,
  MEDIUM: 40,
  LOW: 0,
} as const;

export const API_ROUTES = {
  AUTH: '/api/auth',
  LEADS: '/api/leads',
  PIPELINE: '/api/pipeline',
  AI: '/api/ai',
  WEBHOOKS: '/api/webhooks',
  INTEGRATIONS: '/api/integrations',
  ANALYTICS: '/api/analytics',
} as const;
