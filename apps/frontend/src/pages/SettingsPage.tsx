import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Building,
  Bell,
  Shield,
  Globe,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Key,
  Database,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export interface Settings {
  company_name: string;
  timezone: string;
  currency: string;
  date_format: string;
  language: string;
}

export interface NotificationSettings {
  high_score_leads: boolean;
  stage_changes: boolean;
  daily_summary: boolean;
  whatsapp_replies: boolean;
  email_notifications: boolean;
  slack_notifications: boolean;
}

export interface AIProviderConfig {
  provider: string;
  api_key?: string;
  model?: string;
  base_url?: string;
  enabled: boolean;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'JPY', symbol: '¥' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'SGD', symbol: 'S$' },
];

const aiProviders = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run AI models locally. Free, private, no API costs.',
    defaultModel: 'qwen2.5:72b',
    requiresApiKey: false,
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Best for complex reasoning and long context analysis.',
    defaultModel: 'claude-sonnet-4-6',
    requiresApiKey: true,
  },
  {
    id: 'openai',
    name: 'GPT-4 (OpenAI)',
    description: 'Widely adopted with extensive tooling ecosystem.',
    defaultModel: 'gpt-4-turbo',
    requiresApiKey: true,
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    description: 'Google AI with strong multimodal capabilities.',
    defaultModel: 'gemini-1.5-pro',
    requiresApiKey: true,
  },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Company Settings
  const [companySettings, setCompanySettings] = useState<Settings>({
    company_name: '',
    timezone: 'UTC',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    language: 'en',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    high_score_leads: true,
    stage_changes: true,
    daily_summary: true,
    whatsapp_replies: true,
    email_notifications: true,
    slack_notifications: false,
  });

  // AI Provider Settings
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [providerConfigs, setProviderConfigs] = useState<Record<string, AIProviderConfig>>({
    ollama: { provider: 'ollama', enabled: true, model: 'qwen2.5:72b' },
    claude: { provider: 'claude', enabled: false, api_key: '', model: 'claude-sonnet-4-6' },
    openai: { provider: 'openai', enabled: false, api_key: '', model: 'gpt-4-turbo' },
    gemini: { provider: 'gemini', enabled: false, api_key: '', model: 'gemini-1.5-pro' },
  });

  const loadSettings = async () => {
    try {
      // Load organization settings
      const orgs = await api.organizations.list();
      if (orgs.organizations && orgs.organizations.length > 0) {
        const org = orgs.organizations[0];
        const settings = org.settings || {};
        setCompanySettings({
          company_name: settings.company_name || 'Saleduct Platform',
          timezone: settings.timezone || 'UTC',
          currency: settings.currency || 'USD',
          date_format: settings.date_format || 'MM/DD/YYYY',
          language: settings.language || 'en',
        });

        // Load notification settings
        if (settings.notifications) {
          setNotifications({
            high_score_leads: settings.notifications.high_score_leads ?? true,
            stage_changes: settings.notifications.stage_changes ?? true,
            daily_summary: settings.notifications.daily_summary ?? true,
            whatsapp_replies: settings.notifications.whatsapp_replies ?? true,
            email_notifications: settings.notifications.email_notifications ?? true,
            slack_notifications: settings.notifications.slack_notifications ?? false,
          });
        }

        // Load AI provider settings
        if (settings.ai_providers) {
          setProviderConfigs(prev => ({
            ...prev,
            ...settings.ai_providers,
          }));
          const activeProvider = Object.entries(settings.ai_providers)
            .find(([_, config]) => (config as AIProviderConfig).enabled)?.[0];
          if (activeProvider) setSelectedProvider(activeProvider);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveCompany = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations && orgs.organizations.length > 0) {
        const orgId = orgs.organizations[0].id;
        await api.organizations.update(orgId, {
          settings: {
            ...companySettings,
            notifications,
            ai_providers: providerConfigs,
          },
        });
        setSaveMessage({ type: 'success', text: 'Company settings saved successfully!' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const orgs = await api.organizations.list();
      if (orgs.organizations && orgs.organizations.length > 0) {
        const orgId = orgs.organizations[0].id;
        await api.organizations.update(orgId, {
          settings: {
            ...companySettings,
            notifications,
            ai_providers: providerConfigs,
          },
        });
        setSaveMessage({ type: 'success', text: 'Notification preferences saved!' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save notification settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSaveProvider = async (providerId: string) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const config = providerConfigs[providerId];

      // Test the provider connection if API key is provided
      if (config.api_key && config.api_key.length > 0) {
        // In production, this would call an API endpoint to test the provider
        console.log('Testing provider connection...', providerId);
      }

      const orgs = await api.organizations.list();
      if (orgs.organizations && orgs.organizations.length > 0) {
        const orgId = orgs.organizations[0].id;
        await api.organizations.update(orgId, {
          settings: {
            ...companySettings,
            notifications,
            ai_providers: {
              ...providerConfigs,
              [providerId]: { ...config, enabled: true },
            },
          },
        });
        setSelectedProvider(providerId);
        setSaveMessage({ type: 'success', text: `AI provider ${providerId} configured successfully!` });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to configure AI provider.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const updateProviderConfig = (providerId: string, updates: Partial<AIProviderConfig>) => {
    setProviderConfigs(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], ...updates },
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your Saleduct workspace</p>
      </header>

      <div className="p-6 space-y-8">
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-lg flex items-center gap-3',
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            )}
          >
            {saveMessage.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            {saveMessage.text}
          </motion.div>
        )}

        {/* AI Provider Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
              <Sparkles className="text-[#2563EB]" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A]">AI Provider</h2>
              <p className="text-sm text-slate-500">Configure your AI backend for lead scoring and messaging</p>
            </div>
          </div>

          <div className="grid gap-4">
            {aiProviders.map((provider) => {
              const config = providerConfigs[provider.id];
              const isConfigured = config?.api_key || !provider.requiresApiKey;
              const isSelected = selectedProvider === provider.id;

              return (
                <motion.div
                  key={provider.id}
                  layout
                  className={cn(
                    'card p-6 transition-all',
                    isSelected
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 cursor-pointer',
                        isSelected
                          ? 'border-[#2563EB] bg-[#2563EB]'
                          : 'border-[#CBD5E1]'
                      )}
                        onClick={() => setSelectedProvider(provider.id)}
                      />
                      <div>
                        <h3 className="font-semibold text-[#0F172A]">{provider.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
                      </div>
                    </div>
                    {isConfigured && (
                      <span className="text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full font-medium">
                        {isSelected ? 'Active' : 'Configured'}
                      </span>
                    )}
                  </div>

                  {isSelected && provider.requiresApiKey && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                      <div className="input-group">
                        <input
                          type="password"
                          id={`${provider.id}-api-key`}
                          value={config?.api_key || ''}
                          onChange={(e) => updateProviderConfig(provider.id, { api_key: e.target.value })}
                          placeholder="sk-..."
                        />
                        <label htmlFor={`${provider.id}-api-key`}>API Key</label>
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          id={`${provider.id}-model`}
                          value={config?.model || provider.defaultModel}
                          onChange={(e) => updateProviderConfig(provider.id, { model: e.target.value })}
                        />
                        <label htmlFor={`${provider.id}-model`}>Model</label>
                      </div>
                      <button
                        onClick={() => handleSaveProvider(provider.id)}
                        disabled={saving || !config?.api_key}
                        className={cn(
                          'btn btn-primary',
                          (saving || !config?.api_key) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save & Activate'}
                      </button>
                    </div>
                  )}

                  {isSelected && !provider.requiresApiKey && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                      <div className="input-group">
                        <input
                          type="text"
                          id={`${provider.id}-model`}
                          value={config?.model || provider.defaultModel}
                          onChange={(e) => updateProviderConfig(provider.id, { model: e.target.value })}
                        />
                        <label htmlFor={`${provider.id}-model`}>Model</label>
                      </div>
                      <button
                        onClick={() => handleSaveProvider(provider.id)}
                        disabled={saving}
                        className={cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed')}
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save & Activate'}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Company Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Building className="text-[#8B5CF6]" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A]">Company</h2>
              <p className="text-sm text-slate-500">Your company information and preferences</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="input-group">
              <input
                type="text"
                id="company"
                value={companySettings.company_name}
                onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
              />
              <label htmlFor="company">Company Name</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <select
                  id="timezone"
                  value={companySettings.timezone}
                  onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                  className="input"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <label htmlFor="timezone">Timezone</label>
              </div>
              <div className="input-group">
                <select
                  id="currency"
                  value={companySettings.currency}
                  onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
                  className="input"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} - {c.code}</option>
                  ))}
                </select>
                <label htmlFor="currency">Currency</label>
              </div>
            </div>
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className={cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed')}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Company Settings'}
            </button>
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#EA580C]/10 flex items-center justify-center">
              <Bell className="text-[#EA580C]" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A]">Notifications</h2>
              <p className="text-sm text-slate-500">Configure when and how you get notified</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            {[
              { label: 'New high-score leads (80+)', key: 'high_score_leads', icon: Sparkles },
              { label: 'Lead stage changes', key: 'stage_changes', icon: Database },
              { label: 'Daily pipeline summary', key: 'daily_summary', icon: Mail },
              { label: 'WhatsApp message replies', key: 'whatsapp_replies', icon: MessageSquare },
              { label: 'Email notifications', key: 'email_notifications', icon: Mail },
              { label: 'Slack notifications', key: 'slack_notifications', icon: Globe },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof NotificationSettings]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>
            ))}
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className={cn('btn btn-primary mt-4', saving && 'opacity-50 cursor-not-allowed')}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Notification Preferences'}
            </button>
          </div>
        </section>

        {/* Security Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center">
              <Shield className="text-[#DC2626]" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A]">Security</h2>
              <p className="text-sm text-slate-500">Manage your password and account security</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
              </div>
              <button className="btn btn-secondary text-sm">
                <Key size={16} />
                <span>Enable 2FA</span>
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Change Password</p>
                <p className="text-xs text-slate-500">Update your password regularly for security</p>
              </div>
              <button className="btn btn-secondary text-sm">
                <Shield size={16} />
                <span>Change Password</span>
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Active Sessions</p>
                <p className="text-xs text-slate-500">Manage devices logged into your account</p>
              </div>
              <button className="btn btn-secondary text-sm">
                <Globe size={16} />
                <span>View Sessions</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
