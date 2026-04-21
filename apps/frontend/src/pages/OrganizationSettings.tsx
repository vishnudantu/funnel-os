import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, CreditCard, Trash2, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Member {
  userId: string;
  email: string;
  name: string;
  membershipRole: string;
  acceptedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
}

export default function OrganizationSettingsPage() {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'billing'>('general');
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      loadOrganizationData();
    }
  }, [organization?.id]);

  const loadOrganizationData = async () => {
    if (!organization?.id) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to load organization data:', error);
    } finally {
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
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !organization?.id) return;

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
    } catch (error) {
      console.error('Failed to invite:', error);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Organization Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your organization's settings, members, and billing
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'general'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <Building2 size={16} className="inline mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'members'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <Users size={16} className="inline mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'billing'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <CreditCard size={16} className="inline mr-2" />
            Billing
          </button>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="max-w-2xl space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-[#0F172A] mb-4">Organization Details</h3>

              <div className="space-y-4">
                <div className="input-group">
                  <input
                    type="text"
                    id="orgName"
                    placeholder=" "
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                  <label htmlFor="orgName">Organization Name</label>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    id="orgSlug"
                    placeholder=" "
                    value={organization?.slug || ''}
                    disabled
                  />
                  <label htmlFor="orgSlug">Slug (read-only)</label>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <span className="text-sm text-slate-500">Plan:</span>
                  <span className="text-sm font-medium capitalize">{organization?.plan}</span>
                  <span className="text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full">
                    {organization?.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || orgName === organization?.name}
                  className={cn(
                    'btn btn-primary',
                    saving && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="card p-6 border-[#DC2626]/30">
              <h3 className="font-semibold text-[#DC2626] mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-600 mb-4">
                Once you delete your organization, there is no going back. All data will be permanently removed.
              </p>
              <button className="btn" style={{ backgroundColor: '#DC2626', color: 'white' }}>
                <Trash2 size={18} />
                Delete Organization
              </button>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="max-w-4xl">
            {/* Invite form */}
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-[#0F172A] mb-4">Invite Member</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={handleInvite} className="btn btn-primary">
                  <Plus size={18} />
                  Invite
                </button>
              </div>
            </div>

            {/* Members list */}
            <div className="card">
              <div className="p-6 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#0F172A]">Members ({members.length})</h3>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">Loading...</div>
                ) : members.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No members yet</div>
                ) : (
                  members.map((member) => (
                    <div key={member.userId} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-medium">
                          {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">{member.name || member.email}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize">
                          {member.membershipRole}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending invitations */}
            {invitations.length > 0 && (
              <div className="card mt-6">
                <div className="p-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#0F172A]">Pending Invitations ({invitations.length})</h3>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0F172A]">{inv.email}</p>
                        <p className="text-sm text-slate-500">
                          Expires: {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-[#D97706]/10 text-[#D97706] rounded">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="max-w-2xl space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-[#0F172A] mb-4">Current Plan</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold capitalize">{organization?.plan}</p>
                  <p className="text-sm text-slate-500">
                    {organization?.plan === 'free' ? 'Up to 100 leads' :
                     organization?.plan === 'pro' ? 'Up to 1000 leads' : 'Unlimited leads'}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full capitalize">
                  {organization?.status}
                </span>
              </div>

              {organization?.plan === 'free' && (
                <button className="btn btn-primary w-full">
                  Upgrade to Pro - $99/month
                </button>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-[#0F172A] mb-4">Billing Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Next billing date</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment method</span>
                  <span className="font-medium">Not configured</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
