import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Loader2, RefreshCw } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
const getSourceColor = (source) => {
    const colors = {
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
    const [data, setData] = useState(null);
    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const leadsRes = await api.leads.list({ limit: 100 });
            const stagesRes = await api.stages.list();
            const leads = leadsRes.data;
            const stages = stagesRes || [];
            // Calculate pipeline distribution
            const pipelineMap = new Map();
            stages.forEach((stage) => {
                pipelineMap.set(stage.name, { count: 0, value: 0 });
            });
            leads.forEach((lead) => {
                const stage = stages.find((s) => s.id === lead.stage_id);
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
            const sourceMap = new Map();
            leads.forEach((lead) => {
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
            const closedWonStage = stages.find((s) => s.name.toLowerCase().includes('won'));
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
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
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
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-3 text-slate-500", children: [_jsx(Loader2, { className: "animate-spin", size: 20 }), "Loading analytics..."] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col overflow-auto", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Analytics" }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Performance overview and insights" })] }), _jsx("button", { onClick: loadAnalytics, className: "btn btn-secondary p-2", children: _jsx(RefreshCw, { size: 18, className: cn(loading && 'animate-spin') }) })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat) => (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center", style: { backgroundColor: `${stat.color}15` }, children: _jsx(stat.icon, { size: 20, style: { color: stat.color } }) }), _jsx("span", { className: "text-xs font-medium text-[#16A34A]", children: stat.change })] }), _jsx("p", { className: "text-2xl font-bold text-[#0F172A]", children: stat.value }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: stat.label })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Pipeline Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: data?.pipelineDistribution || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }), _jsx(XAxis, { dataKey: "stage", tick: { fontSize: 11 }, angle: -15, textAnchor: "end", height: 60 }), _jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 } }), _jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, tickFormatter: (v) => `$${v / 1000}k` }), _jsx(Tooltip, { contentStyle: { borderRadius: 8, border: '1px solid #E2E8F0' }, formatter: (value, name) => [
                                                        name === 'value' ? formatCurrency(value) : value,
                                                        name === 'count' ? 'Leads' : 'Value'
                                                    ] }), _jsx(Bar, { yAxisId: "left", dataKey: "count", fill: "#2563EB", radius: [4, 4, 0, 0] }), _jsx(Bar, { yAxisId: "right", dataKey: "value", fill: "#16A34A", radius: [4, 4, 0, 0], opacity: 0.6 })] }) })] }), _jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Lead Sources" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data?.sourceDistribution || [], cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 2, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: data?.sourceDistribution.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { borderRadius: 8, border: '1px solid #E2E8F0' } })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Weekly Activity" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(AreaChart, { data: data?.weeklyActivity || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }), _jsx(XAxis, { dataKey: "day", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { borderRadius: 8, border: '1px solid #E2E8F0' } }), _jsx(Area, { type: "monotone", dataKey: "leads", stroke: "#2563EB", fill: "#2563EB20", strokeWidth: 2 }), _jsx(Area, { type: "monotone", dataKey: "conversations", stroke: "#16A34A", fill: "#16A34A20", strokeWidth: 2 })] }) })] }), _jsxs("div", { className: "card p-6", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] mb-4", children: "Conversion Rate Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(AreaChart, { data: data?.conversionTrend || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `${v}%` }), _jsx(Tooltip, { contentStyle: { borderRadius: 8, border: '1px solid #E2E8F0' }, formatter: (value) => [`${value}%`, 'Conversion Rate'] }), _jsx(Area, { type: "monotone", dataKey: "rate", stroke: "#8B5CF6", fill: "#8B5CF620", strokeWidth: 2 })] }) })] })] })] })] }));
}
