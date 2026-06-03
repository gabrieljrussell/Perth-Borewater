import React, { useState } from 'react';
import { SuburbData } from '../types';
import { SUBURBS_DATA } from '../data';
import { ALL_SUBURBS_LIST, generateSuburbData } from '../allSuburbs';
import { Search, MapPin, ExternalLink, SlidersHorizontal, AlertTriangle, CheckCircle, ChevronRight, CornerDownRight } from 'lucide-react';

const ALL_EXPANDED_SUBURBS = ALL_SUBURBS_LIST.map(sub => {
  const staticMatch = SUBURBS_DATA.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
  if (staticMatch) return staticMatch;
  
  // Clean slug of form matching sitemap config
  const slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return { ...generateSuburbData(sub.name, sub.postcode), slug };
});

interface DirectoryTableProps {
  onSelectSuburb: (slug: string) => void;
}

export default function DirectoryTable({ onSelectSuburb }: DirectoryTableProps) {
  const [search, setSearch] = useState('');
  const [selectedIronRisk, setSelectedIronRisk] = useState<string>('All');
  const [selectedSoilType, setSelectedSoilType] = useState<string>('All');

  const filteredSuburbs = ALL_EXPANDED_SUBURBS.filter((suburb) => {
    const matchesSearch = suburb.name.toLowerCase().includes(search.toLowerCase()) || 
                          suburb.soilComposition.toLowerCase().includes(search.toLowerCase()) ||
                          suburb.localHeadache.toLowerCase().includes(search.toLowerCase());
    
    const matchesIron = selectedIronRisk === 'All' || suburb.ironRisk === selectedIronRisk;
    
    // Quick search match for soil type category
    let matchesSoil = true;
    if (selectedSoilType !== 'All') {
      if (selectedSoilType === 'Bassendean') {
        matchesSoil = suburb.soilComposition.toLowerCase().includes('bassendean');
      } else if (selectedSoilType === 'Spearwood') {
        matchesSoil = suburb.soilComposition.toLowerCase().includes('spearwood');
      } else if (selectedSoilType === 'Clay') {
        matchesSoil = suburb.soilComposition.toLowerCase().includes('clay') || suburb.soilComposition.toLowerCase().includes('scarp');
      }
    }

    return matchesSearch && matchesIron && matchesSoil;
  });

  return (
    <div className="space-y-6" id="directory-section">
      {/* Search and Filters Hub */}
      <div className="bg-slate-50/70 p-7 sm:p-10 rounded-3xl border border-slate-200/50 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#007AFF]" />
            <input
              type="text"
              placeholder="Search your suburb (e.g., Canning Vale, Rockingham, Byford...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#007AFF] rounded-2xl p-3.5 pl-11 text-xs outline-none transition-all shadow-sm"
              id="dir-search-input"
            />
          </div>

          {/* Quick Clear Filter Option */}
          {(search || selectedIronRisk !== 'All' || selectedSoilType !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedIronRisk('All');
                setSelectedSoilType('All');
              }}
              className="text-xs text-[#007AFF] hover:text-[#007AFF]/80 font-mono font-bold cursor-pointer"
            >
              Reset Filters [x]
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80 text-xs shadow-none">
          <div className="flex items-center gap-2 text-slate-600 font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Filter Hydro-risk:</span>
          </div>

          {/* Iron Risk level filter */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Minimal', 'Moderate', 'High', 'Severe'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedIronRisk(lvl)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedIronRisk === lvl
                    ? 'bg-[#1E293B] text-white scale-105 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-205'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-205 hidden lg:block" />

          {/* Soil landscape type filter */}
          <div className="flex items-center gap-2 text-slate-605 font-mono">
            <span>Soil Baseline:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Bassendean', 'Spearwood', 'Clay'].map((soil) => (
              <button
                key={soil}
                onClick={() => setSelectedSoilType(soil)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedSoilType === soil
                    ? 'bg-[#1E293B] text-white scale-105 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-205'
                }`}
              >
                {soil === 'All' ? 'All Soils' : `${soil} Sands`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
        <span>Displaying {filteredSuburbs.length} of {ALL_EXPANDED_SUBURBS.length} Perth Metros</span>
        <span>Ref: Perth Superficial Aquifer Grid</span>
      </div>

      {/* Primary Desktop Table Grid (Visible on md+) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left border-collapse" id="suburbs-comparison-table">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold font-mono">
              <th className="px-7 py-5">Suburb</th>
              <th className="px-7 py-5">Soil Landscape</th>
              <th className="px-7 py-5 text-red-600">Groundwater Hazard / Headache</th>
              <th className="px-7 py-5">Target Depth</th>
              <th className="px-7 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuburbs.length > 0 ? (
              filteredSuburbs.map((suburb) => {
                const isSevere = suburb.ironRisk === 'Severe' || suburb.ironRisk === 'High';
                return (
                  <tr 
                    key={suburb.slug}
                    onClick={() => onSelectSuburb(suburb.slug)}
                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    {/* Suburb Name & Landmark */}
                    <td className="px-7 py-6">
                      <div className="space-y-1">
                        <div className="font-display font-bold text-base text-slate-900 group-hover:text-[#007AFF] transition-colors">
                          {suburb.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <MapPin className="w-3 h-3 text-[#007AFF]" />
                          <span>{suburb.landmark}</span>
                        </div>
                      </div>
                    </td>

                    {/* Soil Composition */}
                    <td className="px-7 py-6 max-w-xs text-[11px] text-slate-600 leading-relaxed font-sans font-normal">
                      {suburb.soilComposition}
                    </td>

                    {/* Local Headache */}
                    <td className="px-7 py-6 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSevere ? 'text-red-500' : 'text-amber-500'}`} />
                        <span className="text-[11px] text-slate-600 leading-relaxed font-sans font-normal">
                          {suburb.localHeadache}
                        </span>
                      </div>
                    </td>

                    {/* Typical Depth & Risk Tag */}
                    <td className="px-7 py-6 whitespace-nowrap">
                      <div className="space-y-2 text-left">
                        <div className="text-xs font-bold text-slate-900 font-mono">{suburb.typicalDepth}</div>
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          suburb.ironRisk === 'Severe' 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : suburb.ironRisk === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {suburb.ironRisk} Risk
                        </span>
                      </div>
                    </td>

                    {/* Drill-Down Action Button */}
                    <td className="px-7 py-6 text-right whitespace-nowrap">
                      <button className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#007AFF] group-hover:text-[#007AFF]/80">
                        <span>Analyse Site</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">
                  <p className="text-sm font-semibold text-slate-600 mb-1">No local subsurface records found</p>
                  <p className="text-xs text-slate-400">Try adjusting your filters or typing standard Perth search terms.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards Layout for Tablets/Mobiles (Visible on < lg) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredSuburbs.length > 0 ? (
          filteredSuburbs.map((suburb) => {
            const isSevere = suburb.ironRisk === 'Severe' || suburb.ironRisk === 'High';
            return (
              <div
                key={suburb.slug}
                onClick={() => onSelectSuburb(suburb.slug)}
                className="bg-white rounded-3xl p-7 border border-slate-200/50 flex flex-col justify-between cursor-pointer space-y-4 group hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5 text-left">
                      <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#007AFF] transition-colors">
                        {suburb.name}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Base: {suburb.landmark}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      suburb.ironRisk === 'Severe' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : suburb.ironRisk === 'High' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {suburb.ironRisk} Risk
                    </span>
                  </div>

                  <div className="space-y-2.5 text-left pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">Soil Profile</span>
                      <p className="text-slate-600 text-[11px] font-normal mt-0.5 leading-relaxed font-sans">{suburb.soilComposition}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-red-600 uppercase block font-semibold">Active Headache</span>
                      <p className="text-slate-600 text-[11px] font-normal mt-0.5 leading-relaxed font-sans">{suburb.localHeadache}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Drilling Depth</span>
                    <span className="font-bold text-slate-900 font-mono">{suburb.typicalDepth}</span>
                  </div>
                  <span className="text-[#007AFF] font-mono font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 sm:col-span-2 p-10 bg-white rounded-3xl text-center border border-slate-200/50">
            <p className="text-sm font-semibold text-slate-650 font-sans">No local subsurface records found</p>
            <p className="text-xs text-slate-400 font-sans">Try choosing a different soil filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
