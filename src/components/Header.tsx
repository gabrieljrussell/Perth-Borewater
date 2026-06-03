import React from 'react';
import { Droplet, Phone, ShieldCheck, MapPin } from 'lucide-react';

interface HeaderProps {
  onSelectSuburb: (slug: string | null) => void;
  currentSuburb: string | null;
}

export default function Header({ onSelectSuburb, currentSuburb }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_12px_30px_rgba(0,0,0,0.03)] px-4 sm:px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo and Brand (Fully customized with SVG logo) */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectSuburb(null)}
          id="hdr-logo"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden p-0.5 transition-transform group-hover:scale-105 duration-300">
            <img src="https://perthborewater.com.au/serve-image.php?file=Logo.jpeg" alt="Perth BoreWater Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 transition-colors">
                Perth<span className="text-[#007AFF] font-medium ml-1">BoreWater</span>
              </h1>
              {currentSuburb && (
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] rounded-md">
                  {currentSuburb}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              Precision Bore Engineering
            </p>
          </div>
        </div>

        {/* Rapid Stats & Contacts */}
        <div className="flex items-center gap-4 md:gap-6 text-xs text-slate-600">
          <div className="hidden lg:flex items-center gap-2 text-slate-500 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Perth Aquifer Network</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]"></span>
            </span>
            <span className="text-[#007AFF] font-mono font-bold text-[10px] uppercase">Active Drill Teams</span>
          </div>

          <a 
            href="tel:0863704982" 
            className="bg-[#E2E8F0]/40 hover:bg-[#E2E8F0]/65 text-slate-800 font-sans font-extrabold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-slate-300/40 hover:scale-[1.02] active:scale-[0.98] duration-300 flex items-center gap-2 cursor-pointer h-[38px]"
            id="hdr-call-btn"
          >
            <Phone className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="font-extrabold font-sans">(08) 6370 4982</span>
          </a>

          <button 
            onClick={() => document.getElementById('emergency-repair-booking-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)] text-white font-sans text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-full font-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/20 duration-300 flex items-center gap-1.5 h-[38px]"
          >
            Book a Drill
          </button>
        </div>
      </div>
    </header>
  );
}
