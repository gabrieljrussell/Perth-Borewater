import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Wrench, 
  Droplets, 
  Smartphone, 
  Search, 
  ShieldCheck, 
  Cpu, 
  ArrowUpRight, 
  Sparkles,
  Phone,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { ALL_SUBURBS_LIST } from '../allSuburbs';

// 20 primary pSEO South Corridor Suburbs
const SOUTH_CORRIDOR_SUBURBS = [
  "Baldivis", "Rockingham", "Canning Vale", "Mandurah", "Secret Harbour", 
  "Atwell", "Aubin Grove", "Beeliar", "Bertram", "Casuarina", 
  "Cockburn Central", "Cooloongup", "Hammond Park", "Jandakot", "Karrakup", 
  "Karnup", "Kwinana", "Port Kennedy", "Success", "Wellard"
];

// Local water profile information as requested by layout logic
const LOCAL_WATER_PROFILES: Record<string, string> = {
  baldivis: "Bassendean Sands | Avg. 18m Water Table",
  rockingham: "Coastal Limestone | High Salinity Risk",
  "canning-vale": "Guildford Formation | Iron-rich Coffee Rock"
};

const DEFAULT_PROFILE = "Deep Alluvial Aquifer | High Yield Area";

interface HomeBentoPageProps {
  onSelectSuburb: (slug: string) => void;
  onOpenModal: (title: string) => void;
}

