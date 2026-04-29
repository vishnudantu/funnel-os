import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Building, Bell, Shield, Save, Check, Loader2, AlertCircle,
  Key, Users, Workflow, Tags, FileText, Clock, Trash2, Edit2, Plus, X,
  ChevronRight, RotateCcw, Download, Upload, Database, Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// Types
interface CompanySettings {
  company_name: string;
  timezone: string;
  currency: string;
  date_format: string;
  language: string;
  phone: string;
  address: string;
  website: string;
  logo_url?: string;
}

interface LocalizationSettings {
  region: string;
  currency: string;
  date_format: string;
  time_format: string;
  number_format: string;
  phone_format: string;
  first_day_of_week: string;
}

interface NotificationSettings {
  high_score_leads: boolean;
  stage_changes: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
  whatsapp_replies: boolean;
  email_notifications: boolean;
  slack_notifications: boolean;
  new_lead_assignment: boolean;
  deal_won_lost: boolean;
  task_reminders: boolean;
}

interface AIProviderConfig {
  provider: string;
  api_key?: string;
  model?: string;
  base_url?: string;
  enabled: boolean;
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  auto_action: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
}

// Constants
const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney', 'Asia/Dubai'
];

const currencies = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  { code: 'MXN', symbol: '$', locale: 'es-MX' },
  { code: 'RUB', symbol: '₽', locale: 'ru-RU' },
  { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
];

