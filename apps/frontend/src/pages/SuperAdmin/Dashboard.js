import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, TrendingUp, Activity, Shield, } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
export default function SuperAdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => {
        loadMetrics();
    }, []);
    const loadMetrics = async () => {
        try {
            const response = await fetch('/api/admin/metrics', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        }
        catch (error) {
            console.error('Failed to load metrics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const stats = metrics
        ? [
            {
                label: 'Organizations',
                value: metrics.organizations.active.toLocaleString(),
                sub: `of ${metrics.organizations.total.toLocaleString()} total`,
                icon: Building2,
                color: '#2563EB',
            },
            {
                label: 'Users',
                value: metrics.users.total.toLocaleString(),
                sub: 'Across all orgs',
                icon: Users,
                color: '#8B5CF6',
            },
            {
                label: 'MRR',
                value: formatCurrency(metrics.billing.mrr),
                sub: 'Monthly recurring revenue',
                icon: DollarSign,
                color: '#16A34A',
            },
            {
                label: 'Total Leads',
                value: metrics.leads.total.toLocaleString(),
                sub: 'All time',
                icon: TrendingUp,
                color: '#EA580C',
            },
        ]
        : [];
    return (_jsxs("div", { className: "h-full flex flex-col overflow-auto bg-[#F8FAFC]", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center", children: _jsx(Shield, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Super Admin" }), _jsx("p", { className: "text-sm text-slate-500", children: "Platform oversight and management" })] })] }) }), _jsx("div", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setActiveTab('overview'), className: cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'overview'
                                ? 'bg-[#2563EB] text-white'
                                : 'text-slate-600 hover:bg-[#F1F5F9]'), children: "Overview" }), _jsx("button", { onClick: () => setActiveTab('orgs'), className: cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'orgs'
                                ? 'bg-[#2563EB] text-white'
                                : 'text-slate-600 hover:bg-[#F1F5F9]'), children: "Organizations" }), _jsx("button", { onClick: () => setActiveTab('users'), className: cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'users'
                                ? 'bg-[#2563EB] text-white'
                                : 'text-slate-600 hover:bg-[#F1F5F9]'), children: "Users" })] }) }), _jsxs("div", { className: "p-6", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "card p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center", style: { backgroundColor: `${stat.color}15` }, children: _jsx(stat.icon, { size: 20, style: { color: stat.color } }) }) }), _jsx("p", { className: "text-2xl font-bold text-[#0F172A]", children: stat.value }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: stat.label }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: stat.sub })] }, stat.label))) }), metrics && (_jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Plan Distribution" }), _jsx("div", { className: "space-y-4", children: metrics.billing.byPlan.map((plan) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: {
                                                                backgroundColor: plan.plan === 'free'
                                                                    ? '#64748B'
                                                                    : plan.plan === 'pro'
                                                                        ? '#2563EB'
                                                                        : '#8B5CF6',
                                                            } }), _jsx("span", { className: "font-medium capitalize", children: plan.plan })] }), _jsx("span", { className: "text-lg font-semibold", children: plan.count })] }, plan.plan))) })] })), _jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Recent Activity" }), _jsxs("div", { className: "text-center text-slate-500 py-8", children: [_jsx(Activity, { size: 48, className: "mx-auto mb-4 text-slate-300" }), _jsx("p", { children: "Activity feed coming soon" })] })] })] })), activeTab === 'orgs' && _jsx(OrganizationsList, {}), activeTab === 'users' && _jsx(UsersList, {})] })] }));
}
function OrganizationsList() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadOrgs();
    }, []);
    const loadOrgs = async () => {
        try {
            const response = await fetch('/api/admin/organizations?page=1&limit=100', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                const data = await response.json();
                setOrgs(data.organizations || []);
            }
        }
        catch (error) {
            console.error('Failed to load orgs:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSuspend = async (id) => {
        if (!confirm('Suspend this organization?'))
            return;
        try {
            const response = await fetch(`/api/admin/organizations/${id}/suspend`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                alert('Organization suspended');
                loadOrgs();
            }
        }
        catch (error) {
            console.error('Failed to suspend:', error);
        }
    };
    const handleRestore = async (id) => {
        try {
            const response = await fetch(`/api/admin/organizations/${id}/restore`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                alert('Organization restored');
                loadOrgs();
            }
        }
        catch (error) {
            console.error('Failed to restore:', error);
        }
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "p-6 border-b border-[#E2E8F0]", children: _jsx("h3", { className: "font-semibold text-[#0F172A]", children: "All Organizations" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#F8FAFC]", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Plan" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Created" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-[#E2E8F0]", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-slate-500", children: "Loading..." }) })) : orgs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-slate-500", children: "No organizations found" }) })) : (orgs.map((org) => (_jsxs("tr", { className: "hover:bg-[#F8FAFC]", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: org.name }), _jsx("p", { className: "text-sm text-slate-500", children: org.slug })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize", children: org.plan }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: cn('text-xs px-2 py-1 rounded-full capitalize', org.status === 'active'
                                                ? 'bg-[#16A34A]/10 text-[#16A34A]'
                                                : org.status === 'suspended'
                                                    ? 'bg-[#DC2626]/10 text-[#DC2626]'
                                                    : 'bg-[#64748B]/10 text-[#64748B]'), children: org.status }) }), _jsx("td", { className: "px-4 py-3 text-sm text-slate-500", children: new Date(org.created_at).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3 text-right", children: org.status === 'active' ? (_jsx("button", { onClick: () => handleSuspend(org.id), className: "text-sm text-[#DC2626] hover:underline", children: "Suspend" })) : (_jsx("button", { onClick: () => handleRestore(org.id), className: "text-sm text-[#16A34A] hover:underline", children: "Restore" })) })] }, org.id)))) })] }) })] }));
}
function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadUsers();
    }, []);
    const loadUsers = async () => {
        try {
            const response = await fetch('/api/admin/users?page=1&limit=100', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        }
        catch (error) {
            console.error('Failed to load users:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "p-6 border-b border-[#E2E8F0]", children: _jsx("h3", { className: "font-semibold text-[#0F172A]", children: "All Users" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#F8FAFC]", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Email" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Super Admin" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase", children: "Created" })] }) }), _jsx("tbody", { className: "divide-y divide-[#E2E8F0]", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-slate-500", children: "Loading..." }) })) : users.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-slate-500", children: "No users found" }) })) : (users.map((user) => (_jsxs("tr", { className: "hover:bg-[#F8FAFC]", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium", children: user.name?.[0]?.toUpperCase() || 'U' }), _jsx("span", { className: "font-medium", children: user.name })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-slate-600", children: user.email }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize", children: user.role }) }), _jsx("td", { className: "px-4 py-3", children: user.isSuperAdmin ? (_jsx("span", { className: "text-xs px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded", children: "Yes" })) : (_jsx("span", { className: "text-slate-400", children: "-" })) }), _jsx("td", { className: "px-4 py-3 text-sm text-slate-500", children: new Date(user.created_at).toLocaleDateString() })] }, user.id)))) })] }) })] }));
}
