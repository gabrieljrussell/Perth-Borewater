import React from 'react';
import { Layers, Droplet, Check, ShieldAlert, Compass } from 'lucide-react';

interface SoilProfileDiagramProps {
  soilType: 'Limestone' | 'Clay' | 'Sand';
  waterDepth: number; // e.g., 5 to 50 representing depth in meters
  surfaceHeight?: number; // default 100
}

export default function SoilProfileDiagram({ 
  soilType, 
  waterDepth, 
  surfaceHeight = 100 
}: SoilProfileDiagramProps) {
  
  // Calculate vertical dimensions.
  // We want the bottom of our diagram to scale dynamically based on the water depth so it's always visible.
  const maxDepth = Math.max(50, Math.ceil((waterDepth * 1.5) / 10) * 10);
  
  // Height of SVG plotting area
  const svgHeight = 320;
  const plotTop = 30;
  const plotBottom = 290;
  const plotHeight = plotBottom - plotTop;

  // Helper helper to convert meter depth to Y coordinate
  const getY = (depthValue: number) => {
    const ratio = Math.min(1, Math.max(0, depthValue / maxDepth));
    return plotTop + ratio * plotHeight;
  };

  const waterY = getY(waterDepth);

  // Generate tick marks on the depth meter
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const depthVal = Math.round((i * maxDepth) / tickCount);
    return {
      depth: depthVal,
      y: getY(depthVal),
    };
  });

  // Calculate descriptive data based on dominant soil
  const soilInfo = {
    Sand: {
      title: 'Spearwood & Bassendean Sands',
      desc: 'Highly porous particle matrices allowing rapid infiltration but demanding specialized slotted screening to prevent high silting.',
      porosity: 'High (35-45%)',
      filtration: 'Excellent naturally',
      drillRate: 'Fast (10m/hr)',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    Clay: {
      title: 'Guildford Clay Formations',
      desc: 'Dense, rich colloidal sheets that lock moisture but can buckle casing under load. Requires heavy mud-rotary drilling fluids.',
      porosity: 'Low (Active barrier)',
      filtration: 'Poor (Fine silt risk)',
      drillRate: 'Slow / Staged',
      colorClass: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    Limestone: {
      title: 'Tamala Crystalline Limestone',
      desc: 'Fractured calcium carbonate channels. Highly productive water veins but prone to bit bounce and massive cavities during drilling.',
      porosity: 'High Secondary (Channeled)',
      filtration: 'Moderate (Fissure flow)',
      drillRate: 'Variable (Hard strike)',
      colorClass: 'text-slate-700 bg-slate-50 border-slate-200'
    },
  }[soilType] || {
    title: 'Superficial Strata',
    desc: 'Mixed geological aggregates of coastal aquifers.',
    porosity: 'Variable',
    filtration: 'Standard',
    drillRate: 'Standard',
    colorClass: 'text-slate-600 bg-slate-50 border-slate-200'
  };

  return (
    <div 
      className="bento-card p-5 hover:scale-[1.01] transition-transform duration-300 h-full flex flex-col justify-between text-left"
      id={`soil-profile-diagram-${soilType.toLowerCase()}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                <Layers className="w-4 h-4 text-[#007AFF]" />
              </div>
              <h4 className="font-display font-black text-slate-900 text-sm tracking-tight">Active Bore Geological Column</h4>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">
              Subsurface Profile Visualizer
            </p>
          </div>

          <span className={`font-mono text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${soilInfo.colorClass}`}>
            ● {soilType} Layer
          </span>
        </div>

        {/* Dynamic Graphic Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
          
          {/* SVG Visual Column (8 cols on sm+) */}
          <div className="col-span-1 sm:col-span-8 relative">
            <svg 
              viewBox={`0 0 200 ${svgHeight}`} 
              className="w-full h-auto overflow-visible select-none rounded-lg"
              style={{ maxHeight: '280px' }}
            >
              <defs>
                {/* Sand granulate pattern using fine vector stippling dots */}
                <pattern id="sand-granular" width="16" height="16" patternUnits="userSpaceOnUse">
                  <rect width="16" height="16" fill="#FEF3C7" />
                  <circle cx="2" cy="3" r="1" fill="#F59E0B" opacity="0.4" />
                  <circle cx="8" cy="11" r="1" fill="#D97706" opacity="0.5" />
                  <circle cx="14" cy="4" r="0.8" fill="#B45309" opacity="0.4" />
                  <circle cx="5" cy="8" r="1.2" fill="#D97706" opacity="0.3" />
                  <circle cx="11" cy="6" r="0.7" fill="#F59E0B" opacity="0.4" />
                  <circle cx="13" cy="13" r="1.1" fill="#B45309" opacity="0.35" />
                  <circle cx="3" cy="14" r="0.9" fill="#D97706" opacity="0.4" />
                </pattern>

                {/* Clay dense orange-brown vertical gradient */}
                <linearGradient id="clay-dense" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="35%" stopColor="#C2410C" />
                  <stop offset="70%" stopColor="#9A3412" />
                  <stop offset="100%" stopColor="#7C2D12" />
                </linearGradient>

                {/* Limestone crystalline pattern */}
                <pattern id="limestone-matrix" width="24" height="24" patternUnits="userSpaceOnUse">
                  <rect width="24" height="24" fill="#F1F5F9" />
                  {/* Crystalline interlocking lines */}
                  <path d="M0 12 L12 0 M12 24 L24 12 M12 0 L24 12 M0 12 L12 24" stroke="#94A3B8" strokeWidth="0.5" opacity="0.3" fill="none" />
                  <path d="M0 0 L24 24 M24 0 L0 24" stroke="#D1D5DB" strokeWidth="0.5" opacity="0.2" fill="none" />
                  {/* Rocky crystalline shard polygon inserts */}
                  <polygon points="4,4 10,4 8,9 5,8" fill="#CBD5E1" opacity="0.5" />
                  <polygon points="14,14 19,16 17,20 12,18" fill="#94A3B8" opacity="0.3" />
                  <polygon points="18,3 22,6 20,10 16,5" fill="#E2E8F0" opacity="0.4" />
                </pattern>

                {/* Water Saturation overlay gradient */}
                <linearGradient id="saturation-overlay" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0056B3" stopOpacity="0.4" />
                </linearGradient>

                {/* Topsoil organic dark gradient */}
                <linearGradient id="topsoil-organic" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#451A03" />
                  <stop offset="100%" stopColor="#1C1917" />
                </linearGradient>
              </defs>

              {/* DRAW GEOLOGICAL DIRT COLUMN */}
              {/* Top Organic Soil cap (fixed first 4 meters relative) */}
              <rect 
                x="45" 
                y={plotTop} 
                width="155" 
                height={Math.max(12, (4 / maxDepth) * plotHeight)} 
                fill="url(#topsoil-organic)" 
                rx="2"
              />

              {/* Main Stratum Fill */}
              <rect 
                x="45" 
                y={plotTop + Math.max(12, (4 / maxDepth) * plotHeight)} 
                width="155" 
                height={plotBottom - (plotTop + Math.max(12, (4 / maxDepth) * plotHeight))} 
                fill={
                  soilType === 'Sand' ? 'url(#sand-granular)' : 
                  soilType === 'Clay' ? 'url(#clay-dense)' : 
                  'url(#limestone-matrix)'
                }
                rx="4"
              />

              {/* Overlapping crystalline polygonal cracks if LIMESTONE to accentuate jagged crystalline structure */}
              {soilType === 'Limestone' && (
                <g stroke="#64748B" strokeWidth="1" strokeDasharray="2,3" opacity="0.35" fill="none">
                  <path d={`M 50,${plotTop + 50} H 180`} />
                  <path d={`M 45,${plotTop + 100} L 120,${plotTop + 130} L 200,${plotTop + 110}`} />
                  <path d={`M 60,${plotTop + 180} L 150,${plotTop + 160} L 195,${plotTop + 200}`} />
                  {/* Jagged rocky lines */}
                  <polyline points={`60,${plotTop + 40} 80,${plotTop + 65} 90,${plotTop + 45} 120,${plotTop + 85}`} strokeWidth="1.5" stroke="#475569" />
                  <polyline points={`110,${plotTop + 140} 140,${plotTop + 165} 150,${plotTop + 135} 185,${plotTop + 180}`} strokeWidth="1.5" stroke="#475569" />
                </g>
              )}

              {/* Overlapping clay seam faults if CLAY */}
              {soilType === 'Clay' && (
                <g stroke="#7C2D12" strokeWidth="2.5" opacity="0.25" fill="none">
                  {/* Wavy sedimentary dynamic bands */}
                  <path d={`M 45,${plotTop + 60} Q 90,${plotTop + 80} 150,${plotTop + 50} T 200,${plotTop + 90}`} />
                  <path d={`M 45,${plotTop + 130} Q 100,${plotTop + 110} 140,${plotTop + 160} T 200,${plotTop + 120}`} />
                  <path d={`M 45,${plotTop + 210} Q 80,${plotTop + 230} 160,${plotTop + 200} T 200,${plotTop + 210}`} />
                </g>
              )}

              {/* Overlapping sand streaks if SAND */}
              {soilType === 'Sand' && (
                <g stroke="#D97706" strokeWidth="1.5" opacity="0.25" strokeDasharray="3,6" fill="none">
                  {/* Gentle sweeping sandy layers */}
                  <path d={`M 45,${plotTop + 40} C 100,${plotTop + 70} 150,${plotTop + 20} 200,${plotTop + 50}`} />
                  <path d={`M 45,${plotTop + 110} C 80,${plotTop + 90} 160,${plotTop + 130} 200,${plotTop + 100}`} />
                  <path d={`M 45,${plotTop + 180} C 120,${plotTop + 160} 140,${plotTop + 220} 200,${plotTop + 175}`} />
                </g>
              )}

              {/* WATER SATURATION BLUE OVERLAY (Saturated Aquifer below deep waterDepth target) */}
              <rect 
                x="45" 
                y={waterY} 
                width="155" 
                height={plotBottom - waterY} 
                fill="url(#saturation-overlay)" 
                className="transition-all duration-750"
              />

              {/* SATURATED STREAM BUBBLES OUTLINE (for high flow visual cues) */}
              <g fill="#38BDF8" opacity="0.55" className="animate-pulse">
                <circle cx="80" cy={waterY + 25} r="2" />
                <circle cx="150" cy={waterY + 30} r="1.5" />
                <circle cx="110" cy={waterY + 50} r="2.5" />
                <circle cx="170" cy={waterY + 15} r="1" />
                <circle cx="130" cy={waterY + 70} r="2" />
                <circle cx="95" cy={waterY + 85} r="1.8" />
              </g>

              {/* MEASURING TAPE (Left ruler guide) */}
              {/* Linear Axis */}
              <line x1="32" y1={plotTop} x2="32" y2={plotBottom} stroke="#CBD5E1" strokeWidth="1.5" />
              
              {/* Tick Marks & Text */}
              {ticks.map((tick, i) => (
                <g key={i} className="font-mono text-[8px] font-semibold text-slate-400">
                  <line x1="26" y1={tick.y} x2="32" y2={tick.y} stroke="#94A3B8" strokeWidth="1.2" />
                  <text x="5" y={tick.y + 3.2} fill="#64748B" fontWeight="bold">
                    {tick.depth}m
                  </text>
                </g>
              ))}

              {/* WATER TABLE LEVEL POINTER (High visual contrast) */}
              <g className="transition-all duration-750">
                {/* Horizontal reference dashed blue line across geological column */}
                <line 
                  x1="39" 
                  y1={waterY} 
                  x2="200" 
                  y2={waterY} 
                  stroke="#007AFF" 
                  strokeWidth="2" 
                  strokeDasharray="4,3" 
                />

                {/* Blue Arrow pointing exactly to water table */}
                <polygon 
                  points={`22,${waterY - 4.5} 34,${waterY} 22,${waterY + 4.5}`} 
                  fill="#007AFF" 
                />
                
                {/* Overlay Text representing Water Level */}
                <rect 
                  x="50" 
                  y={waterY - 10} 
                  width="142" 
                  height="16" 
                  rx="4" 
                  fill="#0F172A" 
                  opacity="0.82" 
                  className="backdrop-blur-xs"
                />
                <text 
                  x="121" 
                  y={waterY + 1} 
                  fill="#FFFFFF" 
                  fontSize="7.5" 
                  fontFamily="monospace" 
                  fontWeight="black" 
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  💦 WATER TABLE: {waterDepth} METERS
                </text>
              </g>

              {/* Ground level symbol at y = plotTop */}
              <line x1="40" y1={plotTop} x2="200" y2={plotTop} stroke="#1C1917" strokeWidth="1.5" opacity="0.6"/>
              <text x="50" y={plotTop - 6} fill="#7C2D12" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                ▼ PERTH SURFACE DIRECTORY GROUND LEVEL
              </text>
            </svg>
          </div>

          {/* Sizing & Legend Data Card (4 cols on sm+) */}
          <div className="col-span-1 sm:col-span-4 flex flex-col justify-between space-y-3.5 pl-1 pt-3 sm:pt-0 border-t border-slate-100 sm:border-t-0 sm:border-l sm:border-slate-100/50 sm:pl-4">
            <div className="space-y-3">
              <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                METERS DOWN
              </span>
              <div className="bg-slate-100 p-2 rounded-xl text-center border border-slate-200/50">
                <span className="block text-xl font-display font-black text-slate-900 leading-none">
                  {waterDepth}m
                </span>
                <span className="text-[7px] text-slate-400 font-mono uppercase font-black tracking-wide block mt-1">
                  Aquifer Strike
                </span>
              </div>

              {/* Dynamic Soil stats */}
              <div className="space-y-2 text-left">
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">POROSITY</span>
                  <span className="text-[10px] font-bold text-slate-700">{soilInfo.porosity}</span>
                </div>
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">DRILL VELOCITY</span>
                  <span className="text-[10px] font-bold text-slate-700">{soilInfo.drillRate}</span>
                </div>
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">FILTRATION</span>
                  <span className="text-[10px] font-bold text-emerald-600">{soilInfo.filtration}</span>
                </div>
              </div>
            </div>

            <div className="p-2 border border-blue-100 bg-[#007AFF]/[0.02] rounded-xl flex items-center gap-1.5 shrink-0">
              <Droplet className="w-3.5 h-3.5 text-[#007AFF] shrink-0 animate-pulse" />
              <div className="leading-tight">
                <span className="text-[7px] font-mono font-semibold text-slate-405 block uppercase">Dynamic flow</span>
                <span className="text-[8px] font-bold text-slate-655 block">Waterwise Cap</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Context text paragraph */}
        <div className="pt-1.5">
          <h5 className="text-[11px] font-semibold text-slate-800 font-display">{soilInfo.title}</h5>
          <p className="text-[10.5px] text-slate-500 leading-normal font-sans mt-0.5">
            {soilInfo.desc}
          </p>
        </div>
      </div>

      {/* Dynamic drill checklist status list */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-150 flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-mono text-slate-500 font-bold justify-between">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" /> RIG CALIBRATED
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" /> AQUIFER DETECTED
        </span>
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-[#007AFF]" /> TAMALA GEOLOGY
        </span>
      </div>
    </div>
  );
}
