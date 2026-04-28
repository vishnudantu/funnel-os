import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, Trash2, Save, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
export default function OrganizationSettingsPage() {
    const { organization } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [orgName, setOrgName] = useState(organization?.name || '');
    const [saving, setSaving] = useState(false);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (organization) {
            loadOrganizationData();
        }
    }, [organization?.id]);
    const loadOrganizationData = async () => {
        if (!organization?.id)
            return;
        try {
            const response = await fetch(`/api/organizations/${organization.id}/members`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data.members || []);
                setInvitations(data.invitations || []);
            }
        }
        catch (error) {
            console.error('Failed to load organization data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/organizations/${organization?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ name: orgName }),
            });
            if (response.ok) {
                alert('Organization updated successfully');
            }
        }
        catch (error) {
            console.error('Failed to save:', error);
        }
        finally {
            setSaving(false);
        }
    };
    const handleInvite = async () => {
        if (!inviteEmail || !organization?.id)
            return;
        try {
            const response = await fetch(`/api/organizations/${organization.id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            if (response.ok) {
                alert('Invitation sent! (In production, an email would be sent)');
                setInviteEmail('');
                loadOrganizationData();
            }
        }
        catch (error) {
            console.error('Failed to invite:', error);
        }
    };
    return (_jsxs("div", { className: "h-full flex flex-col overflow-auto", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Organization Settings" }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Manage your organization's settings, members, and billing" })] }) }) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex gap-4 mb-6 border-b border-[#E2E8F0]", children: [_jsxs("button", { onClick: () => setActiveTab('general'), className: cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'general'
                                    ? 'border-[#2563EB] text-[#2563EB]'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'), children: [_jsx(Building2, { size: 16, className: "inline mr-2" }), "General"] }), _jsxs("button", { onClick: () => setActiveTab('members'), className: cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'members'
                                    ? 'border-[#2563EB] text-[#2563EB]'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'), children: [_jsx(Users, { size: 16, className: "inline mr-2" }), "Members"] }), _jsxs("button", { onClick: () => setActiveTab('billing'), className: cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'billing'
                                    ? 'border-[#2563EB] text-[#2563EB]'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'), children: [_jsx(CreditCard, { size: 16, className: "inline mr-2" }), "Billing"] })] }), activeTab === 'general' && (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Organization Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: "orgName", placeholder: " ", value: orgName, onChange: (e) => setOrgName(e.target.value) }), _jsx("label", { htmlFor: "orgName", children: "Organization Name" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: "orgSlug", placeholder: " ", value: organization?.slug || '', disabled: true }), _jsx("label", { htmlFor: "orgSlug", children: "Slug (read-only)" })] }), _jsxs("div", { className: "flex items-center gap-4 pt-4", children: [_jsx("span", { className: "text-sm text-slate-500", children: "Plan:" }), _jsx("span", { className: "text-sm font-medium capitalize", children: organization?.plan }), _jsx("span", { className: "text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full", children: organization?.status })] })] }), _jsx("div", { className: "flex justify-end mt-6", children: _jsxs("button", { onClick: handleSave, disabled: saving || orgName === organization?.name, className: cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed'), children: [_jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save Changes'] }) })] }), _jsxs("div", { className: "card p-6 border-[#DC2626]/30", children: [_jsx("h3", { className: "font-semibold text-[#DC2626] mb-2", children: "Danger Zone" }), _jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Once you delete your organization, there is no going back. All data will be permanently removed." }), _jsxs("button", { className: "btn", style: { backgroundColor: '#DC2626', color: 'white' }, children: [_jsx(Trash2, { size: 18 }), "Delete Organization"] })] })] })), activeTab === 'members' && (_jsxs("div", { className: "max-w-4xl", children: [_jsxs("div", { className: "card p-6 mb-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Invite Member" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "email", placeholder: "Email address", value: inviteEmail, onChange: (e) => setInviteEmail(e.target.value), className: "flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]" }), _jsxs("select", { value: inviteRole, onChange: (e) => setInviteRole(e.target.value), className: "px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]", children: [_jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] }), _jsxs("button", { onClick: handleInvite, className: "btn btn-primary", children: [_jsx(Plus, { size: 18 }), "Invite"] })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "p-6 border-b border-[#E2E8F0]", children: _jsxs("h3", { className: "font-semibold text-[#0F172A]", children: ["Members (", members.length, ")"] }) }), _jsx("div", { className: "divide-y divide-[#E2E8F0]", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading..." })) : members.length === 0 ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "No members yet" })) : (members.map((member) => (_jsxs("div", { className: "p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-medium", children: member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-[#0F172A]", children: member.name || member.email }), _jsx("p", { className: "text-sm text-slate-500", children: member.email })] })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsx("span", { className: "text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize", children: member.membershipRole }) })] }, member.userId)))) })] }), invitations.length > 0 && (_jsxs("div", { className: "card mt-6", children: [_jsx("div", { className: "p-6 border-b border-[#E2E8F0]", children: _jsxs("h3", { className: "font-semibold text-[#0F172A]", children: ["Pending Invitations (", invitations.length, ")"] }) }), _jsx("div", { className: "divide-y divide-[#E2E8F0]", children: invitations.map((inv) => (_jsxs("div", { className: "p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-[#0F172A]", children: inv.email }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Expires: ", new Date(inv.expires_at).toLocaleDateString()] })] }), _jsx("span", { className: "text-xs px-2 py-1 bg-[#D97706]/10 text-[#D97706] rounded", children: "Pending" })] }, inv.id))) })] }))] })), activeTab === 'billing' && (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Current Plan" }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold capitalize", children: organization?.plan }), _jsx("p", { className: "text-sm text-slate-500", children: organization?.plan === 'free' ? 'Up to 100 leads' :
                                                            organization?.plan === 'pro' ? 'Up to 1000 leads' : 'Unlimited leads' })] }), _jsx("span", { className: "text-xs px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full capitalize", children: organization?.status })] }), organization?.plan === 'free' && (_jsx("button", { className: "btn btn-primary w-full", children: "Upgrade to Pro - $99/month" }))] }), _jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Billing Information" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Next billing date" }), _jsx("span", { className: "font-medium", children: "-" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Payment method" }), _jsx("span", { className: "font-medium", children: "Not configured" })] })] })] })] }))] })] }));
}
