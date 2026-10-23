import React, { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

let vid = 0;
const newId = () => `v${Date.now().toString(36)}${(vid++).toString(36)}`;

export default function VariantEditor({ variants, colours = [], onChange }) {
  const [sizesInput, setSizesInput] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const list = variants || [];

  const generate = () => {
    const sizes = sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!sizes.length) return;
    const cols = colours.length ? colours : [''];
    const existing = new Set(list.map((v) => `${v.size}|${v.colour || ''}`));
    const next = [...list];
    sizes.forEach((sz) =>
      cols.forEach((col) => {
        const key = `${sz}|${col}`;
        if (existing.has(key)) return;
        next.push({
          id: newId(),
          size: sz,
          colour: col || '',
          price: Number(basePrice) || 0,
          sku: '',
          stock: 0,
          label: [col, sz].filter(Boolean).join(' · '),
        });
      })
    );
    setSizesInput('');
    onChange(next);
  };

  const copyPrice = () => {
    if (!list.length) return;
    const p = Number(list[0].price) || 0;
    onChange(list.map((v) => ({ ...v, price: p })));
  };

  const updateRow = (id, field, val) =>
    onChange(
      list.map((v) =>
        v.id === id
          ? { ...v, [field]: val, label: [field === 'colour' ? val : v.colour, field === 'size' ? val : v.size].filter(Boolean).join(' · ') }
          : v
      )
    );
  const removeRow = (id) => onChange(list.filter((v) => v.id !== id));
  const addRow = () =>
    onChange([...list, { id: newId(), size: '', colour: colours[0] || '', price: Number(basePrice) || 0, sku: '', stock: 0, label: '' }]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="input-field flex-1"
          placeholder="Sizes (e.g. 4-5y, 6-7y, S, M, L)"
          value={sizesInput}
          onChange={(e) => setSizesInput(e.target.value)}
        />
        <input type="number" className="input-field sm:w-32" placeholder="Base price" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
        <button type="button" onClick={generate} className="btn-primary text-xs inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Generate
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copyPrice} className="btn-outline text-xs inline-flex items-center gap-2">
          <Copy className="w-4 h-4" /> Copy price to all
        </button>
        <button type="button" onClick={addRow} className="btn-outline text-xs inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add row
        </button>
      </div>

      {list.length > 0 && (
        <div className="border border-input overflow-x-auto">
          <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_auto] gap-2 p-2 bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground min-w-[560px]">
            <span>Size</span>
            <span>Colour</span>
            <span>Price</span>
            <span>SKU</span>
            <span>Stock</span>
            <span />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {list.map((v) => (
              <div key={v.id} className="grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_auto] gap-2 p-2 stitched-t items-center min-w-[560px]">
                <input className="border border-input px-2 py-1 text-sm" value={v.size || ''} onChange={(e) => updateRow(v.id, 'size', e.target.value)} />
                <input className="border border-input px-2 py-1 text-sm" value={v.colour || ''} onChange={(e) => updateRow(v.id, 'colour', e.target.value)} list="colour-options" />
                <input type="number" className="border border-input px-2 py-1 text-sm" value={v.price} onChange={(e) => updateRow(v.id, 'price', e.target.value)} />
                <input className="border border-input px-2 py-1 text-sm" value={v.sku || ''} onChange={(e) => updateRow(v.id, 'sku', e.target.value)} />
                <input type="number" className="border border-input px-2 py-1 text-sm" value={v.stock} onChange={(e) => updateRow(v.id, 'stock', e.target.value)} />
                <button type="button" onClick={() => removeRow(v.id)} className="p-1 text-destructive hover:bg-secondary">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <datalist id="colour-options">
        {colours.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}