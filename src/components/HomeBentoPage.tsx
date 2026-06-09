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
  Database,
  Coins,
  TrendingUp
} from 'lucide-react';
import { ALL_SUBURBS_LIST } from '../allSuburbs';

// 20 primary pSEO South Corridor Suburbs
const SOUTH_CORRIDOR_SUBURBS = [
  "Rockingham", "Baldivis", "Piara Waters", "Canning Vale", "Wellard",
  "Bertram", "Atwell", "Aubin Grove", "Success", "Beeliar",
  "Coogee", "Cockburn Central", "Hammond Park", "Harrisdale", "Southern River",
  "Armadale", "Kelmscott", "Kwinana", "Spearwood", "Byford"
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

  // States for Hero Zip Code / Suburb Search box
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [showHeroDropdown, setShowHeroDropdown] = useState(false);
  const heroDropdownRef = useRef<HTMLDivElement>(null);

  // States for Mains vs Bore Calculator
  const [lawnSize, setLawnSize] = useState<number>(250); // m²
  const [wateringWeeks, setWateringWeeks] = useState<number>(30); // 30 active weeks in Perth's dry season
  
  const mainsCostPerKL = 3.10; // high house usage tier in WA
  const borePowerCostPerKL = 0.05; // standard Grundfos energy use
  
  const annualWaterVolumeKL = useMemo(() => {
    // 10mm per watering session, 2 sessions per week, over wateringWeeks
    return Math.round((lawnSize * 10 * 2 * wateringWeeks) / 1000);
  }, [lawnSize, wateringWeeks]);
  
  const annualMainsCost = useMemo(() => {
    return Math.round(annualWaterVolumeKL * mainsCostPerKL);
  }, [annualWaterVolumeKL]);
  
  const annualBoreCost = useMemo(() => {
    return Math.round((annualWaterVolumeKL * borePowerCostPerKL) + 40); // $40 safety buffer
  }, [annualWaterVolumeKL]);
  
  const annualSavings = useMemo(() => {
    return annualMainsCost - annualBoreCost;
  }, [annualMainsCost, annualBoreCost]);
  
  const paybackYears = useMemo(() => {
    // Average cost of a high-quality shallow Bore installation in Perth is approx $5,400
    const estBoreInstallCost = 5200;
    return (estBoreInstallCost / (annualSavings || 1)).toFixed(1);
  }, [annualSavings]);

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

  // Filter suburbs list for the Hero Search box (restricted to 20 index suburbs)
  const filteredHeroSuburbs = useMemo(() => {
    const query = heroSearchQuery.trim().toLowerCase();
    if (!query) return [];
    const southSet = new Set(SOUTH_CORRIDOR_SUBURBS.map(s => s.toLowerCase()));
    return ALL_SUBURBS_LIST.filter(sub => {
      const matchQuery = sub.name.toLowerCase().includes(query) || 
                          sub.postcode.includes(query);
      const isIndexSuburb = southSet.has(sub.name.toLowerCase());
      return matchQuery && isIndexSuburb;
    }).slice(0, 6);
  }, [heroSearchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (heroDropdownRef.current && !heroDropdownRef.current.contains(event.target as Node)) {
        setShowHeroDropdown(false);
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
        <div className="lg:col-span-8 lg:row-span-2 bg-[#00142A] text-white border border-[#002147]/50 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative group min-h-[480px]">
          {/* Background Wrapper keeping overflow constrained for background video and gradients */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none z-0">
            {/* High-impact Video Montage active background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 pointer-events-none mix-blend-lighten"
            >
              <source src="https://assets.perthborewater.com.au/Coogee.mp4" type="video/mp4" />
            </video>

            {/* Subtle water schematic overlay gradient */}
            <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(0,33,71,0.4),rgba(0,10,25,0.95)) z-0 pointer-events-none" />
          </div>
          
          <div className="space-y-6 relative z-10 w-full">
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

            {/* Headline and Wallet-targeting Hook */}
            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-4.5xl font-display font-black tracking-tight leading-tight text-white">
                Slash Your Water Bills <br className="hidden sm:inline" />
                with a <span className="text-[#00B4D8]">Custom-Engineered Bore.</span>
              </h1>
              <p className="text-[#E2E8F0]/90 font-sans font-medium text-sm sm:text-md leading-relaxed max-w-2xl">
                Perth&apos;s leading engineers in the underground. Save up to 80% on retic water charges and garden maintenance with class-1 drilling.
              </p>
            </div>
          </div>

          {/* CTA & Single-Field Zip / Suburb Search box */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-20 space-y-4">
            <div className="relative w-full max-w-md">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00B4D8] mb-2.5">
                Find your local water table expert:
              </label>
              
              <div className="relative flex items-center bg-slate-950/85 hover:bg-slate-900 border border-white/20 focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/10 rounded-xl px-3.5 transition-all">
                <MapPin className="w-4 h-4 text-[#00B4D8] shrink-0" />
                <select
                  onChange={(e) => {
                    const subSlug = e.target.value;
                    if (subSlug) {
                      onSelectSuburb(subSlug);
                    }
                  }}
                  className="w-full bg-transparent text-white text-xs py-3.5 pl-3 pr-8 border-none outline-none focus:outline-none focus:ring-0 cursor-pointer appearance-none font-sans font-semibold"
                  defaultValue=""
                >
                  <option value="" disabled className="bg-[#0A0F1D] text-slate-400">
                    Choose Specific Suburb...
                  </option>
                  {ALL_SUBURBS_LIST.slice().sort((a,b) => a.name.localeCompare(b.name)).map((sub) => {
                    const subSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <option key={sub.name} value={subSlug} className="bg-[#0A0F1D] text-white py-2">
                        {sub.name} (Postcode {sub.postcode})
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-4.5 top-5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-[#00B4D8] w-0 h-0" />
              </div>

              {/* Instant-select Priority Suburb Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-1">
                  Quick Select:
                </span>
                {['Baldivis', 'Rockingham', 'Canning Vale', 'Piara Waters', 'Wellard'].map((subName) => {
                  const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <button
                      key={subName}
                      type="button"
                      onClick={() => onSelectSuburb(subSlug)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00B4D8]/15 border border-white/10 hover:border-[#00B4D8]/30 text-[10px] text-slate-350 hover:text-white transition-all cursor-pointer font-sans font-medium"
                    >
                      {subName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Soft contact buttons below the instant search block */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenModal('Book Site Audit')}
                className="bg-[#00B4D8] hover:bg-white text-[#002147] font-sans text-xs uppercase tracking-wider font-black px-6 py-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#00B4D8]/20"
              >
                Book Site Audit
              </button>
              <a 
                href="tel:0863704982"
                className="px-5 py-4 border border-white/20 hover:border-white/40 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all hover:bg-white/5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>(08) 6370 4982</span>
              </a>
            </div>
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
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#002147]/5 border border-[#002147]/10 flex items-center justify-center text-[#002147]">
                  <Layers className="w-5 h-5 text-[#002147]" />
                </div>
                <span className="text-[8px] font-mono font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 border border-[#007AFF]/15 px-2.5 py-0.5 rounded-full">
                  Tier I
                </span>
              </div>
              <h4 className="font-display font-black text-[#002147] text-sm">New Water Bores</h4>
              
              {/* Image holder for New Water Bores */}
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS9LmvO7mawncwLdjxtZvYiFRtsNcXYv_94qu6ByOeZpKC_DpMT1BJh3SXGLDVzfp5kjvH8bFJ8fJq13Qla3cr3Juvr5x7i4kUiFrptGWMgqmmnp5pRo0yizIO0ewmhP1XbQ3vWAEMy79_7G-w0Vc-wCpkIa41CKErQiDCDpPLaQfzT6mBNEUxQaR0V3QVZpmvH6qS-jNTOj4neyC5lLBhzen03c3hh2BkaFw5KDY7pjGJxBOayRdNd4npeabUG0S9eGZ2YYMrmr2W" 
                  alt="New water bore drilling rig and installation" 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[8px] text-white font-mono uppercase tracking-widest font-bold">
                  DRILLING RIG
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Precision water bore installations using engineered food-safe casing and uncompromised regulatory guidelines.
              </p>
            </div>
          </div>

          {/* Card B: Repairs */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono font-bold tracking-widest text-rose-600 uppercase bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                  Tier II
                </span>
              </div>
              <h4 className="font-display font-black text-slate-800 text-sm">Pump &amp; Bore Repairs</h4>

              {/* Image holder for Repairs */}
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img 
                  src="https://assets.perthborewater.com.au/Water_bore_diagnostic_repair_202606090937.jpeg" 
                  alt="Water bore diagnostic repair and technicians" 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[8px] text-white font-mono uppercase tracking-widest font-bold">
                  DIAGNOSTICS RIG
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Same-day electrical troubleshooting, diagnostics, downhole camera tracking, and rapid pump changeouts.
              </p>
            </div>
          </div>

          {/* Card C: Filtration */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-[8px] font-mono font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 border border-[#007AFF]/15 px-2.5 py-0.5 rounded-full">
                  Tier III
                </span>
              </div>
              <h4 className="font-display font-black text-slate-800 text-sm">Iron Stain Filtration</h4>

              {/* Image holder for Filtration */}
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img 
                  src="https://assets.perthborewater.com.au/Water_bore_stain_removal_system.jpeg" 
                  alt="Water bore iron stain filtration and mineral treatment" 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[8px] text-white font-mono uppercase tracking-widest font-bold">
                  MINERAL FILTER
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Anti-scaling waterwise treatments to eliminate brown iron-rich staining from walls, driveways, and plants.
              </p>
            </div>
          </div>

          {/* Card D: Retic / Smart Irrigation */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300 text-left flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                  Tier IV
                </span>
              </div>
              <h4 className="font-display font-black text-[#002147] text-sm">Smart Irrigation</h4>

              {/* Image holder for Smart Irrigation */}
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img 
                  src="https://assets.perthborewater.com.au/Smart_reticulation.jpeg" 
                  alt="Smart Reticulation and waterwise irrigation layout" 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1563514227346-a3b14a2bf1de?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[8px] text-white font-mono uppercase tracking-widest font-bold">
                  FLOW OPTIMIZER
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Wi-Fi controller setups, weather-synchronized reticulation, and water-wise solenoid diagnostics.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2b. The 3-Step Authority Section */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-[2rem] p-8 sm:p-10 text-left space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-b border-slate-200/60 pb-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-full text-[9px] font-mono font-bold text-[#008BB2] uppercase tracking-wider">
              <span>Our Transparent Installation Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-display font-black text-slate-900 tracking-tight leading-tight">
              Our 3-Step Authority Blueprint
            </h2>
            <p className="text-xs sm:text-sm text-slate-505 max-w-xl">
              Home water drilling is a significant lifestyle asset. We make the entire process smooth, secure, and completely transparent from regulatory checks to active service.
            </p>
          </div>

          {/* Lead Engineer Bio Box (Human Trust Signal) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs w-full lg:max-w-md shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=180&h=180&q=80" 
                alt="Michael Russell, Lead Director" 
                className="w-full h-full object-cover grayscale font-sans text-[8px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] font-mono font-black text-[#00B4D8] uppercase tracking-widest leading-none">Lead Site Director</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h4 className="text-xs font-display font-extrabold text-slate-800">Michael &quot;Mike&quot; Russell</h4>
              <p className="text-[10px] text-slate-500 italic leading-snug">
                &quot;We don&apos;t just drill holes. We map your subsoil, design custom slot casing, and guarantee lifetime flow.&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-4 relative bg-white border border-slate-200/50 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,180,216,0.01)] hover:shadow-md transition-all group">
            <span className="absolute -top-3 right-4 text-6xl font-sans font-black text-slate-100/50 pointer-events-none select-none z-0 group-hover:text-[#00B4D8]/10 transition-colors">01</span>
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Database className="w-5.5 h-5.5 text-[#007AFF]" />
              </div>
              <h3 className="text-base font-display font-black text-slate-800">1. Geological Site Map</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                We analyze the Perth Basin under your property. Our GIS satellite dataset accurately maps depth levels and strata layers before any machinery unloads.
              </p>
              <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-100">
                ✦ PRIOR CORRIDOR ANALYSIS
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 relative bg-white border border-slate-200/50 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,180,216,0.01)] hover:shadow-md transition-all group">
            <span className="absolute -top-3 right-4 text-6xl font-sans font-black text-slate-100/50 pointer-events-none select-none z-0 group-hover:text-orange-500/10 transition-colors">02</span>
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <Layers className="w-5.5 h-5.5 text-orange-500" />
              </div>
              <h3 className="text-base font-display font-black text-slate-800">2. Precision Drill</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Our compact class-1 rigs handle everything from coastal white sand to tough Darling Scarp coffee clay without digging up your entire garden.
              </p>
              <div className="text-[9px] font-mono text-orange-600 font-bold uppercase tracking-wider pt-2 border-t border-slate-100">
                ✦ DUST & COMPACTION SHIELDED
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 relative bg-white border border-slate-200/50 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,180,216,0.01)] hover:shadow-md transition-all group">
            <span className="absolute -top-3 right-4 text-6xl font-sans font-black text-slate-100/50 pointer-events-none select-none z-0 group-hover:text-emerald-500/10 transition-colors">03</span>
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Droplets className="w-5.5 h-5.5 text-emerald-500" />
              </div>
              <h3 className="text-base font-display font-black text-slate-800">3. Lifetime Water</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                We lower premium stainless-steel, high-efficiency Grundfos submersible pumps. Coupled with our 24/7 maintenance support and full warranty peace of mind.
              </p>
              <div className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider pt-2 border-t border-slate-100">
                ✦ GRUNDFOS GOLD SEALED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2c. The "Mains vs. Bore" Calculator Section */}
      <div className="bg-white border border-slate-200/70 rounded-[2.2rem] p-8 sm:p-10 text-left shadow-md relative overflow-hidden">
        {/* Decorative background visual elements */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-60 h-60 bg-[#00B4D8]/[0.02] rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-10">
          
          {/* Controls & Inputs: Spans 5 columns */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" />
                <span>Interactive Yield Tool</span>
              </span>
              <h3 className="text-xl sm:text-2.5xl font-display font-black text-slate-900 tracking-tight">
                Mains vs. Bore Calculator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                Adjust your lawn dimensions and active irrigation weeks to calculate the true Water Corporation mains tariff costs compared to a self-sufficient bore.
              </p>
            </div>

            {/* Slider Inputs */}
            <div className="space-y-6 pt-2">
              {/* Slider 1: Lawn/Garden Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold">Lawn &amp; Garden Area:</span>
                  <span className="font-mono text-slate-900 font-bold text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                    {lawnSize} m²
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={lawnSize}
                  onChange={(e) => setLawnSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 hover:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00B4D8] transition-all"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Small Courtyard (50m²)</span>
                  <span>Estate (1500m²)</span>
                </div>
              </div>

              {/* Slider 2: Irrigation active weeks */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold">Watering Season Duration:</span>
                  <span className="font-mono text-slate-900 font-bold text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                    {wateringWeeks} Active Weeks
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="1"
                  value={wateringWeeks}
                  onChange={(e) => setWateringWeeks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 hover:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00B4D8] transition-all"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Spring/Summer (15w)</span>
                  <span>All-Year Maintenance (45w)</span>
                </div>
              </div>
            </div>

            {/* Quick Insights Accent Card */}
            <div className="p-4 bg-blue-50/50 border border-blue-100/60 rounded-2xl flex items-start gap-3">
              <span className="text-[#00B4D8] mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4 shrink-0" />
              </span>
              <p className="text-[11px] text-slate-605 leading-relaxed font-sans font-medium">
                <strong>Bores allow 3 watering days a week</strong> under permanent Perth metropolitan exemption clauses, whereas Mains connections are strictly restricted to 2 days on the municipal roster!
              </p>
            </div>
          </div>

          {/* Calculation Table & Return details: Spans 7 columns */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 text-white rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl min-h-[380px]">
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 pb-3.5">
                <div>
                  <span className="text-[9px] font-mono text-[#00B4D8] font-bold uppercase tracking-widest block">
                    HYDROGEOLOGY ESTIMATION
                  </span>
                  <p className="text-xs font-sans font-medium text-slate-400 mt-0.5">
                    Calculated Annual Water Consumption:
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-lg sm:text-xl font-mono text-white tracking-tight block">
                    {annualWaterVolumeKL} <span className="text-xs text-slate-400 font-normal">kL/yr</span>
                  </strong>
                </div>
              </div>

              {/* Major instant financial win callout - High impact */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-widest block">
                  Your Net Savings Per Year
                </span>
                <div className="text-3xl sm:text-4.5xl font-mono font-black text-emerald-400 tracking-tight leading-none">
                  ${annualSavings.toLocaleString()}<span className="text-xs sm:text-sm font-sans font-medium text-emerald-500 ml-1">/ year</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto pt-1 leading-normal font-sans">
                  Switching to a bore instantly chops up to 80% off your reticulation charges. You will save <strong className="text-white">${(annualSavings * 3).toLocaleString()}</strong> in just your first 3 seasons.
                </p>
              </div>

              {/* Softened data comparisons */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/30 border border-slate-850/60 p-3 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Standard Mains (1yr)</span>
                  <span className="text-slate-300 font-semibold block mt-1">${annualMainsCost.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/30 border border-slate-850/60 p-3 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Bore Power (1yr)</span>
                  <span className="text-slate-300 font-semibold block mt-1">${annualBoreCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payback period and call-to-action block */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-widest block">
                  AMORTIZATION TIMELINE
                </span>
                <span className="text-xs font-sans text-slate-400">
                  Estimated Payback period: <strong className="text-slate-200 font-mono text-xs">{paybackYears} Years</strong> (Subtle asset hedge)
                </span>
              </div>
              <button
                onClick={() => onOpenModal('Book Site Audit')}
                className="bg-[#00B4D8] hover:bg-white text-[#002147] font-sans text-xs uppercase tracking-wider font-extrabold px-6 py-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#00B4D8]/10 flex items-center gap-1.5"
              >
                <span>Book Site Audit</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {SOUTH_CORRIDOR_SUBURBS.map((subName) => {
                const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const subEntry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase() === subName.toLowerCase());
                const postcode = subEntry ? subEntry.postcode : '';
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
                    <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors">
                      {subName} Bore Analysis ({postcode || '6000'})
                    </span>
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
          onClick={() => onOpenModal('Book Site Audit')}
          className="bg-[#00B4D8] hover:bg-white text-[#002147] font-semibold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-1.5 font-bold h-12 w-full md:w-auto justify-center hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Book Site Audit</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
