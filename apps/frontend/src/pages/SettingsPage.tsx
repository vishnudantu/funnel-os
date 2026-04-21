import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building, Bell, Shield, Globe, Save } from 'lucide-react';
import { cn } from '../lib/utils';

const aiProviders = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run AI models locally with Ollama. Free, private, no API costs.',
    model: 'qwen2.5:72b',
    status: 'connected',
    latency: 245,
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Anthropic Claude models. Best for complex reasoning and long context.',
    model: 'claude-sonnet-4-6',
    status: 'not-configured',
    latency: null,
  },
  {
    id: 'openai',
    name: 'GPT-4 (OpenAI)',
    description: 'OpenAI GPT-4 models. Widely adopted, extensive tooling.',
    model: 'gpt-4-turbo',
    status: 'not-configured',
    latency: null,
  },
];

export default function SettingsPage() {
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your FunnelOS workspace</p>
      </header>

      <div className="p-6 space-y-8">
        {/* AI Provider Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
              <Sparkles className="text-[#2563EB]" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A]">AI Provider</h2>
              <p className="text-sm text-slate-500">Choose your AI backend for lead scoring and messaging</p>
            </div>
          </div>

          <div className="grid gap-4">
            {aiProviders.map((provider) => (
              <motion.div
                key={provider.id}
                layout
                className={cn(
                  'card p-6 cursor-pointer transition-all',
                  activeProvider === provider.id
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                )}
                onClick={() => setActiveProvider(provider.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2',
                      activeProvider === provider.id
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-[#CBD5E1]'
                    )} />
                    <div>
                      <h3 className="font-semibold text-[#0F172A]">{provider.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs px-2 py-1 bg-[#F1F5F9] rounded text-slate-600">
                          Model: {provider.model}
                        </span>
                        {provider.latency && (
                          <span className="text-xs text-[#16A34A]">
                            ~{provider.latency}ms latency
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {provider.status === 'connected' && (
                    <span className="text-xs px-2 py-1 bg-[#16A34A]/10 text-[#16A34A] rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
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
              <p className="text-sm text-slate-500">Your company information</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="input-group">
              <input type="text" id="company" placeholder=" " defaultValue="Acme Inc." />
              <label htmlFor="company">Company Name</label>
            </div>
            <div className="input-group">
              <input type="text" id="timezone" placeholder=" " defaultValue="America/New_York" />
              <label htmlFor="timezone">Timezone</label>
            </div>
            <div className="input-group">
              <input type="text" id="currency" placeholder=" " defaultValue="USD" />
              <label htmlFor="currency">Currency</label>
            </div>
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
              { label: 'New high-score leads (80+)', key: 'high_score' },
              { label: 'Lead stage changes', key: 'stage_change' },
              { label: 'Daily pipeline summary', key: 'daily_summary' },
              { label: 'WhatsApp message replies', key: 'whatsapp_reply' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{item.label}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'btn btn-primary',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
