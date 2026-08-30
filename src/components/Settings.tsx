import React, { useState } from 'react';
import { UserSettings, ThemeId, DiagnosticSession } from '../types';
import { soundEngine } from '../utils/audioAlert';
import { NetworkTooltip } from './NetworkTooltip';
import {
  Palette,
  Sliders,
  Bell,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Globe,
  Download,
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  Radio,
  SlidersHorizontal,
  FileCode,
  HardDrive
} from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetDefaults: () => void;
  session: DiagnosticSession;
}

export const THEMES: {
  id: ThemeId;
  name: string;
  category: string;
  description: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  textColor: string;
}[] = [
  {
    id: 'cyber-slate',
    name: 'Cyber Slate',
    category: 'Dark Cyberpunk',
    description: 'High-contrast dark slate with neon cyan and electric sky accents.',
    bgHex: '#0b1120',
    cardHex: '#0f172a',
    accentHex: '#06b6d4',
    textColor: 'text-cyan-300'
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Terminal',
    category: 'Hacker Monospace',
    description: 'Carbon black canvas with neon emerald and matrix phosphor greens.',
    bgHex: '#030804',
    cardHex: '#051408',
    accentHex: '#22c55e',
    textColor: 'text-emerald-300'
  },
  {
    id: 'deep-space',
    name: 'Deep Space OLED',
    category: 'Midnight Indigo',
    description: 'Midnight navy and violet gradients with purple glow highlights.',
    bgHex: '#070617',
    cardHex: '#0e0b29',
    accentHex: '#818cf8',
    textColor: 'text-indigo-300'
  },
  {
    id: 'enterprise-light',
    name: 'Enterprise Light',
    category: 'Crisp Daylight',
    description: 'Ultra-clean high-contrast daylight slate with royal blue indicators.',
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    accentHex: '#0284c7',
    textColor: 'text-sky-600'
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Cyber',
    category: 'Solarized Teal',
    description: 'Teal base03 palette with warm amber telemetry and cyan metrics.',
    bgHex: '#002b36',
    cardHex: '#073642',
    accentHex: '#b58900',
    textColor: 'text-amber-400'
  }
];

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
  session
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exportedAt: new Date().toISOString(),
      settings,
      session
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NetTrace_Diagnostic_Snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    let csv = "Hop,IP,Host,ASN,ASN_Org,Sent,Recv,LossPercent,LastRtt,AvgRtt,BestRtt,WorstRtt,Jitter,Status\n";
    session.hops.forEach(h => {
      csv += `${h.hop},"${h.ip}","${h.host}","${h.asn || ''}","${h.asnOrg || ''}",${h.sentCount},${h.recvCount},${h.lossPercent},${h.lastRtt},${h.avgRtt},${h.bestRtt},${h.worstRtt},${h.jitter},"${h.status}"\n`;
    });

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NetTrace_Hop_Data_${session.target}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Settings Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider">
              Control Panel
            </span>
            <span className="text-xs text-slate-400">Settings & Telemetry Preferences</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
            System & Diagnostics Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize visual themes, probe polling frequencies, SLA alerting rules, and sound telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Settings Saved
            </div>
          )}
          <button
            onClick={() => {
              onResetDefaults();
              triggerToast();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset CCIE Defaults
          </button>
        </div>
      </div>

      {/* 1. Theme Selection Suite */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Visual Themes & Color Palettes</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Select an engineered theme. Changes apply across all diagnostic graphs, hop tables, and visualizers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map(theme => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onUpdateSettings({ theme: theme.id });
                  triggerToast();
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'border-cyan-400/80 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
                style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : undefined }}
              >
                <div>
                  {/* Palette Preview Swatches */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.bgHex }}
                      title="Background"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.cardHex }}
                      title="Card / Panel"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.accentHex }}
                      title="Accent"
                    />
                    <span className="text-[10px] text-slate-400 font-mono ml-auto">
                      {theme.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      {theme.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Probing Engine & Diagnostic Tuning */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Diagnostic Probing Engine Parameters</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Tune continuous sampling intervals, packet payloads, and QoS DiffServ markings:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Polling Interval */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <label className="text-xs font-bold text-slate-200 block mb-1">
              Live Probe Refresh Frequency
            </label>
            <p className="text-[11px] text-slate-400 mb-3">Time interval between MTR probe cycles</p>
            <select
              value={settings.refreshIntervalMs}
              onChange={(e) => {
                onUpdateSettings({ refreshIntervalMs: Number(e.target.value) });
                triggerToast();
              }}
              className="w-full bg-slate-900 text-xs text-white border border-white/15 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            >
              <option value={500}>500 ms (High Precision Rapid)</option>
              <option value={1000}>1,000 ms (1.0 sec Standard)</option>
              <option value={1500}>1,500 ms (1.5 sec Balanced Default)</option>
              <option value={3000}>3,000 ms (3.0 sec Conservative)</option>
              <option value={5000}>5,000 ms (5.0 sec Low Overhead)</option>
            </select>
          </div>

          {/* Default Packet Size */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-200 block">
                Default Packet Payload Size (Frame MTU)
              </label>
              <NetworkTooltip topic="frame_mtu" position="top" />
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Payload bytes per ICMP/UDP echo request (PMTUD testing)</p>
            <select
              value={settings.defaultPacketSize}
              onChange={(e) => {
                onUpdateSettings({ defaultPacketSize: Number(e.target.value) });
                triggerToast();
              }}
              className="w-full bg-slate-900 text-xs text-white border border-white/15 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            >
              <option value={64}>64 Bytes (RFC 792 Standard Ping / VoIP RTP)</option>
              <option value={128}>128 Bytes (Compact Payload)</option>
              <option value={512}>512 Bytes (Medium Frame)</option>
              <option value={1472}>1,472 Bytes (Max IPv4 MTU Frame)</option>
              <option value={1500}>1,500 Bytes (Full MTU L2 Frame)</option>
            </select>
          </div>

          {/* DSCP Marking */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-200 block">
                QoS DSCP DiffServ Tag
              </label>
              <NetworkTooltip topic="dscp_qos" position="top" />
            </div>
            <p className="text-[11px] text-slate-400 mb-3">IP header traffic classification & hardware queueing</p>
            <select
              value={settings.defaultDscp}
              onChange={(e) => {
                onUpdateSettings({ defaultDscp: e.target.value });
                triggerToast();
              }}
              className="w-full bg-slate-900 text-xs text-white border border-white/15 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            >
              <option value="CS0">CS0 (Best Effort Default)</option>
              <option value="EF">EF (Expedited Forwarding 46 - VoIP LLQ)</option>
              <option value="AF41">AF41 (Assured Forwarding 34 - Video / Conf)</option>
              <option value="AF31">AF31 (Assured Forwarding 26 - High Data / ERP)</option>
              <option value="CS6">CS6 (Internetwork Control 48 - BGP / Routing)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SLA Alert Policies & Audio Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Threshold Rules */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">SLA Anomaly Threshold Policies</h3>
          </div>

          <div className="space-y-4">
            {/* Packet Loss Threshold */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Critical Packet Loss Threshold:</span>
                <span className="font-mono font-bold text-rose-300">{settings.lossThresholdPercent}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={settings.lossThresholdPercent}
                onChange={(e) => onUpdateSettings({ lossThresholdPercent: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* RTT Latency Alert */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">High Latency Warning Threshold:</span>
                <span className="font-mono font-bold text-amber-300">{settings.latencyThresholdMs} ms</span>
              </div>
              <input
                type="range"
                min={20}
                max={250}
                step={5}
                value={settings.latencyThresholdMs}
                onChange={(e) => onUpdateSettings({ latencyThresholdMs: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Jitter Threshold */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Excessive Jitter Alert:</span>
                <span className="font-mono font-bold text-indigo-300">{settings.jitterThresholdMs} ms</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={settings.jitterThresholdMs}
                onChange={(e) => onUpdateSettings({ jitterThresholdMs: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Voice MOS SLA */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Minimum Acceptable Voice MOS Score:</span>
                <span className="font-mono font-bold text-emerald-300">{settings.mosMinThreshold} / 4.5</span>
              </div>
              <input
                type="range"
                min={3.0}
                max={4.4}
                step={0.1}
                value={settings.mosMinThreshold}
                onChange={(e) => onUpdateSettings({ mosMinThreshold: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Audio & Alert Notifications */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Audio & Visual Notifications</h3>
            </div>

            <div className="space-y-4">
              {/* Sound Alerts Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  {settings.soundAlerts ? (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">Telemetry Sound Chimes</span>
                    <span className="text-[11px] text-slate-400">Pure Web Audio synth feedback on drops & spikes</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) => {
                    onUpdateSettings({ soundAlerts: e.target.checked });
                    triggerToast();
                  }}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
                />
              </div>

              {/* Visual Flashing Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Visual Anomaly Glow</span>
                  <span className="text-[11px] text-slate-400">Pulse animations on degraded intermediate hops</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.visualFlashing}
                  onChange={(e) => {
                    onUpdateSettings({ visualFlashing: e.target.checked });
                    triggerToast();
                  }}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
                />
              </div>

              {/* DoH Provider */}
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/10">
                <label className="text-xs font-bold text-white block mb-1">
                  Default DNS-over-HTTPS (DoH) Provider
                </label>
                <select
                  value={settings.dohProvider}
                  onChange={(e) => {
                    onUpdateSettings({ dohProvider: e.target.value as any });
                    triggerToast();
                  }}
                  className="w-full bg-slate-900 text-xs text-white border border-white/15 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                >
                  <option value="cloudflare">Cloudflare (1.1.1.1 Fast Anycast)</option>
                  <option value="google">Google Public DNS (8.8.8.8 Global)</option>
                  <option value="quad9">Quad9 (9.9.9.9 Threat Protected)</option>
                  <option value="adguard">AdGuard (94.140.14.14 Privacy)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Audio Chimes */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <span className="text-[11px] text-slate-400 block mb-2 font-semibold">Test Audio Synthesizer:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => soundEngine.playProbePing()}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-semibold hover:bg-cyan-500/25 transition"
              >
                Probe Ping
              </button>
              <button
                onClick={() => soundEngine.playWarningChime()}
                className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/30 text-xs font-semibold hover:bg-amber-500/25 transition"
              >
                Warning Chime
              </button>
              <button
                onClick={() => soundEngine.playCriticalAlarm()}
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/30 text-xs font-semibold hover:bg-rose-500/25 transition"
              >
                Critical Alarm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Data Export & Storage Management */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Diagnostic Data Export & Local Storage</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Save active diagnostic trace samples, export telemetry as structured CSV/JSON, or manage local cache:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-semibold text-xs hover:bg-cyan-500/25 transition"
          >
            <Download className="w-4 h-4" />
            Export Complete Snapshot (JSON)
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-semibold text-xs hover:bg-emerald-500/25 transition"
          >
            <FileCode className="w-4 h-4" />
            Export Hop Telemetry (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
