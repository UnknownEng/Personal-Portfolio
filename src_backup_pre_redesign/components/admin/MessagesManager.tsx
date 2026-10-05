import React, { useState } from 'react';
import { MessageSquare, Mail, Trash2, CheckCircle2, Clock, Check, Reply } from 'lucide-react';
import { ContactMessage } from '../../types/portfolio';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface MessagesManagerProps {
  messages: ContactMessage[];
  onMarkRead: (id: string, read?: boolean) => Promise<boolean>;
  onDeleteMessage: (id: string) => Promise<boolean>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MessagesManager: React.FC<MessagesManagerProps> = ({
  messages,
  onMarkRead,
  onDeleteMessage,
  onShowToast,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const success = await onMarkRead(id, !currentRead);
    if (success) {
      onShowToast('info', `Message marked as ${!currentRead ? 'read' : 'unread'}`);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await onDeleteMessage(id);
    setDeleteId(null);
    if (success) {
      onShowToast('success', 'Message deleted from inbox');
    } else {
      onShowToast('error', 'Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>INCOMING TELEMETRY & INQUIRIES</span>
        </div>
        <h2 className="text-xl font-bold text-white font-sans">
          Inquiries Inbox ({messages.length} Total Messages)
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Messages dispatched from the public contact form are securely captured and logged here.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0D121F] border border-[#1E293B]">
          <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-200 font-sans">No Inquiries Received Yet</h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm mx-auto">
            When recruiters, engineering leads, or clients dispatch a message from the website contact section, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-xl border transition-all ${
                !msg.read
                  ? 'bg-[#0E1628] border-cyan-500/40 shadow-sm shadow-cyan-900/20'
                  : 'bg-[#0D121F] border-[#1E293B]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                  <h3 className="text-sm font-bold text-white font-sans">{msg.name}</h3>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    &lt;{msg.email}&gt;
                  </a>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-cyan-300 font-semibold mb-2">
                Subject: {msg.subject || 'Engineering Collaboration'}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-[#080C16] p-3 rounded-lg border border-[#1E293B]">
                {msg.message}
              </p>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#1E293B]">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Engineering Collaboration')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-500/30 transition"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.read)}
                    className="p-1.5 rounded-lg bg-[#080C16] hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs font-mono flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{msg.read ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteId(msg.id)}
                    className="p-1.5 rounded-lg bg-[#080C16] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Inquiry Message"
        message="Are you sure you want to delete this inquiry message from your inbox?"
        confirmText="Delete Message"
      />

    </div>
  );
};
