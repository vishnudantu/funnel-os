import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface WhatsAppButtonProps {
  leadId: string;
  leadName: string;
  prefillMessage?: string;
}

export function WhatsAppButton({ leadId, leadName, prefillMessage }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(prefillMessage || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

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
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
          sent
            ? 'bg-[#16A34A] text-white'
            : 'bg-[#25D366] text-white hover:bg-[#25D366]/90'
        )}
      >
        {sent ? (
          <>
            <Check size={18} />
            <span>Sent!</span>
          </>
        ) : (
          <>
            <MessageSquare size={18} />
            <span>WhatsApp</span>
          </>
        )}
      </motion.button>

      {isOpen && !sent && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 top-full mt-2 w-80 card p-4 shadow-lg z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#0F172A]">Send WhatsApp Message</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-3">
            Sending to <span className="font-medium">{leadName}</span>
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-3 border border-[#E2E8F0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[100px] text-sm"
            maxLength={1600}
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">
              {message.length}/1600
            </span>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className={cn(
                'btn btn-primary py-2 text-sm',
                (sending || !message.trim()) && 'opacity-50 cursor-not-allowed'
              )}
              style={{ backgroundColor: '#25D366' }}
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
