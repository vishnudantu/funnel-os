import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building, Bell, Shield, Globe, Save, Check, Loader2, AlertCircle, Key, Database, Mail, MessageSquare, } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
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
    const [saveMessage, setSaveMessage] = useState(null);
    // Company Settings
    const [companySettings, setCompanySettings] = useState({
        company_name: '',
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        language: 'en',
    });
    // Notification Settings
    const [notifications, setNotifications] = useState({
        high_score_leads: true,
        stage_changes: true,
        daily_summary: true,
        whatsapp_replies: true,
        email_notifications: true,
        slack_notifications: false,
    });
    // AI Provider Settings
    const [selectedProvider, setSelectedProvider] = useState('ollama');
    const [providerConfigs, setProviderConfigs] = useState({
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
                const notifications = settings.notifications;
                if (notifications) {
                    setNotifications({
                        high_score_leads: notifications.high_score_leads ?? true,
                        stage_changes: notifications.stage_changes ?? true,
                        daily_summary: notifications.daily_summary ?? true,
                        whatsapp_replies: notifications.whatsapp_replies ?? true,
                        email_notifications: notifications.email_notifications ?? true,
                        slack_notifications: notifications.slack_notifications ?? false,
                    });
                }
                // Load AI provider settings
                const aiProviders = settings.ai_providers;
                if (aiProviders) {
                    setProviderConfigs(prev => ({
                        ...prev,
                        ...aiProviders,
                    }));
                    const activeProvider = Object.entries(aiProviders)
                        .find(([_, config]) => config.enabled)?.[0];
                    if (activeProvider)
                        setSelectedProvider(activeProvider);
                }
            }
        }
        catch (error) {
            console.error('Failed to load settings:', error);
        }
        finally {
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
        }
        catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        }
        finally {
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
        }
        catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save notification settings.' });
        }
        finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };
    const handleSaveProvider = async (providerId) => {
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
        }
        catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to configure AI provider.' });
        }
        finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };
    const updateProviderConfig = (providerId, updates) => {
        setProviderConfigs(prev => ({
            ...prev,
            [providerId]: { ...prev[providerId], ...updates },
        }));
    };
    if (loading) {
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-3 text-slate-500", children: [_jsx(Loader2, { className: "animate-spin", size: 20 }), "Loading settings..."] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col overflow-auto", children: [_jsxs("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0", children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Settings" }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Configure your Saleduct workspace" })] }), _jsxs("div", { className: "p-6 space-y-8", children: [saveMessage && (_jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: cn('p-4 rounded-lg flex items-center gap-3', saveMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'), children: [saveMessage.type === 'success' ? _jsx(Check, { size: 20 }) : _jsx(AlertCircle, { size: 20 }), saveMessage.text] })), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center", children: _jsx(Sparkles, { className: "text-[#2563EB]", size: 20 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-[#0F172A]", children: "AI Provider" }), _jsx("p", { className: "text-sm text-slate-500", children: "Configure your AI backend for lead scoring and messaging" })] })] }), _jsx("div", { className: "grid gap-4", children: aiProviders.map((provider) => {
                                    const config = providerConfigs[provider.id];
                                    const isConfigured = config?.api_key || !provider.requiresApiKey;
                                    const isSelected = selectedProvider === provider.id;
                                    return (_jsxs(motion.div, { layout: true, className: cn('card p-6 transition-all', isSelected
                                            ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                                            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn('w-4 h-4 rounded-full border-2 cursor-pointer', isSelected
                                                                    ? 'border-[#2563EB] bg-[#2563EB]'
                                                                    : 'border-[#CBD5E1]'), onClick: () => setSelectedProvider(provider.id) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-[#0F172A]", children: provider.name }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: provider.description })] })] }), isConfigured && (_jsx("span", { className: "text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full font-medium", children: isSelected ? 'Active' : 'Configured' }))] }), isSelected && provider.requiresApiKey && (_jsxs("div", { className: "mt-4 pt-4 border-t border-[#E2E8F0] space-y-3", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "password", id: `${provider.id}-api-key`, value: config?.api_key || '', onChange: (e) => updateProviderConfig(provider.id, { api_key: e.target.value }), placeholder: "sk-..." }), _jsx("label", { htmlFor: `${provider.id}-api-key`, children: "API Key" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: `${provider.id}-model`, value: config?.model || provider.defaultModel, onChange: (e) => updateProviderConfig(provider.id, { model: e.target.value }) }), _jsx("label", { htmlFor: `${provider.id}-model`, children: "Model" })] }), _jsxs("button", { onClick: () => handleSaveProvider(provider.id), disabled: saving || !config?.api_key, className: cn('btn btn-primary', (saving || !config?.api_key) && 'opacity-50 cursor-not-allowed'), children: [saving ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save & Activate'] })] })), isSelected && !provider.requiresApiKey && (_jsxs("div", { className: "mt-4 pt-4 border-t border-[#E2E8F0]", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: `${provider.id}-model`, value: config?.model || provider.defaultModel, onChange: (e) => updateProviderConfig(provider.id, { model: e.target.value }) }), _jsx("label", { htmlFor: `${provider.id}-model`, children: "Model" })] }), _jsxs("button", { onClick: () => handleSaveProvider(provider.id), disabled: saving, className: cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed'), children: [saving ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save & Activate'] })] }))] }, provider.id));
                                }) })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center", children: _jsx(Building, { className: "text-[#8B5CF6]", size: 20 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-[#0F172A]", children: "Company" }), _jsx("p", { className: "text-sm text-slate-500", children: "Your company information and preferences" })] })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: "company", value: companySettings.company_name, onChange: (e) => setCompanySettings({ ...companySettings, company_name: e.target.value }) }), _jsx("label", { htmlFor: "company", children: "Company Name" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "input-group", children: [_jsx("select", { id: "timezone", value: companySettings.timezone, onChange: (e) => setCompanySettings({ ...companySettings, timezone: e.target.value }), className: "input", children: timezones.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) }), _jsx("label", { htmlFor: "timezone", children: "Timezone" })] }), _jsxs("div", { className: "input-group", children: [_jsx("select", { id: "currency", value: companySettings.currency, onChange: (e) => setCompanySettings({ ...companySettings, currency: e.target.value }), className: "input", children: currencies.map((c) => (_jsxs("option", { value: c.code, children: [c.symbol, " - ", c.code] }, c.code))) }), _jsx("label", { htmlFor: "currency", children: "Currency" })] })] }), _jsxs("button", { onClick: handleSaveCompany, disabled: saving, className: cn('btn btn-primary', saving && 'opacity-50 cursor-not-allowed'), children: [saving ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save Company Settings'] })] })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#EA580C]/10 flex items-center justify-center", children: _jsx(Bell, { className: "text-[#EA580C]", size: 20 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-[#0F172A]", children: "Notifications" }), _jsx("p", { className: "text-sm text-slate-500", children: "Configure when and how you get notified" })] })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [[
                                        { label: 'New high-score leads (80+)', key: 'high_score_leads', icon: Sparkles },
                                        { label: 'Lead stage changes', key: 'stage_changes', icon: Database },
                                        { label: 'Daily pipeline summary', key: 'daily_summary', icon: Mail },
                                        { label: 'WhatsApp message replies', key: 'whatsapp_replies', icon: MessageSquare },
                                        { label: 'Email notifications', key: 'email_notifications', icon: Mail },
                                        { label: 'Slack notifications', key: 'slack_notifications', icon: Globe },
                                    ].map((item) => (_jsxs("label", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(item.icon, { size: 18, className: "text-slate-400" }), _jsx("span", { className: "text-sm text-slate-700", children: item.label })] }), _jsx("input", { type: "checkbox", checked: notifications[item.key], onChange: (e) => setNotifications({ ...notifications, [item.key]: e.target.checked }), className: "w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" })] }, item.key))), _jsxs("button", { onClick: handleSaveNotifications, disabled: saving, className: cn('btn btn-primary mt-4', saving && 'opacity-50 cursor-not-allowed'), children: [saving ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save Notification Preferences'] })] })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center", children: _jsx(Shield, { className: "text-[#DC2626]", size: 20 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-[#0F172A]", children: "Security" }), _jsx("p", { className: "text-sm text-slate-500", children: "Manage your password and account security" })] })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-xs text-slate-500", children: "Add an extra layer of security to your account" })] }), _jsxs("button", { className: "btn btn-secondary text-sm", children: [_jsx(Key, { size: 16 }), _jsx("span", { children: "Enable 2FA" })] })] }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "Change Password" }), _jsx("p", { className: "text-xs text-slate-500", children: "Update your password regularly for security" })] }), _jsxs("button", { className: "btn btn-secondary text-sm", children: [_jsx(Shield, { size: 16 }), _jsx("span", { children: "Change Password" })] })] }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "Active Sessions" }), _jsx("p", { className: "text-xs text-slate-500", children: "Manage devices logged into your account" })] }), _jsxs("button", { className: "btn btn-secondary text-sm", children: [_jsx(Globe, { size: 16 }), _jsx("span", { children: "View Sessions" })] })] })] })] })] })] }));
}
