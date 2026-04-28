/**
 * FunnelOS API Client
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
async function request(endpoint, options) {
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
export const api = {
    leads: {
        list: (params) => {
            const searchParams = new URLSearchParams();
            if (params?.page)
                searchParams.set('page', String(params.page));
            if (params?.limit)
                searchParams.set('limit', String(params.limit));
            if (params?.source)
                searchParams.set('source', params.source);
            if (params?.search)
                searchParams.set('search', params.search);
            const queryString = searchParams.toString();
            return request(`/leads${queryString ? `?${queryString}` : ''}`);
        },
        get: (id) => request(`/leads/${id}`),
        create: (data) => request('/leads', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => request(`/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
        score: (id) => request(`/leads/${id}/score`, {
            method: 'POST',
        }),
    },
    stages: {
        list: () => request('/funnel-stages'),
    },
    auth: {
        login: (email, password) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        me: () => request('/auth/me'),
    },
    ai: {
        score: (leadId) => request(`/ai/score`, {
            method: 'POST',
            body: JSON.stringify({ lead_id: leadId }),
        }),
        draftMessage: (leadId, context) => request('/ai/draft-message', {
            method: 'POST',
            body: JSON.stringify({ lead_id: leadId, context }),
        }),
    },
    integrations: {
        list: (params) => {
            const searchParams = new URLSearchParams();
            if (params?.type)
                searchParams.set('type', params.type);
            if (params?.status)
                searchParams.set('status', params.status);
            const queryString = searchParams.toString();
            return request(`/integrations${queryString ? `?${queryString}` : ''}`);
        },
        templates: () => request('/integrations/templates'),
        get: (id) => request(`/integrations/${id}`),
        create: (data) => request('/integrations', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => request(`/integrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id) => request(`/integrations/${id}`, {
            method: 'DELETE',
        }),
        toggle: (id, active) => request(`/integrations/${id}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ active }),
        }),
        test: (id) => request(`/integrations/${id}/test`),
        events: (id, limit = 50) => request(`/integrations/${id}/events?limit=${limit}`),
        webhookLogs: (params) => {
            const searchParams = new URLSearchParams();
            if (params?.limit)
                searchParams.set('limit', String(params.limit));
            if (params?.source)
                searchParams.set('source', params.source);
            if (params?.status)
                searchParams.set('status', params.status);
            const queryString = searchParams.toString();
            return request(`/integrations/webhooks/logs${queryString ? `?${queryString}` : ''}`);
        },
    },
    organizations: {
        list: () => request('/organizations'),
        get: (id) => request(`/organizations/${id}`),
        update: (id, data) => request(`/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    },
};
