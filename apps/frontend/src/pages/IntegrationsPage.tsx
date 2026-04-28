import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Settings2,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api, type Integration, type IntegrationTemplate } from '../lib/api';

interface IntegrationCardProps {
  integration: Integration;
  templates: IntegrationTemplate[];
  onToggle: (id: string, active: boolean) => Promise<void>;
  onConfigure: (id: string) => void;
  onTest: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function IntegrationCard({ integration, templates, onToggle, onConfigure, onTest, onDelete }: IntegrationCardProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async () => {
    await onToggle(integration.id, !isConnected);
  };

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle size={18} className="text-red-500" />;
    if (isPending) return <Clock size={18} className="text-yellow-500" />;
    if (isConnected) return <CheckCircle2 size={18} className="text-green-500" />;
    return <XCircle size={18} className="text-slate-400" />;
  };

  const getStatusText = () => {
    if (hasError) return integration.error_message || 'Error';
    if (isPending) return 'Setup required';
    if (isConnected) return 'Connected';
    return 'Not connected';
  };

  const getStatusColor = () => {
    if (hasError) return 'text-red-600';
    if (isPending) return 'text-yellow-600';
    if (isConnected) return 'text-green-600';
    return 'text-slate-400';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <IntegrationIcon provider={integration.provider} name={integration.name} />
          <div>
            <h3 className="font-semibold text-[#0F172A]">{integration.name}</h3>
            <p className="text-sm text-slate-500">{template?.description || integration.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={cn('text-xs font-medium', getStatusColor())}>{getStatusText()}</span>
        </div>
      </div>

      {integration.base_url && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <span className="font-medium">API URL:</span> {integration.base_url}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            'btn py-2 text-sm',
            isConnected ? 'btn-secondary' : 'btn-primary',
            isPending && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>

        {isConnected && (
          <>
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn btn-secondary py-2 text-sm"
            >
              <Zap size={16} />
              {testing ? 'Testing...' : 'Test'}
            </button>
            <button
              onClick={() => onConfigure(integration.id)}
              className="btn btn-secondary py-2 text-sm"
            >
              <Settings2 size={16} />
              Configure
            </button>
            <button
              onClick={() => onDelete(integration.id)}
              className="btn btn-secondary py-2 text-sm text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}

        {isPending && (
          <button
            onClick={() => onConfigure(integration.id)}
            className="btn btn-primary py-2 text-sm"
          >
            <Settings2 size={16} />
            Setup
          </button>
        )}
      </div>

      {testResult && (
        <div className={cn(
          'mt-4 p-3 rounded-lg text-sm',
          testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )}>
          {testResult.message}
        </div>
      )}

      {isConnected && integration.last_sync_at && (
        <p className="text-xs text-slate-400 mt-4">
          Last synced: {new Date(integration.last_sync_at).toLocaleString()}
          {integration.sync_count > 0 && ` • ${integration.sync_count} syncs`}
        </p>
      )}

      {hasError && integration.error_message && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700">
            <span className="font-medium">Error:</span> {integration.error_message}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function IntegrationIcon({ provider, name }: { provider: string; name: string }) {
  const colors: Record<string, string> = {
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

  const icons: Record<string, string> = {
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

  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
      style={{ backgroundColor: color }}
    >
      {icon}
    </div>
  );
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [configuringIntegration, setConfiguringIntegration] = useState<Integration | null>(null);

  const loadIntegrations = async () => {
    try {
      const [integrationsRes, templatesRes] = await Promise.all([
        api.integrations.list(),
        api.integrations.templates(),
      ]);
      setIntegrations(integrationsRes.integrations || []);
      setTemplates(templatesRes.templates || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleToggle = async (id: string, active: boolean) => {
    await api.integrations.toggle(id, active);
    await loadIntegrations();
  };

  const handleTest = async (id: string) => {
    const result = await api.integrations.test(id);
    if (!result.success) throw new Error(result.message);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;
    await api.integrations.delete(id);
    await loadIntegrations();
  };

  const handleConfigure = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (integration) setConfiguringIntegration(integration);
  };

  const handleAddIntegration = async (data: { name: string; slug: string; type: string; provider: string }) => {
    await api.integrations.create(data);
    setShowAddModal(false);
    await loadIntegrations();
  };

  const handleUpdateIntegration = async (id: string, data: { config?: Record<string, unknown>; webhook_config?: Record<string, unknown>; base_url?: string; status?: 'active' | 'inactive' | 'error' | 'pending_config' }) => {
    await api.integrations.update(id, data);
    setConfiguringIntegration(null);
    await loadIntegrations();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Integrations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Connect your favorite tools and automate your workflow
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Integration</span>
          </button>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Lead Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter((i) => i.type === 'lead-source').map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                templates={templates}
                onToggle={handleToggle}
                onConfigure={handleConfigure}
                onTest={handleTest}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Messaging
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter((i) => i.type === 'messaging').map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                templates={templates}
                onToggle={handleToggle}
                onConfigure={handleConfigure}
                onTest={handleTest}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter((i) => i.type === 'notification').map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                templates={templates}
                onToggle={handleToggle}
                onConfigure={handleConfigure}
                onTest={handleTest}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Automation & CRM
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter((i) => ['automation', 'scheduling', 'crm', 'analytics', 'custom'].includes(i.type)).map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                templates={templates}
                onToggle={handleToggle}
                onConfigure={handleConfigure}
                onTest={handleTest}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddIntegrationModal
          templates={templates}
          existingIntegrations={integrations}
          onAdd={handleAddIntegration}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {configuringIntegration && (
        <ConfigureIntegrationModal
          integration={configuringIntegration}
          template={templates.find((t) => t.provider === configuringIntegration.provider)}
          onUpdate={handleUpdateIntegration}
          onClose={() => setConfiguringIntegration(null)}
        />
      )}
    </div>
  );
}

function AddIntegrationModal({
  templates,
  existingIntegrations,
  onAdd,
  onClose,
}: {
  templates: IntegrationTemplate[];
  existingIntegrations: Integration[];
  onAdd: (data: { name: string; slug: string; type: string; provider: string }) => void;
  onClose: () => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState('');

  const availableTemplates = templates.filter(
    (t) => !existingIntegrations.some((i) => i.provider === t.provider && i.slug === t.provider)
  );

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add Integration</h2>
        <p className="text-slate-500 mb-4">Select an integration to add:</p>
        <div className="space-y-2 max-h-80 overflow-auto mb-6">
          {availableTemplates.map((template) => (
            <button
              key={template.provider}
              onClick={() => setSelectedProvider(template.provider)}
              className={cn(
                'w-full p-4 rounded-lg border text-left transition-colors',
                selectedProvider === template.provider
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-slate-500">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-100 rounded">{template.type}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedProvider}
            className="btn btn-primary"
          >
            Add Integration
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigureIntegrationModal({
  integration,
  template,
  onUpdate,
  onClose,
}: {
  integration: Integration;
  template?: IntegrationTemplate;
  onUpdate: (id: string, data: { config?: Record<string, unknown>; webhook_config?: Record<string, unknown>; base_url?: string; status?: 'active' | 'inactive' | 'error' | 'pending_config' }) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<Record<string, unknown>>(integration.config || {});
  const [webhookConfig, setWebhookConfig] = useState<Record<string, unknown>>(integration.webhook_config || {});
  const [baseUrl, setBaseUrl] = useState(integration.base_url || '');

  const handleSave = () => {
    const updates = {
      config,
      webhook_config: template?.webhook_support ? webhookConfig : undefined,
      base_url: baseUrl || undefined,
      status: 'active' as const,
    };
    onUpdate(integration.id, updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
        <h2 className="text-xl font-bold mb-2">Configure {integration.name}</h2>
        <p className="text-slate-500 mb-6">{template?.description}</p>

        {template?.config_schema && (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">Configuration</h3>
            {Object.entries(template.config_schema).map(([key, schema]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{schema.label}</label>
                {schema.options ? (
                  <select
                    value={(config[key] as string) || ''}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                    className="input"
                  >
                    <option value="">Select...</option>
                    {schema.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={schema.type === 'string' ? 'text' : 'password'}
                    value={(config[key] as string) || ''}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                    className="input"
                    placeholder={schema.label}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {integration.provider === 'custom' && (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">Custom API Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Base URL</label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="input"
                placeholder="https://api.example.com"
              />
            </div>
          </div>
        )}

        {template?.webhook_support && (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">Webhook Configuration</h3>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">Webhook URL:</span>
              </p>
              <code className="text-xs bg-white px-2 py-1 rounded block break-all">
                {`https://your-domain.com/api/integrations/webhooks/${integration.provider}?integration_slug=${integration.slug}`}
              </code>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
