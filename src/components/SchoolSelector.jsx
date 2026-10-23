import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { School as SchoolIcon, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SchoolSelector() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.School.list('sort_order', 50)
      .then((s) => setSchools(s || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = schools.filter((s) => s.active !== false);
  if (!loading && active.length === 0) return null;

  return (
    <section className="container-academic py-12 md:py-16">
      <div className="flex items-end justify-between mb-6 stitched-b pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Shop by School</p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary">Find uniforms for your school</h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {active.map((s) => (
          <Link
            key={s.id}
            to={`/catalog?school=${encodeURIComponent(s.slug)}`}
            className="group inline-flex items-center gap-3 bg-card stitched px-4 py-3 hover:border-accent transition-colors"
          >
            {s.logo_url ? (
              <img src={s.logo_url} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <SchoolIcon className="w-5 h-5 text-accent" />
            )}
            <span className="text-sm font-medium text-foreground group-hover:text-accent">{s.name}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
          </Link>
        ))}
        {loading && [...Array(3)].map((_, i) => <div key={i} className="h-12 w-44 bg-muted animate-pulse" />)}
      </div>
    </section>
  );
}