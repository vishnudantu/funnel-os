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
  deal_value: number | null;
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
};
