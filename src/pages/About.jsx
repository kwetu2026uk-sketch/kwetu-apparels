import React from 'react';
import { MapPin, Clock, Mail, Phone, Target, Eye, Quote } from 'lucide-react';
import { useSettings, telLink, waMe } from '@/lib/settingsContext';
import { SocialIcons } from '@/components/SocialIcons';

const FALLBACK = {
  mission: 'Our mission is to provide Nairobi families with high-quality, durable and affordable school uniforms, making back-to-school simple for parents and comfortable for students.',
  vision: 'To be Nairobi\'s most trusted school uniform retailer — known for quality, reliability and genuine care for every student we dress.',
  ceo_name: 'CEO Name',
  ceo_message: 'Welcome to Kwetu Apparels. We started this business to take the stress out of school uniform shopping for Nairobi parents. Every uniform we sell is chosen for durability and comfort, and every family we serve is treated like our own. Thank you for trusting us with your children.',
};

export default function About() {
  const s = useSettings();
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(s.map_query || s.address)}&output=embed`;

  return (
    <div>
      <div className="bg-secondary/30 stitched-b">
        <div className="container-academic py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">About Us</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary">The story behind Kwetu Apparels</h1>
        </div>
      </div>

      <div className="container-academic py-12 md:py-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          <div className="bg-card p-8">
            <Target className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">Our Mission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.mission || FALLBACK.mission}</p>
          </div>
          <div className="bg-card p-8">
            <Eye className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">Our Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.vision || FALLBACK.vision}</p>
          </div>
        </div>

        {/* CEO word */}
        <div className="bg-card p-8 md:p-10 mb-14">
          <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
            <div className="aspect-square bg-secondary overflow-hidden">
              {s.ceo_photo ? <img src={s.ceo_photo} alt={s.ceo_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>}
            </div>
            <div>
              <Quote className="w-8 h-8 text-accent mb-4" />
              <h2 className="font-heading text-2xl font-bold text-primary mb-2">A Word from the CEO</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.ceo_message || FALLBACK.ceo_message}</p>
              <p className="font-heading text-lg text-primary">{s.ceo_name || FALLBACK.ceo_name}</p>
              <p className="text-xs uppercase tracking-wider text-accent">Chief Executive Officer</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Find Us</p>
            <h2 className="font-heading text-3xl font-bold text-primary mb-5">Our Location</h2>
            <div className="space-y-4 mb-6">
              {s.address && <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" /><p className="text-sm text-foreground">{s.address}</p></div>}
              {s.phone && <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" /><a href={telLink(s.phone)} className="text-sm text-foreground hover:text-accent">{s.phone}</a></div>}
              {s.email && <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" /><a href={`mailto:${s.email}`} className="text-sm text-foreground hover:text-accent">{s.email}</a></div>}
              {s.working_hours && <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" /><p className="text-sm text-foreground">{s.working_hours}</p></div>}
            </div>
            <div className="flex items-center gap-4">
              <a href={waMe(s.phone)} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2"><Phone className="w-4 h-4" /> WhatsApp Us</a>
              <SocialIcons settings={s} />
            </div>
          </div>
          <div className="relative aspect-video bg-secondary overflow-hidden border border-border">
            <iframe title="Kwetu Apparels location" src={mapSrc} className="w-full h-full" style={{ border: 0 }} loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}