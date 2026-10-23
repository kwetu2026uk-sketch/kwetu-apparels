import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { useSettings, telLink } from '@/lib/settingsContext';
import { SocialIcons } from '@/components/SocialIcons';

export default function Footer() {
  const s = useSettings();

  const shopLinks = [
    { label: 'All Products', to: '/catalog' },
    { label: 'Tops', to: '/catalog/tops' },
    { label: 'Dresses & Bottoms', to: '/catalog/dresses-bottoms' },
    { label: 'Outerwear', to: '/catalog/outerwear' },
    { label: 'Socks & Accessories', to: '/catalog/socks-accessories' },
  ];

  const infoLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Work With Us', to: '/work-with-us' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Uniform Guide', to: '/uniform-guide' },
    { label: 'Size Guide', to: '/measure' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container-academic py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex flex-col leading-none mb-4">
              <span className="font-heading text-2xl font-bold tracking-tight">KWETU</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent -mt-0.5">Apparels</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">Nairobi's trusted school uniform retailer. Quality uniforms for Nairobi's students.</p>
            <SocialIcons settings={s} className="mt-5" iconClass="w-4 h-4" />
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-accent mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              {shopLinks.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-accent">{l.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-accent mb-4">Information</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              {infoLinks.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-accent">{l.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-accent mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {s.address && <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" /><span>{s.address}</span></li>}
              {s.phone && <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-accent shrink-0" /><a href={telLink(s.phone)} className="hover:text-accent">{s.phone}</a></li>}
              {s.email && <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-accent shrink-0" /><a href={`mailto:${s.email}`} className="hover:text-accent">{s.email}</a></li>}
              {s.working_hours && <li className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 text-accent shrink-0" /><span>{s.working_hours}</span></li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} Kwetu Apparels. All rights reserved.</p>
          <p className="text-xs text-primary-foreground/50">Nairobi's Trusted School Uniform Retailer</p>
        </div>
      </div>
    </footer>
  );
}