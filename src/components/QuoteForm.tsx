import React, { useState } from 'react';
import { Mail, Phone, User, MapPin, Calendar, Clock, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import { QuoteFormState } from '../types';
import { SUBURBS_DATA } from '../data';

interface QuoteFormProps {
  initialSuburb?: string;
}

export default function QuoteForm({ initialSuburb = '' }: QuoteFormProps) {
  const [form, setForm] = useState<QuoteFormState>({
    fullName: '',
    email: '',
    phone: '',
    suburb: initialSuburb,
    serviceType: 'bore_repair',
    urgency: 'standard',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Update suburb if prop changes
  React.useEffect(() => {
    if (initialSuburb) {
      setForm((prev) => ({ ...prev, suburb: initialSuburb }));
    }
  }, [initialSuburb]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.suburb) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      const uuid = 'WA-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(uuid);
    }, 900);
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'new_bore': return 'New Water Bore Drilling';
      case 'bore_repair': return 'Bore Clean-out & Repair';
      case 'retic_service': return 'Reticulation Service & Solenoids';
      case 'pump_replacement': return 'Submersible Pump Upgrade';
      case 'electrical_fault': return 'Electrical Diagnostics & Rewiring';
      default: return 'Emergency Service';
    }
  };

  const selectedSuburbObj = SUBURBS_DATA.find(s => s.name.toLowerCase() === form.suburb.toLowerCase());

  return (
    <div className="bento-accent-card p-7 sm:p-[38px] relative overflow-hidden" id="quote-form-container">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-slate-200 pb-4 mb-3">
            <span className="text-[#007AFF] text-[10px] font-mono uppercase tracking-widest font-bold block mb-1">
              FAST-TRACK DRILLING & REPAIRS
            </span>
            <h3 className="text-xl font-display font-bold text-slate-900">
              {form.suburb ? `Request Emergency Repair in ${form.suburb}` : 'Request Emergency Subsurface Repair'}
            </h3>
            <p className="text-xs text-slate-505 mt-1">
              Fill in your details below. Our field coordinator will review your suburb soil profile parameters on dispatch.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#007AFF]" />
              <input
                type="text"
                required
                placeholder="e.g. Gabriel Russell"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bento-input pl-11"
                id="qf-fullname"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#007AFF]" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0412 345 678"
                  value={form.phone}
                   onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bento-input pl-11 shadow-2xs"
                  id="qf-phone"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#007AFF]" />
                <input
                  type="email"
                  placeholder="e.g. user@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bento-input pl-11 shadow-2xs"
                  id="qf-email"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Suburb Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">Target Suburb *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#007AFF]" />
                <select
                  required
                  value={form.suburb}
                  onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                  className="w-full bento-input pl-11 appearance-none cursor-pointer"
                  id="qf-suburb"
                >
                  <option value="" disabled>Select Suburb</option>
                  {SUBURBS_DATA.slice().sort((a,b) => a.name.localeCompare(b.name)).map((s) => (
                    <option key={s.slug} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-[#007AFF] w-0 h-0" />
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">Required Service</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-[#007AFF]" />
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value as any })}
                  className="w-full bento-input pl-11 appearance-none cursor-pointer"
                  id="qf-servicetype"
                >
                  <option value="new_bore">New Water Bore Installation</option>
                  <option value="bore_repair">Bore Repair & Submersible Service</option>
                  <option value="retic_service">Reticulation Repair & Solenoids</option>
                  <option value="pump_replacement">Submersible Pump Upgrade</option>
                  <option value="electrical_fault">Bore Fusion & Controller Diagnostics</option>
                </select>
                <div className="absolute right-3.5 top-5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-[#007AFF] w-0 h-0" />
              </div>
            </div>
          </div>

          {/* Urgency Radio Toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-mono">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'standard', label: 'Book Advice', desc: 'No active leak' },
                { value: 'this_week', label: 'Next 48 Hours', desc: 'No sprinkler flow' },
                { value: 'emergency', label: 'EMERGENCY', desc: 'Active dry run / burnout' },
              ].map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: lvl.value as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    form.urgency === lvl.value
                      ? 'bg-[#007AFF]/10 border-[#007AFF] text-[#1E293B] font-semibold ring-1 ring-[#007AFF]/25 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                    {lvl.value === 'emergency' && <span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-ping" />}
                    <span>{lvl.label}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional details / site context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
              Site Details / Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Pump hums when switched on but no water emerges, or we have heavy staining on local walls near the garden."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-white border border-slate-200 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/25 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none font-sans"
              id="qf-notes"
            />
          </div>

          {/* Real-time calculated pricing indicator */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between font-mono">
              <span>Selected Suburb:</span>
              <span className="text-slate-900 font-bold">{form.suburb || 'None'}</span>
            </div>
            {selectedSuburbObj && (
              <>
                <div className="flex justify-between font-mono">
                  <span>Soil Profile Diagnostic:</span>
                  <span className="text-[#007AFF] font-bold">{selectedSuburbObj.ironRisk} Staining Risk</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Target Aquifer Depth:</span>
                  <span className="text-[#007AFF] font-bold">{selectedSuburbObj.typicalDepth}</span>
                </div>
              </>
            )}
            <div className="border-t border-slate-200 my-1.5 pt-1.5 flex justify-between text-xs font-mono">
              <span className="text-[#007AFF] font-semibold">Service Diagnostic Callout:</span>
              <span className="text-slate-900 font-bold">$185 + GST</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-3xl text-xs font-bold uppercase tracking-wider text-[#1E293B] transition-all flex items-center justify-center gap-2 shimmer-btn cursor-pointer ${
              loading 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#FFD700] hover:bg-[#FFD700]/95 active:scale-[0.99] shadow-md shadow-amber-300/10'
            }`}
            id="qf-submit-btn"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Subsurface Strata...</span>
              </>
            ) : (
              <span>{form.suburb ? `Request Emergency Repair in ${form.suburb}` : 'Request Emergency Subsurface Repair'}</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Underpinned by official DWER hydrogeologic safety guidelines</span>
          </div>
        </form>
      ) : (
        /* Submission Receipt ticket */
        <div className="text-center py-6 space-y-5 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] mb-2">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <span className="bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#007AFF] font-mono text-[9px] font-bold px-2.5 py-0.5 rounded uppercase tracking-widest">
              Booking Dispatched
            </span>
            <h4 className="text-2xl font-display font-bold text-slate-900">
              Request Received
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our dispatch system has sent this ticket to <strong className="text-slate-800">support@perthborewater.com.au</strong> for {form.suburb}.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 font-mono text-xs text-slate-700">
            <div className="border-b border-slate-200 pb-2 flex justify-between">
              <span className="text-slate-500">TICKET NO:</span>
              <span className="text-[#007AFF] font-bold">{ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CLIENT:</span>
              <span className="text-slate-900 font-bold">{form.fullName}</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-slate-500">PHONE:</span>
              <span className="text-slate-900">{form.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SUBURB:</span>
              <span className="text-[#007AFF] font-bold">{form.suburb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SOIL MATCH:</span>
              <span className="text-slate-650">{selectedSuburbObj ? 'Geological Match Loaded' : 'Guildford/Bassendean Blend'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SERVICE:</span>
              <span className="text-slate-900">{getServiceLabel(form.serviceType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PRIORITY:</span>
              <span className={`font-bold uppercase ${form.urgency === 'emergency' ? 'text-red-650' : 'text-[#007AFF]'}`}>
                {form.urgency === 'standard' ? 'Standard Advice' : form.urgency === 'this_week' ? 'High (48 hr)' : '🚨 EMERGENCY CALLOUT'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 max-w-sm mx-auto">
            <button
              onClick={() => {
                setForm({
                  fullName: '',
                  email: '',
                  phone: '',
                  suburb: initialSuburb,
                  serviceType: 'bore_repair',
                  urgency: 'standard',
                  notes: '',
                });
                setSubmitted(false);
              }}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              Submit Another Request
            </button>
            <p className="text-[10px] text-slate-500">
              A copy of diagnostic dispatch ticket #{ticketId} has been sent to our desk at support@perthborewater.com.au.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
