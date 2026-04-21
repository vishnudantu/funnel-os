import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plug,
  CheckCircle2,
  XCircle,
  Zap,
  Settings2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  connected: boolean;
  lastSync: Date | null;
  icon: string;
  color: string;
}

const integrations: Integration[] = [
  {
    id: '1',
    name: 'Meta Lead Ads',
    type: 'lead-source',
    description: 'Automatically import leads from Facebook & Instagram ads',
    connected: true,
    lastSync: new Date(),
    icon: 'M',
    color: '#1877F2',
  },
  {
    id: '2',
    name: 'WhatsApp Cloud API',
    type: 'messaging',
    description: 'Send and receive WhatsApp messages directly from FunnelOS',
    connected: true,
    lastSync: new Date(Date.now() - 300000),
    icon: 'W',
    color: '#25D366',
  },
  {
    id: '3',
    name: 'Google Ads',
    type: 'lead-source',
    description: 'Import leads from Google Ads lead form extensions',
    connected: false,
    lastSync: null,
    icon: 'G',
    color: '#4285F4',
  },
  {
    id: '4',
    name: 'Slack Notifications',
    type: 'notification',
    description: 'Get notified in Slack when high-score leads come in',
    connected: false,
    lastSync: null,
    icon: 'S',
    color: '#4A154B',
  },
  {
    id: '5',
    name: 'Calendly',
    type: 'scheduling',
    description: 'Auto-schedule meetings with qualified leads',
    connected: false,
    lastSync: null,
    icon: 'C',
    color: '#006BFF',
  },
  {
    id: '6',
    name: 'Zapier',
    type: 'automation',
    description: 'Connect FunnelOS to 5000+ apps via Zapier',
    connected: false,
    lastSync: null,
    icon: 'Z',
    color: '#FF4F00',
  },
];

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string) => void;
  onConfigure: (id: string) => void;
  onTest: (id: string) => void;
}

function IntegrationCard({ integration, onToggle, onConfigure, onTest }: IntegrationCardProps) {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await onTest(integration.id);
    setTesting(false);
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
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: integration.color }}
          >
            {integration.icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#0F172A]">{integration.name}</h3>
            <p className="text-sm text-slate-500">{integration.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {integration.connected ? (
            <div className="flex items-center gap-1 text-[#16A34A]">
              <CheckCircle2 size={18} />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <XCircle size={18} />
              <span className="text-xs font-medium">Not connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(integration.id)}
          className={cn(
            'btn py-2',
            integration.connected ? 'btn-secondary' : 'btn-primary'
          )}
        >
          {integration.connected ? 'Disconnect' : 'Connect'}
        </button>

        {integration.connected && (
          <>
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn btn-secondary py-2"
            >
              <Zap size={18} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={() => onConfigure(integration.id)}
              className="btn btn-secondary py-2"
            >
              <Settings2 size={18} />
              Configure
            </button>
          </>
        )}

        {!integration.connected && integration.type === 'lead-source' && (
          <a
            href="#"
            className="btn btn-secondary py-2 text-[#2563EB]"
          >
            <ExternalLink size={18} />
            Setup Guide
          </a>
        )}
      </div>

      {integration.connected && integration.lastSync && (
        <p className="text-xs text-slate-400 mt-4">
          Last synced: {integration.lastSync.toLocaleString()}
        </p>
      )}
    </motion.div>
  );
}

export default function IntegrationsPage() {
  const [integrationsList, setIntegrationsList] = useState(integrations);

  const handleToggle = (id: string) => {
    setIntegrationsList((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: !i.connected } : i
      )
    );
  };

  const handleTest = async (id: string) => {
    // Simulate API test
    await new Promise((r) => setTimeout(r, 1500));
    alert('Connection test passed!');
  };

  const handleConfigure = (id: string) => {
    alert(`Configure ${id}`);
  };

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
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>Add Integration</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Lead Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationsList
              .filter((i) => i.type === 'lead-source')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={handleToggle}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                />
              ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Messaging
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationsList
              .filter((i) => i.type === 'messaging')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={handleToggle}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                />
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Automation & Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationsList
              .filter((i) => ['notification', 'scheduling', 'automation'].includes(i.type))
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={handleToggle}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
