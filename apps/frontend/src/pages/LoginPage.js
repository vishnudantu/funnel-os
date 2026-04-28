import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        organizationName: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = mode === 'login'
                ? { email: formData.email, password: formData.password }
                : formData;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }
            login(data.token, data.user, data.organization, data.organizations);
            navigate('/pipeline');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-[#0F172A]", children: "FunnelOS" }), _jsx("p", { className: "text-slate-600 mt-2", children: "AI-Native Sales CRM" })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8", children: [_jsxs("div", { className: "flex mb-6", children: [_jsx("button", { onClick: () => setMode('login'), className: cn('flex-1 py-2 text-sm font-medium border-b-2 transition-colors', mode === 'login'
                                        ? 'border-[#2563EB] text-[#2563EB]'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'), children: "Sign In" }), _jsx("button", { onClick: () => setMode('register'), className: cn('flex-1 py-2 text-sm font-medium border-b-2 transition-colors', mode === 'register'
                                        ? 'border-[#2563EB] text-[#2563EB]'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'), children: "Create Account" })] }), _jsx(AnimatePresence, { mode: "wait", children: mode === 'login' ? (_jsxs(motion.form, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "email", id: "email", placeholder: " ", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }), _jsx("label", { htmlFor: "email", children: "Email address" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "password", id: "password", placeholder: " ", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true }), _jsx("label", { htmlFor: "password", children: "Password" })] }), error && (_jsx(motion.p, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "text-[#DC2626] text-sm", children: error })), _jsx("button", { type: "submit", disabled: loading, className: cn('w-full btn btn-primary py-3', loading && 'opacity-50 cursor-not-allowed'), children: loading ? 'Signing in...' : 'Sign in' })] }, "login")) : (_jsxs(motion.form, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: "name", placeholder: " ", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true }), _jsx("label", { htmlFor: "name", children: "Full name" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "email", id: "email", placeholder: " ", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }), _jsx("label", { htmlFor: "email", children: "Email address" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", id: "organizationName", placeholder: " ", value: formData.organizationName, onChange: (e) => setFormData({ ...formData, organizationName: e.target.value }), required: true }), _jsx("label", { htmlFor: "organizationName", children: "Company name" })] }), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "password", id: "password", placeholder: " ", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true, minLength: 8 }), _jsx("label", { htmlFor: "password", children: "Password (min 8 characters)" })] }), error && (_jsx(motion.p, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "text-[#DC2626] text-sm", children: error })), _jsx("button", { type: "submit", disabled: loading, className: cn('w-full btn btn-primary py-3', loading && 'opacity-50 cursor-not-allowed'), children: loading ? 'Creating account...' : 'Create account' }), _jsx("p", { className: "text-xs text-slate-500 text-center", children: "By creating an account, you agree to our Terms of Service and Privacy Policy" })] }, "register")) }), mode === 'login' && (_jsx("div", { className: "mt-6 pt-6 border-t border-[#E2E8F0]", children: _jsx("p", { className: "text-sm text-slate-600 text-center", children: "Demo: Use any email and password \"password\"" }) }))] })] }) }));
}
