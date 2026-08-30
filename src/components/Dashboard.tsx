import React, { useState } from 'react';
import {
  DiagnosticSession,
  SubnetAnalysis,
  HostScanResult,
  DiagnosticTab,
  NetworkPreset,
  NetworkIncident
} from '../types';
import { PRESETS } from './Header';
import { NetworkTooltip } from './NetworkTooltip';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Zap,
  Globe,
  Server,
  ArrowRight,
  TrendingUp,
  Cpu,
  Scan,
  FileText,
  Bot,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Layers,
  Radio,
  Clock,
  ExternalLink,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  session: DiagnosticSession;
  subnet: SubnetAnalysis | null;
  scanResults: HostScanResult[] | null;
  isLiveProbing: boolean;
  onToggleLiveProbe: () => void;
  onRunSingleCycle: () => void;
  onSelectPreset: (preset: NetworkPreset) => void;
  onNavigateTab: (tab: DiagnosticTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  session,
  subnet,
  scanResults,
  isLiveProbing,
  onToggleLiveProbe,
  onRunSingleCycle,
  onSelectPreset,
  onNavigateTab
}) => {
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'critical' | 'warning'>('all');

  // Compute live incidents and anomalies
  const incidents: NetworkIncident[] = [];

  session.hops.forEach(hop => {
    if (hop.lossPercent >= 10 && hop.status !== 'rate-limited') {
      incidents.push({
        id: `inc-loss-${hop.hop}`,
        timestamp: 'Just now',
        severity: 'CRITICAL',
        title: `Sustained Packet Loss at Hop #${hop.hop}`,
        description: `${hop.lossPercent}% packet drop observed on ${hop.ip} (${hop.host}). Downstream degradation risk.`,
        affectedHop: hop.hop,
        affectedIp: hop.ip,
        metric: 'Packet Loss',
        value: `${hop.lossPercent}%`
      });
    } else if (hop.status === 'rate-limited') {
      incidents.push({
        id: `inc-copp-${hop.hop}`,
        timestamp: 'Active',
        severity: 'WARNING',
        title: `Control Plane CoPP Rate-Limiting`,
        description: `Hop #${hop.hop} (${hop.ip}) is silently discarding ICMP TTL-Exceeded probes. Transit forwarding nominal.`,
        affectedHop: hop.hop,
        affectedIp: hop.ip,
        metric: 'ICMP Rate Limit',
        value: 'CoPP Filter'
      });
    } else if (hop.degradationDelta >= 35) {
      incidents.push({
        id: `inc-rtt-${hop.hop}`,
        timestamp: 'Active',
        severity: 'WARNING',
        title: `Latency Step-Up (+${hop.degradationDelta}ms)`,
        description: `Physical distance or peering handoff delay between Hop #${hop.hop - 1} and Hop #${hop.hop} (${hop.asn || 'Transit'}).`,
        affectedHop: hop.hop,
        affectedIp: hop.ip,
        metric: 'Delta RTT',
        value: `+${hop.degradationDelta}ms`
      });
    }
  });

  if (incidents.length === 0) {
    incidents.push({
      id: 'inc-nominal',
      timestamp: 'Nominal',
      severity: 'INFO',
      title: 'Path SLA Nominal & Validated',
      description: `All ${session.totalHops} routing nodes operating within target enterprise latency boundaries with zero drop.`,
      metric: 'Path SLA',
      value: '100% Target Met'
    });
  }

  const filteredIncidents = incidents.filter(inc => {
    if (incidentFilter === 'critical') return inc.severity === 'CRITICAL';
    if (incidentFilter === 'warning') return inc.severity === 'WARNING';
    return true;
  });

  // Calculate carrier & ASN breakdown
  const asns: string[] = Array.from(new Set(session.hops.filter(h => h.asn).map(h => `${h.asn} - ${h.asnOrg}`)));

  const healthyHopCount = session.hops.filter(h => h.status === 'optimal').length;
  const warningHopCount = session.hops.filter(h => h.status === 'warning' || h.status === 'rate-limited').length;
  const criticalHopCount = session.hops.filter(h => h.status === 'degraded' || h.status === 'unresponsive').length;

  return (
    <div className="space-y-6">
      {/* 1. Executive NOC Status Header Banner */}
      <div className="bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Live NOC Telemetry
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                session.overallLossPercent === 0 && session.mosScore >= 4.0
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                  : session.overallLossPercent > 5
                  ? 'bg-rose-500/15 text-rose-300 border-rose-400/30 animate-pulse'
                  : 'bg-amber-500/15 text-amber-300 border-amber-400/30'
              }`}>
                {session.overallLossPercent === 0 && session.mosScore >= 4.0
                  ? 'SLA Optimal (99.99%)'
                  : session.overallLossPercent > 5
                  ? 'SLA Breach Risk (Degraded)'
                  : 'Transit Warning'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cycle #{session.cycleCount} • {session.totalHops} Hops Resolved
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5 drop-shadow-sm">
              Path Diagnostics: <span className="text-cyan-300 font-mono">{session.target}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              End-to-end active probe telemetry from source edge across intermediate transit carriers to target destination.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onToggleLiveProbe}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg backdrop-blur-md ${
                isLiveProbing
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 hover:bg-rose-500/30'
                  : 'bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 hover:shadow-cyan-500/30'
              }`}
            >
              {isLiveProbing ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Prober
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Live Stream
                </>
              )}
            </button>

            <button
              onClick={onRunSingleCycle}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition backdrop-blur-md"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Single Poll
            </button>

            <button
              onClick={() => onNavigateTab('report')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 font-semibold text-xs transition backdrop-blur-md"
            >
              <FileText className="w-4 h-4" />
              Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Diagnostic Metrics Grid (6 Enterprise KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Mean RTT */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean RTT</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {session.overallAvgRtt} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Min: {session.overallMinRtt}ms</span>
            <span>Max: {session.overallMaxRtt}ms</span>
          </div>
        </div>

        {/* Packet Loss */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Packet Loss</span>
            <AlertTriangle className={`w-4 h-4 ${session.overallLossPercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono tracking-tight ${session.overallLossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
            {session.overallLossPercent}%
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {session.overallLossPercent === 0 ? 'Zero Drop SLA' : `${session.overallLossPercent}% at destination`}
          </div>
        </div>

        {/* Jitter */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PDV Jitter</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {session.overallJitter} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            RFC 3550 Variance
          </div>
        </div>

        {/* Voice MOS Score */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Voice MOS</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono tracking-tight ${
            session.mosScore >= 4.2 ? 'text-emerald-300' : session.mosScore >= 3.8 ? 'text-amber-300' : 'text-rose-300'
          }`}>
            {session.mosScore} <span className="text-xs font-normal text-slate-400">/ 4.5</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {session.mosScore >= 4.0 ? 'P.800 Toll Quality' : 'VoIP Impairment'}
          </div>
        </div>

        {/* Path Hops Health */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Node Health</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {healthyHopCount} <span className="text-xs font-normal text-slate-400">/ {session.totalHops}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{healthyHopCount} OK</span>
            {warningHopCount > 0 && <span className="text-amber-400">• {warningHopCount} Warn</span>}
            {criticalHopCount > 0 && <span className="text-rose-400">• {criticalHopCount} Crit</span>}
          </div>
        </div>

        {/* Path MTU & QoS */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-sm relative overflow-visible group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payload / MTU</span>
              <NetworkTooltip topic="frame_mtu" position="bottom" />
            </div>
            <div className="flex items-center gap-1">
              <NetworkTooltip topic="dscp_qos" position="bottom" />
              <ShieldCheck className="w-4 h-4 text-emerald-400 ml-1" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {session.packetSize} <span className="text-xs font-normal text-slate-400">B</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            MTU 1500 • DSCP: <strong className="text-cyan-300 font-mono">{session.dscp || 'CS0'}</strong>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Traceroute Path Preview Flow */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Live Route Topology & Hop Progression
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sequence of Layer-3 forwarding routers with individual RTT step-up and carrier tags
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('mtr')}
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition"
          >
            <span>Open Full Hop Diagnostic Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Hop Flow Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {session.hops.map((hop, idx) => {
            const isLast = idx === session.hops.length - 1;
            const isOptimal = hop.status === 'optimal';
            const isRateLtd = hop.status === 'rate-limited';
            const isDegraded = hop.status === 'degraded' || hop.status === 'unresponsive' || hop.lossPercent > 10;

            return (
              <div
                key={hop.hop}
                className={`p-3 rounded-xl border transition flex flex-col justify-between backdrop-blur-md relative ${
                  isDegraded
                    ? 'bg-rose-500/10 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : isRateLtd
                    ? 'bg-amber-500/10 border-amber-400/40'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-400/20">
                    #{hop.hop}
                  </span>
                  <span className={`text-[10px] font-bold ${isDegraded ? 'text-rose-300' : isRateLtd ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {hop.lossPercent > 0 ? `${hop.lossPercent}% Loss` : '0% Loss'}
                  </span>
                </div>

                <div className="font-mono text-xs font-bold text-white truncate" title={hop.ip}>
                  {hop.ip}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5" title={hop.host}>
                  {hop.host || 'Unknown Host'}
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    {hop.avgRtt} ms
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans truncate max-w-[50px]" title={hop.asnOrg}>
                    {hop.asnOrg?.split(' ')[0] || 'Transit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Operations Layout: Incidents Center & Fleet Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Center & Carrier Topology */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident & Anomaly Triage Center */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Active Path Anomaly Log & Triage</h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setIncidentFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    incidentFilter === 'all' ? 'bg-white/15 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({incidents.length})
                </button>
                <button
                  onClick={() => setIncidentFilter('critical')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    incidentFilter === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Critical ({incidents.filter(i => i.severity === 'CRITICAL').length})
                </button>
                <button
                  onClick={() => setIncidentFilter('warning')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    incidentFilter === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Warnings ({incidents.filter(i => i.severity === 'WARNING').length})
                </button>
              </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-2.5">
              {filteredIncidents.map(inc => (
                <div
                  key={inc.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 backdrop-blur-md ${
                    inc.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-400/30 text-rose-100'
                      : inc.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-400/30 text-amber-100'
                      : 'bg-emerald-500/10 border-emerald-400/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {inc.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
                      ) : inc.severity === 'WARNING' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-sans text-white">{inc.title}</span>
                        {inc.affectedHop && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white/10 border border-white/10 text-cyan-300">
                            Hop #{inc.affectedHop}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{inc.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{inc.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">{inc.metric}</span>
                    <span className="text-xs font-mono font-bold text-white">{inc.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous System & Peering Map */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-cyan-400" />
              Carrier & Autonomous System (ASN) Topology
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Autonomous networks participating in packet routing and border gateway transit:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {asns.length > 0 ? (
                asns.map((asnStr, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{asnStr.split(' - ')[0]}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{asnStr.split(' - ')[1] || 'Internal Transit'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20">
                      BGP Peer OK
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-3 bg-white/5 rounded-xl border border-white/10">
                  Private enterprise RFC 1918 internal routing topology.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Fleet Status & Tool Shortcuts */}
        <div className="space-y-6">
          {/* Subnet Matrix Quick View */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Subnet Matrix</h4>
              </div>
              <button
                onClick={() => onNavigateTab('subnet')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {subnet ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-mono">CIDR Block</span>
                  <span className="text-xs font-bold font-mono text-cyan-300">{subnet.cidr}</span>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400">Usable Addresses</span>
                  <span className="text-xs font-bold font-mono text-white">{subnet.usableHosts.toLocaleString()} IPs</span>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400">Active Utilization</span>
                  <span className="text-xs font-bold font-mono text-emerald-300">{subnet.utilizationPercent}%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No active subnet evaluated.</div>
            )}
          </div>

          {/* Scanner Fleet Summary */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Host Discovery</h4>
              </div>
              <button
                onClick={() => onNavigateTab('scanner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>Scan</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {scanResults && scanResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Scanned</span>
                  <span className="font-mono font-bold text-white">{scanResults.length} Hosts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400">Online & Responding</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {scanResults.filter(h => h.status === 'ONLINE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400">Latency Warnings</span>
                  <span className="font-mono font-bold text-amber-300">
                    {scanResults.filter(h => h.status === 'LATENCY_WARNING').length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Scanner ready to audit IP range.</div>
            )}
          </div>

          {/* Preset Target Quick Launch */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Target Benchmarks
            </h4>
            <div className="space-y-2">
              {PRESETS.slice(0, 4).map((p, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectPreset(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.target}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
