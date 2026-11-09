import React, { useState } from 'react';
import { AlertCircle, ArrowUpRight, Check, Copy, Send } from 'lucide-react';
import { ContactData, SocialLinkItem } from '../../types/portfolio';
import { SocialPlatformIcon } from '../ui/Icons';
import { SectionHead, externalUrl } from './siteKit';

interface ContactProps {
  num: string;
  contact: ContactData;
  socials: SocialLinkItem[];
  onSubmitMessage: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<{ success: boolean; error?: string } | boolean>;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

export const Contact: React.FC<ContactProps> = ({ num, contact, socials, onSubmitMessage }) => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const email = contact.email;
  const phone = contact.phone;
  const tel = phone?.replace(/[^0-9+]/g, '');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot: humans never see this field; form-filling bots do. Pretend it worked.
    const trap = (e.currentTarget as HTMLFormElement).elements.namedItem('website') as HTMLInputElement | null;
    if (trap?.value) {
      setStatus('success');
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setError('Please fill in your name, email and a message.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await onSubmitMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'Portfolio enquiry',
        message: form.message.trim(),
      });
      const ok = typeof res === 'boolean' ? res : res?.success;
      if (ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setError(`That didn't go through. Email me directly at ${email}.`);
      }
    } catch {
      setStatus('error');
      setError(`Network problem. Email me directly at ${email}.`);
    }
  };

  const channels = socials.filter((s) => s.platform !== 'email');
  const [head, tail] = splitHeading(contact.heading);

  return (
    <section className="sec contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHead num={num} title="Contact" id="contact-title" />

        <div className="contact__grid">
          <div className="rv">
            <p className="contact__big">
              {head}
              {tail && <em>{tail}</em>}
            </p>
            {contact.description && <p className="contact__lede">{contact.description}</p>}

            <div className="contact__mail">
              <a className="contact__email" href={`mailto:${email}`}>
                {email}
              </a>
              <button
                type="button"
                className="icon-btn"
                onClick={copyEmail}
                aria-label={copied ? 'Email copied' : 'Copy email address'}
                title="Copy email"
              >
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              </button>
              <span className="vh" aria-live="polite">
                {copied ? 'Email address copied' : ''}
              </span>
            </div>

            <div className="contact__channels">
              {contact.showPhone && phone && (
                <a href={`tel:${tel}`}>
                  <span>{phone}</span>
                  <span className="mono muted">Phone</span>
                </a>
              )}
              {channels.map((s) => (
                <a key={s.id} href={externalUrl(s.url)} target="_blank" rel="noopener noreferrer">
                  <span>
                    <SocialPlatformIcon platform={s.platform} icon={s.icon} />
                    {s.label || s.platform}
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {contact.formEnabled && (
            <form className="form rv" onSubmit={onSubmit} noValidate>
              <p className="mono muted">Or send a message</p>
              <div className="vh" aria-hidden="true">
                <label htmlFor="cf-website">Leave this field empty</label>
                <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <div className="form__row">
                <div className="field">
                  <label className="mono" htmlFor="cf-name">
                    Name
                  </label>
                  <input id="cf-name" name="name" autoComplete="name" required value={form.name} onChange={set('name')} />
                </div>
                <div className="field">
                  <label className="mono" htmlFor="cf-email">
                    Email
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                  />
                </div>
              </div>
              <div className="field">
                <label className="mono" htmlFor="cf-subject">
                  Subject <span className="muted">(optional)</span>
                </label>
                <input id="cf-subject" name="subject" value={form.subject} onChange={set('subject')} />
              </div>
              <div className="field">
                <label className="mono" htmlFor="cf-message">
                  Message
                </label>
                <textarea id="cf-message" name="message" rows={5} required value={form.message} onChange={set('message')} />
              </div>

              <div role="status" aria-live="polite">
                {status === 'success' && (
                  <p className="form__status is-ok">
                    <Check aria-hidden="true" /> Thanks, your message is in. I'll get back to you soon.
                  </p>
                )}
              </div>
              {status === 'error' && (
                <p className="form__status is-err" role="alert">
                  <AlertCircle aria-hidden="true" /> {error}
                </p>
              )}

              <div>
                <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'} <Send aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

/** Put the final word or the trailing "?" of the heading in the signal colour. */
function splitHeading(text: string): [string, string] {
  const t = (text || '').trim();
  if (!t) return ['Get in touch', '.'];
  if (/[?.!]$/.test(t)) return [t.slice(0, -1), t.slice(-1)];
  return [t, '.'];
}
