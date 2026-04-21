import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function OrganizationSwitcher() {
  const { user, organization, organizations, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (org: typeof organization) => {
    if (!org || org.id === organization?.id) return;

    setSwitching(true);
    try {
      await switchOrganization(org);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setSwitching(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white truncate">
            {organization?.name || 'Loading...'}
          </p>
          <p className="text-xs text-slate-400 capitalize">
            {organization?.plan || 'free'}
          </p>
        </div>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-0 right-0 mt-2 w-64 bg-[#1e293b] rounded-xl shadow-xl border border-[#334155] z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Organizations
                </p>

                <div className="space-y-1">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSwitch(org)}
                      disabled={switching}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        org.id === organization?.id
                          ? 'bg-[#2563EB] text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          org.id === organization?.id
                            ? 'bg-white/20'
                            : 'bg-[#2563EB]/20'
                        )}
                      >
                        <Building2
                          size={16}
                          className={cn(
                            org.id === organization?.id
                              ? 'text-white'
                              : 'text-[#2563EB]'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{org.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{org.plan}</p>
                      </div>
                      {org.id === organization?.id && (
                        <Check size={16} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>

                <button className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors border border-dashed border-[#334155]">
                  <Plus size={16} />
                  <span className="text-sm">Create New Organization</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
