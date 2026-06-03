import React, { useState } from 'react';
import { SuburbData, Review } from '../types';
import QuoteForm from './QuoteForm';
import { 
  MapPin, 
  ExternalLink, 
  AlertTriangle, 
  ShieldAlert, 
  Droplets, 
  Wrench, 
  Video, 
  CornerDownRight,
  Sparkles,
  Award,
  Image as ImageIcon,
  Play,
  Phone,
  ShieldCheck,
  Calendar,
  Layers,
  Droplet
} from 'lucide-react';
import { GENERAL_REVIEWS } from '../data';

interface SuburbPageProps {
  suburb: SuburbData;
  onGoBack: () => void;
  onSelectSuburbByName: (name: string) => void;
}

export default function SuburbPage({ suburb, onGoBack, onSelectSuburbByName }: SuburbPageProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'compliance' | 'reviews'>('diagnostics');

  // Specific reviews matching or fallbacks with localized tags
  const filteredReviews: Review[] = [
    {
      author: `George K. - ${suburb.name} Resident`,
      rating: 5,
      text: `Superb response when our retic pump failed near ${suburb.landmark}. They knew precisely what depth the soil interface was at and resolved our pressure drop.`,
      date: "May 2026"
    },
    {
      author: `Samantha T. - ${suburb.name}`,
      rating: 5,
      text: `Sorted our bore repair quickly. Highly recommend their professional diagnostics team who explained the iron staining threats thoroughly.`,
      date: "April 2026"
    },
    ...GENERAL_REVIEWS.filter(r => !r.author.toLowerCase().includes(suburb.name.toLowerCase())).slice(0, 2)
  ];

  // Map postcodes to reflect authentic Western Australian postcodes
  const getPostcode = (slug: string) => {
    switch (slug) {
      case 'rockingham': return '6168';
      case 'baldivis': return '6171';
      case 'piara-waters': return '6112';
      case 'canning-vale': return '6155';
      case 'wellard': return '6170';
      case 'bertram': return '6167';
      case 'atwell': return '6164';
      case 'aubin-grove': return '6164';
      default: return '6168';
    }
  };

  const postcode = getPostcode(suburb.slug);

  const scrollQuoteFormIntoView = () => {
    const el = document.getElementById('quote-form-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up text-[#1E293B]" id={`suburb-page-${suburb.slug}`}>
      
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onGoBack} 
          className="flex items-center gap-2 text-xs font-mono font-bold text-[#007AFF] hover:text-[#007AFF]/95 bg-[#007AFF]/10 hover:bg-[#007AFF]/15 border border-[#007AFF]/20 px-4 py-2 rounded-xl transition-all cursor-pointer font-sans"
          id="btn-back-to-dir"
        >
          <span>←</span> Back to Perth Directory
        </button>
        <span className="text-slate-350 font-mono text-xs">/</span>
        <span className="text-slate-500 font-mono text-[11px] font-bold uppercase tracking-wider">{suburb.name} Subsurface Blueprint</span>
      </div>

      {/* 2. Standardized Floating Hero Visual Background with Embedded Video Block */}
      <header className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-8 md:p-12 rounded-3xl overflow-hidden shadow-2xl">
        {/* Blurry drone ground background image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700" 
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAS9LmvO7mawncwLdjxtZvYiFRtsNcXYv_94qu6ByOeZpKC_DpMT1BJh3SXGLDVzfp5kjvH8bFJ8fJq13Qla3cr3Juvr5x7i4kUiFrptGWMgqmmnp5pRo0yizIO0ewmhP1XbQ3vWAEMy79_7G-w0Vc-wCpkIa41CKErQiDCDpPLaQfzT6mBNEUxQaR0V3QVZpmvH6qS-jNTOj4neyC5lLBhzen03c3hh2BkaFw5KDY7pjGJxBOayRdNd4npeabUG0S9eGZ2YYMrmr2W')`,
            filter: 'blur(20px) brightness(0.6)',
            transform: 'scale(1.08)',
            zIndex: 0
          }}
        />
        
        {/* Central Floating Bento-Style Card (frosted glass) */}
        <div className="glass-panel border border-white/25 rounded-[2rem] p-6 sm:p-10 md:p-12 max-w-4xl w-full mx-auto relative z-10 text-center cloud-shadow flex flex-col justify-between">
          
          {/* Top Video / Media aspect-video container */}
          <div className="w-full aspect-[21/9] sm:aspect-[16/7] rounded-2xl overflow-hidden relative mb-8 border border-white/30 bg-slate-900/50 shadow-inner">
            {isPlayingVideo ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-60"
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-mechanical-drilling-machine-working-on-a-site-41584-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-900/85 flex flex-col items-center justify-center p-6 text-center text-white/50">
                <p className="text-xs font-mono font-medium">Standby: Cinematic satellite feed paused.</p>
              </div>
            )}

            {/* Custom active telemetry overlays inside video screen */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none text-white font-mono select-none z-10">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                  <span>Stream Active</span>
                </div>
                <div className="bg-slate-900/55 border border-white/10 backdrop-blur-md rounded-lg px-2 py-0.5 text-[8px] tracking-wide pointer-events-auto">
                  <button 
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="flex items-center gap-1 text-white hover:text-[#007AFF] transition-colors cursor-pointer font-bold"
                  >
                    <Video className="w-2.5 h-2.5" />
                    <span>{isPlayingVideo ? 'PAUSE FEED' : 'PLAY FEED'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex justify-between items-center text-[8px] tracking-wide">
                <span>FEED: {suburb.name.toUpperCase()}_TAP_SENSE</span>
                <span className="hidden xs:inline">METHOD: TRIPLE-WALL ROTARY Air-Drill</span>
                <span>DEPTH: {suburb.typicalDepth}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-center">
            {/* Suburb location indicator */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#007AFF] font-mono text-[10px] font-bold rounded-full uppercase tracking-widest mx-auto">
              <MapPin className="w-3.5 h-3.5" />
              <span>{suburb.name} • Postcode {postcode} Roster</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-display font-black text-slate-900 tracking-tight leading-tight">
              Perth's Precision Bore Drilling for {suburb.name}.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Access the Superficial Aquifer at <span className="text-[#007AFF] font-bold italic">{suburb.typicalDepth}</span> depth. Sustainable subsurface irrigation systems engineered precisely around the local <strong className="text-slate-900 font-semibold">{suburb.soilComposition.split(' (')[0] || suburb.soilComposition}</strong> layers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={scrollQuoteFormIntoView}
                className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FFD700]/95 text-slate-900 px-8 py-4 rounded-3xl font-bold uppercase text-xs tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-sans shimmer-btn"
              >
                Secure My Drill Date →
              </button>
              
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 bg-white/50 px-4 py-2 border border-slate-200/65 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>On-Call Dispatch Team Active Today</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 3. Main Content Bento Area & Technical specs */}
      <main className="py-8 space-y-12 max-w-7xl mx-auto relative z-20">
        
        {/* Bento Grid Header */}
        <div className="text-left space-y-1.5">
          <span className="text-xs font-mono font-bold text-[#007AFF] uppercase tracking-wider block">CORE GEOLOGICAL METRICS</span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">Technical Drilling Blueprint</h2>
        </div>

        {/* Dynamic Bento Box Matrix - 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          
          {/* Card 1: Soil Composition (2x2 Column block) */}
          <div className="md:col-span-2 md:row-span-2 bento-card p-7 sm:p-9 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 shadow-xs">
                <Layers className="w-6 h-6 text-[#007AFF]" />
              </div>
              <span className="font-mono text-[9px] font-bold text-[#007AFF] px-3 py-1 bg-[#007AFF]/10 rounded-full uppercase tracking-wider border border-[#007AFF]/15">
                Geology Report
              </span>
            </div>
            
            <div className="mt-8">
              <h3 className="font-mono text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Soil Composition</h3>
              <p className="font-sans font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                {suburb.soilComposition.split(' (')[0] || suburb.soilComposition}
              </p>
              {suburb.soilComposition.includes('(') && (
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  ({suburb.soilComposition.split('(')[1].replace(')', '')})
                </p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-20F/10">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Localized data matrix mapping for extraction parameters in the {suburb.name} ground corridor.
              </p>
            </div>
          </div>

          {/* Card 2: The Explorer (1x1 column block) */}
          <div className="md:col-span-1 bento-card p-6 sm:p-8 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 text-left">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">The Explorer</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Standard water bore drilling & residential casing installation.
              </p>
            </div>
            <button 
              onClick={scrollQuoteFormIntoView}
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Request Quote
            </button>
          </div>

          {/* Card 3: Drill Depth (1x1 column block) */}
          <div className="md:col-span-1 bento-card p-6 sm:p-8 flex flex-col items-start justify-between hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/15 flex items-center justify-center border border-[#FFD700]/25">
              <Droplet className="w-5 h-5 text-amber-600 fill-amber-500/20" />
            </div>
            <div className="mt-6">
              <h3 className="font-mono text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Typical Drill Depth</h3>
              <p className="text-xl sm:text-2xl font-display font-black text-slate-900">{suburb.typicalDepth}</p>
            </div>
          </div>

          {/* Card 4: The Restorer (2x1 column block) - RECOMMENDED banner */}
          <div className="md:col-span-2 bento-accent-card p-6 sm:p-8 flex items-center justify-between relative overflow-hidden bg-white hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="absolute top-0 right-0 bg-[#007AFF] text-white font-mono font-bold text-[9px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
              RECOMMENDED
            </div>
            <div className="max-w-[65%]">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-1.5">
                <span>The Restorer</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submersible iron hazard capture & advanced water filtration systems suited for {suburb.ironRisk} risk pockets.
              </p>
            </div>
            <button 
              onClick={scrollQuoteFormIntoView}
              className="bg-[#007AFF] hover:bg-[#007AFF]/95 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Get Pricing</span>
            </button>
          </div>

          {/* Card 5: Geological Evidence Photographic Sample (2x1 column block) */}
          <div className="md:col-span-2 bento-card relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 min-h-[170px] text-left">
            <img 
              alt={`Ground sample for ${suburb.name}`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-DHHe-WJTQQyXAhmDCvZ3pj2owtlLrn6z8LZbSV3KdCgClcKXE0BgdV1EhIrz7isw9dK0LmhjQMobpttsB_38b6uOnBtxYrJVJBGwZORnzWy5G4CHTW-05sM8mfnx7ifyNJ08BncfKxqxkwKL5vUAKsPQpYTiIC_jkDaHrQgJnwM3jyznCnIssiuuw3UWpV35yhBP4t8sF3Y5m-vasGbP9KF4x4R7bAbXrdWRLpqHdFjNqvo6NvoDBaMvZTBdBtEMir-Gu59V2RNl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <h3 className="font-display font-bold text-base tracking-tight flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FFD700]" />
                <span>Geological Core Evidence Specimen</span>
              </h3>
              <p className="text-[10px] text-slate-300 mt-0.5">High-definition spectroscopy image of {suburb.name} core sandstone matrix.</p>
            </div>
          </div>

          {/* Card 6: Watering Days (2x1 Column block) */}
          <div className="md:col-span-2 bento-card p-6 flex items-center gap-5 hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 shadow-2xs shrink-0">
              <Calendar className="w-6 h-6 text-[#007AFF]" />
            </div>
            <div>
              <h3 className="font-mono text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Watering Days</h3>
              <p className="text-base sm:text-lg font-display font-black text-slate-900 leading-tight">
                Monday &amp; Friday Roster
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Based on Water Corporation 2-day-per-week scheme for postcode {postcode}.</p>
            </div>
          </div>

        </div>

        {/* Secondary Detailed Columns: Form, Technical Specifications, Warning alerts, Accreditations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* Left Column: Alerts, Tabs, Lead intake Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Warning Hazard Board */}
            <div className="bg-red-500/[0.04] border border-red-500/20 rounded-[2rem] p-6 sm:p-8 space-y-4 text-left relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-15px] text-red-500/5 font-extrabold text-[9rem] pointer-events-none select-none font-sans">
                !
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-655 shrink-0 mt-1">
                  <ShieldAlert className="w-6 h-6 text-red-650" />
                </div>
                <div>
                  <span className="text-red-650 font-mono text-[9px] font-bold uppercase tracking-wider block">
                    AQUIFER WATER HAZARD ALERT
                  </span>
                  <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 mt-0.5">
                    Geological Ground Concerns in {suburb.name} Corridor
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Subsurface mapping indicates standard properties in {suburb.name} lie in proximity to heavy <strong className="text-slate-900 font-bold">{suburb.soilComposition.split(' (')[0]}</strong> formations.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-orange-500/[0.04] border-l-4 border-l-red-550 rounded-r-xl space-y-1 font-sans">
                <span className="text-red-700 font-bold font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Active Subsurface Hazard:
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {suburb.localHeadache}
                </p>
              </div>

              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans pt-2 border-t border-slate-500/10">
                Failing to install high-performance filter screens or adjust active pressure targets to these chemical hazards can spark corrosion of copper pipes and localized liming blockages.
              </p>
            </div>

            {/* Diagnostics Interactive Tabs Block */}
            <div className="bento-card overflow-hidden text-left flex flex-col justify-between" id="diagnostics-tabs-card">
              <div>
                {/* Tab selectors */}
                <div className="flex border-b border-slate-200 bg-slate-50 font-mono">
                  {[
                    { id: 'diagnostics', label: 'Technical Specs' },
                    { id: 'compliance', label: 'Council Rules' },
                    { id: 'reviews', label: 'Suburb Feedback' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 text-[10px] sm:text-xs uppercase font-mono tracking-wider font-bold text-center border-b-2 transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-white text-[#007AFF] border-b-[#007AFF]'
                          : 'bg-transparent text-slate-500 border-b-transparent hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content screens */}
                <div className="p-6 sm:p-9 font-sans min-h-[220px]">
                  {activeTab === 'diagnostics' && (
                    <div className="space-y-4 animate-slide-up">
                      <h4 className="text-slate-900 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Droplets className="w-4 h-4 text-[#007AFF]" />
                        Hydrogeological Depth Analysis
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Sourced and collated from the Perth Groundwater Map (DWER) local aquifer profiles:
                      </p>

                      <div className="space-y-3 pt-1">
                        <div className="flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Localized Ground Type:</span>
                            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{suburb.soilComposition}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Chemical Staining Assessment:</span>
                            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{suburb.waterQualityNotes}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Aquifer Screen Requirements:</span>
                            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">Precision slotted commercial-grade PVC casing screens to counteract deep silty sands.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'compliance' && (
                    <div className="space-y-4 animate-slide-up">
                      <h4 className="text-slate-900 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Wrench className="w-4 h-4 text-[#007AFF]" />
                        Seasonal Water Usage Compliance
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        Water bore licensing and localized sprinkler roster schedules apply under regulatory water allocation limits. For properties in the <strong className="text-slate-900 font-semibold">{suburb.name}</strong> sector, please review municipal parameters directly via the official council portal.
                      </p>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-mono block font-bold">Regulatory Authority Portal</span>
                          <span className="text-xs text-slate-800 font-bold font-mono">
                            {suburb.regulatoryBody}
                          </span>
                        </div>

                        <a 
                          href={suburb.councilLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#007AFF] hover:bg-[#007AFF]/95 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer shrink-0"
                          id="council-external-link"
                        >
                          <span>Review Council Rules</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4 text-left font-sans animate-slide-up">
                      <h4 className="text-slate-900 font-display font-bold text-xs uppercase tracking-wider font-mono">
                        Local Client Satisfaction
                      </h4>
                      <div className="space-y-3 font-sans">
                        {filteredReviews.slice(0, 2).map((rev, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span className="font-bold text-[#007AFF]">{rev.author}</span>
                              <span className="font-mono text-[9px]">{rev.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed italic mt-1">"{rev.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Embedded Lead Intake Form */}
            <div className="space-y-4">
              <div className="text-left space-y-1">
                <span className="text-xs font-mono font-bold text-[#007AFF] uppercase tracking-wider block">DISPATCH COORDINATION</span>
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight" id="emergency-repair-booking-form">Book Drill Date or Service</h3>
              </div>
              <QuoteForm initialSuburb={suburb.name} />
            </div>

          </div>

          {/* Right Column: Accreditations, Dispatch pulse, neighbors list */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Trust Accreditations and operations board */}
            <div className="bento-card p-6 sm:p-8 text-left flex flex-col justify-between" id="contact-credentials-card">
              <div className="space-y-5">
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 border border-[#007AFF]/20 px-2.5 py-0.5 rounded-full">
                    PERTH BOREWATER TRUST CO.
                  </span>
                  <h3 className="font-display font-bold text-slate-950 text-base mt-2.5">
                    Operations & Certification Board
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Licensed waterwise contractors and Class 1 bore drillers verified for operations in {suburb.name}.
                  </p>
                </div>

                <div className="space-y-4 pt-2 font-mono text-[11px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] shrink-0">
                      <Phone className="w-4 h-4 text-[#007AFF]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">24hr Operations Dispatch</span>
                      <a href="tel:0863704982" className="text-xs text-[#007AFF] font-bold hover:underline">
                        08 6370 4982
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Australian Business Number</span>
                      <p className="text-xs text-slate-800 font-bold">ABN: 16015205459</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 text-[#007AFF]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Drilling Authority Level</span>
                      <p className="text-xs text-slate-800 font-bold">Class 1 Waterwise Accredited #2241</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={scrollQuoteFormIntoView}
                className="mt-8 w-full bg-[#1E293B] hover:bg-[#007AFF] text-white text-xs font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer text-center"
                id="suburb-contact-scroller-btn"
              >
                Book {suburb.name} Repair ↓
              </button>
            </div>

            {/* Live priority dispatch indicator board */}
            <div className="bento-card p-6 sm:p-8 text-left space-y-4 flex flex-col justify-between" id="priority-dispatch-card">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 rounded-full h-2 bg-emerald-500 animate-ping" />
                  <h4 className="font-display font-medium text-slate-900 text-xs uppercase tracking-wider font-mono">Priority Dispatch Slots</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                  Our regional trucks are stationed in close proximity to <strong className="text-slate-800">{suburb.landmark}</strong>. We can dispatch technicians to residential bore burnout complaints under 2 hours.
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-150 text-[10px] text-emerald-800 leading-normal font-mono uppercase tracking-wider font-bold">
                🟢 DISPATCH WINDOW: Slots open today for {suburb.name} properties.
              </div>
            </div>

            {/* Geological sand neighbors comparable selector */}
            <div className="bento-card p-6 sm:p-8 text-left space-y-4 flex flex-col justify-between" id="soil-neighbors-card">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-[#007AFF]" />
                  <h4 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wider">
                    Geological Soil Neighbors
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                  Compare water yields and soil behaviors of adjacent Perth regions sharing matching aquifer classifications:
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['Baldivis', 'Canning Vale', 'Piara Waters', 'Wellard', 'Bertram', 'Atwell', 'Aubin Grove'].map((other) => {
                  if (other === suburb.name) return null;
                  return (
                    <button
                      key={other}
                      onClick={() => onSelectSuburbByName(other)}
                      className="text-[10px] bg-slate-50 hover:bg-[#007AFF]/10 hover:text-[#007AFF] text-slate-705 border border-slate-200 hover:border-[#007AFF]/35 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-extrabold font-mono uppercase"
                    >
                      {other}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
