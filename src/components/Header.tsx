import React from 'react';
import { Download, Play, Pause, RefreshCw, Server, ShieldCheck, AlertTriangle, Radio, Palette, Settings } from 'lucide-react';
import { DiagnosticSession, NetworkPreset, ThemeId } from '../types';
import appLogo from '../assets/images/app_logo_icon_1786884494503.jpg';

interface HeaderProps {
  session: DiagnosticSession;
  isLiveProbing: boolean;
  onToggleLiveProbe: () => void;
  onRunSingleCycle: () => void;
  onSelectPreset: (preset: NetworkPreset) => void;
  onExportPdf: () => void;
  theme: ThemeId;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
}

export const PRESETS: NetworkPreset[] = [
  {
    name: 'Google Public DNS',
    target: '8.8.8.8',
    description: 'Global Anycast DNS (AS15169 Google LLC)',
    category: 'DNS / CDN',
    iconName: 'Globe'
  },
  {
    name: 'Cloudflare Anycast Edge',
    target: '1.1.1.1',
    description: 'High-speed Anycast Edge (AS13335 Cloudflare)',
    category: 'DNS / CDN',
    iconName: 'Zap'
  },
  {
    name: 'Quad9 Secure Resolver',
    target: '9.9.9.9',
    description: 'Global Threat Blocking DNS (AS19281 Quad9)',
    category: 'DNS / CDN',
    iconName: 'Shield'
  },
  {
    name: 'Cisco OpenDNS Anycast',
    target: '208.67.222.222',
    description: 'Enterprise Edge Resolver (AS36692 Cisco)',
    category: 'DNS / CDN',
    iconName: 'Compass'
  },
  {
    name: 'Microsoft Global WAN Edge',
    target: '13.107.4.50',
    description: 'Azure Public Backbone Edge (AS8075 Microsoft)',
    category: 'Cloud',
    iconName: 'Cloud'
  },
  {
    name: 'Local Interface / Gateway',
    target: '127.0.0.1',
    description: 'Host Loopback & Local Stack Routing',
    category: 'Enterprise Core',
    iconName: 'Server'
  }
];

export const Header: React.FC<HeaderProps> = ({
  session,
  isLiveProbing,
  onToggleLiveProbe,
  onRunSingleCycle,
  onSelectPreset,
  onExportPdf,
  theme,
  onCycleTheme,
  onOpenSettings
}) => {
  return (
    <header className="bg-slate-950/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md flex-shrink-0 bg-slate-900">
            <img
              src={appLogo}
              alt="NetTrace Enterprise Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight drop-shadow-sm">NetTrace Enterprise</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm">
                v2.4 CCIE
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs">
                <span className={`w-2 h-2 rounded-full ${isLiveProbing ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-slate-400'}`} />
                <span className="text-slate-200 font-medium text-[11px]">{isLiveProbing ? 'LIVE PROBING' : 'IDLE'}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Enterprise Network Latency, Loss & Hop-by-Hop MTR Engine</p>
          </div>
        </div>

        {/* Live Telemetry Summary Pill Badges - Frosted */}
        <div className="hidden lg:flex items-center gap-3.5 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target</span>
            <span className="text-xs font-mono font-bold text-cyan-300 drop-shadow-sm">{session.target}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mean RTT</span>
            <span className="text-xs font-mono font-bold text-white">{session.overallAvgRtt} ms</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Jitter / Loss</span>
            <span className={`text-xs font-mono font-bold ${session.overallLossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {session.overallJitter}ms / {session.overallLossPercent}%
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">MOS Score</span>
            <span className={`text-xs font-mono font-bold ${session.mosScore >= 4.0 ? 'text-emerald-300' : session.mosScore >= 3.5 ? 'text-amber-300' : 'text-rose-300'}`}>
              {session.mosScore} / 4.5
            </span>
          </div>
        </div>

        {/* Actions & Presets */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={PRESETS.some(p => p.target === session.target) ? session.target : ""}
              onChange={(e) => {
                const found = PRESETS.find(p => p.target === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-black/30 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 cursor-pointer shadow-sm"
            >
              <option value="" disabled className="bg-slate-900">Diagnostic Scenarios</option>
              {PRESETS.map((p) => (
                <option key={p.target} value={p.target} className="bg-slate-900">
                  [{p.category}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Single Probe Button */}
          <button
            onClick={onRunSingleCycle}
            title="Probe Path Once (Single Cycle)"
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 backdrop-blur-md transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Probe Once</span>
          </button>

          {/* Live Continuous Probe Toggle */}
          <button
            onClick={onToggleLiveProbe}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border transition shadow-lg ${
              isLiveProbing
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40 shadow-amber-950/40'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/40 shadow-cyan-950/40'
            }`}
          >
            {isLiveProbing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveProbing ? 'Stop MTR' : 'Live MTR'}</span>
          </button>

          {/* Export PDF Report */}
          <button
            onClick={onExportPdf}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 border border-emerald-400/40 backdrop-blur-md shadow-lg shadow-emerald-950/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Theme Quick Switcher */}
          <button
            onClick={onCycleTheme}
            title={`Current Theme: ${theme}. Click to switch theme`}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 backdrop-blur-md transition shadow-sm"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Settings Shortcut */}
          <button
            onClick={onOpenSettings}
            title="Open System & Telemetry Settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
