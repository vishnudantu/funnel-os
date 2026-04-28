import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
export function WhatsAppButton({ leadId, leadName, prefillMessage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState(prefillMessage || '');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const handleSend = async () => {
        if (!message.trim())
            return;
        setSending(true);
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    lead_id: leadId,
                    channel: 'whatsapp',
                    body: message,
                }),
            });
            if (response.ok) {
                setSent(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSent(false);
                    setMessage('');
                }, 1500);
            }
        }
        catch (error) {
            console.error('Failed to send:', error);
        }
        finally {
            setSending(false);
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsx(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => setIsOpen(!isOpen), className: cn('flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors', sent
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#25D366] text-white hover:bg-[#25D366]/90'), children: sent ? (_jsxs(_Fragment, { children: [_jsx(Check, { size: 18 }), _jsx("span", { children: "Sent!" })] })) : (_jsxs(_Fragment, { children: [_jsx(MessageSquare, { size: 18 }), _jsx("span", { children: "WhatsApp" })] })) }), isOpen && !sent && (_jsxs(motion.div, { initial: { opacity: 0, y: 10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 10, scale: 0.95 }, className: "absolute right-0 top-full mt-2 w-80 card p-4 shadow-lg z-50", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-[#0F172A]", children: "Send WhatsApp Message" }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-1 text-slate-400 hover:text-slate-600", children: _jsx(X, { size: 16 }) })] }), _jsxs("p", { className: "text-sm text-slate-600 mb-3", children: ["Sending to ", _jsx("span", { className: "font-medium", children: leadName })] }), _jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Type your message...", className: "w-full p-3 border border-[#E2E8F0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[100px] text-sm", maxLength: 1600 }), _jsxs("div", { className: "flex items-center justify-between mt-3", children: [_jsxs("span", { className: "text-xs text-slate-400", children: [message.length, "/1600"] }), _jsx("button", { onClick: handleSend, disabled: sending || !message.trim(), className: cn('btn btn-primary py-2 text-sm', (sending || !message.trim()) && 'opacity-50 cursor-not-allowed'), style: { backgroundColor: '#25D366' }, children: sending ? ('Sending...') : (_jsxs(_Fragment, { children: [_jsx(Send, { size: 16 }), "Send"] })) })] })] }))] }));
}
