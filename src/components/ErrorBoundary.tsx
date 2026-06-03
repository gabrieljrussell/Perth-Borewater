import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertOctagon, 
  RefreshCw, 
  RotateCcw, 
  Terminal, 
  Info, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles
} from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an active runtime exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert("Local storage and caches cleared successfully. Reloading...");
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear local cache", e);
    }
  };

  private handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `Error: ${error?.message || 'Unknown'}\n\nStack:\n${error?.stack || 'N/A'}\n\nComponent Stack:\n${errorInfo?.componentStack || 'N/A'}\n\nLocation: ${window.location.href}`;
    
    navigator.clipboard.writeText(errorText)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-rose-500 selection:text-white" id="react-error-boundary-view">
          {/* Header Bar */}
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                PB
              </div>
              <span className="font-display font-extrabold text-slate-200 tracking-tight text-sm">
                PERTH BOREWATER <span className="text-rose-500 text-xs font-mono font-bold">DIAGNOSTIC FAULT LOG</span>
              </span>
            </div>
            <span className="text-[10px] font-mono bg-rose-950/40 text-rose-400 border border-rose-800/40 px-2.5 py-1 rounded-md uppercase tracking-wider font-bold animate-pulse">
              System Interrupted
            </span>
          </div>

          {/* Main Card grid */}
          <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-left flex-grow flex flex-col justify-center my-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient(circle_at_center,rgba(239,68,68,0.03)_0%,transparent_70%) pointer-events-none" />
            
            <div className="space-y-6">
              {/* Fault Icon Badge */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 shadow-inner">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-rose-500 font-mono text-[9px] font-bold tracking-widest uppercase block">
                    React Unhandled Error Capture
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-100 mt-1">
                    Interface Render Execution Failed
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                A component in the application crashed during render execution or state routing. 
                Below is the live diagnostic output designed to pinpoint database issues or bad file loads on your Hostinger static site.
              </p>

              {/* Error Message Trace Block */}
              <div className="bg-black border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-rose-500" />
                    EXCEPTION_REPORT.LOG
                  </span>
                  <button 
                    onClick={this.handleCopyError}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[11px]"
                    title="Copy technical details to clipboard"
                    id="btn-copy-error-stack"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Details</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 sm:p-6 font-mono text-xs text-rose-300 overflow-x-auto space-y-2 max-h-[160px] overflow-y-auto leading-relaxed">
                  <div className="font-bold text-slate-100">
                    Message: {this.state.error?.message || 'Unknown runtime error'}
                  </div>
                  {this.state.error?.stack && (
                    <div className="text-rose-400/80 text-[11px] whitespace-pre select-all">
                      {this.state.error.stack}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  id="btn-error-reload"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Core App
                </button>

                <button
                  onClick={this.handleClearCache}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-medium text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all border border-slate-705 cursor-pointer"
                  id="btn-error-clear-cache"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  Force Clear App Cache
                </button>

                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider px-4 py-3 border border-dashed border-slate-800 hover:border-slate-705 rounded-xl cursor-pointer"
                  id="btn-error-toggle-stack"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{this.state.showDetails ? 'Hide Stack Frame' : 'Show Component Stack'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Nested Component Stack Details */}
              {this.state.showDetails && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-[10px] text-slate-400 whitespace-pre-wrap overflow-x-auto max-h-[180px] overflow-y-auto leading-relaxed space-y-2 animate-slide-up">
                  <header className="text-slate-202 font-bold uppercase border-b border-slate-800/50 pb-2 mb-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-sky-500" />
                    React Virtual DOM Component Stack Trace:
                  </header>
                  <div>
                    {this.state.errorInfo?.componentStack || 'No component structure trace has been gathered.'}
                  </div>
                </div>
              )}

              {/* Standard Hosting environment recommendations */}
              <div className="bg-indigo-950/15 border-l-4 border-l-sky-500 rounded-r-xl p-4.5 space-y-1.5">
                <span className="text-sky-400 font-bold font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-400" />
                  Hostinger Environment Diagnostic Advisory:
                </span>
                <ul className="text-xs text-slate-305 space-y-1.5 list-disc pl-5 font-normal leading-relaxed">
                  <li><strong>Blank/White Screens on Deployment:</strong> Often occur if deployment upload includes temporary workspace config folders or ignores absolute paths. Look at the page address: <code>{window.location.pathname}</code>.</li>
                  <li><strong>Asset Mapping:</strong> Ensure you built with <code>npm run build</code> and copied the entire, individual contents of the local <code>/dist/</code> folder directly into Hostinger's <code>public_html/</code> directory, rather than putting the entire folder tree inside there.</li>
                  <li><strong>Active .htaccess Rules:</strong> If refreshing a suburb landing link directly (e.g., <code>/suburbs/baldivis</code>) returns a 404 or white page, ensure you have our included <code>.htaccess</code> inside <code>public_html/</code> folder to catch SPA base rewriting.</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer credentials tracking */}
          <div className="max-w-7xl mx-auto w-full text-center text-[10px] tracking-widest text-slate-600 font-mono mt-8 border-t border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              ABN 16015205459 | Perth BoreWater Operations Center
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <Sparkles className="w-3 h-3" />
              <span>Diagnostic Active Trace Client</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
