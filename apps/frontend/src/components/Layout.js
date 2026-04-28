import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BarChart3, Plug, Settings, LogOut, Menu, X, Shield, } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import OrganizationSwitcher from './OrganizationSwitcher';
const navItems = [
    { to: '/pipeline', icon: LayoutDashboard, label: 'Pipeline' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/integrations', icon: Plug, label: 'Integrations' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];
const adminNavItems = [
    { to: '/admin', icon: Shield, label: 'Admin' },
];
export default function Layout() {
    const navigate = useNavigate();
    const { user, logout, organization } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "flex h-screen bg-[#F8FAFC]", children: [_jsx("button", { className: "lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md", onClick: () => setMobileMenuOpen(!mobileMenuOpen), children: mobileMenuOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) }), _jsxs(motion.aside, { initial: false, animate: { x: mobileMenuOpen ? 0 : 0 }, className: cn('fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0F172A] flex flex-col', 'transform lg:transform-none transition-transform duration-200', mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'), children: [_jsxs("div", { className: "p-6 border-b border-white/10", children: [_jsx("h1", { className: "text-xl font-bold text-white", children: "FunnelOS" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "AI-Native Sales CRM" })] }), _jsx("div", { className: "p-4 border-b border-white/10", children: _jsx(OrganizationSwitcher, {}) }), _jsxs("nav", { className: "flex-1 p-4 space-y-1 overflow-y-auto", children: [navItems.map((item) => (_jsxs(NavLink, { to: item.to, onClick: () => setMobileMenuOpen(false), className: ({ isActive }) => cn('flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors', isActive
                                    ? 'bg-[#2563EB] text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'), children: [_jsx(item.icon, { size: 20 }), item.label] }, item.to))), user?.isSuperAdmin && (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-4 mt-4 border-t border-white/10", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2", children: "Administration" }), adminNavItems.map((item) => (_jsxs(NavLink, { to: item.to, onClick: () => setMobileMenuOpen(false), className: ({ isActive }) => cn('flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors', isActive
                                                ? 'bg-[#2563EB] text-white'
                                                : 'text-slate-300 hover:bg-white/5 hover:text-white'), children: [_jsx(item.icon, { size: 20 }), item.label] }, item.to)))] }) }))] }), _jsx("div", { className: "p-4 border-t border-white/10", children: _jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium", children: user?.name?.[0]?.toUpperCase() || 'U' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: user?.name || 'User' }), _jsx("p", { className: "text-xs text-slate-400 truncate", children: user?.email || '' })] }), _jsx("button", { onClick: handleLogout, className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(LogOut, { size: 18 }) })] }) })] }), mobileMenuOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 z-30 lg:hidden", onClick: () => setMobileMenuOpen(false) })), _jsx("main", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: _jsx("div", { className: "flex-1 overflow-auto", children: _jsx(Outlet, {}) }) })] }));
}
