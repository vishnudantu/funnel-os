import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { cn, formatCurrency, formatRelativeTime, getPriorityColor, getSourceColor } from '../lib/utils';
import { api, type Lead as APILead } from '../lib/api';
import AddLeadModal from '../components/AddLeadModal';

interface Stage {
  id: string;
  name: string;
  order: number;
  color: string;
  auto_action: boolean;
}

interface PipelineLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage_id: string;
  ai_score: { score: number; reasoning: string; priority: 'low' | 'medium' | 'high' | 'urgent' } | null;
  last_activity: Date;
  deal_value?: number | null;
}

interface LeadCardProps {
  lead: PipelineLead;
  onClick: () => void;
}

function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="card p-4 cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] truncate">{lead.name}</h3>
          <p className="text-sm text-slate-500 truncate">{lead.email}</p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full text-white font-medium"
          style={{ backgroundColor: getSourceColor(lead.source) }}
        >
          {lead.source}
        </span>
      </div>

      {lead.ai_score && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke={getPriorityColor(lead.ai_score.priority)}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(lead.ai_score.score / 100) * 100.53} 100.53`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {lead.ai_score.score}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">AI Score</p>
              <p className="text-xs font-medium text-slate-700 truncate">
                {lead.ai_score.reasoning}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <span className="text-xs text-slate-500">
          {formatRelativeTime(lead.last_activity)}
        </span>
        {lead.deal_value && (
          <span className="text-sm font-semibold text-[#16A34A]">
            {formatCurrency(lead.deal_value)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface PipelineColumnProps {
  stage: Stage;
  leads: PipelineLead[];
  onLeadClick: (id: string) => void;
  onAddLead: () => void;
}

function PipelineColumn({ stage, leads, onLeadClick, onAddLead }: PipelineColumnProps) {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);

  return (
    <div className="flex-shrink-0 w-80 flex flex-col">
      <div
        className="px-4 py-3 rounded-t-lg"
        style={{ backgroundColor: `${stage.color}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-[#0F172A]">{stage.name}</h3>
          </div>
          <span className="text-sm font-medium text-slate-600">{leads.length}</span>
        </div>
        {totalValue > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <DollarSign size={12} />
            <span>{formatCurrency(totalValue)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-[#F1F5F9] rounded-b-lg">
        <AnimatePresence>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead.id)} />
          ))}
        </AnimatePresence>

        <button
          onClick={onAddLead}
          className="w-full py-2 border-2 border-dashed border-[#E2E8F0] rounded-lg text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add Lead</span>
        </button>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<PipelineLead[]>([]);
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

      const leadsWithStage = leadsRes.data.map((lead: APILead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage_id: lead.stage_id || '1',
        ai_score: lead.ai_score ? {
          score: lead.ai_score.score,
          reasoning: lead.ai_score.reasoning,
          priority: lead.ai_score.priority as 'low' | 'medium' | 'high' | 'urgent',
        } : null,
        last_activity: new Date(lead.created_at),
        deal_value: lead.deal_value,
      }));
      setLeads(leadsWithStage);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const getLeadsForStage = (stageId: string) => {
    return leads.filter((lead) => lead.stage_id === stageId);
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);

  if (loading && leads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading pipeline...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Pipeline</h1>
            <p className="text-sm text-slate-500 mt-1">
              {leads.length} leads • {formatCurrency(totalValue)} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadPipelineData} className="btn btn-secondary p-2">
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
            </button>
            <button onClick={() => setShowAddLeadModal(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={getLeadsForStage(stage.id)}
              onLeadClick={setSelectedLead}
              onAddLead={() => setShowAddLeadModal(true)}
            />
          ))}
        </div>
      </div>

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSuccess={loadPipelineData}
      />
    </div>
  );
}
