import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Footprints, Calculator, Palette, Globe } from 'lucide-react';

const SECTIONS = [
  { icon: Shirt, title: 'Tops', text: 'Polo shirts, blouses, shirts and sweaters. Check your school\'s colour and the correct fit around the shoulders and chest.' },
  { icon: Palette, title: 'Dresses & Bottoms', text: 'Pinafores, skirts and trousers. For trousers, measure the waist and inside leg; for skirts and pinafores, use the waist and desired length.' },
  { icon: Shirt, title: 'Outerwear', text: 'Hoodies and fleece jackets. These are usually worn over the uniform, so allow a little room — order one size up if in doubt.' },
  { icon: Footprints, title: 'Socks & Accessories', text: 'Socks, ties and neck scarves. Match the school\'s required colour; ties and scarves are usually one size.' },
  { icon: Calculator, title: 'Calculators', text: 'IB Graphic Display Calculators for senior students. Confirm the exact model your school\'s maths department requires before ordering.' },
  { icon: Globe, title: 'Local vs Imported', text: 'Some items are available as a locally-made or an imported (UK) version. Both meet quality standards — choose based on your school\'s preference and budget.' },
];

export default function UniformGuide() {
  return (
    <div>
      <div className="bg-secondary/30 stitched-b">
        <div className="container-academic py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Uniform Guide</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary">Choosing the right uniform</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">A simple guide to the uniform categories we stock and how to pick the right items for your child.</p>
        </div>
      </div>

      <div className="container-academic py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-card p-6">
              <s.icon className="w-8 h-8 text-accent mb-4" />
              <h2 className="font-heading text-lg font-bold text-primary mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Not sure of the size?</h2>
            <p className="text-sm text-primary-foreground/70 max-w-md">Use our size guide to measure your child at home, or visit us at Ridgeways Mall to try sizes on.</p>
          </div>
          <Link to="/measure" className="btn-accent inline-flex items-center gap-2 shrink-0">Open Size Guide <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}