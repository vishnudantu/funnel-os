import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const pipelineData = [
  { stage: 'New Lead', count: 24, value: 120000 },
  { stage: 'Contacted', count: 18, value: 95000 },
  { stage: 'Qualified', count: 12, value: 180000 },
  { stage: 'Proposal', count: 8, value: 160000 },
  { stage: 'Negotiation', count: 5, value: 125000 },
  { stage: 'Closed Won', count: 11, value: 340000 },
];

const sourceData = [
  { name: 'Meta Ads', value: 45, color: '#1877F2' },
  { name: 'Website', value: 28, color: '#8B5CF6' },
  { name: 'WhatsApp', value: 18, color: '#25D366' },
  { name: 'Import', value: 9, color: '#0EA5E9' },
];

const activityData = [
  { day: 'Mon', leads: 12, conversations: 8 },
  { day: 'Tue', leads: 18, conversations: 14 },
  { day: 'Wed', leads: 15, conversations: 11 },
  { day: 'Thu', leads: 22, conversations: 19 },
  { day: 'Fri', leads: 20, conversations: 16 },
  { day: 'Sat', leads: 8, conversations: 5 },
  { day: 'Sun', leads: 5, conversations: 3 },
];

const conversionData = [
  { month: 'Jan', rate: 18.5 },
  { month: 'Feb', rate: 21.2 },
  { month: 'Mar', rate: 19.8 },
  { month: 'Apr', rate: 24.5 },
];

const stats = [
  { label: 'Total Leads', value: '156', change: '+12%', icon: Users, color: '#2563EB' },
  { label: 'Pipeline Value', value: formatCurrency(1020000), change: '+8%', icon: DollarSign, color: '#16A34A' },
  { label: 'Avg. Score', value: '67', change: '+5%', icon: Target, color: '#8B5CF6' },
  { label: 'Conversion Rate', value: '22.4%', change: '+3%', icon: TrendingUp, color: '#EA580C' },
];

export default function AnalyticsPage() {
  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Performance overview and insights</p>
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
              <BarChart data={pipelineData}>
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
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
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
              <AreaChart data={activityData}>
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
              <AreaChart data={conversionData}>
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
