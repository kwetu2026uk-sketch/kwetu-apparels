import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { slugify } from '@/lib/format';

export default function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await base44.entities.School.list('sort_order', 100);
      setSchools(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) return;
    const payload = { ...editing, slug: editing.slug || slugify(editing.name), sort_order: Number(editing.sort_order) || 0, active: editing.active !== false };
    if (editing.id) await base44.entities.School.update(editing.id, payload);
    else await base44.entities.School.create(payload);
    setShowForm(false); setEditing(null); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this school?')) return;
    await base44.entities.School.delete(id);
    load();
  };

  const toggleActive = async (s) => {
    await base44.entities.School.update(s.id, { active: !s.active });
    load();
  };

  const reorder = async (id, dir) => {
    const idx = schools.findIndex((s) => s.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= schools.length) return;
    const a = schools[idx], b = schools[swapIdx];
    await base44.entities.School.bulkUpdate([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ]);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p>
          <h1 className="font-heading text-3xl font-bold text-primary">Schools</h1>
          <p className="text-xs text-muted-foreground mt-1">New schools appear in the shop filter automatically.</p>
        </div>
        <button onClick={() => { setEditing({ name: '', slug: '', logo_url: '', active: true, sort_order: schools.length }); setShowForm(true); }} className="btn-primary text-xs inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add School</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card">
          {schools.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4 p-4 stitched-b last:border-0">
              <div className="flex flex-col">
                <button onClick={() => reorder(s.id, 'up')} disabled={i === 0} className="text-muted-foreground hover:text-accent disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => reorder(s.id, 'down')} disabled={i === schools.length - 1} className="text-muted-foreground hover:text-accent disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
              <div className="w-10 h-10 bg-secondary overflow-hidden shrink-0 flex items-center justify-center">{s.logo_url ? <img src={s.logo_url} alt="" className="w-full h-full object-contain" /> : <span className="text-xs text-muted-foreground">—</span>}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">/{s.slug}</p>
              </div>
              <button onClick={() => toggleActive(s)} className={`px-3 py-1 text-xs uppercase tracking-wider border ${s.active !== false ? 'border-[#3A8A4A] text-[#3A8A4A]' : 'border-muted-foreground/40 text-muted-foreground'}`}>{s.active !== false ? 'Active' : 'Inactive'}</button>
              <div className="flex gap-2">
                <button onClick={() => { setEditing({ ...s }); setShowForm(true); }} className="p-2 hover:bg-secondary"><Pencil className="w-4 h-4 text-primary" /></button>
                <button onClick={() => remove(s.id)} className="p-2 hover:bg-secondary"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          ))}
          {schools.length === 0 && <p className="p-8 text-center text-muted-foreground">No schools yet.</p>}
        </div>
      )}

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card w-full max-w-md p-6 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 stitched-b pb-4">
              <h2 className="font-heading text-xl font-bold text-primary">{editing.id ? 'Edit School' : 'New School'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-primary" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Name *</label>
                <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Makini Schools" />
              </div>
              <div>
                <label className="label-field">Slug (auto-generated)</label>
                <input className="input-field" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder={slugify(editing.name)} />
              </div>
              <div>
                <label className="label-field">Logo URL (optional)</label>
                <input className="input-field" value={editing.logo_url || ''} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Display Order</label>
                  <input type="number" className="input-field" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">Active</label>
                  <select className="input-field" value={editing.active === false ? 'false' : 'true'} onChange={(e) => setEditing({ ...editing, active: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 stitched-t pt-5">
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">Save School</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}