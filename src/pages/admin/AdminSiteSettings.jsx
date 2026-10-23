import React, { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BLANK = {
  phone: '+254140910889', email: 'Kwetu2025uk@gmail.com', working_hours: '10:30 AM - 5:30 PM, every day',
  tiktok: '', instagram: '', facebook: '', address: 'Ridgeways Mall, Kiambu Road, Nairobi', map_query: 'Ridgeways Mall Nairobi',
  mission: '', vision: '', ceo_name: '', ceo_photo: '', ceo_message: '',
};

export default function AdminSiteSettings() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.list('-created_date', 1)
      .then((r) => setS(r && r[0] ? { ...BLANK, ...r[0] } : { ...BLANK }))
      .catch(() => setS({ ...BLANK }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (s.id) await base44.entities.SiteSettings.update(s.id, s);
      else await base44.entities.SiteSettings.create(s);
      alert('Settings saved.');
    } catch (e) { alert('Could not save.'); }
    finally { setSaving(false); }
  };

  if (loading || !s) return <div className="h-40 bg-muted animate-pulse" />;

  const set = (k, v) => setS({ ...s, [k]: v });
  const field = (k, label, type = 'text') => (
    <div><label className="label-field">{label}</label><input type={type} className="input-field" value={s[k] || ''} onChange={(e) => set(k, e.target.value)} /></div>
  );
  const area = (k, label) => (
    <div><label className="label-field">{label}</label><textarea className="input-field min-h-[80px]" value={s[k] || ''} onChange={(e) => set(k, e.target.value)} /></div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p>
        <h1 className="font-heading text-3xl font-bold text-primary">Site Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">These power the header, footer, contact, About and WhatsApp buttons across the site.</p>
      </div>

      <div className="bg-card p-6 md:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {field('phone', 'Phone / WhatsApp')}
          {field('email', 'Email', 'email')}
        </div>
        {field('working_hours', 'Working hours')}
        <div className="grid sm:grid-cols-3 gap-4">
          {field('tiktok', 'TikTok URL')}
          {field('instagram', 'Instagram URL')}
          {field('facebook', 'Facebook URL')}
        </div>
        <p className="text-xs text-muted-foreground">Leave a social URL blank to hide that icon.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {field('address', 'Address')}
          {field('map_query', 'Map search query')}
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 mt-6 space-y-4">
        <h2 className="font-heading text-lg font-bold text-primary">About Us content</h2>
        {area('mission', 'Our Mission')}
        {area('vision', 'Our Vision')}
        <div className="grid sm:grid-cols-2 gap-4">
          {field('ceo_name', 'CEO name')}
          {field('ceo_photo', 'CEO photo URL')}
        </div>
        {area('ceo_message', 'CEO message')}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-60">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
      </button>
    </div>
  );
}