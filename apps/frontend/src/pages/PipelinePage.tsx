import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { cn, formatCurrency, formatRelativeTime, getPriorityColor, getSourceColor } from '../lib/utils';

const mockStages = [
  { id: '1', name: 'New Lead', order: 1, color: '#3B82F6', auto_action: true },
  { id: '2', name: 'Contacted', order: 2, color: '#8B5CF6', auto_action: false },
  { id: '3', name: 'Qualified', order: 3, color: '#16A34A', auto_action: false },
  { id: '4', name: 'Proposal', order: 4, color: '#F59E0B', auto_action: false },
  { id: '5', name: 'Negotiation', order: 5, color: '#EF4444', auto_action: false },
  { id: '6', name: 'Closed Won', order: 6, color: '#10B981', auto_action: true },
];

const mockLeads = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '+1234567890',
    source: 'meta-ads',
    stage_id: '1',
    ai_score: { score: 85, reasoning: 'High intent signals', priority: 'high' as const },
    last_activity: new Date(),
    deal_value: 15000,
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@startup.io',
    phone: '+1987654321',
    source: 'website',
    stage_id: '2',
    ai_score: { score: 62, reasoning: 'Engaged with content', priority: 'medium' as const },
    last_activity: new Date(Date.now() - 3600000),
    deal_value: 8000,
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@enterprise.com',
    phone: '+1122334455',
    source: 'whatsapp',
    stage_id: '3',
    ai_score: { score: 91, reasoning: 'Budget confirmed', priority: 'urgent' as const },
    last_activity: new Date(Date.now() - 7200000),
    deal_value: 45000,
  },
];

interface LeadCardProps {
  lead: typeof mockLeads[0];
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
  stage: typeof mockStages[0];
  leads: typeof mockLeads;
  onLeadClick: (id: string) => void;
}

function PipelineColumn({ stage, leads, onLeadClick }: PipelineColumnProps) {
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

        <button className="w-full py-2 border-2 border-dashed border-[#E2E8F0] rounded-lg text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2">
          <Plus size={18} />
          <span className="text-sm font-medium">Add Lead</span>
        </button>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const getLeadsForStage = (stageId: string) => {
    return mockLeads.filter((lead) => lead.stage_id === stageId);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Pipeline</h1>
            <p className="text-sm text-slate-500 mt-1">
              {mockLeads.length} leads • {formatCurrency(mockLeads.reduce((s, l) => s + (l.deal_value || 0), 0))} total
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {mockStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={getLeadsForStage(stage.id)}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
