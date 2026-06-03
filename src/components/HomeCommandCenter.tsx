import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  Wrench, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Phone,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { ALL_SUBURBS_LIST } from '../allSuburbs';

interface HomeCommandCenterProps {
  onSelectSuburb: (slug: string) => void;
  mediaOverrides: Record<string, { video?: string; photo?: string; geology?: string }>;
  isEditorMode: boolean;
  onToggleEditor: () => void;
}

export default function HomeCommandCenter({ 
  onSelectSuburb, 
  mediaOverrides, 
  isEditorMode,
  onToggleEditor
}: HomeCommandCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter 350+ suburbs based on name or postcode
  const query = searchQuery.trim().toLowerCase();
  const filteredSuburbs = query.length > 0
    ? ALL_SUBURBS_LIST.filter(sub => 
        sub.name.toLowerCase().includes(query) || 
        sub.postcode.includes(query)
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    onSelectSuburb(slug);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const getSuburbsBySector = (sector: string) => {
    return ALL_SUBURBS_LIST.filter(s => s.sector === sector).slice(0, 5);
  };

  const overriddenCount = Object.keys(mediaOverrides).length;

  return (
    <div className="space-y-12 animate-fade-in text-[#1E293B]" id="home-command-center">
      
      {/* 1. Tactical Command Header Banner */}
      <section className="relative min-h-[45vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 rounded-[2rem] overflow-hidden bg-[#0B132B] border border-white/5 shadow-2xl">
        {/* Dark radial grid network background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,122,255,0.18),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Active indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 font-mono text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>Perth Aquifer Intelligence Network</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            Perth Subsurface <span className="text-[#007AFF]">Command Center</span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time strata mapping, geology profiles, and environmental watering rosters across WA&apos;s unconfined groundwater domes. Select or search your suburb to generate.
          </p>

          {/* 2. Tactical Autocomplete Search Bar */}
          <div className="relative w-full max-w-lg mx-auto" ref={dropdownRef}>
            <div className="relative flex items-center bg-white shadow-xl rounded-2xl border border-slate-200 focus-within:border-[#007AFF] transition-all p-1.5">
              <span className="pl-3.5 pr-2 text-slate-400 select-none">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Enquire 350+ suburbs (e.g. Baldivis, Rockingham or 6171)..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm py-2.5 outline-none font-sans font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Suggestions dropdown container */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left divide-y divide-slate-50 transition-all font-sans">
                {filteredSuburbs.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                      Subsurface Records Found
                    </div>
                    {filteredSuburbs.map((sub) => {
                      const slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <button
                          key={slug}
                          onClick={() => handleSelect(slug)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-55 hover:bg-[#007AFF]/5 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-[#007AFF] shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800 text-xs sm:text-sm">{sub.name}</span>
                              <span className="ml-1.5 text-xs text-slate-400 font-mono font-medium">({sub.postcode})</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#007AFF]/85 bg-[#007AFF]/10 border border-[#007AFF]/15 rounded py-0.5 px-2 group-hover:bg-[#007AFF] group-hover:text-white transition-all capitalize font-bold">
                            {sub.sector} Sector
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No exact regional match for <strong className="text-slate-850">&ldquo;{searchQuery}&rdquo;</strong>.
                    <br />
                    <span className="text-[11px] text-slate-400">Type a valid Perth residential name or postal code.</span>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                      Suggested Drilling Hotspots
                    </div>
                    {['rockingham', 'baldivis', 'canning-vale', 'wellard', 'piara-waters'].map(slug_id => {
                      const entry = ALL_SUBURBS_LIST.find(s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug_id);
                      if (!entry) return null;
                      return (
                        <button
                          key={slug_id}
                          onClick={() => handleSelect(slug_id)}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer text-xs font-bold text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{entry.name} ({entry.postcode})</span>
                          </span>
                          <span className="text-[9px] text-[#007AFF] uppercase font-mono">Select Blueprint →</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. "Why Us" Bento Grid (4 Cards) */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className="text-xs font-mono font-black tracking-widest text-[#007AFF] uppercase">
            Sovereign Bore Engineering
          </h3>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-800">
            Why West Australian Estates Trust Us
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Four pillars of precision drilling ensuring lifetime flow, chemical stability, and structural bore integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: WA Ownership */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between min-h-[190px]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#007AFF]">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                100% WA Owned &amp; Operated
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Licensed West Australian borehole specialists (Bore License **#2241**). Built specifically for local sands.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-4">
              LIC #2241 APPROVED
            </span>
          </div>

          {/* Card 2: Precision Drilling */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between min-h-[190px]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                Rigorous Acoustic Drilling
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applying downhole geological telemetry to isolate robust water paths, avoiding silt overlays.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-4">
              99.8% PRECISION FIT
            </span>
          </div>

          {/* Card 3: Lifetime Maintenance */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between min-h-[190px]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Wrench className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                Anti-Clog Acidic Shocks
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proactive chemical backwashing to eliminate organic colloidal iron oxide (Fe&sup2;&#x207A;) bacteria.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-4">
              PREVENTATIVE CARE
            </span>
          </div>

          {/* Card 4: Sustainability */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between min-h-[190px]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                DWER Skimming Models
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skimming unconfined aquifers cleanly. Retaining fresh water tables while preventing seaward wedges.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-4">
              DWER CONSERVANT TYPE
            </span>
          </div>
        </div>
      </section>

      {/* 4. Directory Sitemap index map */}
      <section className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-left">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-4">
          Aquifer Regional Sectors
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6.5">
          {/* Section A: Spearwood */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-[#007AFF] font-mono font-bold bg-[#007AFF]/10 border border-[#007AFF]/15 py-0.5 px-2 rounded">
              Spearwood (Yellow Sands/Limestone)
            </span>
            <div className="space-y-1.5 pl-1 pt-1">
              {getSuburbsBySector('spearwood').map(sub => (
                <button
                  key={sub.name}
                  onClick={() => handleSelect(sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#007AFF] font-medium transition-all group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-350 group-hover:text-[#007AFF] transition-colors" />
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Bassendean */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-purple-700 font-mono font-bold bg-purple-55 bg-purple-50 border border-purple-100 py-0.5 px-2 rounded">
              Bassendean (Grey Sands/Iron-Heavy)
            </span>
            <div className="space-y-1.5 pl-1 pt-1">
              {getSuburbsBySector('bassendean').map(sub => (
                <button
                  key={sub.name}
                  onClick={() => handleSelect(sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-purple-600 font-medium transition-all group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-350 group-hover:text-purple-600 transition-colors" />
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section C: Quindalup */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded">
              Quindalup/Scarp/Guildford
            </span>
            <div className="space-y-1.5 pl-1 pt-1">
              {[...ALL_SUBURBS_LIST.filter(s => ['quindalup', 'scarp', 'guildford'].includes(s.sector)).slice(0, 5)].map(sub => (
                <button
                  key={sub.name}
                  onClick={() => handleSelect(sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 font-medium transition-all group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                  <span>{sub.name} ({sub.postcode})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Builder Admin Tools Quick Overview Panel */}
      <section className="bg-slate-900 border border-white/5 rounded-3xl p-6 text-left text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>AI Studio Manual Media Override System</span>
          </h4>
          <p className="text-xs text-slate-400">
            Smart-bind custom videos or lithological scans to any of Perth&apos;s suburbs. Click on a suburb&apos;s page media slots inside our live preview to manual replace assets in-session.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[8.5px] font-mono text-emerald-300 font-semibold uppercase">
              {overriddenCount} Active Overrides
            </span>
            <span className="bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded text-[8.5px] font-mono text-blue-300 font-semibold uppercase">
              Overrides auto-bind to URLs
            </span>
          </div>
        </div>
        <button 
          onClick={onToggleEditor}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
            isEditorMode 
              ? 'bg-[#007AFF] border-[#007AFF] text-white' 
              : 'bg-white/10 border-white/10 hover:bg-white/15 text-slate-300'
          }`}
        >
          {isEditorMode ? 'Editor Mode: ON' : 'Activate Overrides'}
        </button>
      </section>

    </div>
  );
}
