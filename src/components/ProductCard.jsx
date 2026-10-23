import React from 'react';
import { Link } from 'react-router-dom';
import { priceLabel, ORIGIN_BADGE } from '@/lib/format';
import { totalStock, productStockStatus } from '@/lib/stock';
import Swatch from '@/components/Swatch';

export default function ProductCard({ product }) {
  const status = productStockStatus(product);
  const image = product.images?.[0];
  const stock = totalStock(product);
  const origin = ORIGIN_BADGE[product.origin] || ORIGIN_BADGE.local;
  const colourSet = [...new Set([...(product.colours || []), ...(product.variants || []).map((v) => v.colour)].filter(Boolean))].slice(0, 6);

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square bg-secondary overflow-hidden mb-3">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/50">Kwetu</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/90 backdrop-blur px-2 py-1">
          <span className={`w-1.5 h-1.5 rounded-full ${status.tone === 'in' ? 'pulse-dot' : ''}`} style={{ backgroundColor: status.color }} />
          <span className="text-[10px] uppercase tracking-wider text-foreground">{status.label}</span>
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-background/90 backdrop-blur px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: origin.color }} />
          <span className="text-[10px] uppercase tracking-wider text-foreground">{origin.label}</span>
        </div>
        {stock <= 0 && (
          <div className="absolute inset-0 bg-background/55 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-primary font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{[product.category_name, product.subtype].filter(Boolean).join(' · ')}</p>
        <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-snug">{product.name}</h3>
        {colourSet.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {colourSet.map((c) => <Swatch key={c} colour={c} size={14} />)}
          </div>
        )}
        <p className="text-sm font-bold text-primary">{priceLabel(product.price)}</p>
      </div>
    </Link>
  );
}