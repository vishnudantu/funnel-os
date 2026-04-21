import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Send,
  Edit2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { cn, formatRelativeTime, getPriorityColor, getSourceColor } from '../lib/utils';

const mockLead = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@techcorp.com',
  phone: '+1234567890',
  source: 'meta-ads',
  company: 'TechCorp Inc.',
  position: 'VP of Engineering',
  stage: 'New Lead',
  created_at: new Date(Date.now() - 86400000 * 3),
  ai_score: {
    score: 85,
    reasoning: 'High intent signals from ad engagement. Complete contact info. Decision-maker title.',
    priority: 'high' as const,
    model_used: 'claude-sonnet-4-6',
    confidence: 0.92,
  },
  ai_suggestion: {
    nextAction: 'Send personalized WhatsApp message within 2 hours. Mention specific pain point from ad interaction.',
    bestTime: '2:00 PM - 4:00 PM (their timezone)',
    tone: 'professional-friendly',
  },
  drafted_message: "Hi Sarah! Noticed you're interested in scaling your engineering team. We've helped similar VP-level leaders reduce hiring time by 40%. Worth a quick chat this week?",
  activities: [
    { type: 'ad_click', description: 'Clicked Meta ad: "Scale Engineering Team"', time: new Date() },
    { type: 'form_submit', description: 'Submitted contact form on pricing page', time: new Date(Date.now() - 1800000) },
    { type: 'page_view', description: 'Viewed enterprise features page (3 min)', time: new Date(Date.now() - 3600000) },
  ],
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState(mockLead.drafted_message);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
  };

  const handleRegenerate = async () => {
    // Simulate AI regeneration
    setMessage('Regenerating...');
    await new Promise((r) => setTimeout(r, 1000));
    setMessage(mockLead.drafted_message);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">{mockLead.name}</h1>
            <p className="text-sm text-slate-500">{mockLead.company} • {mockLead.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-3 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: getSourceColor(mockLead.source) }}
          >
            {mockLead.source}
          </span>
          <span className="text-sm text-slate-600">{mockLead.stage}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="bg-[#F1F5F9] p-1 rounded-lg inline-flex mb-6">
              <TabsTrigger value="overview" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2563EB]">
                Overview
              </TabsTrigger>
              <TabsTrigger value="ai" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2563EB]">
                AI Intelligence
              </TabsTrigger>
              <TabsTrigger value="activity" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2563EB]">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-400" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium">{mockLead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-slate-400" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium">{mockLead.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-slate-400" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Created</p>
                        <p className="text-sm font-medium">{formatRelativeTime(mockLead.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-4">Company Info</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="text-sm font-medium">{mockLead.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Position</p>
                      <p className="text-sm font-medium">{mockLead.position}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="h-full">
              <div className="space-y-6">
                {/* AI Score Card */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                      <Sparkles className="text-[#2563EB]" size={20} />
                      AI Lead Score
                    </h3>
                    <span className="text-xs px-2 py-1 bg-[#F1F5F9] rounded text-slate-600">
                      {mockLead.ai_score.model_used}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#E2E8F0"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={getPriorityColor(mockLead.ai_score.priority)}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(mockLead.ai_score.score / 100) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{mockLead.ai_score.score}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: getPriorityColor(mockLead.ai_score.priority) }}
                        >
                          {mockLead.ai_score.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          Confidence: {(mockLead.ai_score.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{mockLead.ai_score.reasoning}</p>
                    </div>
                  </div>
                </div>

                {/* AI Suggestion */}
                <div className="card p-6 border-[#2563EB]/30 bg-[#2563EB]/5">
                  <h3 className="font-semibold text-[#0F172A] flex items-center gap-2 mb-4">
                    <TrendingUp className="text-[#2563EB]" size={20} />
                    Recommended Action
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">{mockLead.ai_suggestion.nextAction}</p>
                  <p className="text-xs text-slate-500">Best time: {mockLead.ai_suggestion.bestTime}</p>
                </div>

                {/* Drafted Message */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                      <MessageSquare className="text-slate-400" size={20} />
                      Drafted WhatsApp Message
                    </h3>
                    <button
                      onClick={handleRegenerate}
                      className="text-xs flex items-center gap-1 text-[#2563EB] hover:underline"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 border border-[#E2E8F0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[120px]"
                  />

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-500">
                      Tone: {mockLead.ai_suggestion.tone}
                    </span>
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className={cn(
                        'btn btn-primary',
                        sending && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Send size={18} />
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="h-full">
              <div className="card">
                <div className="p-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#0F172A]">Activity Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {mockLead.activities.map((activity, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          {i < mockLead.activities.length - 1 && (
                            <div className="w-px flex-1 bg-[#E2E8F0] my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-[#0F172A]">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(activity.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-80 border-l border-[#E2E8F0] bg-white p-6 overflow-auto mobile-hide">
          <h3 className="font-semibold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary py-3">
              <MessageSquare size={18} />
              Send WhatsApp
            </button>
            <button className="w-full btn btn-secondary py-3">
              <Phone size={18} />
              Call Lead
            </button>
            <button className="w-full btn btn-secondary py-3">
              <Mail size={18} />
              Send Email
            </button>
            <button className="w-full btn btn-secondary py-3">
              <Edit2 size={18} />
              Edit Details
            </button>
          </div>

          <div className="mt-8">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Notes
            </h4>
            <textarea
              placeholder="Add a note..."
              className="w-full p-3 border border-[#E2E8F0] rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
