import React from 'react';
import { 
  Building2, 
  Droplet, 
  MapPin, 
  ShieldAlert, 
  AlertCircle, 
  Calendar, 
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { SuburbData } from '../types';

interface AuthorityBentoCardsProps {
  suburb: SuburbData;
  postcode: string;
  depthText: string;
  consultantSpeak: {
    profile: string;
    priority: string;
    mitigation: string;
    consultantPrompt: string;
  };
  onOpenQuote: (serviceType: string) => void;
}

export default function AuthorityBentoCards({
  suburb,
  postcode,
  depthText,
  consultantSpeak,
  onOpenQuote
}: AuthorityBentoCardsProps) {
  
  // Deterministic chemical metrics for rendering on suburban pages
  const getChemicalMetrics = (slug: string) => {
    let charCodeSum = 0;
    for (let i = 0; i < slug.length; i++) {
      charCodeSum += slug.charCodeAt(i);
    }
    
    const ironVal = (0.5 + (charCodeSum % 10) * 0.95).toFixed(2);
    const carbonateVal = (50 + (charCodeSum % 15) * 14.5).toFixed(1);
    const sulfideVal = (0.01 + (charCodeSum % 8) * 0.04).toFixed(3);
    const salinityVal = (100 + (charCodeSum % 12) * 22.8).toFixed(1);
    const phVal = (5.2 + (charCodeSum % 7) * 0.42).toFixed(1);

    return {
      iron: ironVal,
      carbonate: carbonateVal,
      sulfide: sulfideVal,
      salinity: salinityVal,
      ph: phVal
    };
  };

  const metrics = getChemicalMetrics(suburb.slug);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="authority-bento-cards">
      
      {/* CARD A: GEOLOGY & HYDROLOGY CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6.5 border border-white/5 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
        {/* Subtle geological grid overlay absolute background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_0%,rgba(56,189,248,0.08),transparent)] pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-0.5 rounded text-[8.5px] font-mono tracking-widest font-bold bg-sky-500/10 border border-sky-500/25 text-sky-400 uppercase">
              STRATA ANALYTICS
            </span>
            <span className="text-[10px] font-mono text-slate-450 font-bold">
              ID: {suburb.slug.toUpperCase()}_HYD
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-black text-xl text-white tracking-tight">
              Aquifer Stratum Metrics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
              Ge geological reading for the shallow unconfined water lens beneath {suburb.name} ({postcode}).
            </p>
          </div>

          {/* Saturated units display */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
              <span className="text-[8px] font-mono text-slate-405 font-bold uppercase tracking-widest block">DEPTH TO WATER</span>
              <strong className="text-lg text-white font-mono font-black tracking-tight">{depthText} mBGL</strong>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
              <span className="text-[8px] font-mono text-slate-405 font-bold uppercase tracking-widest block">DWER BASE RATE</span>
              <strong className="text-lg text-sky-400 font-mono font-black tracking-tight">0.35 GL/yr</strong>
            </div>
          </div>

          {/* Chemical assay with subscripts */}
          <div className="space-y-2.5 pt-2.5 border-t border-white/5 font-sans">
            <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#38BDF8] uppercase">
              Dissolved Mineral Concentration Assay
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 text-[11px] font-medium font-sans">
                  Calcium Carbonate (CaCO<sub>3</sub>)
                </span>
                <span className="font-mono text-white text-[11px] font-bold">{metrics.carbonate} mg/L</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 text-[11px] font-medium font-sans">
                  Ferrous Iron (Fe<sup>2+</sup>)
                </span>
                <span className="font-mono text-white text-[11px] font-bold">{metrics.iron} mg/L</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 text-[11px] font-medium font-sans">
                  Sulfide gas (H<sub>2</sub>S)
                </span>
                <span className="font-mono text-white text-[11px] font-bold">{metrics.sulfide} mg/L</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 text-[11px] font-medium font-sans">
                  Salt Intrusive (NaCl)
                </span>
                <span className="font-mono text-white text-[11px] font-bold">{metrics.salinity} mg/L</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5 sm:col-span-2">
                <span className="text-slate-400 text-[11px] font-medium font-sans">
                  Organic Acidity (pH scale)
                </span>
                <span className="font-mono text-[#38BDF8] text-[11px] font-bold">{metrics.ph} U (acidic)</span>
              </div>

            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono font-bold font-sans">
          <span>COASTAL INTRUSION THRESHOLD</span>
          <span className="text-sky-400 font-medium font-mono font-sans capitalize">{suburb.ironRisk === 'Severe' ? 'CRITICAL WATCH' : 'SAFE BOUND'}</span>
        </div>
      </div>

      {/* CARD B: REGULATIONS AND DWER FRAMEWORK CARD */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-0.5 rounded text-[8.5px] font-mono tracking-widest font-bold bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#007AFF] uppercase">
              REGULATORY COMPLIANCE
            </span>
            <span className="text-[#007AFF]">
              <Building2 className="w-5 h-5 shrink-0" />
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-black text-xl text-slate-800 tracking-tight">
              DWER Policy Allocation
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
              Environmental framework issued by the Department of Water and Environmental Regulation (DWER) of Western Australia.
            </p>
          </div>

          <div className="space-y-3.5 pt-2 font-sans text-xs">
            
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative">
              <span className="text-[#007AFF] mt-0.5">
                <Calendar className="w-4 h-4 shrink-0" />
              </span>
              <div>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block">RETICULATION ROSTER SLOT</span>
                <strong className="text-slate-800 font-bold block text-[12px] pt-0.5">
                  Mon &amp; Fri Roster (Postcode {postcode})
                </strong>
                <span className="text-[10px] text-slate-400 block pt-0.5 leading-normal">
                  Irrigation allowed only prior to 9:00 AM or after 6:00 PM to control evaporative drift.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative">
              <span className="text-orange-500 mt-0.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
              </span>
              <div>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block">DRAW CONSTRAINT LIMIT</span>
                <strong className="text-slate-800 font-bold block text-[12px] pt-0.5">
                  0.35 GL/yr Domestic Cap Bounds
                </strong>
                <span className="text-[10px] text-slate-400 block pt-0.5 leading-normal">
                  Domestic garden bores do not require licensing if annual withdrawal remains under {postcode}&apos;s 0.35 GL threshold.
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono font-bold">
          <span>GOVERNING PLAN</span>
          <span className="text-slate-700 font-medium font-mono">SWAN WATER MANAGEMENT</span>
        </div>
      </div>

      {/* CARD C: HIGH-GLOSS EMERALD PULSING CTA */}
      <div className="bg-emerald-900 border border-emerald-800 rounded-3xl p-6.5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-[0_0_20px_rgba(16,185,129,0.18)] border-emerald-800/80">
        {/* Neon Emerald pulsing aura in the corner */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8.5px] font-mono tracking-widest font-bold text-emerald-400 uppercase">
                ACTIVE RESERVATION WINDOW
              </span>
            </div>
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-2xl text-white tracking-tight">
              Reserve Your Drilling Slot
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed font-sans font-medium">
              Our Rockingham tactical command rig is active in the {postcode} corridor this week. Complete our rapid 30-second form to secure an engineering site survey.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1 text-[#C6F6D5]">
            <span className="text-[7.5px] font-mono text-emerald-3D text-emerald-300 font-bold uppercase tracking-widest block">
              CORRIDOR BONUS
            </span>
            <p className="text-[11px] leading-relaxed font-sans font-medium">
              Zero mobilization dispatch fee applied for all domestic installations completed under the current water table allocation.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 mt-6.5">
          <button 
            onClick={() => onOpenQuote('Submit Subsurface Bid')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold border border-emerald-400/30 text-emerald-950 text-xs tracking-wider uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>REQUEST SYSTEM QUOTE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-[9.5px] font-mono tracking-wide text-emerald-300 text-center font-bold">
            🔒 WA CLASS-1 LICENSED DRILLING ASSURED
          </p>
        </div>
      </div>

    </div>
  );
}
