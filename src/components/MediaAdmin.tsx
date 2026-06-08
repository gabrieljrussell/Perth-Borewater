import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Save, 
  Download, 
  Copy, 
  Check, 
  X, 
  Upload, 
  Link2, 
  Eye, 
  Settings, 
  ChevronRight, 
  BookOpen, 
  Video, 
  Image, 
  MapPin, 
  Database,
  ArrowRight,
  FileJson,
  Shield,
  Trash2,
  Undo
} from 'lucide-react';
import { SUBURBS_DATA } from '../data';

interface MediaAdminProps {
  mediaOverrides: Record<string, { video?: string; photo?: string; geology?: string; pump?: string; background?: string; drilling?: string }>;
  onSaveOverrides: (updated: Record<string, any>) => void;
  onClose: () => void;
}

// Media Fields metadata to assist rendering
const ASSET_FIELDS = [
  { 
    key: 'video' as const, 
    label: 'Hero Video URL', 
    description: 'Direct MP4 link, YouTube (youtube.com/watch?v=...) or Vimeo URL for the top section backdrop.',
    icon: Video,
    accept: 'video/mp4,video/*'
  },
  { 
    key: 'photo' as const, 
    label: 'Hero Fallback Cover Image', 
    description: 'Image displayed as background and fallback if the hero video cannot load.',
    icon: Image,
    accept: 'image/*'
  },
  { 
    key: 'geology' as const, 
    label: 'Geology Profile Chart / Image', 
    description: 'High-definition survey chart or sample photograph displayed inside Card 6.',
    icon: Database,
    accept: 'image/*'
  },
  { 
    key: 'pump' as const, 
    label: 'Pump Technical Spec Image', 
    description: 'Schematic diagrams, technical setup photos, or catalog listings inside Card 3.',
    icon: Settings,
    accept: 'image/*'
  },
  { 
    key: 'background' as const, 
    label: 'Backdrop Blurry Panorama', 
    description: 'Full-width blur effect panorama matching the background theme colors.',
    icon: BookOpen,
    accept: 'image/*'
  },
  { 
    key: 'drilling' as const, 
    label: 'Drilling Video URL', 
    description: 'Direct MP4 link of the borehole drilling operation for this suburb displayed in Card 1.',
    icon: Video,
    accept: 'video/mp4,video/*'
  }
];

