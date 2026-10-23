import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminCareers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.CareerRole.list('sort_order', 100)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title) return;
    const payload = { ...editing, sort_order: Number(editing.sort_order) || 0, active: editing.active !== false };
    if (editing.id) await base44.entities.CareerRole.update(editing.id, payload);
    else await base44.entities.CareerRole.create(payload);
    setShowForm(false); setEditing(null); load();
  };
  const remove = async (id) => { if (!confirm('Delete this role?')) return; await base44.entities.CareerRole.delete(id); load(); };
  const toggle = async (i) => { await base44.entities.CareerRole.update(i.id, { active: i.active === false }); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p><h1 className="font-heading text-3xl font-bold text-primary">Careers</h1></div>
        <button onClick={() => { setEditing({ title: '', department: '', description: '', location: '', sort_order: items.length, active: true }); setShowForm(true); }} className="btn-primary text-xs inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Role</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div> : (
        <div className="bg-card">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-4 stitched-b last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{i.title}</p>
                <p className="text-xs text-muted-foreground">{[i.department, i.location].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => toggle(i)} className={`px-2 py-1 text-[10px] uppercase border ${i.active !== false ? 'border-[#3A8A4A] text-[#3A8A4A]' : 'border-muted-foreground/40 text-muted-foreground'}`}>{i.active !== false ? 'Active' : 'Hidden'}</button>
              <button onClick={() => { setEditing({ ...i }); setShowForm(true); }} className="p-2 hover:bg-secondary"><Pencil className="w-4 h-4 text-primary" /></button>
              <button onClick={() => remove(i.id)} className="p-2 hover:bg-secondary"><Trash2 className="w-4 h-4 text-destructive" /></button>
            </div>
          ))}
          {items.length === 0 && <p className="p-8 text-center text-muted-foreground">No roles yet.</p>}
        </div>
      )}

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card w-full max-w-lg p-6 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 stitched-b pb-4">
              <h2 className="font-heading text-xl font-bold text-primary">{editing.id ? 'Edit Role' : 'New Role'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-primary" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label-field">Title *</label><input className="input-field" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label-field">Department</label><input className="input-field" value={editing.department || ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></div>
                <div><label className="label-field">Location</label><input className="input-field" value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
              </div>
              <div><label className="label-field">Description</label><textarea className="input-field min-h-[90px]" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-field">Sort order</label><input type="number" className="input-field" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
                <div><label className="label-field">Active</label><select className="input-field" value={editing.active === false ? 'false' : 'true'} onChange={(e) => setEditing({ ...editing, active: e.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 stitched-t pt-5">
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}