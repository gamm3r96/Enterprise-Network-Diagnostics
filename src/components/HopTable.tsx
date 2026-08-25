import React, { useState } from 'react';
import { HopDiagnostic } from '../types';
import { Shield, Globe, Server, Check, Copy, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface HopTableProps {
  hops: HopDiagnostic[];
  probeCount: number;
}

export const HopTable: React.FC<HopTableProps> = ({ hops, probeCount }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'loss' | 'latency' | 'ratelimited'>('all');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const copyToClipboard = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const filteredHops = hops.filter(hop => {
    const matchesText = 
      hop.ip.toLowerCase().includes(filterText.toLowerCase()) ||
      hop.host.toLowerCase().includes(filterText.toLowerCase()) ||
      (hop.asn && hop.asn.toLowerCase().includes(filterText.toLowerCase())) ||
      (hop.asnOrg && hop.asnOrg.toLowerCase().includes(filterText.toLowerCase()));

    if (!matchesText) return false;

    if (statusFilter === 'loss') return hop.lossPercent > 0 && hop.status !== 'rate-limited';
    if (statusFilter === 'latency') return hop.avgRtt > 30 || hop.degradationDelta > 20;
    if (statusFilter === 'ratelimited') return hop.status === 'rate-limited';
    return true;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
      {/* Table Header & Filtering Bar */}
      <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Hop-by-Hop MTR Telemetry Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-metric analysis showing RTT percentiles, jitter standard deviation, and carrier AS transits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter Chips */}
          <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 backdrop-blur-md text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'all' ? 'bg-white/15 text-cyan-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Hops ({hops.length})
            </button>
            <button
              onClick={() => setStatusFilter('loss')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'loss' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Loss ({hops.filter(h => h.lossPercent > 0 && h.status !== 'rate-limited').length})
            </button>
            <button
              onClick={() => setStatusFilter('latency')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'latency' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Elevated RTT ({hops.filter(h => h.avgRtt > 30 || h.degradationDelta > 20).length})
            </button>
            <button
              onClick={() => setStatusFilter('ratelimited')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'ratelimited' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rate-Ltd ({hops.filter(h => h.status === 'rate-limited').length})
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Filter by IP, Host, ASN..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-black/30 text-xs text-slate-100 placeholder-slate-400 border border-white/10 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-md w-48 shadow-inner"
          />
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/40 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3.5 text-center w-12">#</th>
              <th className="py-3 px-3.5">Node Address / FQDN</th>
              <th className="py-3 px-3.5">Carrier ASN & Geo</th>
              <th className="py-3 px-3.5 text-center">Loss %</th>
              <th className="py-3 px-3.5 text-center">Snt/Rcv</th>
              <th className="py-3 px-3.5 text-right">Last</th>
              <th className="py-3 px-3.5 text-right">Avg RTT</th>
              <th className="py-3 px-3.5 text-right">Min / Max</th>
              <th className="py-3 px-3.5 text-right">Jitter</th>
              <th className="py-3 px-3.5 text-right">StdDev</th>
              <th className="py-3 px-3.5 text-center">RTT History</th>
              <th className="py-3 px-3.5 text-center">Diagnostic Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredHops.map((hop) => {
              const hasLoss = hop.lossPercent > 0;
              const isRateLimited = hop.status === 'rate-limited';
              const isCritical = hop.lossPercent > 10;

              return (
                <tr
                  key={hop.hop}
                  className={`hover:bg-white/5 transition duration-150 ${
                    isRateLimited ? 'bg-amber-500/5' :
                    isCritical ? 'bg-rose-500/10' :
                    hasLoss ? 'bg-rose-500/5' : ''
                  }`}
                >
                  {/* Hop # */}
                  <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-slate-300 border border-white/5">
                      {hop.hop}
                    </span>
                  </td>

                  {/* IP & Hostname */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white font-mono text-[12px]">{hop.ip}</span>
                      <button
                        onClick={() => copyToClipboard(hop.ip)}
                        title="Copy IP"
                        className="text-slate-400 hover:text-cyan-300 p-0.5"
                      >
                        {copiedIp === hop.ip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans truncate max-w-[200px]" title={hop.host}>
                      {hop.host || 'Unknown Host'}
                    </div>
                    {hop.mplsLabel && (
                      <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        {hop.mplsLabel}
                      </span>
                    )}
                  </td>

                  {/* ASN & Geo */}
                  <td className="py-3 px-3.5 font-sans">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                      <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate max-w-[170px]" title={`${hop.asn} - ${hop.asnOrg}`}>
                        {hop.asn ? `${hop.asn} (${hop.asnOrg})` : 'Private Enterprise'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {hop.city ? `${hop.city}, ${hop.countryCode || hop.country}` : 'Local Intranet'}
                    </div>
                  </td>

                  {/* Loss % */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold text-xs ${
                        isRateLimited ? 'text-amber-300' :
                        isCritical ? 'text-rose-300' :
                        hasLoss ? 'text-rose-200' : 'text-emerald-300'
                      }`}>
                        {hop.lossPercent}%
                      </span>
                      <div className="w-12 bg-black/40 h-1.5 rounded-full overflow-hidden mt-1 border border-white/5">
                        <div
                          className={`h-full ${
                            isRateLimited ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' :
                            hasLoss ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, hop.lossPercent))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Sent / Recv */}
                  <td className="py-3 px-3.5 text-center text-slate-300 text-[11px]">
                    {hop.sentCount} / <span className={hop.recvCount < hop.sentCount ? 'text-rose-300 font-bold' : 'text-slate-300'}>{hop.recvCount}</span>
                  </td>

                  {/* Last RTT */}
                  <td className="py-3 px-3.5 text-right font-medium text-slate-200">
                    {hop.lastRtt} ms
                  </td>

                  {/* Avg RTT */}
                  <td className="py-3 px-3.5 text-right">
                    <span className={`font-bold text-xs ${
                      hop.avgRtt > 80 ? 'text-amber-300' :
                      hop.avgRtt > 30 ? 'text-cyan-300' : 'text-emerald-300'
                    }`}>
                      {hop.avgRtt} ms
                    </span>
                    {hop.degradationDelta > 20 && (
                      <div className="text-[9px] text-cyan-400 font-sans">
                        +{hop.degradationDelta}ms
                      </div>
                    )}
                  </td>

                  {/* Min / Max */}
                  <td className="py-3 px-3.5 text-right text-slate-400 text-[11px]">
                    <span className="text-emerald-300">{hop.bestRtt}</span> / <span className="text-amber-300">{hop.worstRtt}</span>
                  </td>

                  {/* Jitter */}
                  <td className="py-3 px-3.5 text-right">
                    <span className={`font-medium ${hop.jitter > 10 ? 'text-amber-300' : 'text-slate-300'}`}>
                      {hop.jitter} ms
                    </span>
                  </td>

                  {/* StdDev */}
                  <td className="py-3 px-3.5 text-right text-slate-400 text-[11px]">
                    ±{hop.stdDevRtt}
                  </td>

                  {/* Sparkline History Visual */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-end justify-center gap-0.5 h-6 w-24 mx-auto">
                      {hop.rttHistory.slice(-8).map((val, hIdx) => {
                        const maxVal = Math.max(...hop.rttHistory, 10);
                        const heightPercent = Math.min(100, Math.max(15, (val / maxVal) * 100));
                        return (
                          <div
                            key={hIdx}
                            className={`w-2 rounded-t-sm transition-all ${
                              val > 50 ? 'bg-amber-400/90' : 'bg-cyan-400/80 shadow-[0_0_4px_rgba(6,182,212,0.4)]'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                            title={`Probe ${hIdx + 1}: ${val}ms`}
                          />
                        );
                      })}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3.5 text-center font-sans">
                    {isRateLimited ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 backdrop-blur-sm" title="ICMP Rate Limited by Router Control Plane">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        CoPP Rate-Ltd
                      </span>
                    ) : isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/40 backdrop-blur-sm animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        High Loss
                      </span>
                    ) : hasLoss ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 backdrop-blur-sm">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Degraded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Optimal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
