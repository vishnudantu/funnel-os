import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
export default function OrganizationSwitcher() {
    const { user, organization, organizations, switchOrganization } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const handleSwitch = async (org) => {
        if (!org || org.id === organization?.id)
            return;
        setSwitching(true);
        try {
            await switchOrganization(org);
        }
        catch (error) {
            console.error('Failed to switch organization:', error);
        }
        finally {
            setSwitching(false);
            setIsOpen(false);
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), disabled: switching, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center", children: _jsx(Building2, { size: 16, className: "text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0 text-left", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: organization?.name || 'Loading...' }), _jsx("p", { className: "text-xs text-slate-400 capitalize", children: organization?.plan || 'free' })] }), _jsx(ChevronDown, { size: 16, className: "text-slate-400" })] }), _jsx(AnimatePresence, { children: isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setIsOpen(false) }), _jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, className: "absolute left-0 right-0 mt-2 w-64 bg-[#1e293b] rounded-xl shadow-xl border border-[#334155] z-50 overflow-hidden", children: _jsxs("div", { className: "p-2", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2", children: "Organizations" }), _jsx("div", { className: "space-y-1", children: organizations.map((org) => (_jsxs("button", { onClick: () => handleSwitch(org), disabled: switching, className: cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', org.id === organization?.id
                                                ? 'bg-[#2563EB] text-white'
                                                : 'text-slate-300 hover:bg-white/5'), children: [_jsx("div", { className: cn('w-8 h-8 rounded-lg flex items-center justify-center', org.id === organization?.id
                                                        ? 'bg-white/20'
                                                        : 'bg-[#2563EB]/20'), children: _jsx(Building2, { size: 16, className: cn(org.id === organization?.id
                                                            ? 'text-white'
                                                            : 'text-[#2563EB]') }) }), _jsxs("div", { className: "flex-1 min-w-0 text-left", children: [_jsx("p", { className: "text-sm font-medium truncate", children: org.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize", children: org.plan })] }), org.id === organization?.id && (_jsx(Check, { size: 16, className: "text-white" }))] }, org.id))) }), _jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors border border-dashed border-[#334155]", children: [_jsx(Plus, { size: 16 }), _jsx("span", { className: "text-sm", children: "Create New Organization" })] })] }) })] })) })] }));
}
