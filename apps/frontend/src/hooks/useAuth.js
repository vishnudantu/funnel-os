import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuth = create()(persist((set, get) => ({
    user: null,
    token: null,
    organization: null,
    organizations: [],
    isAuthenticated: false,
    login: (token, user, organization, organizations = []) => set({ token, user, organization, organizations: organizations.length > 0 ? organizations : [organization], isAuthenticated: true }),
    logout: () => set({ token: null, user: null, organization: null, organizations: [], isAuthenticated: false }),
    switchOrganization: async (org) => {
        const response = await fetch('/api/auth/switch-org', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${get().token}`,
            },
            body: JSON.stringify({ organizationId: org.id }),
        });
        if (!response.ok) {
            throw new Error('Failed to switch organization');
        }
        const data = await response.json();
        set({
            token: data.token,
            organization: data.organization,
        });
    },
    updateOrganizations: (orgs) => set({ organizations: orgs }),
}), {
    name: 'funnelos-auth',
}));
export function getAuthHeaders() {
    const token = useAuth.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
