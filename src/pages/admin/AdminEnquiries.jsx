import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, FileText, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MOVEMENT_TYPE_LABELS } from '@/lib/format';

const TYPE_LABELS = { partner_school: 'Partner School', sponsor: 'Sponsor', career: 'Career', general: 'General' };
const STATUS = ['new', 'in_progress', 'closed'];
const STATUS_LABELS = { new: 'New', in_progress: 'In Progress', closed: 'Closed' };
const STATUS_COLOR = { new: '#3A8A4A', in_progress: '#C58F21', closed: '#94918B' };

export default function AdminEnquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.Enquiry.list('-created_date', 200)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter ? items.filter((i) => i.status === filter) : items;
  const counts = { new: 0, in_progress: 0, closed: 0 };
  items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });

  const setStatus = async (status) => {
    await base44.entities.Enquiry.update(active.id, { status });
    setActive({ ...active, status }); load();
  };
  const setNote = async (val) => {
    await base44.entities.Enquiry.update(active.id, { staff_note: val });
    setActive({ ...active, staff_note: val });
  };
  const viewCv = async () => {
    if (active.cv_link) { window.open(active.cv_link, '_blank'); return; }
    if (active.cv_uri) {
      try { const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: active.cv_uri }); window.open(signed_url, '_blank'); }
      catch { alert('Could not open CV.'); }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p>
        <h1 className="font-heading text-3xl font-bold text-primary">Enquiries</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${!filter ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>All ({items.length})</button>
        {STATUS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${filter === s ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>{STATUS_LABELS[s]} ({counts[s] || 0})</button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div> : (
        <div className="bg-card">
          {filtered.map((i) => (
            <button key={i.id} onClick={() => setActive(i)} className="w-full flex items-center gap-4 p-4 stitched-b last:border-0 text-left hover:bg-secondary/30">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[i.status] || '#94918B' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{i.name || 'Unknown'} · {TYPE_LABELS[i.type] || i.type}</p>
                <p className="text-xs text-muted-foreground truncate">{i.message}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(i.created_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-8 text-center text-muted-foreground">No enquiries.</p>}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 stitched-b pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-primary">{active.name || 'Enquiry'}</h2>
                <p className="text-xs uppercase tracking-wider text-accent">{TYPE_LABELS[active.type] || active.type}</p>
              </div>
              <button onClick={() => setActive(null)}><X className="w-5 h-5 text-primary" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {active.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /><a href={`tel:${active.phone}`} className="hover:text-accent">{active.phone}</a></p>}
              {active.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /><a href={`mailto:${active.email}`} className="hover:text-accent">{active.email}</a></p>}
              {active.organisation && <p><span className="text-muted-foreground">Organisation: </span>{active.organisation}</p>}
              {active.contact_person && <p><span className="text-muted-foreground">Contact: </span>{active.contact_person}</p>}
              {active.role && <p><span className="text-muted-foreground">Role: </span>{active.role}</p>}
              {active.students ? <p><span className="text-muted-foreground">Students: </span>{active.students}</p> : null}
              {active.collaboration_type && <p><span className="text-muted-foreground">Collaboration: </span>{active.collaboration_type}</p>}
              {(active.cv_uri || active.cv_link) && <button onClick={viewCv} className="inline-flex items-center gap-2 text-accent hover:underline"><FileText className="w-4 h-4" /> View CV <ExternalLink className="w-3 h-3" /></button>}
              <div className="stitched-t pt-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Message</p>
                <p className="text-foreground whitespace-pre-line">{active.message}</p>
              </div>
              <div className="stitched-t pt-3">
                <label className="label-field">Status</label>
                <div className="flex gap-2">
                  {STATUS.map((s) => (
                    <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs uppercase border ${active.status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>{STATUS_LABELS[s]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-field">Staff note</label>
                <textarea className="input-field min-h-[70px]" defaultValue={active.staff_note || ''} onBlur={(e) => setNote(e.target.value)} placeholder="Add an internal note…" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}