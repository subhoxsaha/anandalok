import React from 'react';
import { Heart, ShieldCheck, Mail, MapPin, Phone, ArrowUpRight, Award, ExternalLink } from 'lucide-react';
import { AnandalokLogo } from './AnandalokLogo';
import { AnimatedDonateButton } from './AnimatedDonateButton';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenDonate: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenDonate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <AnandalokLogo size="lg" className="[&_span]:text-white" />

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Anandalok Welfare Foundation is a registered non-governmental social welfare organization dedicated to child
              education, women empowerment, winter cloth distribution drives, and connecting local buyers directly with rural
              artisans.
            </p>

            <div className="inline-flex items-center gap-2 text-xs bg-slate-900/90 text-amber-300 px-3.5 py-2 rounded-xl border border-slate-800 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Registered Govt. Trust | 80G Tax Exemption Certified</span>
            </div>
          </div>

          {/* Causes */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Core Focus Areas</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => setActiveTab('causes')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Child Education & Pathshalas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('causes')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Women Empowerment & SHGs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('causes')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Winter Cloth & Blanket Drives
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Anandalok Crafts Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('causes')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Maternal Health & Nutrition
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Engage & Participate</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Shop Artisan Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('gallery')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  High-Res Impact Gallery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('blog')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Field Update Stories
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('cms')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Staff CMS Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Central Office</h4>
            <p className="flex items-start gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Anandalok Welfare Hub, 14 GT Road, Howrah, West Bengal 711101</span>
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+91 (033) 2638-4000</span>
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>contact@anandalok.org</span>
            </p>
            <AnimatedDonateButton
              onClick={onOpenDonate}
              variant="primary"
              label="Support a Cause Today"
              className="mt-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Anandalok Social Welfare Foundation. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">80G Exemption Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy & Data Audit</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Artisan Fair Wage Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
