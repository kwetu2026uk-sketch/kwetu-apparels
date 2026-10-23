import React, { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Store, ShoppingBag, ClipboardList } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { KES, MOVEMENT_TYPE_LABELS } from '@/lib/format';
import { totalStock, adjustStock, variantLabel } from '@/lib/stock';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [period, setPeriod] = useState('all');

  // In-store sale / adjustment form
  const [selProduct, setSelProduct] = useState('');
  const [selVariant, setSelVariant] = useState('');
  const [moveType, setMoveType] = useState('instore_sale');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [staff, setStaff] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, m, o] = await Promise.all([
        base44.entities.Product.list('-created_date', 300),
        base44.entities.StockMovement.list('-movement_date', 300),
        base44.entities.Order.list('-created_date', 200),
      ]);
      setProducts(p); setMovements(m); setOrders(o);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stockRows = useMemo(() => {
    const rows = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length) {
        p.variants.forEach((v) => rows.push({ product: p.name, productId: p.id, variantId: v.id, variantLabel: variantLabel(v) || 'Default', sku: v.sku || '', stock: Number(v.stock || 0) }));
      } else {
        rows.push({ product: p.name, productId: p.id, variantId: '', variantLabel: 'Default', sku: '', stock: Number(p.stock || 0) });
      }
    });
    return rows;
  }, [products]);

  const lowRows = stockRows.filter((r) => r.stock > 0 && r.stock <= threshold);
  const outRows = stockRows.filter((r) => r.stock <= 0);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (period === '7d') return now.getTime() - 7 * 86400000;
    if (period === '30d') return now.getTime() - 30 * 86400000;
    return 0;
  }, [period]);

  const summary = useMemo(() => {
    const inRange = (m) => new Date(m.movement_date || m.created_date).getTime() >= periodStart;
    let onlineUnits = 0, physicalUnits = 0;
    movements.filter(inRange).forEach((m) => {
      if (m.type === 'online_sale') onlineUnits += Math.abs(Number(m.quantity) || 0);
      if (m.type === 'instore_sale') physicalUnits += Math.abs(Number(m.quantity) || 0);
    });
    const onlineRevenue = orders.filter((o) => o.status !== 'cancelled' && new Date(o.created_date).getTime() >= periodStart).reduce((s, o) => s + (o.total || 0), 0);
    return { onlineUnits, physicalUnits, onlineRevenue };
  }, [movements, orders, periodStart]);

  const selectedProduct = products.find((p) => p.id === selProduct);
  const variantOptions = selectedProduct?.variants?.length ? selectedProduct.variants : [];

  const record = async () => {
    if (!selectedProduct) return;
    setBusy(true);
    try {
      let delta = Number(qty) || 0;
      if (moveType === 'instore_sale') delta = -Math.abs(delta);
      else if (moveType === 'restock' || moveType === 'return') delta = Math.abs(delta);
      await adjustStock(selectedProduct, selVariant || (variantOptions.length ? variantOptions[0].id : ''), delta, { type: moveType, channel: 'physical', note, staff });
      setQty(1); setNote(''); setSelVariant('');
      load();
    } catch (e) { console.error(e); alert('Could not record movement.'); }
    finally { setBusy(false); }
  };

  const exportCSV = () => {
    const rows = [['Product', 'Variant', 'SKU', 'Stock']];
    stockRows.forEach((r) => rows.push([r.product, r.variantLabel, r.sku, r.stock]));
    const csv = rows.map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kwetu-stock.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Manage</p>
          <h1 className="font-heading text-3xl font-bold text-primary">Inventory</h1>
        </div>
        <button onClick={exportCSV} className="btn-outline text-xs inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wider text-muted-foreground">Online Units</span><ShoppingBag className="w-4 h-4 text-accent" /></div>
          <p className="text-2xl font-bold text-primary">{summary.onlineUnits}</p>
        </div>
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wider text-muted-foreground">In-store Units</span><Store className="w-4 h-4 text-accent" /></div>
          <p className="text-2xl font-bold text-primary">{summary.physicalUnits}</p>
        </div>
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wider text-muted-foreground">Online Revenue</span><TrendingUp className="w-4 h-4 text-accent" /></div>
          <p className="text-2xl font-bold text-primary">{KES(summary.onlineRevenue)}</p>
        </div>
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wider text-muted-foreground">Low / Out</span><ClipboardList className="w-4 h-4 text-accent" /></div>
          <p className="text-2xl font-bold text-primary">{lowRows.length} / {outRows.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Record movement */}
        <div className="bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-primary mb-4">Record In-store Sale / Movement</h2>
          <div className="space-y-3">
            <select className="input-field" value={selProduct} onChange={(e) => { setSelProduct(e.target.value); setSelVariant(''); }}>
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {variantOptions.length > 0 && (
              <select className="input-field" value={selVariant} onChange={(e) => setSelVariant(e.target.value)}>
                <option value="">Select variant…</option>
                {variantOptions.map((v) => <option key={v.id} value={v.id}>{variantLabel(v)}</option>)}
              </select>
            )}
            <div className="grid grid-cols-2 gap-3">
              <select className="input-field" value={moveType} onChange={(e) => setMoveType(e.target.value)}>
                <option value="instore_sale">In-store Sale (−)</option>
                <option value="restock">Restock (+)</option>
                <option value="return">Return (+)</option>
                <option value="adjustment">Adjustment (±)</option>
              </select>
              <input type="number" className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" value={staff} onChange={(e) => setStaff(e.target.value)} placeholder="Staff member" />
              <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
            </div>
            <button onClick={record} disabled={!selProduct || busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Recording…' : 'Record Movement'}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-primary mb-4">Summary Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="label-field">Sales period</label>
              <select className="input-field" value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            <div>
              <label className="label-field">Low-stock threshold</label>
              <input type="number" className="input-field" value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 0)} />
            </div>
            {lowRows.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-accent mb-2">Low-stock alerts</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {lowRows.map((r, i) => (
                    <p key={i} className="text-xs text-foreground">{r.product} · {r.variantLabel} · <span className="text-accent font-medium">{r.stock} left</span></p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock list */}
      <div className="bg-card overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="stitched-b">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Product</th>
              <th className="p-4">Variant</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockRows.map((r, i) => {
              const status = r.stock <= 0 ? { label: 'Out', color: '#94918B' } : r.stock <= threshold ? { label: 'Low', color: '#C58F21' } : { label: 'OK', color: '#3A8A4A' };
              return (
                <tr key={i} className="stitched-b">
                  <td className="p-4 text-foreground">{r.product}</td>
                  <td className="p-4 text-muted-foreground">{r.variantLabel}</td>
                  <td className="p-4 text-muted-foreground">{r.sku || '—'}</td>
                  <td className="p-4 font-medium">{r.stock}</td>
                  <td className="p-4"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} /><span className="text-xs">{status.label}</span></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Movement log */}
      <div className="bg-card overflow-x-auto">
        <h2 className="font-heading text-lg font-bold text-primary p-6 pb-4">Stock Movement Log</h2>
        <table className="w-full text-sm min-w-[640px]">
          <thead className="stitched-b">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Date</th>
              <th className="p-4">Product</th>
              <th className="p-4">Variant</th>
              <th className="p-4">Type</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Channel</th>
              <th className="p-4">Staff</th>
            </tr>
          </thead>
          <tbody>
            {movements.slice(0, 50).map((m) => (
              <tr key={m.id} className="stitched-b">
                <td className="p-4 text-muted-foreground">{new Date(m.movement_date || m.created_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</td>
                <td className="p-4 text-foreground">{m.product_name}</td>
                <td className="p-4 text-muted-foreground">{m.variant_label || '—'}</td>
                <td className="p-4">{MOVEMENT_TYPE_LABELS[m.type] || m.type}</td>
                <td className="p-4 font-medium">{Number(m.quantity) > 0 ? '+' : ''}{m.quantity}</td>
                <td className="p-4 capitalize">{m.channel}</td>
                <td className="p-4 text-muted-foreground">{m.staff || '—'}</td>
              </tr>
            ))}
            {movements.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No movements yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}