export default function MediaAdmin({ mediaOverrides, onSaveOverrides, onClose }: MediaAdminProps) {
  // Safe deep clone current state for working copy
  const [localOverrides, setLocalOverrides] = useState<Record<string, any>>(() => {
    return JSON.parse(JSON.stringify(mediaOverrides || {}));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('rockingham');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCopyPanel, setShowCopyPanel] = useState(false);

  // File uploading refs to target inputs
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter suburbs by name
  const filteredSuburbs = useMemo(() => {
    return SUBURBS_DATA.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Selected Suburb object
  const activeSuburb = useMemo(() => {
    return SUBURBS_DATA.find(s => s.slug === selectedSlug) || SUBURBS_DATA[0];
  }, [selectedSlug]);

  // Active inputs state for selected suburb keys
  const activeData = useMemo(() => {
    const defaultData = { video: '', photo: '', geology: '', pump: '', background: '', drilling: '' };
    return { ...defaultData, ...(localOverrides[selectedSlug] || {}) };
  }, [localOverrides, selectedSlug]);

  // Handle manual input updates
  const handleFieldChange = (key: 'video' | 'photo' | 'geology' | 'pump' | 'background' | 'drilling', value: string) => {
    setLocalOverrides(prev => {
      const currentSuburbData = { ...(prev[selectedSlug] || {}) };
      
      if (value === '') {
        delete currentSuburbData[key];
      } else {
        currentSuburbData[key] = value;
      }

      // Cleanup parent if empty
      const nextOverrides = { ...prev };
      if (Object.keys(currentSuburbData).length === 0) {
        delete nextOverrides[selectedSlug];
      } else {
        nextOverrides[selectedSlug] = currentSuburbData;
      }

      return nextOverrides;
    });
  };

  // Convert uploaded file to base64 inline and save
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'video' | 'photo' | 'geology' | 'pump' | 'background' | 'drilling') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleFieldChange(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute global save to database/filesystem
  const handleCommitChanges = async () => {
    setSaveStatus('saving');
    try {
      await onSaveOverrides(localOverrides);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  // Generate downloadable JSON blob
  const handleDownloadFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localOverrides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "media_overrides.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy fully modified JSON dictionary code to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(localOverrides, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe checks for URL inputs
  const isRealUrl = (str: string) => {
    if (!str) return false;
    if (str.startsWith('data:')) return true; // Accept inline local base64
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
  };

  // Embed converters for YouTube and Vimeo
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    if (!url) return null;
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Total statistics count for indicators
  const totalConfiguredSuburbs = Object.keys(localOverrides).length;
  const totalConfiguredFields = Object.values(localOverrides).reduce((acc: number, cur: any) => {
    return acc + Object.keys(cur || {}).length;
  }, 0);

  return (
    <div className="w-full min-h-screen bg-[#090F1C] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden relative" id="media-admin-board">
      
      {/* Dynamic Glow Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[550px] bg-[radial-gradient(circle_at_top_right,rgba(0,122,255,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

      {/* Admin Central Toolbar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800 px-6 sm:px-10 py-5 flex flex-col md:flex-row gap-5 items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-display font-black tracking-tight flex items-center gap-2">
              Perth BoreWater Media Panel
              <span className="text-[10px] uppercase font-mono font-bold bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] px-2 py-0.5 rounded-full">Admin</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Configure videos, photos, and geological blueprints for {SUBURBS_DATA.length} region pages.</p>
          </div>
        </div>

        {/* Global Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCopyPanel(!showCopyPanel)}
            className={`flex items-center gap-1.5 font-mono text-[11px] font-bold py-2.5 px-4 rounded-xl border uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              showCopyPanel 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-850 border-slate-750 text-slate-350 hover:text-white hover:bg-slate-800'
            }`}
            title="Inspect direct JSON array replacement to commit to files manually"
          >
            <FileJson className="w-4 h-4" />
            <span>Copy Code Block</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-755 text-slate-200 hover:text-white font-mono text-[11px] font-bold py-2.5 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-black/20 hover:shadow-md"
            title="Download the updated media_overrides.json file directly to your disk"
          >
            <Download className="w-4 h-4 text-[#007AFF]" />
            <span>Download replacement</span>
          </button>

          <button
            type="button"
            onClick={handleCommitChanges}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-1.5 font-sans text-[11.5px] font-bold py-2.5 px-5.5 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer ${
              saveStatus === 'success' 
                ? 'bg-emerald-600 text-white shadow-emerald-950/20' 
                : saveStatus === 'error'
                ? 'bg-rose-600 text-white shadow-rose-950/20 animate-shake'
                : 'bg-[#007AFF] hover:bg-[#0060DF] text-white shadow-blue-950/20 hover:shadow-lg'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>Saving to Server...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-emerald-100 shrink-0" />
                <span>Successfully Saved!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <X className="w-4 h-4 text-rose-100 shrink-0" />
                <span>Failed to Save</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-blue-100 shrink-0" />
                <span>Save to Server</span>
              </>
            )}
          </button>

          <div className="border-l border-slate-800 h-6 mx-1.5 hidden md:block" />

          {/* Back to Live Site UI */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2 px-3.5 rounded-xl font-semibold text-xs tracking-wide transition-all uppercase flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <span>Close Admin</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Copy Code Replacement Drawer Drawer / Modal */}
      {showCopyPanel && (
        <div className="bg-[#0B1221] border-b border-amber-500/20 p-6 flex flex-col gap-4 animate-fade-in text-left">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-amber-500 font-mono text-[10px] font-black uppercase tracking-widest block">CODE EXPORT PLAYGROUND</span>
              <h3 className="text-sm font-bold text-slate-100">Direct Code replacement for <code className="text-amber-400 font-mono text-xs bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">src/media_overrides.json</code></h3>
              <p className="text-[11px] text-slate-400">Copy the code below and paste it completely inside your local project file <strong className="font-mono text-slate-350">src/media_overrides.json</strong> to make these modifications permanent.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 bg-[#007AFF] hover:bg-[#0060DF] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-250 animate-pulse" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCopyPanel(false)}
                className="text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              readOnly
              value={JSON.stringify(localOverrides, null, 2)}
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-amber-400/90 outline-none focus:ring-0 focus:border-slate-800 tracking-wide scrollbar"
            />
          </div>
        </div>
      )}

      {/* Main Admin Page Workspace Split Panel */}
      <div className="flex-grow flex flex-col lg:flex-row items-stretch">
        
        {/* LEFT COLUMN: Search & Suburb Directory Selector List (Touch items target size 44px+) */}
        <aside className="w-full lg:w-[320px] bg-[#0E1524] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col shrink-0 text-left">
          
          {/* Suburb Search Field */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative flex items-center bg-[#090F1B] border border-slate-850 rounded-xl p-1.5 focus-within:border-[#007AFF]/50 focus-within:ring-1 focus-within:ring-[#007AFF]/20 transition-all">
              <Search className="w-4 h-4 text-slate-500 pl-1 shrink-0" />
              <input
                type="text"
                placeholder="Search region or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 outline-none focus:ring-0 pl-2 pr-2 font-medium"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-slate-800 text-slate-450 hover:text-white rounded"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Asset Diagnostics Badges */}
            <div className="flex gap-2.5 mt-3 justify-between font-mono text-[9px] text-slate-400 font-bold tracking-wider">
              <div className="bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-lg py-1 px-2.2 text-left">
                <span className="text-[#007AFF] block font-black text-xs leading-none">{totalConfiguredSuburbs}</span>
                <span className="text-[8px] uppercase mt-0.5 block">CUSTOM PAGES</span>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg py-1 px-2.2 text-left">
                <span className="text-emerald-400 block font-black text-xs leading-none">{totalConfiguredFields}</span>
                <span className="text-[8px] uppercase mt-0.5 block">CONFIGURED FIELD ASSETS</span>
              </div>
            </div>
          </div>

          {/* Suburb Vertical List Container (Touch target minimum 44px) */}
          <div className="flex-grow overflow-y-auto max-h-[250px] lg:max-h-[calc(100vh-180px)] scrollbar font-sans">
            {filteredSuburbs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                No territories match search filter.
              </div>
            ) : (
              filteredSuburbs.map((sub) => {
                const isSelected = selectedSlug === sub.slug;
                const matchesCount = Object.keys(localOverrides[sub.slug] || {}).length;

                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => setSelectedSlug(sub.slug)}
                    className={`w-full text-left px-5.5 py-3.5 border-b border-slate-900/40 font-medium transition-all duration-150 flex items-center justify-between outline-none cursor-pointer group ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#007AFF]/15 to-transparent text-white border-l-2 border-l-[#007AFF] bg-[#007AFF]/5' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/45'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="capitalize">{sub.name}</span>
                        {matchesCount > 0 && (
                          <span className="text-[8.5px] font-mono font-bold bg-[#007AFF]/20 border border-[#007AFF]/30 text-blue-300 px-1.5 py-0.2 rounded-full leading-none shrink-0 uppercase tracking-widest">
                            {matchesCount} custom
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono tracking-wider font-bold">
                        PCD • {sub.typicalDepth || '10m - 20m'}
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isSelected ? 'text-[#007AFF] translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Interactive Media Overrides Form Details */}
        <main className="flex-grow p-6 sm:p-10 text-left bg-[#0A0F1D] flex flex-col justify-start">
          
          {/* Section banner */}
          <section className="bg-slate-900/55 rounded-2xl border border-slate-850 p-6 mb-8 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[#007AFF]/2 pointer-events-none" />
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5 text-blue-450" />
                <span>Geographic Target Page</span>
              </div>
              <h2 className="text-2xl font-display font-black tracking-tight text-white capitalize flex items-center gap-2">
                {activeSuburb.name} Location Page Settings
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Soil Profile: <strong className="text-slate-300 font-semibold">{activeSuburb.soilComposition}</strong> • Typical drilling depths: <strong className="text-[#007AFF]">{activeSuburb.typicalDepth}</strong>.
              </p>
            </div>

            {/* Quick Preview active slug trigger link */}
            <div className="relative z-10 shrink-0">
              <a 
                href={`/suburbs/${activeSuburb.slug}`}
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all uppercase shadow-sm"
              >
                <span>Live Preview Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>

          {/* Form Fields and Interactive Live Preview Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Editing fields (7 columns out of 12) */}
            <div className="xl:col-span-7 space-y-8">
              {ASSET_FIELDS.map((field) => {
                const Icon = field.icon;
                const value = activeData[field.key] || '';
                const configured = !!value;

                return (
                  <div key={field.key} className="bg-slate-900/80 border border-slate-850 hover:border-slate-800 transition-all rounded-2xl p-5.5 space-y-3 relative group">
                    
                    {/* Corner Clean Tag */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {configured ? (
                        <span className="text-[8.5px] font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-[#007AFF] px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse shrink-0" />
                          Custom Override Active
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-mono font-bold bg-slate-800 border border-slate-850 text-slate-400 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                          Default Preset
                        </span>
                      )}
                    </div>

                    {/* Field label */}
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${configured ? 'bg-blue-500/15 border-blue-500/25 text-[#007AFF]' : 'bg-slate-850 border-slate-755 text-slate-400'}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-200">{field.label}</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-0.5">{field.description}</p>
                      </div>
                    </div>

                    {/* Field interactive inputs controller (Includes manual link or drop zone) */}
                    <div className="flex flex-col md:flex-row gap-3">
                      
                      {/* URL input box */}
                      <div className="flex-grow relative flex items-center bg-[#090F1B] border border-slate-850 rounded-xl p-1 focus-within:border-[#007AFF] transition-all">
                        <Link2 className="w-3.5 h-3.5 text-slate-500 pl-2 shrink-0" />
                        <input
                          type="url"
                          placeholder="Paste direct HTTP URL, YouTube/Vimeo embed address, or upload file..."
                          value={value}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 outline-none focus:ring-0 pl-2.5 pr-8 py-2 font-mono scrollbar"
                        />
                        {value && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange(field.key, '')}
                            className="bg-transparent border-none p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                            title="Reset this asset override pattern back to default fallback"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* File Upload click wrapper */}
                      <div className="shrink-0">
                        <input
                          type="file"
                          ref={el => { fileInputsRef.current[field.key] = el; }}
                          onChange={(e) => handleFileUpload(e, field.key)}
                          accept={field.accept}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputsRef.current[field.key]?.click()}
                          className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#090F1C] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-850 hover:border-slate-750 px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer h-full"
                          title={`Upload static file for ${field.label} fallback`}
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Upload File</span>
                        </button>
                      </div>

                    </div>

                    {/* Show a mini visual feedback of Base64 size weight if loaded as local file */}
                    {configured && value.startsWith('data:') && (
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-lg w-fit">
                        <Database className="w-3 h-3 text-emerald-450 shrink-0 animate-pulse" />
                        <span>Embedded base64 file data weight: {(value.length / 1024).toFixed(1)} KB</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* LIVE PREVIEW CANVAS PANEL (5 columns out of 12) */}
            <div className="xl:col-span-5 sticky top-36 space-y-6">
              <div className="bg-[#0E1524] border border-slate-850 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#007AFF] shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
                
                <h3 className="font-display font-black text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#007AFF] animate-pulse" />
                  Asset Sandbox Preview
                </h3>

                {/* Suburb Core View Preview Container */}
                <div className="space-y-6">
                  
                  {/* Aspect Ratio frame for Video or Cover Photo */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-850 relative flex items-center justify-center shadow-md">
                    
                    {activeData.video && isRealUrl(activeData.video) ? (
                      getYouTubeId(activeData.video) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(activeData.video)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(activeData.video)}&controls=0&showinfo=0&rel=0`}
                          className="w-full h-full border-none pointer-events-none scale-102"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : getVimeoId(activeData.video) ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${getVimeoId(activeData.video)}?autoplay=1&loop=1&muted=1&background=1`}
                          className="w-full h-full border-none pointer-events-none scale-102"
                          allow="autoplay; fullscreen"
                        />
                      ) : (
                        <video 
                          src={activeData.video}
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          preload="auto"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLVideoElement;
                            t.style.display = 'none';
                          }}
                        />
                      )
                    ) : activeData.photo && isRealUrl(activeData.photo) ? (
                      <img 
                        src={activeData.photo} 
                        alt="Hero Screen Override Spec" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Video className="w-9 h-9 text-slate-700 mx-auto mb-2 opacity-50" />
                        <span className="text-[10px] uppercase font-mono font-extrabold text-slate-500 tracking-wider block">No Hero Override Available</span>
                        <span className="text-[9px] text-slate-600 mt-0.5 block font-sans">Displaying default standard layout media</span>
                      </div>
                    )}

                    {/* Corner Tag */}
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs px-2 px-1 rounded text-[8px] font-mono font-bold uppercase tracking-widest text-[#007AFF] border border-blue-500/10 z-10">
                      Top Hero Display
                    </div>
                  </div>

                  {/* Other images preview thumbnails row */}
                  <div className="grid grid-cols-3 gap-3">
                    
                    {/* Geology thumbnail */}
                    <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 flex flex-col justify-between h-[110px] text-left">
                      <div className="h-[75px] w-full rounded bg-slate-900 overflow-hidden flex items-center justify-center">
                        {activeData.geology && isRealUrl(activeData.geology) ? (
                          <img src={activeData.geology} alt="Geology visual asset preview" className="w-full h-full object-cover" />
                        ) : (
                          <Database className="w-4 h-4 text-slate-700" />
                        )}
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-1.5 truncate">Geology Map</span>
                    </div>

                    {/* Pump spec thumbnail */}
                    <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 flex flex-col justify-between h-[110px] text-left">
                      <div className="h-[75px] w-full rounded bg-slate-900 overflow-hidden flex items-center justify-center">
                        {activeData.pump && isRealUrl(activeData.pump) ? (
                          <img src={activeData.pump} alt="Pump spec asset preview" className="w-full h-full object-cover" />
                        ) : (
                          <Settings className="w-4 h-4 text-slate-700" />
                        )}
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-1.5 truncate">Pump Details</span>
                    </div>

                    {/* Backdrop thumbnail */}
                    <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 flex flex-col justify-between h-[110px] text-left">
                      <div className="h-[75px] w-full rounded bg-slate-900 overflow-hidden flex items-center justify-center">
                        {activeData.background && isRealUrl(activeData.background) ? (
                          <img src={activeData.background} alt="Backdrop background asset preview" className="w-full h-full object-cover blur-[0.5px]" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-700" />
                        )}
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-1.5 truncate">Panorama Blur</span>
                    </div>

                  </div>

                  {/* Help advisory box */}
                  <div className="bg-[#007AFF]/5 rounded-xl border border-blue-500/10 p-4 text-left space-y-1">
                    <span className="text-[8.5px] font-mono font-bold text-[#007AFF] uppercase tracking-widest block">ADMINISTRATOR HELP CARD</span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed leading-normal font-sans">
                      Any files uploaded or URLs inserted here are held temporarily in local state. Tap <strong className="text-white hover:text-emerald-300">"Save to Server"</strong> in the main toolbar above to write those modifications directly to the server&apos;s workspace and make them instantly persistent.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
