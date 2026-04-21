import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

interface Metrics {
  organizations: { total: number; active: number };
  users: { total: number };
  leads: { total: number };
  messages: { total: number };
  billing: { mrr: number; byPlan: { plan: string; count: number }[] };
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orgs' | 'users'>('overview');

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
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
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

  return (
    <div className="h-full flex flex-col overflow-auto bg-[#F8FAFC]">
      {/* Admin Header */}
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Super Admin</h1>
            <p className="text-sm text-slate-500">Platform oversight and management</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'overview'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:bg-[#F1F5F9]'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orgs')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'orgs'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:bg-[#F1F5F9]'
            )}
          >
            Organizations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'users'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:bg-[#F1F5F9]'
            )}
          >
            Users
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon size={20} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Plan Distribution */}
            {metrics && (
              <div className="card p-6">
                <h3 className="font-semibold text-[#0F172A] mb-4">Plan Distribution</h3>
                <div className="space-y-4">
                  {metrics.billing.byPlan.map((plan) => (
                    <div key={plan.plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              plan.plan === 'free'
                                ? '#64748B'
                                : plan.plan === 'pro'
                                ? '#2563EB'
                                : '#8B5CF6',
                          }}
                        />
                        <span className="font-medium capitalize">{plan.plan}</span>
                      </div>
                      <span className="text-lg font-semibold">{plan.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity Placeholder */}
            <div className="card p-6">
              <h3 className="font-semibold text-[#0F172A] mb-4">Recent Activity</h3>
              <div className="text-center text-slate-500 py-8">
                <Activity size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Activity feed coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orgs' && <OrganizationsList />}
        {activeTab === 'users' && <UsersList />}
      </div>
    </div>
  );
}

function OrganizationsList() {
  const [orgs, setOrgs] = useState<any[]>([]);
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
    } catch (error) {
      console.error('Failed to load orgs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this organization?')) return;

    try {
      const response = await fetch(`/api/admin/organizations/${id}/suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        alert('Organization suspended');
        loadOrgs();
      }
    } catch (error) {
      console.error('Failed to suspend:', error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        alert('Organization restored');
        loadOrgs();
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-[#0F172A]">All Organizations</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : orgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No organizations found
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-slate-500">{org.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize">
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full capitalize',
                        org.status === 'active'
                          ? 'bg-[#16A34A]/10 text-[#16A34A]'
                          : org.status === 'suspended'
                          ? 'bg-[#DC2626]/10 text-[#DC2626]'
                          : 'bg-[#64748B]/10 text-[#64748B]'
                      )}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {org.status === 'active' ? (
                      <button
                        onClick={() => handleSuspend(org.id)}
                        className="text-sm text-[#DC2626] hover:underline"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(org.id)}
                        className="text-sm text-[#16A34A] hover:underline"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
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
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-[#0F172A]">All Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Super Admin
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-[#F1F5F9] rounded capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isSuperAdmin ? (
                      <span className="text-xs px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