export default function HomeBentoPage({ onSelectSuburb, onOpenModal }: HomeBentoPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProfileSuburb, setSelectedProfileSuburb] = useState<string>('Baldivis');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suburbs list for searchable selector dropdown (restricted to 20 index suburbs)
  const filteredSuburbs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const southSet = new Set(SOUTH_CORRIDOR_SUBURBS.map(s => s.toLowerCase()));
    return ALL_SUBURBS_LIST.filter(sub => {
      const matchQuery = sub.name.toLowerCase().includes(query) || 
                          sub.postcode.includes(query);
      const isIndexSuburb = southSet.has(sub.name.toLowerCase());
      return matchQuery && isIndexSuburb;
    }).slice(0, 6);
  }, [searchQuery]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Retrieve water profile descriptive string based on suburb slug
  const getWaterProfile = (suburbName: string) => {
    const slug = suburbName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return LOCAL_WATER_PROFILES[slug] || DEFAULT_PROFILE;
  };

  const handleProfileSelection = (subName: string) => {
    setSelectedProfileSuburb(subName);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#1E293B]" id="home-bento-view">
      
      {/* Visual background engineering grid highlights */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(0,180,216,0.08),transparent)] pointer-events-none z-0" />
      
      {/* 1. TOP BENTO GRID ROW: Hero (2x2) and Value Prop (1x1) + Trust (1x1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* HERO CARD: Spans 8 of 12 columns, 2 rows */}
        <div className="lg:col-span-8 lg:row-span-2 bg-[#002147] text-white border border-[#002147]/50 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[460px]">
          {/* Subtle water schematic design accent */}
          <div className="absolute inset-0 bg-[#00B4D8]/5 mix-blend-overlay pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00B4D8]/15 transition-all duration-700" />
          
          <div className="space-y-6">
            {/* Top Badge Indicators for compliance & DWER licence */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-full text-[#00B4D8] font-mono text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Licensed Driller Class 1</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DWER Compliant</span>
              </span>
            </div>

            {/* Headline and Narrative */}
            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-4.5xl font-display font-black tracking-tight leading-tight text-white">
                Perth&apos;s Local Bore &amp;<br />
                <span className="text-[#00B4D8]">Reticulation Experts</span>
              </h1>
              <p className="text-[#E2E8F0] font-sans font-medium text-sm sm:text-base leading-relaxed max-w-2xl">
                Specialized drilling, preventative maintenance, and smart state-of-the-art irrigation models across the South Corridor. 100% West Australian owned and operated.
              </p>
            </div>
          </div>

          {/* Primary CTA and response metrics */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => onOpenModal('Book Site Assessment')}
              className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-[#002147] font-sans text-xs uppercase tracking-wider font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300 shadow-lg shadow-[#00B4D8]/25 hover:scale-[1.01] active:scale-[0.99] relative"
            >
              {/* Pulse ripple effect */}
              <span className="absolute inset-0 rounded-xl bg-[#00B4D8]/30 animate-ping -z-10 opacity-75" />
              <span>Book a Site Assessment</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            
            <a 
              href="tel:0863704982"
              className="px-5 py-4 border border-white/20 hover:border-white/40 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-white/5 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#00B4D8]" />
              <span>(08) 6370 4982</span>
            </a>
          </div>
        </div>

        {/* VALUE PROP CARD: Spans 4 of 12 columns */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-[2rem] p-7 flex flex-col justify-between hover:shadow-xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[220px] text-left">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/10 text-[#002147] border border-[#00B4D8]/20 flex items-center justify-center">
              <Cpu className="w-5.5 h-5.5 text-[#00B4D8]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-black text-[#002147] text-base">Slash Your Water Bill</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save up to 40% on annual water utility expenses by switching your garden connection over to an optimized shallow bore.
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black block mt-6">
            ✦ HIGH WATERWISE RATING
          </span>
        </div>

        {/* TRUST & COMPLIANCE CARD: Spans 4 of 12 columns */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-[2rem] p-7 flex flex-col justify-between hover:shadow-xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[220px] text-left">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-black text-[#002147] text-base">Government Certified</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Licensed water bore drilling aligning fully with DWER environmental standards to protect the integrity of underlying aquifers.
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-widest block mt-6">
            DWER LICENSE #2241 APPROVED
          </span>
        </div>

      </div>

      {/* 2. MIDDLE BENTO ROW: Horizontal Services Strip (4x1 Columns Layout) */}
      <div className="space-y-4 text-left">
        <h2 className="text-xs font-mono font-black tracking-widest text-[#00B4D8] uppercase pl-1">
          ✦ Core Drilling &amp; Reticulation Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card A: Drilling */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#002147]/5 border border-[#002147]/10 flex items-center justify-center text-[#002147]">
                <Layers className="w-5 h-5 text-[#002147]" />
              </div>
              <h4 className="font-display font-black text-[#002147] text-sm">New Water Bores</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Precision water bore installations using engineered food-safe casing and uncompromised regulatory guidelines.
              </p>
            </div>
          </div>

          {/* Card B: Repairs */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-display font-black text-slate-800 text-sm">Pump &amp; Bore Repairs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Same-day electrical troubleshooting, diagnostics, downhole camera tracking, and rapid pump changeouts.
              </p>
            </div>
          </div>

          {/* Card C: Filtration */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="font-display font-black text-slate-800 text-sm">Iron Stain Filtration</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anti-scaling waterwise treatments to eliminate brown iron-rich staining from walls, driveways, and plants.
              </p>
            </div>
          </div>

          {/* Card D: Retic */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-display font-black text-[#002147] text-sm">Smart Irrigation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wi-Fi controller setups, weather-synchronized reticulation, and water-wise solenoid diagnostics.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM BENTO ROW: Suburb Hub (3x2 Large Span) and Interactive Suburb Selector (1x2 Span) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SUBURB SITEMAP HUB: 3x2 Large Row Span (represented here as grid-col size 8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2rem] p-7 sm:p-9 flex flex-col justify-between hover:shadow-xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left min-h-[420px]">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00B4D8] rounded-full animate-pulse" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#002147] uppercase">
                Perth South Corridor Footprint
              </h3>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Our South Corridor Hub</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                We maintain active hydrogeological monitoring stations and local drilling operations throughout the Western Australia coastal shelf. Tap on any localized suburb to explore local bore depth limits and specific soil layers:
              </p>
            </div>

            {/* Dense, Beautiful Grid of Suburbs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              {SOUTH_CORRIDOR_SUBURBS.map((subName) => {
                const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <a
                    key={subName}
                    href={`/bore-drilling/${subSlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectSuburb(subSlug);
                    }}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200/50 hover:bg-[#002147] hover:border-[#002147] p-3 rounded-xl hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors">{subName}</span>
                    <span className="text-[#00B4D8] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-xs font-bold">→</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <span className="text-slate-400 font-mono tracking-tight font-medium">Providing complete DWER-compliant licensing support for new residential bores.</span>
            <button 
              onClick={() => {
                const element = document.getElementById('suburb-directory-sitemap');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-[#002147] hover:text-[#00B4D8] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All suburbs</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE DATA & SELECTOR CORE: grid-col size 4 */}
        <div className="lg:col-span-4 bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden text-left min-h-[420px]">
          <div className="absolute inset-0 bg-[#00BEF6]/[0.02] pointer-events-none" />
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#00B4D8] font-black uppercase block">
                Local Water Profile Diagnostic
              </span>
              <h3 className="font-display font-black text-white text-base">Select Your Suburb</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Query local unconfined aquifer profiles and geological rock classifications dynamically across our South Corridor range.
              </p>
            </div>

            {/* Interactive Search / Autocomplete Field */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative flex items-center bg-slate-850 hover:bg-slate-800 border border-slate-800 focus-within:border-[#00B4D8]/60 focus-within:bg-slate-800 rounded-xl px-3.5 py-1.5 transition-colors">
                <Search className="w-4 h-4 text-[#00B4D8] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Type a suburb name (e.g. Baldivis)..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-xs py-2 pl-2 border-none outline-none focus:outline-none focus:ring-0 active:ring-0 focus:border-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Autocomplete selection results floating dropdown */}
              {showDropdown && (
                <div className="absolute top-12 left-0 right-0 bg-[#0E1524] border border-slate-800 rounded-xl overflow-hidden z-40 shadow-2xl divide-y divide-slate-850">
                  {filteredSuburbs.length > 0 ? (
                    filteredSuburbs.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => handleProfileSelection(sub.name)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 text-xs text-slate-200 hover:text-white font-medium flex justify-between items-center transition-colors font-sans"
                      >
                        <span className="font-bold">{sub.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({sub.postcode})</span>
                      </button>
                    ))
                  ) : searchQuery.trim().length > 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 font-sans">
                      No matching unconfined aquifer profiles found.
                    </div>
                  ) : (
                    <div className="p-1 px-2.5 py-2">
                      <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest block mb-1">
                        High Priority Areas
                      </span>
                      {['Baldivis', 'Rockingham', 'Canning Vale'].map((subName) => (
                        <button
                          key={subName}
                          onClick={() => handleProfileSelection(subName)}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-850 rounded text-xs text-slate-350 hover:text-slate-100 font-semibold flex justify-between items-center transition-colors"
                        >
                          <span>{subName}</span>
                          <span className="text-[8px] text-[#00B4D8] font-mono">Profile →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Display Selected Suburb local water diagnostic block */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  Groundwater Status
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-[8.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  Stable System
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-white font-display font-black text-base tracking-tight block">
                  {selectedProfileSuburb} Profile
                </span>
                <p className="text-xs text-[#00B4D8] font-mono font-bold tracking-tight">
                  {getWaterProfile(selectedProfileSuburb)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-slate-800/40">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Recommended casing</span>
                  <span className="text-slate-300 font-semibold">Food-Grade PVC</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Standard drilling</span>
                  <span className="text-slate-300 font-semibold">Rotary Mud Drill</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                const subSlug = selectedProfileSuburb.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                onSelectSuburb(subSlug);
              }}
              className="w-full flex items-center justify-center gap-1 bg-white/10 hover:bg-[#00B4D8] text-white hover:text-[#002147] py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer text-center"
            >
              <span>View Full Geological Report</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. FINAL CTA ROW: Ready to Start (2x1 Large Span) */}
      <div className="bg-[#002147] border border-[#002147]/50 rounded-[2rem] p-8 sm:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden text-left relative z-10 animate-fade-in">
        <div className="absolute inset-0 bg-linear-gradient(to_right,rgba(0,180,216,0.06),transparent) pointer-events-none" />
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span>Fast response priority dispatch</span>
          </div>
          <h3 className="text-2xl sm:text-3.5xl font-display font-black tracking-tight text-white leading-none">
            Ready to secure sustainable water?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Book an obligation-free diagnostic assessment. Our Waterwise certified hydrologist will visit your site, inspect your retic, and detail precise depth estimates.
          </p>
        </div>
        <button
          onClick={() => onOpenModal('Secure My Drill Date')}
          className="bg-[#00B4D8] hover:bg-white text-[#002147] font-semibold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-1.5 font-bold h-12 w-full md:w-auto justify-center hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Book Site Assessment</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
