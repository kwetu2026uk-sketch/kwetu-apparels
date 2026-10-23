import { base44 } from '@/api/base44Client';

export function variantLabel(v) {
  if (!v) return '';
  return v.label || [v.colour, v.size].filter(Boolean).join(' · ') || v.size || '';
}

export function findVariant(product, variantId) {
  if (!product?.variants?.length) return null;
  return product.variants.find((v) => v.id === variantId) || null;
}

export function totalStock(p) {
  if (!p) return 0;
  if (p.variants && p.variants.length) return p.variants.reduce((s, v) => s + Number(v.stock || 0), 0);
  return Number(p.stock || 0);
}

export function productStockStatus(p, threshold = 5) {
  const t = totalStock(p);
  if (t <= 0) return { label: 'Out of Stock', tone: 'out', color: '#94918B' };
  if (t <= threshold) return { label: 'Low Stock', tone: 'low', color: '#C58F21' };
  return { label: 'In Stock', tone: 'in', color: '#3A8A4A' };
}

export async function adjustStock(product, variantId, delta, meta = {}) {
  const d = Number(delta);
  if (product.variants && product.variants.length) {
    const variants = product.variants.map((v) =>
      v.id === variantId ? { ...v, stock: Math.max(0, Number(v.stock || 0) + d) } : v
    );
    const stock = variants.reduce((s, v) => s + Number(v.stock || 0), 0);
    await base44.entities.Product.update(product.id, { variants, stock });
    const variant = variants.find((v) => v.id === variantId);
    await base44.entities.StockMovement.create({
      product_id: product.id,
      product_name: product.name,
      variant_id: variantId || '',
      variant_label: variantLabel(variant),
      sku: variant?.sku || '',
      type: meta.type || 'adjustment',
      quantity: d,
      channel: meta.channel || 'online',
      note: meta.note || '',
      staff: meta.staff || '',
      movement_date: new Date().toISOString(),
    });
    return { variants, stock };
  } else {
    const stock = Math.max(0, Number(product.stock || 0) + d);
    await base44.entities.Product.update(product.id, { stock });
    await base44.entities.StockMovement.create({
      product_id: product.id,
      product_name: product.name,
      variant_id: '',
      variant_label: '',
      sku: '',
      type: meta.type || 'adjustment',
      quantity: d,
      channel: meta.channel || 'online',
      note: meta.note || '',
      staff: meta.staff || '',
      movement_date: new Date().toISOString(),
    });
    return { stock };
  }
}