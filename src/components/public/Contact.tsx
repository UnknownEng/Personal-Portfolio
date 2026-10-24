import React, { useState } from 'react';
import { ContactData } from '../../types/portfolio';
import { Mail, Phone, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../ui/Icons';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

interface ContactProps {
  contact: ContactData;
  githubUrl?: string;
  onSubmitMessage: (msg: { name: string; email: string; subject: string; message: string }) => Promise<any>;
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Contact: React.FC<ContactProps> = ({
  contact,
  githubUrl = 'https://github.com/MansoorAhmedRind',
  onSubmitMessage,
  currentLang = 'en',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const directEmail = contact.email || 'ahmedmansoorrind1210@gmail.com';
  const directPhone = contact.phone || '+92 327 3202419';
  const cleanPhone = directPhone.replace(/[^0-9+]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMessage(
        currentLang === 'zh'
          ? '请填写所有必填字段（姓名、电子邮箱及留言内容）。'
          : 'Please complete all required fields (Name, Email, and Message).'
      );
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await onSubmitMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Engineering Inquiry',
        message: message.trim(),
      });
      const ok = typeof res === 'boolean' ? res : res?.success;
      if (ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setTimeout(() => setStatus('idle'), 8000);
      } else {
        setStatus('error');
        setErrorMessage(
          currentLang === 'zh'
            ? '发送失败，请直接通过电子邮件联系。'
            : 'Message delivery failed. Please reach out directly via email.'
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        currentLang === 'zh'
          ? '网络连接异常，请直接通过电子邮件联系。'
          : 'Network connectivity fault. Please reach out via direct email.'
      );
    }
  };

  const personalNoteEn =
    "Outside of the lab, I am out in the field testing new airframes, scouting good spots to fly my drone, tuning PID control loops, or mentoring aspiring engineering students. The rest of the time I'm reading up on autonomous multi-agent swarm algorithms or exploring new hardware architectures.";

  const personalNoteZh =
    '在实验室工作之余，我常在户外测试新的飞行器机架、寻找测试无人机飞行轨迹的开阔场地、调校四轴飞行器的 PID 控制参数，或是指导年轻的工程系学弟学妹。其余时间，我喜欢研读分布式多智能体蜂群算法并探索下一代自主机器人硬件架构。';

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="footer-container flex flex-col items-center text-center max-w-2xl mx-auto px-4">
          {/* Semantic Section Heading (H2 for single H1 per page compliance) */}
          <h2 className="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            {currentLang === 'zh' ? '联系方式' : 'Contact Coordinates'}
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-sky-400 font-semibold mb-4">
            {currentLang === 'zh' ? '一起来聊聊机器人与无人机吧！' : "Let's collaborate on autonomous systems & robotics!"}
          </p>

          {/* Personal note paragraph */}
          <p className="personal-note text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
            {currentLang === 'zh' ? personalNoteZh : personalNoteEn}
          </p>

          {/* Direct Comms Cards: Clickable Email & Clickable Phone */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 w-full max-w-lg">
            {/* Clickable Email Anchor (Fix 19) */}
            <a
              href={sanitizeUrl(`mailto:${directEmail}?subject=${encodeURIComponent('Engineering Inquiry')}`)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 text-slate-200 hover:text-sky-400 transition shadow-lg group focus:outline-none min-h-[48px]"
              aria-label={`Send direct email to ${directEmail}`}
              title="Click to send direct email"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">Direct Email</div>
                <div className="text-xs sm:text-sm font-semibold">{directEmail}</div>
              </div>
            </a>

            {/* Clickable Phone Anchor (Fix 18) */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 text-slate-200 hover:text-sky-400 transition shadow-lg group focus:outline-none min-h-[48px]"
              aria-label={`Call direct telephone ${directPhone}`}
              title="Click to dial phone"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">Direct Comms</div>
                <div className="text-xs sm:text-sm font-semibold">{directPhone}</div>
              </div>
            </a>
          </div>

          {/* Social Icons row */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {contact.linkedIn && isSafeUrl(contact.linkedIn) && (
              <a
                href={sanitizeUrl(contact.linkedIn)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn Profile"
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition hover:scale-105"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            )}
            {githubUrl && isSafeUrl(githubUrl) && (
              <a
                href={sanitizeUrl(githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub Profile"
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition hover:scale-105"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            )}
            <a
              href={sanitizeUrl(`mailto:${directEmail}`)}
              aria-label="Email"
              title="Direct Email"
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition hover:scale-105"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Quick Inquiry Form */}
          <div className="contact-inquiry-box w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-left">
            <h3 className="text-base font-bold mb-1 text-center text-white flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>{currentLang === 'zh' ? '发送在线消息' : 'Send Direct Message'}</span>
            </h3>
            <p className="text-xs text-slate-300 mb-6 text-center">
              {currentLang === 'zh' ? '消息将直接送达我的工作信箱' : 'Inquiries dispatch directly to primary inbox'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {currentLang === 'zh' ? '您的姓名 *' : 'Your Name *'}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {currentLang === 'zh' ? '电子邮箱 *' : 'Email Address *'}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {currentLang === 'zh' ? '主题' : 'Subject'}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {currentLang === 'zh' ? '留言内容 *' : 'Message *'}
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Success Message Banner (Fix 12) */}
              {status === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-500/40 animate-fadeIn"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold">
                      {currentLang === 'zh' ? '消息发送成功！' : 'Message dispatched successfully!'}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">
                      {currentLang === 'zh'
                        ? '我会尽快阅读并回复您的留言。'
                        : 'Your inquiry has been received and I will follow up promptly.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Banner (Fix 13) */}
              {status === 'error' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-2.5 text-xs text-rose-400 bg-rose-950/50 p-3.5 rounded-xl border border-rose-500/40 animate-shake"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <div>
                    <div className="font-bold">
                      {currentLang === 'zh' ? '发送遇到问题' : 'Dispatch Exception'}
                    </div>
                    <div className="text-[11px] text-rose-300/80 mt-0.5">
                      {errorMessage ||
                        (currentLang === 'zh'
                          ? '发送失败，请直接发送电子邮件至 ahmedmansoorrind1210@gmail.com'
                          : 'Delivery failed. Please email ahmedmansoorrind1210@gmail.com directly.')}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button (Fix 11: Active event handler & visual state) */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/20 hover:scale-[1.01] active:scale-95 disabled:opacity-50 min-h-[48px]"
                aria-label="Send Message"
              >
                {status === 'sending' ? (
                  <span>{currentLang === 'zh' ? '正在发送...' : 'DISPATCHING TELEMETRY...'}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{currentLang === 'zh' ? '发送留言' : 'SEND MESSAGE'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
