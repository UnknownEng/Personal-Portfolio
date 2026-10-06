import React, { useState } from 'react';
import { ContactData } from '../../types/portfolio';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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
  githubUrl,
  onSubmitMessage,
  currentLang = 'en',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('sending');
    try {
      const res = await onSubmitMessage({
        name,
        email,
        subject: subject || 'General Portfolio Inquiry',
        message,
      });
      // Check if res is object with success or boolean
      const ok = typeof res === 'boolean' ? res : res?.success;
      if (ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const personalNoteEn =
    "Outside of the lab, I am out in the field testing new airframes, scouting good spots to fly my drone, tuning PID control loops, or mentoring aspiring engineering students. The rest of the time I'm reading up on autonomous multi-agent swarm algorithms or exploring new hardware architectures.";

  const personalNoteZh =
    '在实验室工作之余，我常在户外测试新的飞行器机架、寻找测试无人机飞行轨迹的开阔场地、调校四轴飞行器的 PID 控制参数，或是指导年轻的工程系学弟学妹。其余时间，我喜欢研读分布式多智能体蜂群算法并探索下一代自主机器人硬件架构。';

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="footer-container">
          {/* Main heading */}
          <h1>{currentLang === 'zh' ? '联系方式' : 'Contact'}</h1>

          {/* Subtitle matching Steven Feng */}
          <h2>{currentLang === 'zh' ? '一起来聊聊机器人与无人机吧！' : "Let's chat about robots!"}</h2>

          {/* Personal note paragraph */}
          <p className="personal-note">
            {currentLang === 'zh' ? personalNoteZh : personalNoteEn}
          </p>

          {/* Prominent Clickable Email */}
          <a
            href={sanitizeUrl(`mailto:${contact.email || 'mansoorahmedrind@gmail.com'}`)}
            className="email-link"
          >
            {contact.email || 'mansoorahmedrind@gmail.com'}
          </a>

          {/* Social Icons row */}
          <div className="social-icons">
            {contact.linkedIn && isSafeUrl(contact.linkedIn) && (
              <a
                href={sanitizeUrl(contact.linkedIn)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
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
                title="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            )}
            <a
              href={sanitizeUrl(`mailto:${contact.email || 'mansoorahmedrind@gmail.com'}`)}
              aria-label="Email"
              title="Direct Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Quick Inquiry Form */}
          <div className="contact-inquiry-box w-full max-w-lg mt-10 p-6 sm:p-8 rounded-2xl shadow-2xl text-left">
            <h3 className="contact-inquiry-title text-base font-bold mb-1 text-center">
              {currentLang === 'zh' ? '发送在线消息' : 'Send a Direct Message'}
            </h3>
            <p className="contact-inquiry-sub text-xs mb-4 text-center">
              {currentLang === 'zh' ? '消息将直接送达我的工作信箱' : 'Inquiries will be delivered directly to my inbox'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="contact-label block text-xs font-semibold mb-1">
                    {currentLang === 'zh' ? '您的姓名' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="contact-input w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="contact-label block text-xs font-semibold mb-1">
                    {currentLang === 'zh' ? '电子邮箱' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="contact-input w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="contact-label block text-xs font-semibold mb-1">
                  {currentLang === 'zh' ? '主题' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. UAV Swarm Collaboration or Research"
                  className="contact-input w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="contact-label block text-xs font-semibold mb-1">
                  {currentLang === 'zh' ? '留言内容' : 'Message'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="contact-input w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{currentLang === 'zh' ? '消息发送成功！我会尽快回复。' : 'Message dispatched successfully! I will get back to you shortly.'}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{currentLang === 'zh' ? '发送失败，请直接通过电子邮件联系。' : 'Failed to send message. Please reach out via direct email.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.02] disabled:opacity-50"
              >
                {status === 'sending' ? (
                  <span>{currentLang === 'zh' ? '正在发送...' : 'Sending...'}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentLang === 'zh' ? '发送消息' : 'Send Message'}</span>
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
