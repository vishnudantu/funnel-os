import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  X, MessageSquare, Phone, Mail, Calendar, TrendingUp, Send, Edit2, RefreshCw, Sparkles,
  ArrowLeft, User, Building, MapPin, Globe, Trash2, MoreVertical, NotePlus
} from 'lucide-react';
import { cn, formatRelativeTime, getPriorityColor, getSourceColor } from '../lib/utils';
import { api, type Lead } from '../lib/api';

interface LeadDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  deal_value?: number | null;
  ai_score: { score: number; reasoning: string; priority: 'low' | 'medium' | 'high' | 'urgent' } | null;
  stage: { id: string; name: string; color: string } | null;
  messages: Array<{ id: string; direction: string; body: string; channel: string; status: string; created_at: string }>;
  events: Array<{ id: string; event_type: string; payload: any; timestamp: string }>;
  created_at: string;
}

type TabType = 'overview' | 'messages' | 'activity' | 'notes' | 'ai';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; content: string; created_by: string; created_at: string }>>([]);
  const [deleting, setDeleting] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    if (id) loadLead();
  }, [id]);

  const loadLead = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.leads.get(id);
      setLead(data);
    } catch (error) {
      console.error('Failed to load lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lead || !confirm('Are you sure you want to delete this lead?')) return;
    setDeleting(true);
    try {
      await api.leads.delete(lead.id);
      navigate('/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const handleRescore = async () => {
    if (!lead) return;
    setScoring(true);
    try {
      const result = await api.leads.score(lead.id);
      setLead({ ...lead, ai_score: result.score });
    } catch (error) {
      console.error('Failed to rescore lead:', error);
      alert('Failed to rescore lead');
    } finally {
      setScoring(false);
    }
  };

  const handleSendNote = async () => {
    if (!note.trim()) return;
    setSending(true);
    try {
      // TODO: Implement backend note creation
      const newNote = {
        id: Date.now().toString(),
        content: note,
        created_by: 'You',
        created_at: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
      setNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Lead not found</h2>
        <button onClick={() => navigate('/leads')} className="btn btn-primary">
          <ArrowLeft size={18} />
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{lead.name}</h1>
              <p className="text-sm text-slate-500">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: getSourceColor(lead.source) }}
            >
              {lead.source}
            </span>
            {lead.stage && (
              <span
                className="text-xs px-3 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: lead.stage.color }}
              >
                {lead.stage.name}
              </span>
            )}
            {lead.ai_score && (
              <span
                className="text-xs px-3 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: getPriorityColor(lead.ai_score.priority) }}
              >
                Score: {lead.ai_score.score}
              </span>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-4 mb-6 border-b border-[#E2E8F0]">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'activity', label: 'Activity', icon: Calendar },
              { id: 'notes', label: 'Notes', icon: NotePlus },
              { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <User size={20} className="text-slate-400" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="text-sm font-medium">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium">{lead.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium">{lead.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="text-sm font-medium capitalize">{lead.source}</p>
                  </div>
                  {lead.deal_value && (
                    <div>
                      <p className="text-xs text-slate-500">Deal Value</p>
                      <p className="text-sm font-medium">${lead.deal_value.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-slate-400" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm font-medium">{formatRelativeTime(new Date(lead.created_at))}</p>
                  </div>
                  {lead.stage && (
                    <div>
                      <p className="text-xs text-slate-500">Current Stage</p>
                      <p className="text-sm font-medium">{lead.stage.name}</p>
                    </div>
                  )}
                  {lead.messages.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Messages</p>
                      <p className="text-sm font-medium">{lead.messages.length} total</p>
                    </div>
                  )}
                  {lead.events.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Events</p>
                      <p className="text-sm font-medium">{lead.events.length} activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="card">
              <div className="p-6 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#0F172A]">Message History</h3>
              </div>
              <div className="p-6">
                {lead.messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No messages yet</div>
                ) : (
                  <div className="space-y-4">
                    {lead.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-4 rounded-lg max-w-[80%]',
                          msg.direction === 'outbound'
                            ? 'ml-auto bg-[#2563EB] text-white'
                            : 'bg-[#F1F5F9] text-[#0F172A]'
                        )}
                      >
                        <p className="text-sm">{msg.body}</p>
                        <p className={cn(
                          'text-xs mt-2',
                          msg.direction === 'outbound' ? 'text-blue-100' : 'text-slate-500'
                        )}>
                          {formatRelativeTime(new Date(msg.created_at))} • {msg.channel}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="card">
              <div className="p-6 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#0F172A]">Activity Timeline</h3>
              </div>
              <div className="p-6">
                {lead.events.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No activities recorded</div>
                ) : (
                  <div className="space-y-6">
                    {lead.events.map((event, i) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
                          {i < lead.events.length - 1 && (
                            <div className="w-px flex-1 bg-[#E2E8F0] my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-[#0F172A] capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </p>
                          {event.payload && (
                            <p className="text-xs text-slate-600 mt-1">
                              {JSON.stringify(event.payload)}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            {formatRelativeTime(new Date(event.timestamp))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-[#0F172A] mb-4">Add Note</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your note here..."
                  className="w-full p-4 border border-[#E2E8F0] rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSendNote}
                    disabled={sending || !note.trim()}
                    className={cn('btn btn-primary', sending && 'opacity-50 cursor-not-allowed')}
                  >
                    <NotePlus size={18} />
                    {sending ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="p-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#0F172A]">Notes ({notes.length})</h3>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {notes.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No notes yet</div>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-4">
                        <p className="text-sm text-[#0F172A]">{n.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">{n.created_by}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{formatRelativeTime(new Date(n.created_at))}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {lead.ai_score ? (
                <>
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                        <Sparkles className="text-[#2563EB]" size={20} />
                        AI Lead Score
                      </h3>
                      <button
                        onClick={handleRescore}
                        disabled={scoring}
                        className={cn(
                          'text-xs flex items-center gap-1 text-[#2563EB] hover:underline',
                          scoring && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <RefreshCw size={14} className={cn(scoring && 'animate-spin')} />
                        {scoring ? 'Scoring...' : 'Rescore'}
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke={getPriorityColor(lead.ai_score.priority)}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(lead.ai_score.score / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{lead.ai_score.score}</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs px-2 py-1 rounded-full text-white font-medium"
                            style={{ backgroundColor: getPriorityColor(lead.ai_score.priority) }}
                          >
                            {lead.ai_score.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{lead.ai_score.reasoning}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-6">
                  <div className="text-center">
                    <Sparkles className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="font-semibold text-[#0F172A] mb-2">No AI Score Yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Score this lead with AI to get insights</p>
                    <button onClick={handleRescore} disabled={scoring} className="btn btn-primary">
                      <Sparkles size={18} />
                      {scoring ? 'Scoring...' : 'Score with AI'}
                    </button>
                  </div>
                </div>
              )}

              <div className="card p-6 border-[#2563EB]/30 bg-[#2563EB]/5">
                <h3 className="font-semibold text-[#0F172A] flex items-center gap-2 mb-4">
                  <TrendingUp className="text-[#2563EB]" size={20} />
                  Recommended Action
                </h3>
                {lead.ai_score ? (
                  <>
                    <p className="text-sm text-slate-700 mb-3">
                      {lead.ai_score.priority === 'urgent' || lead.ai_score.priority === 'high'
                        ? 'High priority lead - Contact within 1 hour for best conversion rate.'
                        : lead.ai_score.priority === 'medium'
                        ? 'Medium priority - Follow up within 24 hours with personalized message.'
                        : 'Low priority - Add to nurture sequence for automated follow-up.'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Best contact method: {lead.phone ? 'Phone/WhatsApp' : 'Email'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-700">Score the lead first to get AI recommendations.</p>
                )}
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-[#0F172A] mb-4">Draft Message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message or use AI to generate one..."
                  className="w-full p-4 border border-[#E2E8F0] rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="flex items-center justify-between mt-4">
                  <button className="text-sm text-[#2563EB] hover:underline flex items-center gap-1">
                    <Sparkles size={16} />
                    Generate with AI
                  </button>
                  <button className="btn btn-primary">
                    <Send size={18} />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-80 border-l border-[#E2E8F0] bg-white p-6 overflow-auto mobile-hide">
          <h3 className="font-semibold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary py-3 justify-center">
              <MessageSquare size={18} />
              Send WhatsApp
            </button>
            <button className="w-full btn btn-secondary py-3 justify-center">
              <Phone size={18} />
              Call Lead
            </button>
            <button className="w-full btn btn-secondary py-3 justify-center">
              <Mail size={18} />
              Send Email
            </button>
            <button className="w-full btn btn-secondary py-3 justify-center">
              <Edit2 size={18} />
              Edit Details
            </button>
          </div>

          {lead.deal_value && (
            <div className="mt-8 p-4 bg-[#16A34A]/10 rounded-lg">
              <p className="text-xs text-[#16A34A] font-medium uppercase tracking-wider mb-1">Deal Value</p>
              <p className="text-2xl font-bold text-[#16A34A]">${lead.deal_value.toLocaleString()}</p>
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Lead Source
            </h4>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSourceColor(lead.source) }}
              />
              <span className="text-sm font-medium capitalize">{lead.source}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
