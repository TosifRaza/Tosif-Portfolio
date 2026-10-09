import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Linkedin, Github, Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { api } from '@/utils/api';
import SectionHeader from '../SectionHeader';
import { usePublicSite } from '../siteContext';

export default function ContactPage() {
  const { profile } = usePublicSite();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const infoRows = [
    { icon: Mail, label: 'Email', value: profile?.email, href: profile?.email ? `mailto:${profile.email}` : null },
    { icon: MapPin, label: 'Location', value: profile?.location },
    { icon: Linkedin, label: 'LinkedIn', value: profile?.socials?.linkedin, href: profile?.socials?.linkedin },
    { icon: Github, label: 'GitHub', value: profile?.socials?.github, href: profile?.socials?.github },
  ].filter((r) => r.value);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await api.submitContact(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setStatus('error');
    }
  };

  const inputCls =
    'w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none transition-colors';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={MessageSquare}
        eyebrow="Contact"
        title="Get In Touch"
        subtitle="I'm always open to discussing new opportunities, collaborations or just a friendly chat."
      />

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* Info side */}
        <div className="space-y-3">
          {infoRows.map(({ icon: Icon, label, value, href }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4"
            >
              <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                <Icon size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener"
                    className="text-sm text-foreground hover:text-primary truncate block transition-colors">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-foreground truncate">{value}</p>
                )}
              </div>
            </motion.div>
          ))}

          {profile?.availability?.status && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-1">Availability</p>
              <p className="text-sm text-foreground">{profile.availability.status}</p>
              {profile.availability.type && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.availability.type} · {profile.availability.location}</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Form side */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CheckCircle2 size={40} className="text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Message sent!</h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                Thanks for reaching out — your message is stored safely and I'll get back to you soon.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground/80 hover:border-primary/40 hover:text-primary transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-name" className="block text-xs font-medium text-foreground/80 mb-1.5">Name</label>
                  <input id="c-name" required maxLength={120} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-xs font-medium text-foreground/80 mb-1.5">Email</label>
                  <input id="c-email" required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="c-subject" className="block text-xs font-medium text-foreground/80 mb-1.5">Subject <span className="text-muted-foreground/60">(optional)</span></label>
                <input id="c-subject" maxLength={200} value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is this about?" className={inputCls} />
              </div>
              <div>
                <label htmlFor="c-message" className="block text-xs font-medium text-foreground/80 mb-1.5">Message</label>
                <textarea id="c-message" required rows={6} maxLength={4000} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can I help you?" className={`${inputCls} resize-y`} />
              </div>
              {status === 'error' && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-[0_4px_24px_hsl(var(--primary)/0.3)] hover:bg-primary/90 transition-all disabled:opacity-60"
              >
                {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