const regions = [
  { code: 'US', name: 'United States', currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', phoneFormat: '+1 (XXX) XXX-XXXX' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+44 XXXX XXXXXX' },
  { code: 'IN', name: 'India', currency: 'INR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+91 XXXXX XXXXX' },
  { code: 'DE', name: 'Germany', currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', phoneFormat: '+49 XXXX XXXXXXX' },
  { code: 'FR', name: 'France', currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+33 X XX XX XX XX' },
  { code: 'JP', name: 'Japan', currency: 'JPY', dateFormat: 'YYYY/MM/DD', timeFormat: '24h', phoneFormat: '+81 XX XXXX XXXX' },
  { code: 'AU', name: 'Australia', currency: 'AUD', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+61 XXX XXX XXX' },
  { code: 'CA', name: 'Canada', currency: 'CAD', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', phoneFormat: '+1 (XXX) XXX-XXXX' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+65 XXXX XXXX' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+971 XX XXX XXXX' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+55 (XX) XXXXX-XXXX' },
  { code: 'CN', name: 'China', currency: 'CNY', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', phoneFormat: '+86 XXX XXXX XXXX' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', phoneFormat: '+82 XX XXXX XXXX' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', phoneFormat: '+52 XX XXXX XXXX' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', phoneFormat: '+27 XX XXX XXXX' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/Europe)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (Germany)' },
  { value: 'DD/MMM/YYYY', label: 'DD/MMM/YYYY (e.g., 01/Jan/2024)' },
];

const timeFormats = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
];

const numberFormats = [
  { value: 'en-US', label: '1,234.56 (US/UK)' },
  { value: 'de-DE', label: '1.234,56 (Germany)' },
  { value: 'fr-FR', label: '1 234,56 (France)' },
  { value: 'en-IN', label: '1,23,456.78 (India)' },
];

const aiProviders = [
  { id: 'ollama', name: 'Ollama (Local)', description: 'Free, private, runs locally', defaultModel: 'qwen2.5:72b', requiresApiKey: false },
  { id: 'claude', name: 'Claude (Anthropic)', description: 'Best for complex reasoning', defaultModel: 'claude-sonnet-4-6', requiresApiKey: true },
  { id: 'openai', name: 'GPT-4 (OpenAI)', description: 'Industry standard LLM', defaultModel: 'gpt-4-turbo', requiresApiKey: true },
  { id: 'gemini', name: 'Gemini (Google)', description: 'Multimodal AI from Google', defaultModel: 'gemini-1.5-pro', requiresApiKey: true },
];

const stageColors = [
  '#2563EB', '#16A34A', '#EA580C', '#8B5CF6', '#DC2626', '#0EA5E9', '#D97706', '#7C3AED'
];

type SettingsTab = 'company' | 'localization' | 'pipeline' | 'ai' | 'notifications' | 'team' | 'data' | 'security';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  // State
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    company_name: '', timezone: 'UTC', currency: 'USD', date_format: 'MM/DD/YYYY',
    language: 'en', phone: '', address: '', website: '', logo_url: ''
  });

  const [localization, setLocalization] = useState<LocalizationSettings>({
    region: 'US',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    number_format: 'en-US',
    phone_format: '+1 (XXX) XXX-XXXX',
    first_day_of_week: 'Sunday'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    high_score_leads: true, stage_changes: true, daily_summary: true, weekly_report: true,
    whatsapp_replies: true, email_notifications: true, slack_notifications: false,
    new_lead_assignment: true, deal_won_lost: true, task_reminders: true
  });

  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [providerConfigs, setProviderConfigs] = useState<Record<string, AIProviderConfig>>({
    ollama: { provider: 'ollama', enabled: true, model: 'qwen2.5:72b' },
    claude: { provider: 'claude', enabled: false, api_key: '', model: 'claude-sonnet-4-6' },
    openai: { provider: 'openai', enabled: false, api_key: '', model: 'gpt-4-turbo' },
    gemini: { provider: 'gemini', enabled: false, api_key: '', model: 'gemini-1.5-pro' },
  });

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const orgs = await api.organizations.list();
      if (orgs.organizations?.length > 0) {
        const org = orgs.organizations[0];
        const settings = org.settings as Record<string, unknown> || {};

        setCompanySettings({
          company_name: (settings.company_name as string) || '',
          timezone: (settings.timezone as string) || 'UTC',
          currency: (settings.currency as string) || 'USD',
          date_format: (settings.date_format as string) || 'MM/DD/YYYY',
          language: (settings.language as string) || 'en',
          phone: (settings.phone as string) || '',
          address: (settings.address as string) || '',
          website: (settings.website as string) || '',
        });

        if (settings.notifications) {
          setNotifications(prev => ({ ...prev, ...(settings.notifications as Partial<NotificationSettings>) }));
        }

        if (settings.ai_providers) {
          setProviderConfigs(prev => ({ ...prev, ...(settings.ai_providers as Record<string, AIProviderConfig>) }));
          const active = Object.entries(settings.ai_providers as Record<string, AIProviderConfig>)
            .find(([_, c]) => c.enabled)?.[0];
          if (active) setSelectedProvider(active);
        }
      }

      const stagesRes = await api.stages.list();
      setStages(stagesRes || []);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Save handlers
  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations?.length > 0) {
        await api.organizations.update(orgs.organizations[0].id, { settings: companySettings });
        showSaveMessage('success', 'Company settings saved!');
      }
    } catch (error) {
      showSaveMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocalization = async () => {
    setSaving(true);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations?.length > 0) {
        await api.organizations.update(orgs.organizations[0].id, { settings: { localization } });
        // Also update company settings with matching currency and date format
        await api.organizations.update(orgs.organizations[0].id, {
          settings: {
            ...companySettings,
            currency: localization.currency,
            date_format: localization.date_format
          }
        });
        showSaveMessage('success', 'Localization settings saved! Currency and date format updated.');
      }
    } catch (error) {
      showSaveMessage('error', 'Failed to save localization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegionChange = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode);
    if (region) {
      setLocalization({
        ...localization,
        region: region.code,
        currency: region.currency,
        date_format: region.dateFormat,
        time_format: region.timeFormat,
        phone_format: region.phoneFormat
      });
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations?.length > 0) {
        await api.organizations.update(orgs.organizations[0].id, { settings: { notifications } });
        showSaveMessage('success', 'Notification preferences saved!');
      }
    } catch (error) {
      showSaveMessage('error', 'Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProvider = async (providerId: string) => {
    setSaving(true);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations?.length > 0) {
        await api.organizations.update(orgs.organizations[0].id, {
          settings: { ai_providers: { ...providerConfigs, [providerId]: { ...providerConfigs[providerId], enabled: true } } }
        });
        setSelectedProvider(providerId);
        showSaveMessage('success', `${providerId} activated!`);
      }
    } catch (error) {
      showSaveMessage('error', 'Failed to configure provider');
    } finally {
      setSaving(false);
    }
  };

  const updateProviderConfig = (providerId: string, updates: Partial<AIProviderConfig>) => {
    setProviderConfigs(prev => ({ ...prev, [providerId]: { ...prev[providerId], ...updates } }));
  };

  const handleAddStage = async () => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: `Stage ${stages.length + 1}`,
      order: stages.length,
      color: stageColors[stages.length % stageColors.length],
      auto_action: false
    };
    setStages([...stages, newStage]);
  };

  const handleDeleteStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'company', label: 'Company', icon: <Building size={18} /> },
    { id: 'localization', label: 'Localization', icon: <Globe size={18} /> },
    { id: 'pipeline', label: 'Pipeline', icon: <Workflow size={18} /> },
    { id: 'ai', label: 'AI Provider', icon: <Sparkles size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'team', label: 'Team', icon: <Users size={18} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} /> Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto bg-[#F8FAFC]">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your Saleduct workspace</p>
      </header>

      <div className="flex">
        {/* Sidebar Tabs */}
        <div className="w-56 bg-white border-r border-[#E2E8F0] p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-600 hover:bg-[#F1F5F9]'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mb-6 p-4 rounded-lg flex items-center gap-3',
                saveMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              )}
            >
              {saveMessage.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              {saveMessage.text}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Company Settings */}
            {activeTab === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl"
              >
                <div className="card p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Company Information</h2>

                  <div className="input-group">
                    <input type="text" id="company" value={companySettings.company_name}
                      onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })} />
                    <label htmlFor="company">Company Name</label>
                  </div>
                  <div className="input-group">
                    <input type="text" id="website" value={companySettings.website}
                      onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })} />
                    <label htmlFor="website">Website</label>
                  </div>
                  <div className="input-group">
                    <input type="tel" id="phone" value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })} />
                    <label htmlFor="phone">Phone Number</label>
                  </div>
                  <div className="input-group">
                    <textarea id="address" value={companySettings.address}
                      onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      rows={3} />
                    <label htmlFor="address">Address</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                      <select id="timezone" value={companySettings.timezone}
                        onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                      <label htmlFor="timezone">Timezone</label>
                    </div>
                    <div className="input-group">
                      <select id="currency" value={companySettings.currency}
                        onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} - {c.code}</option>)}
                      </select>
                      <label htmlFor="currency">Currency</label>
                    </div>
                  </div>
                  <button onClick={handleSaveCompany} disabled={saving}
                    className={cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed')}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Company Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Localization Settings */}
            {activeTab === 'localization' && (
              <motion.div
                key="localization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                <div className="card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Region & Localization</h2>
                    <p className="text-sm text-slate-500">
                      Select your region to automatically configure currency, date format, and number formatting
                    </p>
                  </div>

                  {/* Region Quick Select */}
                  <div className="space-y-4">
                    <div className="input-group">
                      <select
                        value={localization.region}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-base"
                      >
                        {regions.map(r => (
                          <option key={r.code} value={r.code}>{r.name}</option>
                        ))}
                      </select>
                      <label htmlFor="region">Select Region</label>
                    </div>

                    <div className="p-4 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-lg">
                      <p className="text-sm font-medium text-[#2563EB] mb-2">Region Preset Applied:</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">Currency:</span>
                          <span className="ml-2 font-medium">{localization.currency}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Date Format:</span>
                          <span className="ml-2 font-medium">{localization.date_format}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Time Format:</span>
                          <span className="ml-2 font-medium">{localization.time_format === '12h' ? '12-hour (AM/PM)' : '24-hour'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Phone Format:</span>
                          <span className="ml-2 font-medium">{localization.phone_format}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0F172A]">Currency Settings</h3>
                    <div className="input-group">
                      <select
                        value={localization.currency}
                        onChange={(e) => setLocalization({ ...localization, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        {currencies.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.symbol} - {c.code} ({c.locale})
                          </option>
                        ))}
                      </select>
                      <label htmlFor="currency">Currency</label>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Preview:</span>{' '}
                        {new Intl.NumberFormat(
                          currencies.find(c => c.code === localization.currency)?.locale || 'en-US',
                          { style: 'currency', currency: localization.currency }
                        ).format(1234.56)}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0F172A]">Date & Time</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="input-group">
                        <select
                          value={localization.date_format}
                          onChange={(e) => setLocalization({ ...localization, date_format: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          {dateFormats.map(df => (
                            <option key={df.value} value={df.value}>{df.label}</option>
                          ))}
                        </select>
                        <label htmlFor="date_format">Date Format</label>
                      </div>
                      <div className="input-group">
                        <select
                          value={localization.time_format}
                          onChange={(e) => setLocalization({ ...localization, time_format: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          {timeFormats.map(tf => (
                            <option key={tf.value} value={tf.value}>{tf.label}</option>
                          ))}
                        </select>
                        <label htmlFor="time_format">Time Format</label>
                      </div>
                    </div>
                    <div className="input-group">
                      <select
                        value={localization.first_day_of_week}
                        onChange={(e) => setLocalization({ ...localization, first_day_of_week: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                      <label htmlFor="first_day_of_week">First Day of Week</label>
                    </div>
                  </div>

                  {/* Number Format */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0F172A]">Number Formatting</h3>
                    <div className="input-group">
                      <select
                        value={localization.number_format}
                        onChange={(e) => setLocalization({ ...localization, number_format: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        {numberFormats.map(nf => (
                          <option key={nf.value} value={nf.value}>{nf.label}</option>
                        ))}
                      </select>
                      <label htmlFor="number_format">Number Format</label>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Preview:</span>{' '}
                        {new Intl.NumberFormat(localization.number_format, { minimumFractionDigits: 2 }).format(1234567.89)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveLocalization}
                    disabled={saving}
                    className={cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed')}
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Localization Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Pipeline Settings */}
            {activeTab === 'pipeline' && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#0F172A]">Pipeline Stages</h2>
                      <p className="text-sm text-slate-500 mt-1">Customize your sales funnel stages</p>
                    </div>
                    <button onClick={handleAddStage} className="btn btn-primary">
                      <Plus size={18} /> Add Stage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: stage.color }}>{index + 1}</div>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[index].name = e.target.value;
                            setStages(newStages);
                          }}
                          className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                        <select
                          value={stage.color}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[index].color = e.target.value;
                            setStages(newStages);
                          }}
                          className="w-20 px-2 py-2 border border-[#E2E8F0] rounded-lg"
                        >
                          {stageColors.map(color => (
                            <option key={color} value={color}>
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={stage.auto_action}
                            onChange={(e) => {
                              const newStages = [...stages];
                              newStages[index].auto_action = e.target.checked;
                              setStages(newStages);
                            }}
                            className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB]"
                          />
                          Auto-advance
                        </label>
                        <button onClick={() => handleDeleteStage(index)} className="p-2 text-slate-400 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button onClick={() => showSaveMessage('success', 'Pipeline stages saved!')} className="btn btn-primary">
                      <Save size={18} /> Save Pipeline
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Provider Settings */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#0F172A]">AI Provider Configuration</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose and configure your AI backend for lead scoring and messaging</p>
                </div>

                <div className="grid gap-4">
                  {aiProviders.map((provider) => {
                    const config = providerConfigs[provider.id];
                    const isSelected = selectedProvider === provider.id;

                    return (
                      <div
                        key={provider.id}
                        className={cn(
                          'card p-6 transition-all cursor-pointer',
                          isSelected ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-[#E2E8F0]'
                        )}
                        onClick={() => setSelectedProvider(provider.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={cn('w-4 h-4 rounded-full border-2', isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1]')} />
                            <div>
                              <h3 className="font-semibold text-[#0F172A]">{provider.name}</h3>
                              <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
                            </div>
                          </div>
                          {isSelected && <span className="text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full font-medium">Active</span>}
                        </div>

                        {provider.requiresApiKey && (
                          <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                            <div className="input-group">
                              <input type="password" value={config?.api_key || ''}
                                onChange={(e) => updateProviderConfig(provider.id, { api_key: e.target.value })}
                                placeholder="sk-..." onClick={(e) => e.stopPropagation()} />
                              <label>API Key</label>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                          <div className="input-group" onClick={(e) => e.stopPropagation()}>
                            <input type="text" value={config?.model || provider.defaultModel}
                              onChange={(e) => updateProviderConfig(provider.id, { model: e.target.value })} />
                            <label>Model</label>
                          </div>
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); handleSaveProvider(provider.id); }}
                          disabled={saving} className={cn('btn btn-primary mt-4', saving && 'opacity-50 cursor-not-allowed')}>
                          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          {saving ? 'Saving...' : 'Save & Activate'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl"
              >
                <div className="card p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Notification Preferences</h2>

                  {[
                    { label: 'New high-score leads (80+)', key: 'high_score_leads', desc: 'Get notified when leads score above 80' },
                    { label: 'Lead stage changes', key: 'stage_changes', desc: 'When a lead moves to a different stage' },
                    { label: 'Daily pipeline summary', key: 'daily_summary', desc: 'End of day summary of pipeline activity' },
                    { label: 'Weekly report', key: 'weekly_report', desc: 'Weekly performance and conversion report' },
                    { label: 'WhatsApp message replies', key: 'whatsapp_replies', desc: 'When leads reply to WhatsApp messages' },
                    { label: 'New lead assignment', key: 'new_lead_assignment', desc: 'When a new lead is assigned to you' },
                    { label: 'Deal won/lost notifications', key: 'deal_won_lost', desc: 'When deals are closed' },
                    { label: 'Task reminders', key: 'task_reminders', desc: 'Reminders for pending follow-ups' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start justify-between py-3 border-b border-[#E2E8F0] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <input type="checkbox" checked={notifications[item.key as keyof NotificationSettings]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" />
                    </label>
                  ))}
                  <button onClick={handleSaveNotifications} disabled={saving}
                    className={cn('btn btn-primary mt-4', saving && 'opacity-50 cursor-not-allowed')}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Team Management */}
            {activeTab === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#0F172A]">Team Members</h2>
                      <p className="text-sm text-slate-500 mt-1">Manage your team and permissions</p>
                    </div>
                    <button className="btn btn-primary">
                      <Plus size={18} /> Invite Member
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Users size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No team members yet. Invite your first team member!</p>
                      </div>
                    ) : (
                      teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-semibold">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-[#0F172A]">{member.name}</p>
                              <p className="text-sm text-slate-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn('text-xs px-2 py-1 rounded-full font-medium',
                              member.status === 'active' ? 'bg-green-100 text-green-700' :
                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            )}>{member.status}</span>
                            <span className="text-sm text-slate-600 capitalize">{member.role}</span>
                            <button className="p-2 text-slate-400 hover:text-slate-600"><Edit2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                <div className="card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">Data Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Export, import, and manage your data</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">Export All Leads</p>
                        <p className="text-sm text-slate-500 mt-1">Download all leads as CSV file</p>
                      </div>
                      <button className="btn btn-secondary">
                        <Download size={18} /> Export CSV
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">Import Leads</p>
                        <p className="text-sm text-slate-500 mt-1">Upload CSV file to import leads</p>
                      </div>
                      <button className="btn btn-secondary">
                        <Upload size={18} /> Import
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">Clear AI Scores</p>
                        <p className="text-sm text-slate-500 mt-1">Remove all AI scores and re-score leads</p>
                      </div>
                      <button className="btn btn-secondary">
                        <RotateCcw size={18} /> Reset Scores
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-700">Delete All Data</p>
                        <p className="text-sm text-red-600 mt-1">Permanently delete all leads and data</p>
                      </div>
                      <button className="btn" style={{ backgroundColor: '#DC2626', color: 'white' }}>
                        <Trash2 size={18} /> Delete All
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl"
              >
                <div className="card p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Security Settings</h2>

                  <div className="flex items-center justify-between py-4 border-b border-[#E2E8F0]">
                    <div>
                      <p className="font-medium text-[#0F172A]">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500 mt-1">Add extra security with 2FA</p>
                    </div>
                    <button className="btn btn-secondary">
                      <Key size={16} /> Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-[#E2E8F0]">
                    <div>
                      <p className="font-medium text-[#0F172A]">Change Password</p>
                      <p className="text-sm text-slate-500 mt-1">Update your password</p>
                    </div>
                    <button className="btn btn-secondary">
                      <Shield size={16} /> Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-[#E2E8F0]">
                    <div>
                      <p className="font-medium text-[#0F172A]">Active Sessions</p>
                      <p className="text-sm text-slate-500 mt-1">Manage logged-in devices</p>
                    </div>
                    <button className="btn btn-secondary">
                      <ChevronRight size={16} /> View
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-[#0F172A]">API Keys</p>
                      <p className="text-sm text-slate-500 mt-1">Manage API access tokens</p>
                    </div>
                    <button className="btn btn-secondary">
                      <Key size={16} /> Manage
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
