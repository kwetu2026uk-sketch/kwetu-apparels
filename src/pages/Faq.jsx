import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Faq() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    base44.entities.Faq.list('sort_order', 100)
      .then((r) => setItems((r || []).filter((x) => x.active !== false)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [];
  items.forEach((i) => { if (!categories.includes(i.category || 'General')) categories.push(i.category || 'General'); });

  return (
    <div>
      <div className="bg-secondary/30 stitched-b">
        <div className="container-academic py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Help Centre</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary">Frequently Asked Questions</h1>
        </div>
      </div>

      <div className="container-academic py-12 max-w-3xl">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No questions yet.</p>
        ) : (
          <div className="space-y-10">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="font-heading text-xl font-bold text-primary mb-4">{cat}</h2>
                <div className="space-y-2">
                  {items.filter((i) => (i.category || 'General') === cat).map((i) => {
                    const isOpen = open === i.id;
                    return (
                      <div key={i.id} className="bg-card">
                        <button onClick={() => setOpen(isOpen ? null : i.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                          <span className="text-sm font-medium text-foreground">{i.question}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{i.answer}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}