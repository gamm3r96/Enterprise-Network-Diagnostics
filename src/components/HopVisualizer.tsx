import React, { useState } from 'react';
import { HopDiagnostic } from '../types';
import { Server, Globe, Shield, ArrowRight, AlertTriangle, CheckCircle, Info, Zap, MapPin } from 'lucide-react';
import { getCountryFlagEmoji } from '../utils/geoIp';

interface HopVisualizerProps {
  hops: HopDiagnostic[];
  target: string;
  isLiveProbing: boolean;
}

export const HopVisualizer: React.FC<HopVisualizerProps> = ({
  hops,
  target,
  isLiveProbing
}) => {
  const [selectedHop, setSelectedHop] = useState<HopDiagnostic | null>(null);

  const getNodeIcon = (type: HopDiagnostic['nodeType']) => {
    switch (type) {
      case 'Edge': return Server;
      case 'Core': return Zap;
      case 'MPLS': return Shield;
      case 'Transit': return Globe;
      case 'IXP': return Zap;
      case 'Cloud Gateway': return Globe;
      case 'Destination': return Server;
      default: return Server;
    }
  };

  const getStatusBorder = (status: HopDiagnostic['status'], loss: number) => {
    if (status === 'rate-limited') return 'border-amber-400/40 bg-amber-500/10 text-amber-200 shadow-amber-950/30';
    if (loss > 5 || status === 'degraded') return 'border-rose-400/50 bg-rose-500/15 text-rose-200 shadow-rose-950/40';
    if (loss > 0 || status === 'warning') return 'border-amber-400/40 bg-amber-500/10 text-amber-200';
    return 'border-white/10 bg-white/5 text-slate-200 hover:border-white/25';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hop-by-Hop Network Topology Path
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-white/10 text-cyan-300 border border-white/10 backdrop-blur-sm">
              {hops.length} Hops
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive routing pipeline. Click any hop node to inspect carrier ASN, ISP, geographic location, and telemetry.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3.5 text-xs bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-slate-300 text-[11px]">Optimal (0% Loss)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="text-slate-300 text-[11px]">Rate-Limited (CoPP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]" />
            <span className="text-slate-300 text-[11px]">Packet Loss / Drop</span>
          </div>
        </div>
      </div>

      {/* Horizontal Topology Graph */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex items-center min-w-max gap-1">
          {hops.map((hop, idx) => {
            const Icon = getNodeIcon(hop.nodeType);
            const isLast = idx === hops.length - 1;
            const isSelected = selectedHop?.hop === hop.hop;
            const flagEmoji = getCountryFlagEmoji(hop.countryCode);
            const ispLabel = hop.isp || hop.asnOrg || 'Carrier Transit';

            return (
              <React.Fragment key={hop.hop}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedHop(hop)}
                  className={`cursor-pointer transition-all duration-200 p-3.5 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-between min-w-[145px] max-w-[155px] hover:scale-102 hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]' : getStatusBorder(hop.status, hop.lossPercent)
                  }`}
                >
                  {/* Top Bar: Hop # & Country Flag */}
                  <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded-md text-slate-300 border border-white/5">
                      #{hop.hop}
                    </span>
                    <span className="text-sm select-none" title={hop.country || 'Location'}>
                      {flagEmoji}
                    </span>
                  </div>

                  {/* Center Node Icon */}
                  <div className={`p-2.5 rounded-xl my-1.5 backdrop-blur-sm ${
                    hop.status === 'rate-limited' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                    hop.lossPercent > 5 ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                    'bg-white/10 text-cyan-300 border border-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Host/IP Info */}
                  <div className="w-full text-center my-1">
                    <div className="text-xs font-mono font-bold text-white truncate w-full" title={hop.ip}>
                      {hop.ip}
                    </div>
                    <div className="text-[10px] text-cyan-300/90 truncate w-full font-medium mt-0.5" title={ispLabel}>
                      {ispLabel}
                    </div>
                  </div>

                  {/* Latency & Loss Indicator */}
                  <div className="w-full mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-center text-xs">
                    <div>
                      <div className="text-[9px] text-slate-400 leading-none">AVG RTT</div>
                      <div className="font-mono font-bold text-slate-100 text-[11px] mt-1">
                        {hop.avgRtt} ms
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 leading-none">LOSS</div>
                      <div className={`font-mono font-bold text-[11px] mt-1 ${
                        hop.status === 'rate-limited' ? 'text-amber-300' :
                        hop.lossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {hop.lossPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {hop.status === 'rate-limited' && (
                    <span className="mt-2 w-full text-center text-[9px] bg-amber-500/20 text-amber-200 border border-amber-400/30 px-1 py-0.5 rounded-md font-semibold truncate backdrop-blur-sm">
                      CoPP Rate-Ltd
                    </span>
                  )}
                  {hop.lossPercent > 5 && hop.status !== 'rate-limited' && (
                    <span className="mt-2 w-full text-center text-[9px] bg-rose-500/20 text-rose-200 border border-rose-400/30 px-1 py-0.5 rounded-md font-semibold truncate backdrop-blur-sm">
                      Forwarding Loss
                    </span>
                  )}
                  {hop.degradationDelta > 30 && (
                    <span className="mt-2 w-full text-center text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-1 py-0.5 rounded-md font-semibold truncate backdrop-blur-sm">
                      +{hop.degradationDelta}ms Jump
                    </span>
                  )}
                </div>

                {/* Arrow Connector with Latency Delta */}
                {!isLast && (
                  <div className="flex flex-col items-center px-1">
                    <div className="text-[9px] font-mono text-slate-400 mb-0.5">
                      {hops[idx + 1].degradationDelta > 0 ? `+${hops[idx + 1].degradationDelta}ms` : '0ms'}
                    </div>
                    <div className="flex items-center">
                      <div className={`h-0.5 w-6 ${
                        hops[idx + 1].lossPercent > 5 ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]' : 'bg-slate-700'
                      }`} />
                      <ArrowRight className={`w-3.5 h-3.5 -ml-1 ${
                        hops[idx + 1].lossPercent > 5 ? 'text-rose-400' : 'text-slate-500'
                      }`} />
                    </div>
                    {isLiveProbing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mt-1 shadow-[0_0_6px_#22d3ee]" />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Hop Detail Drawer / Popover - Frosted Glass */}
      {selectedHop && (
        <div className="mt-5 p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 animate-in fade-in slide-in-from-top-2 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-xl backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                {getCountryFlagEmoji(selectedHop.countryCode)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono">{selectedHop.ip}</h3>
                  <span className="text-xs text-slate-400">({selectedHop.host || 'Unknown FQDN'})</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/10 text-slate-300 font-semibold border border-white/10 backdrop-blur-sm">
                    {selectedHop.nodeType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-slate-200">{selectedHop.isp || selectedHop.asnOrg || 'ISP Provider'}</span>
                    <span className="font-mono text-cyan-300">({selectedHop.asn || 'Private ASN'})</span>
                  </span>
                  {selectedHop.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {selectedHop.city ? `${selectedHop.city}, ` : ''}{selectedHop.country}
                    </span>
                  )}
                  {selectedHop.mplsLabel && (
                    <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                      <Shield className="w-3.5 h-3.5" />
                      {selectedHop.mplsLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedHop(null)}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md transition shadow-sm"
            >
              Close
            </button>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-4 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Loss %</span>
              <p className={`text-sm font-mono font-bold mt-0.5 ${selectedHop.lossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {selectedHop.lossPercent}%
              </p>
              <span className="text-[9px] text-slate-400">{selectedHop.sentCount - selectedHop.recvCount} dropped</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg RTT</span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{selectedHop.avgRtt} ms</p>
              <span className="text-[9px] text-slate-400">Last: {selectedHop.lastRtt} ms</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Min / Max</span>
              <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                {selectedHop.bestRtt} / {selectedHop.worstRtt}
              </p>
              <span className="text-[9px] text-slate-400">ms range</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Jitter (RFC 3393)</span>
              <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{selectedHop.jitter} ms</p>
              <span className="text-[9px] text-slate-400">Mean variance</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Std Deviation</span>
              <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">{selectedHop.stdDevRtt} ms</p>
              <span className="text-[9px] text-slate-400">σ RTT spread</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Path MTU</span>
              <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">{selectedHop.mtu} B</p>
              <span className="text-[9px] text-slate-400">Standard Frame</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Step-Up Delta</span>
              <p className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                +{selectedHop.degradationDelta} ms
              </p>
              <span className="text-[9px] text-slate-400">from prev hop</span>
            </div>
          </div>

          {/* Diagnostic Assessment Message */}
          <div className="mt-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5 text-xs">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">
              Diagnostic Status: <span className="text-white font-semibold">{selectedHop.statusReason}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

