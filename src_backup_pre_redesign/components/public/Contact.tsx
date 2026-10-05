import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Terminal, MessageSquare } from 'lucide-react';
import { LinkedinIcon } from '../ui/Icons';
import { ContactData } from '../../types/portfolio';

interface ContactProps {
  contact: ContactData;
  onSubmitMessage: (formData: { name: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; error?: string }>;
}

export const Contact: React.FC<ContactProps> = ({ contact, onSubmitMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setSubmitStatus(null);

    const res = await onSubmitMessage(formData);
    setSubmitting(false);

    if (res.success) {
      setSubmitStatus({
        success: true,
        message: 'Telemetry dispatched successfully! I will respond to your inquiry promptly.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setSubmitStatus({
        success: false,
        message: res.error || 'Failed to dispatch message. Please contact directly via email.',
      });
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-[#080B12] border-t border-[#1E293B]">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Mail className="w-3.5 h-3.5" />
            <span>COMMUNICATION LINK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
            {contact.heading || 'Initiate Technical Collaboration'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
            {contact.description ||
              'Looking to deploy autonomous UAV systems, multi-drone swarm coordination, or embedded robotics hardware? Reach out directly or dispatch an engineering inquiry below.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct verified coordinates */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Availability Status Card */}
            <div className="p-5 rounded-2xl bg-[#0D121F] border border-cyan-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-2 font-mono text-xs text-cyan-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-bold">STATUS BEACON</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {contact.availabilityStatus || 'Available for UAV Engineering & Autonomous Systems roles'}
              </p>
            </div>

            {/* Direct Contact Items */}
            <div className="space-y-3">
              {/* Email */}
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-cyan-500/40 hover:bg-[#111728] transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:border-cyan-400 transition">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">DIRECT EMAIL</div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition font-mono">
                    {contact.email}
                  </div>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href={contact.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-blue-500/40 hover:bg-[#111728] transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:border-blue-400 transition">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">LINKEDIN NETWORK</div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition font-mono">
                    linkedin.com/in/mansoorahmedrind
                  </div>
                </div>
              </a>

              {/* Phone if enabled */}
              {contact.showPhone && contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-emerald-500/40 hover:bg-[#111728] transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:border-emerald-400 transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">DIRECT PHONE</div>
                    <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition font-mono">
                      {contact.phone}
                    </div>
                  </div>
                </a>
              )}

              {/* Location */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0D121F] border border-[#1E293B]">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">BASE LOCATION</div>
                  <div className="text-sm font-semibold text-slate-100 font-mono">
                    {contact.location}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Dispatch Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D121F] border border-[#1E293B] shadow-2xl">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Send Direct Inquiry</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-6">
                Direct channel to Mansoor's inbox. All messages are encrypted and logged to the central command dashboard.
              </p>

              {submitStatus && (
                <div
                  className={`p-4 rounded-xl mb-6 flex items-start gap-3 border text-xs font-mono ${
                    submitStatus.success
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <p className="mt-0.5">{submitStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Alex Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@aerospace-org.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UAV Flight-Stack Integration / Collaboration"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                    MESSAGE / PROJECT SPECIFICATION *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your autonomous flight requirements, research scope, or technical role details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span>DISPATCHING PACKET...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>TRANSMIT INQUIRY</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
