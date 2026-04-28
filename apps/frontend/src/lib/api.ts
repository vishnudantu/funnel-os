/**
 * FunnelOS API Client
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  deal_value?: number | null;
  ai_score: {
    score: number;
    reasoning: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  } | null;
  stage_id?: string;
  created_at: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  color: string;
  auto_action: boolean;
}

export interface LeadsResponse {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Integration {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'pending_config';
  provider: string;
  config?: Record<string, unknown>;
  webhook_config?: Record<string, unknown>;
  base_url?: string;
  last_sync_at?: string;
  error_message?: string;
  sync_count: number;
}

export interface IntegrationTemplate {
  provider: string;
  name: string;
  type: string;
  description: string;
  config_schema: Record<string, { type: string; required: boolean; label: string; options?: string[] }>;
  webhook_support: boolean;
}

export const api = {
  leads: {
    list: (params?: { page?: number; limit?: number; source?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.source) searchParams.set('source', params.source);
      if (params?.search) searchParams.set('search', params.search);

      const queryString = searchParams.toString();
      return request<LeadsResponse>(`/leads${queryString ? `?${queryString}` : ''}`);
    },

    get: (id: string) => request<Lead & { stage: FunnelStage | null; messages: any[]; events: any[] }>(`/leads/${id}`),

    create: (data: { name: string; email: string; phone: string; source?: string; deal_value?: number }) =>
      request<Lead>('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Lead>) =>
      request<{ message: string }>(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/leads/${id}`, { method: 'DELETE' }),

    score: (id: string) =>
      request<{ lead_id: string; score: any; scored_at: string }>(`/leads/${id}/score`, {
        method: 'POST',
      }),
  },

  stages: {
    list: () => request<FunnelStage[]>('/funnel-stages'),
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<{ user: { id: string; email: string; name: string; role: string } }>('/auth/me'),
  },

  ai: {
    score: (leadId: string) => request<{ score: any }>(`/ai/score`, {
      method: 'POST',
      body: JSON.stringify({ lead_id: leadId }),
    }),

    draftMessage: (leadId: string, context?: string) =>
      request<{ message: string; tone: string; suggested_time: string }>('/ai/draft-message', {
        method: 'POST',
        body: JSON.stringify({ lead_id: leadId, context }),
      }),
  },

  integrations: {
    list: (params?: { type?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      const queryString = searchParams.toString();
      return request<{ integrations: Integration[] }>(`/integrations${queryString ? `?${queryString}` : ''}`);
    },

    templates: () => request<{ templates: IntegrationTemplate[] }>('/integrations/templates'),

    get: (id: string) => request<{ integration: Integration }>(`/integrations/${id}`),

    create: (data: { name: string; slug: string; type: string; provider: string; config?: Record<string, unknown> }) =>
      request<{ integration: Integration; message: string }>('/integrations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Integration>) =>
      request<{ integration: Integration; message: string }>(`/integrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/integrations/${id}`, {
        method: 'DELETE',
      }),

    toggle: (id: string, active: boolean) =>
      request<{ integration: Integration; message: string }>(`/integrations/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ active }),
      }),

    test: (id: string) => request<{ success: boolean; message: string; details?: Record<string, unknown> }>(`/integrations/${id}/test`),

    events: (id: string, limit = 50) => request<{ events: unknown[] }>(`/integrations/${id}/events?limit=${limit}`),

    webhookLogs: (params?: { limit?: number; source?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.source) searchParams.set('source', params.source);
      if (params?.status) searchParams.set('status', params.status);
      const queryString = searchParams.toString();
      return request<{ logs: unknown[] }>(`/integrations/webhooks/logs${queryString ? `?${queryString}` : ''}`);
    },
  },

  organizations: {
    list: () => request<{ organizations: Array<{ id: string; name: string; plan: string; settings: Record<string, unknown> }> }>('/organizations'),
    get: (id: string) => request<{ id: string; name: string; plan: string; settings: Record<string, unknown> }>(`/organizations/${id}`),
    update: (id: string, data: { name?: string; settings?: Record<string, unknown> }) =>
      request<{ organization: { id: string; name: string; plan: string; settings: Record<string, unknown> }; message: string }>(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
