import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
export default function AddLeadModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'Manual',
        deal_value: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.leads.create({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                source: formData.source,
                deal_value: formData.deal_value ? parseFloat(formData.deal_value) : undefined,
            });
            onSuccess();
            onClose();
            setFormData({ name: '', email: '', phone: '', source: 'Manual', deal_value: '' });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create lead');
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95, y: 20 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.95, y: 20 }, onClick: (e) => e.stopPropagation(), className: "bg-white rounded-xl shadow-xl max-w-md w-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-[#0F172A]", children: "Add New Lead" }), _jsx("button", { onClick: onClose, className: "p-1 text-slate-400 hover:text-slate-600", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Phone" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Source" }), _jsxs("select", { value: formData.source, onChange: (e) => setFormData({ ...formData, source: e.target.value }), className: "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]", children: [_jsx("option", { value: "Manual", children: "Manual" }), _jsx("option", { value: "Meta Ads", children: "Meta Ads" }), _jsx("option", { value: "Google Ads", children: "Google Ads" }), _jsx("option", { value: "Website", children: "Website" }), _jsx("option", { value: "WhatsApp", children: "WhatsApp" }), _jsx("option", { value: "Import", children: "Import" }), _jsx("option", { value: "Zapier", children: "Zapier" }), _jsx("option", { value: "Make", children: "Make" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Deal Value ($)" }), _jsx("input", { type: "number", value: formData.deal_value, onChange: (e) => setFormData({ ...formData, deal_value: e.target.value }), className: "w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]", min: "0", step: "0.01", placeholder: "0.00" })] }), error && (_jsx("p", { className: "text-sm text-[#DC2626]", children: error })), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg text-slate-700 hover:bg-[#F8FAFC]", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { className: "animate-spin", size: 16 }), "Creating..."] })) : ('Create Lead') })] })] })] }) }) }));
}
