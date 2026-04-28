import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Settings2, Plus, Trash2, Clock, AlertCircle, } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
function IntegrationCard({ integration, templates, onToggle, onConfigure, onTest, onDelete }) {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const template = templates.find((t) => t.provider === integration.provider);
    const isConnected = integration.status === 'active';
    const hasError = integration.status === 'error';
    const isPending = integration.status === 'pending_config';
    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            await onTest(integration.id);
            setTestResult({ success: true, message: 'Connection test passed!' });
        }
        catch {
            setTestResult({ success: false, message: 'Connection test failed' });
        }
        finally {
            setTesting(false);
        }
    };
    const handleToggle = async () => {
        await onToggle(integration.id, !isConnected);
    };
    const getStatusIcon = () => {
        if (hasError)
            return _jsx(AlertCircle, { size: 18, className: "text-red-500" });
        if (isPending)
            return _jsx(Clock, { size: 18, className: "text-yellow-500" });
        if (isConnected)
            return _jsx(CheckCircle2, { size: 18, className: "text-green-500" });
        return _jsx(XCircle, { size: 18, className: "text-slate-400" });
    };
    const getStatusText = () => {
        if (hasError)
            return integration.error_message || 'Error';
        if (isPending)
            return 'Setup required';
        if (isConnected)
            return 'Connected';
        return 'Not connected';
    };
    const getStatusColor = () => {
        if (hasError)
            return 'text-red-600';
        if (isPending)
            return 'text-yellow-600';
        if (isConnected)
            return 'text-green-600';
        return 'text-slate-400';
    };
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "card p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(IntegrationIcon, { provider: integration.provider, name: integration.name }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-[#0F172A]", children: integration.name }), _jsx("p", { className: "text-sm text-slate-500", children: template?.description || integration.type })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(), _jsx("span", { className: cn('text-xs font-medium', getStatusColor()), children: getStatusText() })] })] }), integration.base_url && (_jsx("div", { className: "mb-4 p-3 bg-slate-50 rounded-lg", children: _jsxs("p", { className: "text-xs text-slate-600", children: [_jsx("span", { className: "font-medium", children: "API URL:" }), " ", integration.base_url] }) })), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("button", { onClick: handleToggle, disabled: isPending, className: cn('btn py-2 text-sm', isConnected ? 'btn-secondary' : 'btn-primary', isPending && 'opacity-50 cursor-not-allowed'), children: isConnected ? 'Disconnect' : 'Connect' }), isConnected && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleTest, disabled: testing, className: "btn btn-secondary py-2 text-sm", children: [_jsx(Zap, { size: 16 }), testing ? 'Testing...' : 'Test'] }), _jsxs("button", { onClick: () => onConfigure(integration.id), className: "btn btn-secondary py-2 text-sm", children: [_jsx(Settings2, { size: 16 }), "Configure"] }), _jsx("button", { onClick: () => onDelete(integration.id), className: "btn btn-secondary py-2 text-sm text-red-600", children: _jsx(Trash2, { size: 16 }) })] })), isPending && (_jsxs("button", { onClick: () => onConfigure(integration.id), className: "btn btn-primary py-2 text-sm", children: [_jsx(Settings2, { size: 16 }), "Setup"] }))] }), testResult && (_jsx("div", { className: cn('mt-4 p-3 rounded-lg text-sm', testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'), children: testResult.message })), isConnected && integration.last_sync_at && (_jsxs("p", { className: "text-xs text-slate-400 mt-4", children: ["Last synced: ", new Date(integration.last_sync_at).toLocaleString(), integration.sync_count > 0 && ` • ${integration.sync_count} syncs`] })), hasError && integration.error_message && (_jsx("div", { className: "mt-4 p-3 bg-red-50 rounded-lg", children: _jsxs("p", { className: "text-xs text-red-700", children: [_jsx("span", { className: "font-medium", children: "Error:" }), " ", integration.error_message] }) }))] }));
}
function IntegrationIcon({ provider, name }) {
    const colors = {
        meta: '#1877F2',
        google: '#4285F4',
        whatsapp: '#25D366',
        twilio: '#F22F46',
        slack: '#4A154B',
        microsoft: '#0078D4',
        calendly: '#006BFF',
        'cal-com': '#292929',
        zapier: '#FF4F00',
        make: '#6D28D9',
        salesforce: '#00A1E0',
        hubspot: '#FF5C35',
        custom: '#64748B',
    };
    const icons = {
        meta: 'M',
        google: 'G',
        whatsapp: 'W',
        twilio: 'T',
        slack: 'S',
        microsoft: 'M',
        calendly: 'C',
        'cal-com': 'C',
        zapier: 'Z',
        make: 'M',
        salesforce: 'S',
        hubspot: 'H',
        custom: '⚙',
    };
    const color = colors[provider] || '#64748B';
    const icon = icons[provider] || name[0];
    return (_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold", style: { backgroundColor: color }, children: icon }));
}
export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [configuringIntegration, setConfiguringIntegration] = useState(null);
    const loadIntegrations = async () => {
        try {
            const [integrationsRes, templatesRes] = await Promise.all([
                api.integrations.list(),
                api.integrations.templates(),
            ]);
            setIntegrations(integrationsRes.integrations || []);
            setTemplates(templatesRes.templates || []);
        }
        catch (error) {
            console.error('Failed to load integrations:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadIntegrations();
    }, []);
    const handleToggle = async (id, active) => {
        await api.integrations.toggle(id, active);
        await loadIntegrations();
    };
    const handleTest = async (id) => {
        const result = await api.integrations.test(id);
        if (!result.success)
            throw new Error(result.message);
    };
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this integration?'))
            return;
        await api.integrations.delete(id);
        await loadIntegrations();
    };
    const handleConfigure = (id) => {
        const integration = integrations.find((i) => i.id === id);
        if (integration)
            setConfiguringIntegration(integration);
    };
    const handleAddIntegration = async (data) => {
        await api.integrations.create(data);
        setShowAddModal(false);
        await loadIntegrations();
    };
    const handleUpdateIntegration = async (id, data) => {
        await api.integrations.update(id, data);
        setConfiguringIntegration(null);
        await loadIntegrations();
    };
    if (loading) {
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx("div", { className: "text-slate-500", children: "Loading integrations..." }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col overflow-auto", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Integrations" }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Connect your favorite tools and automate your workflow" })] }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "btn btn-primary", children: [_jsx(Plus, { size: 18 }), _jsx("span", { children: "Add Integration" })] })] }) }), _jsxs("div", { className: "p-6 space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4", children: "Lead Sources" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: integrations.filter((i) => i.type === 'lead-source').map((integration) => (_jsx(IntegrationCard, { integration: integration, templates: templates, onToggle: handleToggle, onConfigure: handleConfigure, onTest: handleTest, onDelete: handleDelete }, integration.id))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4", children: "Messaging" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: integrations.filter((i) => i.type === 'messaging').map((integration) => (_jsx(IntegrationCard, { integration: integration, templates: templates, onToggle: handleToggle, onConfigure: handleConfigure, onTest: handleTest, onDelete: handleDelete }, integration.id))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4", children: "Notifications" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: integrations.filter((i) => i.type === 'notification').map((integration) => (_jsx(IntegrationCard, { integration: integration, templates: templates, onToggle: handleToggle, onConfigure: handleConfigure, onTest: handleTest, onDelete: handleDelete }, integration.id))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4", children: "Automation & CRM" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: integrations.filter((i) => ['automation', 'scheduling', 'crm', 'analytics', 'custom'].includes(i.type)).map((integration) => (_jsx(IntegrationCard, { integration: integration, templates: templates, onToggle: handleToggle, onConfigure: handleConfigure, onTest: handleTest, onDelete: handleDelete }, integration.id))) })] })] }), showAddModal && (_jsx(AddIntegrationModal, { templates: templates, existingIntegrations: integrations, onAdd: handleAddIntegration, onClose: () => setShowAddModal(false) })), configuringIntegration && (_jsx(ConfigureIntegrationModal, { integration: configuringIntegration, template: templates.find((t) => t.provider === configuringIntegration.provider), onUpdate: handleUpdateIntegration, onClose: () => setConfiguringIntegration(null) }))] }));
}
function AddIntegrationModal({ templates, existingIntegrations, onAdd, onClose, }) {
    const [selectedProvider, setSelectedProvider] = useState('');
    const availableTemplates = templates.filter((t) => !existingIntegrations.some((i) => i.provider === t.provider && i.slug === t.provider));
    const handleSelect = () => {
        const template = templates.find((t) => t.provider === selectedProvider);
        if (template) {
            onAdd({
                name: template.name,
                slug: template.provider,
                type: template.type,
                provider: template.provider,
            });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-full max-w-lg", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Add Integration" }), _jsx("p", { className: "text-slate-500 mb-4", children: "Select an integration to add:" }), _jsx("div", { className: "space-y-2 max-h-80 overflow-auto mb-6", children: availableTemplates.map((template) => (_jsx("button", { onClick: () => setSelectedProvider(template.provider), className: cn('w-full p-4 rounded-lg border text-left transition-colors', selectedProvider === template.provider
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: template.name }), _jsx("p", { className: "text-sm text-slate-500", children: template.description })] }), _jsx("span", { className: "text-xs px-2 py-1 bg-slate-100 rounded", children: template.type })] }) }, template.provider))) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleSelect, disabled: !selectedProvider, className: "btn btn-primary", children: "Add Integration" })] })] }) }));
}
function ConfigureIntegrationModal({ integration, template, onUpdate, onClose, }) {
    const [config, setConfig] = useState(integration.config || {});
    const [webhookConfig, setWebhookConfig] = useState(integration.webhook_config || {});
    const [baseUrl, setBaseUrl] = useState(integration.base_url || '');
    const handleSave = () => {
        const updates = {
            config,
            webhook_config: template?.webhook_support ? webhookConfig : undefined,
            base_url: baseUrl || undefined,
            status: 'active',
        };
        onUpdate(integration.id, updates);
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-full max-w-2xl my-8", children: [_jsxs("h2", { className: "text-xl font-bold mb-2", children: ["Configure ", integration.name] }), _jsx("p", { className: "text-slate-500 mb-6", children: template?.description }), template?.config_schema && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("h3", { className: "font-semibold", children: "Configuration" }), Object.entries(template.config_schema).map(([key, schema]) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: schema.label }), schema.options ? (_jsxs("select", { value: config[key] || '', onChange: (e) => setConfig({ ...config, [key]: e.target.value }), className: "input", children: [_jsx("option", { value: "", children: "Select..." }), schema.options.map((opt) => (_jsx("option", { value: opt, children: opt }, opt)))] })) : (_jsx("input", { type: schema.type === 'string' ? 'text' : 'password', value: config[key] || '', onChange: (e) => setConfig({ ...config, [key]: e.target.value }), className: "input", placeholder: schema.label }))] }, key)))] })), integration.provider === 'custom' && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("h3", { className: "font-semibold", children: "Custom API Settings" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Base URL" }), _jsx("input", { type: "url", value: baseUrl, onChange: (e) => setBaseUrl(e.target.value), className: "input", placeholder: "https://api.example.com" })] })] })), template?.webhook_support && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("h3", { className: "font-semibold", children: "Webhook Configuration" }), _jsxs("div", { className: "p-4 bg-slate-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-slate-600 mb-2", children: _jsx("span", { className: "font-medium", children: "Webhook URL:" }) }), _jsx("code", { className: "text-xs bg-white px-2 py-1 rounded block break-all", children: `https://your-domain.com/api/integrations/webhooks/${integration.provider}?integration_slug=${integration.slug}` })] })] })), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleSave, className: "btn btn-primary", children: "Save Configuration" })] })] }) }));
}
