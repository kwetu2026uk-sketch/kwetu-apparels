import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, AlertTriangle, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { slugify, priceLabel, ORIGIN_BADGE } from '@/lib/format';
import { totalStock, productStockStatus } from '@/lib/stock';
import VariantEditor from '@/components/admin/VariantEditor';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [colourInput, setColourInput] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        base44.entities.Product.list('-created_date', 300),
        base44.entities.Category.list('sort_order', 50),
        base44.entities.School.list('sort_order', 50),
      ]);
      setProducts(p); setCategories(c); setSchools(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const blankProduct = () => ({
    name: '', slug: '', category_id: categories[0]?.id || '', category_name: categories[0]?.name || '',
    subtype: '', description: '', images: [], price: 0, coming_soon: false, origin: 'local',
    colours: [], sizes: [], variants: [], stock: 0, school_ids: [], all_schools: true,
    featured: false, best_seller: false,
  });

  const openNew = () => { setEditing(blankProduct()); setShowForm(true); };
  const openEdit = (p) => { setEditing({ ...p }); setShowForm(true); };

  const save = async () => {
    if (!editing.name) return;
    const variants = (editing.variants || []).map((v) => ({
      ...v,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      label: [v.colour, v.size].filter(Boolean).join(' · ') || v.label || '',
    }));
    const sizes = variants.length ? [...new Set(variants.map((v) => v.size).filter(Boolean))] : (editing.sizes || []).filter(Boolean);
    const stock = variants.length ? variants.reduce((s, v) => s + Number(v.stock || 0), 0) : Number(editing.stock) || 0;
    const positivePrices = variants.length ? variants.map((v) => Number(v.price) || 0).filter((n) => n > 0) : [];
    const price = variants.length ? (positivePrices.length ? Math.min(...positivePrices) : 0) : Number(editing.price) || 0;
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.name),
      category_name: categories.find((c) => c.id === editing.category_id)?.name || editing.category_name,
      price,
      stock,
      sizes,
      variants,
      colours: (editing.colours || []).filter(Boolean),
      images: (editing.images || []).filter(Boolean),
      school_ids: editing.all_schools ? [] : (editing.school_ids || []),
      origin: editing.origin || 'local',
    };
    if (editing.id) await base44.entities.Product.update(editing.id, payload);
    else await base44.entities.Product.create(payload);
    setShowForm(false); setEditing(null); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await base44.entities.Product.delete(id);
    load();
  };

  const addColour = () => {
    const c = colourInput.trim();
    if (c && !(editing.colours || []).includes(c)) setEditing({ ...editing, colours: [...(editing.colours || []), c] });
    setColourInput('');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p>
          <h1 className="font-heading text-3xl font-bold text-primary">Products</h1>
        </div>
        <button onClick={openNew} className="btn-primary text-xs inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="mb-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="input-field pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="stitched-b">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Origin</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = productStockStatus(p);
                const origin = ORIGIN_BADGE[p.origin] || ORIGIN_BADGE.local;
                return (
                  <tr key={p.id} className="stitched-b hover:bg-secondary/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary overflow-hidden shrink-0">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                        <div><p className="font-medium text-foreground">{p.name}</p>{p.subtype && <p className="text-xs text-muted-foreground">{p.subtype}</p>}</div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.category_name}</td>
                    <td className="p-4"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: origin.color }} /><span className="text-xs">{origin.label}</span></span></td>
                    <td className="p-4 font-medium">{priceLabel(p.price)}</td>
                    <td className="p-4"><span className={totalStock(p) <= 5 ? 'text-accent font-medium' : ''}>{totalStock(p)}</span></td>
                    <td className="p-4"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} /><span className="text-xs">{status.label}</span></span></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-secondary"><Pencil className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => remove(p.id)} className="p-2 hover:bg-secondary"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 stitched-b pb-4">
              <h2 className="font-heading text-xl font-bold text-primary">{editing.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-primary" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Name *</label>
                <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Category *</label>
                  <select className="input-field" value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Subtype</label>
                  <input className="input-field" value={editing.subtype || ''} onChange={(e) => setEditing({ ...editing, subtype: e.target.value })} placeholder="e.g. Polo Shirt" />
                </div>
                <div>
                  <label className="label-field">Origin</label>
                  <select className="input-field" value={editing.origin || 'local'} onChange={(e) => setEditing({ ...editing, origin: e.target.value })}>
                    <option value="local">Local</option>
                    <option value="imported">Imported (UK)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea className="input-field min-h-[80px]" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Image URLs (one per line)</label>
                <textarea className="input-field min-h-[60px]" value={(editing.images || []).join('\n')} onChange={(e) => setEditing({ ...editing, images: e.target.value.split('\n') })} placeholder="https://..." />
              </div>

              <div className="stitched-t pt-4">
                <p className="label-field">Schools</p>
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                  <input type="checkbox" checked={editing.all_schools} onChange={(e) => setEditing({ ...editing, all_schools: e.target.checked })} className="accent-accent" /> Available for all schools
                </label>
                {!editing.all_schools && (
                  <div className="flex flex-wrap gap-2">
                    {schools.map((s) => {
                      const checked = (editing.school_ids || []).includes(s.id);
                      return (
                        <button key={s.id} type="button" onClick={() => setEditing({ ...editing, school_ids: checked ? (editing.school_ids || []).filter((x) => x !== s.id) : [...(editing.school_ids || []), s.id] })}
                          className={`px-3 py-1.5 text-xs border ${checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>{s.name}</button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="stitched-t pt-4">
                <p className="label-field">Colours / Patterns</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editing.colours || []).map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary text-xs">
                      {c}
                      <button type="button" onClick={() => setEditing({ ...editing, colours: (editing.colours || []).filter((x) => x !== c) })} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input-field" value={colourInput} onChange={(e) => setColourInput(e.target.value)} placeholder="e.g. Navy Blue, Checkered" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColour())} />
                  <button type="button" onClick={addColour} className="btn-outline text-xs">Add</button>
                </div>
              </div>

              <div className="stitched-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="label-field mb-0">Variants (size / colour / price / SKU / stock)</p>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={editing.coming_soon} onChange={(e) => setEditing({ ...editing, coming_soon: e.target.checked })} className="accent-accent" /> Coming soon
                  </label>
                </div>
                <VariantEditor variants={editing.variants || []} colours={editing.colours || []} onChange={(variants) => setEditing({ ...editing, variants })} />
                {!editing.variants?.length && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-field">Sizes (comma separated)</label>
                      <input className="input-field" value={(editing.sizes || []).join(', ')} onChange={(e) => setEditing({ ...editing, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="S, M, L" />
                    </div>
                    <div>
                      <label className="label-field">Stock (no variants)</label>
                      <input type="number" className="input-field" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="accent-accent" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.best_seller} onChange={(e) => setEditing({ ...editing, best_seller: e.target.checked })} className="accent-accent" /> Best Seller
                </label>
              </div>
              {totalStock({ ...editing, variants: editing.variants }) <= 5 && (
                <p className="flex items-center gap-2 text-xs text-accent"><AlertTriangle className="w-3.5 h-3.5" /> Low total stock — consider restocking.</p>
              )}
            </div>
            <div className="flex gap-3 mt-6 stitched-t pt-5">
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              <button onClick={save} className="btn-primary flex-1 inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}