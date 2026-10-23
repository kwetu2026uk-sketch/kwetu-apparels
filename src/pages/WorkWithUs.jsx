import React, { useEffect, useState } from 'react';
import { Briefcase, Handshake, GraduationCap, Check, Loader2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TABS = [
  { id: 'partner', label: 'Partner Schools', icon: GraduationCap, type: 'partner_school' },
  { id: 'sponsor', label: 'Sponsors & Expos', icon: Handshake, type: 'sponsor' },
  { id: 'career', label: 'Careers', icon: Briefcase, type: 'career' },
];

export default function WorkWithUs() {
  const [tab, setTab] = useState('partner');
  const [roles, setRoles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    base44.entities.CareerRole.list('sort_order', 50).then((r) => setRoles((r || []).filter((x) => x.active !== false))).catch(() => {});
  }, []);

  const reset = () => { setForm({}); setDone(false); };

  const submit = async (type) => {
    if (!form.message) { alert('Please add a short message.'); return; }
    setBusy(true);
    try {
      await base44.functions.invoke('submitEnquiry', { ...form, type });
      setDone(true);
      setForm({});
    } catch (e) { alert('Could not submit. Please try again or contact us directly.'); }
    finally { setBusy(false); }
  };

  const onCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((f) => ({ ...f, cv_uri: file_uri, cv_link: '' }));
    } catch { alert('Could not upload your CV. You can paste a link instead.'); }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label-field">{label}</label>
      <input type={type} className="input-field" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
    </div>
  );

  return (
    <div>
      <div className="bg-secondary/30 stitched-b">
        <div className="container-academic py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Work With Us</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary">Let's grow together</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">Schools, sponsors and talented individuals — partner with Kwetu Apparels.</p>
        </div>
      </div>

      <div className="container-academic py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); reset(); }} className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${tab === t.id ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {done ? (
          <div className="bg-card p-10 text-center">
            <div className="w-14 h-14 bg-[#3A8A4A] rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7 text-white" /></div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">Thank you!</h2>
            <p className="text-sm text-muted-foreground mb-6">We've received your submission and will be in touch soon.</p>
            <button onClick={reset} className="btn-outline">Submit another</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card p-6 md:p-8">
              {tab === 'partner' && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-primary mb-2">Partner Schools</h2>
                  {field('organisation', 'School name')}
                  {field('contact_person', 'Contact person')}
                  <div className="grid sm:grid-cols-2 gap-4">{field('phone', 'Phone')}{field('email', 'Email', 'email')}</div>
                  {field('students', 'Number of students', 'number')}
                  <div><label className="label-field">Message</label><textarea className="input-field min-h-[90px]" value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can serve your school…" /></div>
                  <button onClick={() => submit('partner_school')} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Submit'}</button>
                </div>
              )}
              {tab === 'sponsor' && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-primary mb-2">Sponsors & Expos</h2>
                  {field('organisation', 'Organisation')}
                  {field('contact_person', 'Contact person')}
                  <div className="grid sm:grid-cols-2 gap-4">{field('phone', 'Phone')}{field('email', 'Email', 'email')}</div>
                  {field('collaboration_type', 'Type of collaboration')}
                  <div><label className="label-field">Message</label><textarea className="input-field min-h-[90px]" value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the partnership or event…" /></div>
                  <button onClick={() => submit('sponsor')} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Submit'}</button>
                </div>
              )}
              {tab === 'career' && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-primary mb-2">General Application</h2>
                  {field('name', 'Full name')}
                  <div className="grid sm:grid-cols-2 gap-4">{field('phone', 'Phone')}{field('email', 'Email', 'email')}</div>
                  <div>
                    <label className="label-field">Role you're applying for</label>
                    <select className="input-field" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="">Select a role…</option>
                      {roles.map((r) => <option key={r.id} value={r.title}>{r.title}</option>)}
                      <option value="General Application">General Application</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">CV upload</label>
                    <input type="file" onChange={onCv} className="text-sm" />
                    {form.cv_uri && <p className="text-xs text-[#3A8A4A] mt-1">CV uploaded ✓</p>}
                    <p className="text-xs text-muted-foreground mt-1">Or paste a link below (stored privately).</p>
                    <input className="input-field mt-2" value={form.cv_link || ''} onChange={(e) => setForm({ ...form, cv_link: e.target.value, cv_uri: '' })} placeholder="https://link-to-your-cv…" />
                  </div>
                  <div><label className="label-field">Message</label><textarea className="input-field min-h-[80px]" value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about yourself…" /></div>
                  <button onClick={() => submit('career')} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Submit Application'}</button>
                </div>
              )}
            </div>

            <div>
              {tab === 'career' && roles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading text-lg font-bold text-primary mb-2">Open Roles</h3>
                  {roles.map((r) => (
                    <div key={r.id} className="bg-card p-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{r.title}</p>
                        {r.location && <span className="text-xs text-muted-foreground">{r.location}</span>}
                      </div>
                      {r.department && <p className="text-xs uppercase tracking-wider text-accent mb-2">{r.department}</p>}
                      {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {tab === 'career' && roles.length === 0 && <p className="text-sm text-muted-foreground">No specific openings listed — we welcome general applications.</p>}
              {tab !== 'career' && (
                <div className="bg-secondary/30 p-6">
                  <h3 className="font-heading text-lg font-bold text-primary mb-2">{TABS.find((t) => t.id === tab).label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">We partner with schools and organisations across Nairobi to supply quality uniforms and support community events. Fill in the form and our team will reach out to discuss how we can work together.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}