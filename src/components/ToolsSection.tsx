import React, { useState } from 'react';
import { Gauge, Droplets, ShieldAlert, Sparkles, ClipboardList, HelpCircle, ShieldCheck } from 'lucide-react';
import { SUBURBS_DATA } from '../data';

export default function ToolsSection() {
  const [selectedCalcSuburb, setSelectedCalcSuburb] = useState('Rockingham');
  const [irrigationZones, setIrrigationZones] = useState(4);
  const [weeklyRuntimeHours, setWeeklyRuntimeHours] = useState(6);

  const selectedObj = SUBURBS_DATA.find((s) => s.name === selectedCalcSuburb) || SUBURBS_DATA[0];

  // Calculated hydro statistics based on input
  const estimatedWaterConsumptionKL = weeklyRuntimeHours * irrigationZones * 1.8; // 1.8 KL/hr average spray rate
  const ironPrecipitationLitersYearly = selectedObj.ironRisk === 'Severe' 
    ? (estimatedWaterConsumptionKL * 52 * 0.012).toFixed(2)
    : selectedObj.ironRisk === 'High'
    ? (estimatedWaterConsumptionKL * 52 * 0.007).toFixed(2)
    : (estimatedWaterConsumptionKL * 52 * 0.002).toFixed(2);

  return (
    <div className="bento-card p-7 sm:p-[38px] space-y-8 text-left" id="hydro-tools-panel">
      
      {/* Grid Headers */}
      <div className="border-b border-slate-200/80 pb-5">
        <span className="text-[#007AFF] font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
          Accredited Trade Equipment Desk
        </span>
        <h3 className="text-2xl font-display font-extrabold text-slate-900 mt-1">
          Interactive Hydrogeological Tools
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Test water pressure parameters, predicted iron oxide decay, and local sand filtration demands.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Iron Staining & Filter Estimator Calculator */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl text-[#007AFF]">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-base">
              Reticulation Iron Deposit Predictor
            </h4>
          </div>
          
          <p className="text-xs text-slate-605">
            Select your suburb and runtime config to analyze how much iron oxide solids pass through your sprinkler emitters annually.
          </p>

          <div className="space-y-4 pt-2 bg-[#FBFBFB] p-5.5 rounded-xl border border-slate-200/80">
            {/* Suburb Selector inside Tool */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Target Aquifer Area</label>
              <select
                value={selectedCalcSuburb}
                onChange={(e) => setSelectedCalcSuburb(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#007AFF] rounded-xl p-2.5 text-xs text-slate-800 outline-none font-mono"
              >
                {SUBURBS_DATA.slice().sort((a,b) => a.name.localeCompare(b.name)).map((s) => (
                  <option key={s.slug} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Irrigation Zones */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Stations / Soleneoids</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={irrigationZones}
                  onChange={(e) => setIrrigationZones(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 text-center font-mono focus:border-[#007AFF] outline-none"
                />
              </div>

              {/* Weekly Runtime */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Weekly Sprinkling Hours</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={weeklyRuntimeHours}
                  onChange={(e) => setWeeklyRuntimeHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 text-center font-mono focus:border-[#007AFF] outline-none"
                />
              </div>
            </div>

            {/* Calculated results presentation */}
            <div className="border-t border-slate-200/80 pt-3.5 space-y-2 text-xs font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Aquifer Water Drawn Weekly:</span>
                <span className="text-slate-900 font-bold">{estimatedWaterConsumptionKL.toFixed(1)} kL</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Iron Exposure Profile:</span>
                <span className="text-[#007AFF] font-bold">{selectedObj.ironRisk} Risk</span>
              </div>
              <div className="border-t border-slate-200/60 my-1 pt-1.5 flex justify-between text-slate-900 font-semibold border-dotted">
                <span>Predicted Iron Sludge Solids:</span>
                <span className="text-[#007AFF] text-sm font-bold">{ironPrecipitationLitersYearly} kg / year</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-xl text-[10px] text-slate-700 flex items-start gap-2.5">
            <ShieldCheck className="w-4.5 h-4.5 text-[#007AFF] shrink-0" />
            <span>
              {selectedObj.ironRisk === 'Severe' || selectedObj.ironRisk === 'High'
                ? `Critically High Staining Index for ${selectedObj.name}. It is strictly advised to add automatic chemical dosing or clean static inline filters every 3 months.`
                : `Low to moderate staining forecast for ${selectedObj.name}. Standard PVC slotted screens provide outstanding protection without complex filters.`
              }
            </span>
          </div>
        </div>

        {/* Module 2: Soil Strata Diagnostic Guide */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#007AFF]/10 border border-[#007AFF]/25 rounded-xl text-[#007AFF]">
              <Droplets className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-base">
              Perth Metropolitan Aquifers Map Overview
            </h4>
          </div>

          <p className="text-xs text-slate-145">
            Perth sits on layered sands that act as sponges for regional rain absorption. Understanding which aquifer system feeds your property tells you the ideal casing thickness.
          </p>

          <div className="space-y-3.5 font-sans">
            {[
              { 
                name: "Perth Superficial Aquifer", 
                extent: "0m - 50m Depth", 
                desc: "Accessed by 98% of residential garden water bores. Tap water is relatively warm and carries minerals drawn off the Spearwood/Bassendean strata." 
              },
              { 
                name: "Gnangara Mound (Northern)", 
                extent: "Vast recharge network", 
                desc: "Main hydrographic supply for suburbs north of the Swan River. Subject to heavy iron and coffee rock deposits in wetlands." 
              },
              { 
                name: "Jandakot Mound (Southern)", 
                extent: "Underpins Melville to Kwinana", 
                desc: "High iron staining profiles across Piara Waters, Wellard, and Bertram. Rich water table but requires specialized screening diagnostics." 
              }
            ].map((aq, index) => (
              <div key={index} className="p-3 bg-[#FBFBFB] border border-slate-205 hover:border-[#007AFF]/30 rounded-xl transition-all">
                <div className="flex justify-between items-start text-xs font-mono">
                  <span className="font-bold text-slate-900">{aq.name}</span>
                  <span className="text-[#007AFF] text-[10px] font-bold">{aq.extent}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal font-sans">
                  {aq.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Subsurface Drilling FAQ Box */}
      <div className="pt-5 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            How long does a bore repair take?
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Most electrical controller faults, solenoid extractions, and motor replacements are completed same-day in under 3-4 hours directly on site.
          </p>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            What is coffee rock?
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            A concrete-like mixture of sand organic matter cemented by iron oxides, extremely typical around Piara Waters and Harrisdale, requiring specialized heavy hammer drills.
          </p>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            Will iron staining wash off?
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Standard high-pressure washing will not remove rust stains. Mild oxalic acid solutions are required to break the heavy iron iron-oxide bonds safely on limestone.
          </p>
        </div>
      </div>

    </div>
  );
}
