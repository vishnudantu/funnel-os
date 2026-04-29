import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { cn, formatCurrency, formatRelativeTime, getPriorityColor, getSourceColor } from '../lib/utils';
import { api } from '../lib/api';
import AddLeadModal from '../components/AddLeadModal';
function LeadCard({ lead, onClick }) {
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, whileHover: { y: -2 }, onClick: onClick, className: "card p-4 cursor-pointer bg-white", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-[#0F172A] truncate", children: lead.name }), _jsx("p", { className: "text-sm text-slate-500 truncate", children: lead.email })] }), _jsx("span", { className: "text-xs px-2 py-1 rounded-full text-white font-medium", style: { backgroundColor: getSourceColor(lead.source) }, children: lead.source })] }), lead.ai_score && (_jsx("div", { className: "mb-3", children: _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs("div", { className: "relative w-10 h-10", children: [_jsxs("svg", { className: "w-10 h-10 transform -rotate-90", children: [_jsx("circle", { cx: "20", cy: "20", r: "16", stroke: "#E2E8F0", strokeWidth: "4", fill: "none" }), _jsx("circle", { cx: "20", cy: "20", r: "16", stroke: getPriorityColor(lead.ai_score.priority), strokeWidth: "4", fill: "none", strokeDasharray: `${(lead.ai_score.score / 100) * 100.53} 100.53`, strokeLinecap: "round" })] }), _jsx("span", { className: "absolute inset-0 flex items-center justify-center text-xs font-semibold", children: lead.ai_score.score })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-slate-500", children: "AI Score" }), _jsx("p", { className: "text-xs font-medium text-slate-700 truncate", children: lead.ai_score.reasoning })] })] }) })), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-[#E2E8F0]", children: [_jsx("span", { className: "text-xs text-slate-500", children: formatRelativeTime(lead.last_activity) }), lead.deal_value && (_jsx("span", { className: "text-sm font-semibold text-[#16A34A]", children: formatCurrency(lead.deal_value) }))] })] }));
}
function PipelineColumn({ stage, leads, onLeadClick, onAddLead }) {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
    return (_jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col", children: [_jsxs("div", { className: "px-4 py-3 rounded-t-lg", style: { backgroundColor: `${stage.color}15` }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: stage.color } }), _jsx("h3", { className: "font-semibold text-[#0F172A]", children: stage.name })] }), _jsx("span", { className: "text-sm font-medium text-slate-600", children: leads.length })] }), totalValue > 0 && (_jsxs("div", { className: "flex items-center gap-1 mt-2 text-xs text-slate-500", children: [_jsx(DollarSign, { size: 12 }), _jsx("span", { children: formatCurrency(totalValue) })] }))] }), _jsxs("div", { className: "flex-1 p-3 space-y-3 overflow-y-auto bg-[#F1F5F9] rounded-b-lg", children: [_jsx(AnimatePresence, { children: leads.map((lead) => (_jsx(LeadCard, { lead: lead, onClick: () => onLeadClick(lead.id) }, lead.id))) }), _jsxs("button", { onClick: onAddLead, className: "w-full py-2 border-2 border-dashed border-[#E2E8F0] rounded-lg text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2", children: [_jsx(Plus, { size: 18 }), _jsx("span", { className: "text-sm font-medium", children: "Add Lead" })] })] })] }));
}
export default function PipelinePage() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [stages, setStages] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    const loadPipelineData = async () => {
        try {
            setLoading(true);
            const [stagesRes, leadsRes] = await Promise.all([
                api.stages.list(),
                api.leads.list({ limit: 100 }),
            ]);
            setStages(stagesRes || []);
            const leadsWithStage = leadsRes.data.map((lead) => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                source: lead.source,
                stage_id: lead.stage_id || '1',
                ai_score: lead.ai_score ? {
                    score: lead.ai_score.score,
                    reasoning: lead.ai_score.reasoning,
                    priority: lead.ai_score.priority,
                } : null,
                last_activity: new Date(lead.created_at),
                deal_value: lead.deal_value,
            }));
            setLeads(leadsWithStage);
        }
        catch (error) {
            console.error('Failed to load pipeline data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadPipelineData();
    }, []);
    const getLeadsForStage = (stageId) => {
        return leads.filter((lead) => lead.stage_id === stageId);
    };
    const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
    if (loading && leads.length === 0) {
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-3 text-slate-500", children: [_jsx(Loader2, { className: "animate-spin", size: 20 }), "Loading pipeline..."] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Pipeline" }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: [leads.length, " leads \u2022 ", formatCurrency(totalValue), " total"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: loadPipelineData, className: "btn btn-secondary p-2", children: _jsx(RefreshCw, { size: 18, className: cn(loading && 'animate-spin') }) }), _jsxs("button", { onClick: () => setShowAddLeadModal(true), className: "btn btn-primary", children: [_jsx(Plus, { size: 18 }), _jsx("span", { children: "Add Lead" })] })] })] }) }), _jsx("div", { className: "flex-1 overflow-x-auto p-6", children: _jsx("div", { className: "flex gap-4 h-full", children: stages.map((stage) => (_jsx(PipelineColumn, { stage: stage, leads: getLeadsForStage(stage.id), onLeadClick: setSelectedLead, onAddLead: () => setShowAddLeadModal(true) }, stage.id))) }) }), _jsx(AddLeadModal, { isOpen: showAddLeadModal, onClose: () => setShowAddLeadModal(false), onSuccess: loadPipelineData })] }));
}
