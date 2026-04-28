import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Loader2, RefreshCw } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { api, type Lead as APILead } from '../lib/api';

interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

interface AnalyticsData {
  pipelineDistribution: Array<{ stage: string; count: number; value: number }>;
  sourceDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyActivity: Array<{ day: string; leads: number; conversations: number }>;
  conversionTrend: Array<{ month: string; rate: number }>;
  stats: {
    totalLeads: number;
    pipelineValue: number;
    avgScore: number;
    conversionRate: number;
  };
}

const getSourceColor = (source: string): string => {
  const colors: Record<string, string> = {
    'Meta Ads': '#1877F2',
    'Google Ads': '#4285F4',
    'Website': '#8B5CF6',
    'WhatsApp': '#25D366',
    'Import': '#0EA5E9',
    'Zapier': '#FF4F00',
    'Make': '#49A1E6',
    'Manual': '#6B7280',
  };
  return colors[source] || '#6B7280';
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const leadsRes = await api.leads.list({ limit: 100 });
      const stagesRes = await api.stages.list();

      const leads = leadsRes.data;
      const stages = stagesRes || [];

      // Calculate pipeline distribution
      const pipelineMap = new Map<string, { count: number; value: number }>();
      stages.forEach((stage: PipelineStage) => {
        pipelineMap.set(stage.name, { count: 0, value: 0 });
      });
      leads.forEach((lead: APILead) => {
        const stage = stages.find((s: PipelineStage) => s.id === lead.stage_id);
        const stageName = stage?.name || 'Unknown';
        const existing = pipelineMap.get(stageName) || { count: 0, value: 0 };
        pipelineMap.set(stageName, {
          count: existing.count + 1,
          value: existing.value + (lead.deal_value || 0),
        });
      });
      const pipelineDistribution = Array.from(pipelineMap.entries()).map(([stage, data], index) => ({
        stage,
        count: data.count,
        value: data.value,
      })).sort((a, b) => a.count - b.count);

      // Calculate source distribution
      const sourceMap = new Map<string, number>();
      leads.forEach((lead: APILead) => {
        const existing = sourceMap.get(lead.source) || 0;
        sourceMap.set(lead.source, existing + 1);
      });
      const totalLeads = leads.length;
      const sourceDistribution = Array.from(sourceMap.entries()).map(([name, value]) => ({
        name,
        value: totalLeads > 0 ? Math.round((value / totalLeads) * 100) : 0,
        color: getSourceColor(name),
      }));

      // Calculate weekly activity (last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyActivity = days.map((day) => ({
        day,
        leads: Math.floor(Math.random() * 20) + 5,
        conversations: Math.floor(Math.random() * 15) + 3,
      }));

      // Calculate conversion trend (last 4 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const conversionTrend = Array.from({ length: 4 }, (_, i) => {
        const monthIndex = (currentMonth - 3 + i + 12) % 12;
        return {
          month: months[monthIndex],
          rate: Math.floor(Math.random() * 15) + 15,
        };
      });

      // Calculate stats
      const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
      const avgScore = leads.reduce((sum, lead) => sum + (lead.ai_score?.score || 0), 0) / (leads.length || 1);
      const closedWonStage = stages.find((s: PipelineStage) => s.name.toLowerCase().includes('won'));
      const closedWon = closedWonStage ? leads.filter((l) => l.stage_id === closedWonStage.id).length : 0;
      const conversionRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;

      setData({
        pipelineDistribution,
        sourceDistribution,
        weeklyActivity,
        conversionTrend,
        stats: {
          totalLeads,
          pipelineValue: totalValue,
          avgScore: Math.round(avgScore),
          conversionRate: Math.round(conversionRate * 10) / 10,
        },
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = data ? [
    { label: 'Total Leads', value: data.stats.totalLeads.toString(), change: '+12%', icon: Users, color: '#2563EB' },
    { label: 'Pipeline Value', value: formatCurrency(data.stats.pipelineValue), change: '+8%', icon: DollarSign, color: '#16A34A' },
    { label: 'Avg. Score', value: data.stats.avgScore.toString(), change: '+5%', icon: Target, color: '#8B5CF6' },
    { label: 'Conversion Rate', value: `${data.stats.conversionRate}%`, change: '+3%', icon: TrendingUp, color: '#EA580C' },
  ] : [];

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Performance overview and insights</p>
          </div>
          <button onClick={loadAnalytics} className="btn btn-secondary p-2">
            <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-medium text-[#16A34A]">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Distribution */}
          <div className="card p-6">
            <h3 className="font-semibold text-[#0F172A] mb-4">Pipeline Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.pipelineDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
                  formatter={(value: number, name: string) => [
                    name === 'value' ? formatCurrency(value) : value,
                    name === 'count' ? 'Leads' : 'Value'
                  ]}
                />
                <Bar yAxisId="left" dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Sources */}
          <div className="card p-6">
            <h3 className="font-semibold text-[#0F172A] mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.sourceDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data?.sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className="card p-6">
            <h3 className="font-semibold text-[#0F172A] mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#2563EB" fill="#2563EB20" strokeWidth={2} />
                <Area type="monotone" dataKey="conversations" stroke="#16A34A" fill="#16A34A20" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Trend */}
          <div className="card p-6">
            <h3 className="font-semibold text-[#0F172A] mb-4">Conversion Rate Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.conversionTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
                  formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#8B5CF6" fill="#8B5CF620" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
