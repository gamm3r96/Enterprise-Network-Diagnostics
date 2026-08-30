import React, { useState } from 'react';
import { HopDiagnostic } from '../types';
import { 
  Shield, 
  Globe, 
  Check, 
  Copy, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Minimize2, 
  Maximize2,
  MapPin,
  Server,
  Radio,
  ExternalLink,
  Sparkles,
  Info,
  X,
  Navigation as NavIcon
} from 'lucide-react';
import { getCountryFlagEmoji, fetchIpGeoDetails, isPrivateIp } from '../utils/geoIp';

interface HopTableProps {
  hops: HopDiagnostic[];
  probeCount: number;
  onEnrichHops?: (enriched: HopDiagnostic[]) => void;
}

export const HopTable: React.FC<HopTableProps> = ({ hops, probeCount, onEnrichHops }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'loss' | 'latency' | 'ratelimited' | 'public' | 'private'>('all');
  const [isCompact, setIsCompact] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [selectedGeoHop, setSelectedGeoHop] = useState<HopDiagnostic | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);

  const copyToClipboard述 = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const handleCopyPathGeo = () => {
    const summary = hops.map(h => {
      const flag = getCountryFlagEmoji(h.countryCode);
      const ispName = h.isp || h.asnOrg || 'Private Enterprise';
      const loc = h.city ? `${h.city}, ${h.countryCode || h.country || 'GL'}` : (h.country || 'Private');
      return `Hop ${h.hop}: ${h.ip} [${flag} ${loc}] - ${ispName} (${h.asn || 'LAN'}) | ${h.avgRtt}ms (Loss: ${h.lossPercent}%)`;
    }).join('\n');

    navigator.clipboard.writeText(summary);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 2000);
  };

  const handleEnrichAllHops = async () => {
    setIsEnriching(true);
    try {
      const enrichedHops = await Promise.all(
        hops.map(async (h) => {
          if (h.ip === '*' || !h.ip) return h;
          try {
            const geo = await fetchIpGeoDetails(h.ip);
            return {
              ...h,
              asn: geo.asn || h.asn,
              asnOrg: geo.asnOrg || h.asnOrg,
              isp: geo.isp || h.isp || geo.asnOrg,
              city: geo.city || h.city,
              region: geo.region || h.region,
              country: geo.country || h.country,
              countryCode: geo.countryCode || h.countryCode,
              latitude: geo.latitude ?? h.latitude,
              longitude: geo.longitude ?? h.longitude,
              timezone: geo.timezone || h.timezone,
              isPrivate: geo.isPrivate ?? isPrivateIp(h.ip)
            };
          } catch {
            return h;
          }
        })
      );
      if (onEnrichHops) {
        onEnrichHops(enrichedHops);
      }
    } finally {
      setIsEnriching(false);
    }
  };

  const filteredHops = hops.filter(hop => {
    const q = filterText.toLowerCase().trim();
    const isPriv = hop.isPrivate ?? isPrivateIp(hop.ip);

    const matchesText = 
      !q ||
      hop.ip.toLowerCase().includes(q) ||
      hop.host.toLowerCase().includes(q) ||
      (hop.asn && hop.asn.toLowerCase().includes(q)) ||
      (hop.asnOrg && hop.asnOrg.toLowerCase().includes(q)) ||
      (hop.isp && hop.isp.toLowerCase().includes(q)) ||
      (hop.country && hop.country.toLowerCase().includes(q)) ||
      (hop.countryCode && hop.countryCode.toLowerCase().includes(q)) ||
      (hop.city && hop.city.toLowerCase().includes(q)) ||
      (hop.region && hop.region.toLowerCase().includes(q));

    if (!matchesText) return false;

    if (statusFilter === 'loss') return hop.lossPercent > 0 && hop.status !== 'rate-limited';
    if (statusFilter === 'latency') return hop.avgRtt > 30 || hop.degradationDelta > 20;
    if (statusFilter === 'ratelimited') return hop.status === 'rate-limited';
    if (statusFilter === 'public') return !isPriv && hop.ip !== '*';
    if (statusFilter === 'private') return isPriv;
    return true;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
      {/* Table Header & Filtering Bar */}
      <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Hop-by-Hop MTR & Geo-IP Telemetry Matrix</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Geo-IP & ISP Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time hop latency, jitter deviation, geographic country locations, and Carrier ISP / Autonomous System resolutions.
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
              All ({hops.length})
            </button>
            <button
              onClick={() => setStatusFilter('loss')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'loss' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Loss ({hops.filter(h => h.lossPercent > 0 && h.status !== 'rate-limited').length})
            </button>
            <button
              onClick={() => setStatusFilter('latency')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'latency' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latency ({hops.filter(h => h.avgRtt > 30 || h.degradationDelta > 20).length})
            </button>
            <button
              onClick={() => setStatusFilter('public')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'public' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show only Public WAN Carrier Hops"
            >
              WAN ({hops.filter(h => !(h.isPrivate ?? isPrivateIp(h.ip)) && h.ip !== '*').length})
            </button>
            <button
              onClick={() => setStatusFilter('ratelimited')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'ratelimited' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rate-Ltd ({hops.filter(h => h.status === 'rate-limited').length})
            </button>
          </div>

          {/* Enrich Geo-IP Action */}
          <button
            onClick={handleEnrichAllHops}
            disabled={isEnriching}
            title="Perform fresh Geo-IP and ISP lookup for all hops in the path"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-xs font-semibold transition backdrop-blur-md shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 ${isEnriching ? 'animate-spin' : ''}`} />
            <span>{isEnriching ? 'Enriching...' : 'Enrich Geo-IP'}</span>
          </button>

          {/* Copy Path Summary */}
          <button
            onClick={handleCopyPathGeo}
            title="Copy hop-by-hop Geo & ISP path summary to clipboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/30 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition backdrop-blur-md"
          >
            {pathCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{pathCopied ? 'Path Copied!' : 'Copy Path'}</span>
          </button>

          {/* Compact Mode Toggle */}
          <button
            onClick={() => setIsCompact(prev => !prev)}
            title={isCompact ? "Switch to Expanded View" : "Switch to Compact Dense View"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition backdrop-blur-md ${
              isCompact
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40 shadow-sm shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5 text-cyan-300" /> : <Minimize2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCompact ? 'Compact: ON' : 'Compact'}</span>
          </button>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Filter IP, ISP, Country, ASN..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-black/30 text-xs text-slate-100 placeholder-slate-400 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-md w-44 sm:w-56 shadow-inner"
          />
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/40 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <th className={`${isCompact ? 'py-2 px-2 w-9' : 'py-3 px-3.5 w-12'} text-center`}>#</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3 px-3.5'}>Node IP & Hostname</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3 px-3.5'}>Geo Location & Country</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3 px-3.5'}>Carrier ISP & Autonomous System</th>
              <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3.5'} text-center`}>Loss %</th>
              {!isCompact && <th className="py-3 px-3.5 text-center">Snt/Rcv</th>}
              <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3.5'} text-right`}>Last</th>
              <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3.5'} text-right`}>Avg RTT</th>
              {!isCompact && <th className="py-3 px-3.5 text-right">Min / Max</th>}
              <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3.5'} text-right`}>Jitter</th>
              {!isCompact && <th className="py-3 px-3.5 text-right">StdDev</th>}
              {!isCompact && <th className="py-3 px-3.5 text-center">RTT History</th>}
              <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3.5'} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredHops.map((hop) => {
              const hasLoss述 = hop.lossPercent > 0;
              const isRateLimited = hop.status === 'rate-limited';
              const isCritical = hop.lossPercent > 10;
              const flagEmoji = getCountryFlagEmoji(hop.countryCode);
              const isPrivate = hop.isPrivate ?? isPrivateIp(hop.ip);
              const ispDisplay = hop.isp || hop.asnOrg || (isPrivate ? 'Internal Private LAN' : 'Tier-1 Backbone');
              const countryDisplay = hop.country || (isPrivate ? 'Private Network' : 'Global Transit');

              return (
                <tr
                  key={hop.hop}
                  className={`hover:bg-white/5 transition duration-150 group ${
                    isRateLimited ? 'bg-amber-500/5' :
                    isCritical ? 'bg-rose-500/10' :
                    hasLoss述 ? 'bg-rose-500/5' : ''
                  }`}
                >
                  {/* Hop # */}
                  <td className={`${isCompact ? 'py-1.5 px-2' : 'py-3 px-3.5'} text-center font-bold text-slate-400`}>
                    <span className={`rounded-md bg-white/5 text-slate-300 border border-white/5 ${isCompact ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
                      {hop.hop}
                    </span>
                  </td>

                  {/* IP & Hostname */}
                  <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-3.5'}>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-white font-mono ${isCompact ? 'text-[11px]' : 'text-[12px]'}`}>{hop.ip}</span>
                      <button
                        onClick={() => copyToClipboard述(hop.ip)}
                        title="Copy IP"
                        className="text-slate-400 hover:text-cyan-300 p-0.5 transition"
                      >
                        {copiedIp === hop.ip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      {isPrivate && (
                        <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          LAN
                        </span>
                      )}
                      {hop.mplsLabel && (
                        <span className="text-[9px] text-purple-300 font-mono px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/30">
                          {hop.mplsLabel}
                        </span>
                      )}
                    </div>
                    <div className={`text-slate-400 font-sans truncate ${isCompact ? 'text-[10px] max-w-[140px]' : 'text-[11px] max-w-[190px]'}`} title={hop.host}>
                      {hop.host || 'Unknown Host'}
                    </div>
                  </td>

                  {/* Geo Location & Country */}
                  <td className={`${isCompact ? 'py-1.5 px-2.5' : 'py-3 px-3.5'} font-sans`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base select-none flex-shrink-0" title={countryDisplay}>
                        {flagEmoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold text-slate-200 truncate ${isCompact ? 'text-[11px] max-w-[110px]' : 'text-xs max-w-[140px]'}`} title={countryDisplay}>
                            {countryDisplay}
                          </span>
                          {hop.countryCode && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-cyan-300 font-bold border border-white/10 flex-shrink-0">
                              {hop.countryCode}
                            </span>
                          )}
                        </div>
                        <div className={`text-slate-400 truncate flex items-center gap-1 ${isCompact ? 'text-[9px] max-w-[120px]' : 'text-[10px] mt-0.5 max-w-[150px]'}`}>
                          <MapPin className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
                          <span>{hop.city ? `${hop.city}${hop.region ? `, ${hop.region}` : ''}` : (isPrivate ? 'Local Intranet' : 'Global Transit')}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Carrier ISP & Autonomous System */}
                  <td className={`${isCompact ? 'py-1.5 px-2.5' : 'py-3 px-3.5'} font-sans`}>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Server className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-indigo-400 flex-shrink-0`} />
                          <span className={`font-semibold text-slate-100 truncate ${isCompact ? 'text-[11px] max-w-[130px]' : 'text-xs max-w-[180px]'}`} title={ispDisplay}>
                            {ispDisplay}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`font-mono text-cyan-300 font-bold ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
                            {hop.asn || (isPrivate ? 'Private AS' : 'AS-Transit')}
                          </span>
                          {hop.nodeType && !isCompact && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/5">
                              {hop.nodeType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Popover Trigger */}
                      <button
                        onClick={() => setSelectedGeoHop(hop)}
                        title="View detailed Geo-IP, ISP & coordinate analysis"
                        className="opacity-60 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-cyan-300 transition flex-shrink-0"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Loss % */}
                  <td className={`${isCompact ? 'py-1.5 px-2' : 'py-3 px-3.5'} text-center`}>
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${isCompact ? 'text-[11px]' : 'text-xs'} ${
                        isRateLimited ? 'text-amber-300' :
                        isCritical ? 'text-rose-300' :
                        hasLoss述 ? 'text-rose-200' : 'text-emerald-300'
                      }`}>
                        {hop.lossPercent}%
                      </span>
                      <div className={`${isCompact ? 'w-8 h-1' : 'w-12 h-1.5'} bg-black/40 rounded-full overflow-hidden mt-0.5 border border-white/5`}>
                        <div
                          className={`h-full ${
                            isRateLimited ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' :
                            hasLoss述 ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, hop.lossPercent))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Sent / Recv */}
                  {!isCompact && (
                    <td className="py-3 px-3.5 text-center text-slate-300 text-[11px]">
                      {hop.sentCount} / <span className={hop.recvCount < hop.sentCount ? 'text-rose-300 font-bold' : 'text-slate-300'}>{hop.recvCount}</span>
                    </td>
                  )}

                  {/* Last RTT */}
                  <td className={`${isCompact ? 'py-1.5 px-2 text-[11px]' : 'py-3 px-3.5'} text-right font-medium text-slate-200`}>
                    {hop.lastRtt} ms
                  </td>

                  {/* Avg RTT */}
                  <td className={`${isCompact ? 'py-1.5 px-2' : 'py-3 px-3.5'} text-right`}>
                    <span className={`font-bold ${isCompact ? 'text-[11px]' : 'text-xs'} ${
                      hop.avgRtt > 80 ? 'text-amber-300' :
                      hop.avgRtt > 30 ? 'text-cyan-300' : 'text-emerald-300'
                    }`}>
                      {hop.avgRtt} ms
                    </span>
                    {hop.degradationDelta > 20 && (
                      <div className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} text-cyan-400 font-sans`}>
                        +{hop.degradationDelta}ms
                      </div>
                    )}
                  </td>

                  {/* Min / Max */}
                  {!isCompact && (
                    <td className="py-3 px-3.5 text-right text-slate-400 text-[11px]">
                      <span className="text-emerald-300">{hop.bestRtt}</span> / <span className="text-amber-300">{hop.worstRtt}</span>
                    </td>
                  )}

                  {/* Jitter */}
                  <td className={`${isCompact ? 'py-1.5 px-2 text-[11px]' : 'py-3 px-3.5'} text-right`}>
                    <span className={`font-medium ${hop.jitter > 10 ? 'text-amber-300' : 'text-slate-300'}`}>
                      {hop.jitter} ms
                    </span>
                  </td>

                  {/* StdDev */}
                  {!isCompact && (
                    <td className="py-3 px-3.5 text-right text-slate-400 text-[11px]">
                      ±{hop.stdDevRtt}
                    </td>
                  )}

                  {/* Sparkline History Visual */}
                  {!isCompact && (
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
                  )}

                  {/* Status Badge */}
                  <td className={`${isCompact ? 'py-1.5 px-2' : 'py-3 px-3.5'} text-center font-sans`}>
                    {isRateLimited ? (
                      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 backdrop-blur-sm ${isCompact ? 'px-2 py-0.2 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`} title="ICMP Rate Limited by Router Control Plane">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                        {isCompact ? 'Rate-Ltd' : 'CoPP Rate-Ltd'}
                      </span>
                    ) : isCritical ? (
                      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/40 backdrop-blur-sm animate-pulse ${isCompact ? 'px-2 py-0.2 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`}>
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                        {isCompact ? 'Critical' : 'High Loss'}
                      </span>
                    ) : hasLoss述 ? (
                      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 backdrop-blur-sm ${isCompact ? 'px-2 py-0.2 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`}>
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                        {isCompact ? 'Degraded' : 'Degraded'}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm ${isCompact ? 'px-2 py-0.2 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`}>
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
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

      {/* Hop Geo-IP & ISP Detail Inspection Modal */}
      {selectedGeoHop && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedGeoHop(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shadow-inner">
                  {getCountryFlagEmoji(selectedGeoHop.countryCode)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">
                      Hop {selectedGeoHop.hop} Geo-IP & ISP Telemetry
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {selectedGeoHop.nodeType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedGeoHop.ip} ({selectedGeoHop.host || 'Unknown Host'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGeoHop(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Country & Location */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Geographic Location</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Country</span>
                    <span className="text-slate-100 font-semibold text-xs flex items-center gap-1 mt-0.5">
                      <span>{selectedGeoHop.country || (selectedGeoHop.isPrivate ? 'Private Network' : 'Global Transit')}</span>
                      {selectedGeoHop.countryCode && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 font-mono text-cyan-300">
                          {selectedGeoHop.countryCode}
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City / Metro Region</span>
                    <span className="text-slate-100 font-semibold text-xs block mt-0.5">
                      {selectedGeoHop.city ? `${selectedGeoHop.city}${selectedGeoHop.region ? `, ${selectedGeoHop.region}` : ''}` : (selectedGeoHop.isPrivate ? 'Local Intranet' : 'Regional Gateway')}
                    </span>
                  </div>
                  {selectedGeoHop.latitude !== undefined && selectedGeoHop.longitude !== undefined && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Geo Coordinates</span>
                      <span className="text-cyan-300 font-mono text-[11px] block mt-0.5">
                        {selectedGeoHop.latitude.toFixed(4)}°, {selectedGeoHop.longitude.toFixed(4)}°
                      </span>
                    </div>
                  )}
                  {selectedGeoHop.timezone && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Timezone</span>
                      <span className="text-slate-200 font-mono text-[11px] block mt-0.5">
                        {selectedGeoHop.timezone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ISP & Autonomous System */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Carrier ISP & Autonomous System</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Internet Service Provider (ISP)</span>
                    <span className="text-slate-100 font-semibold text-xs block mt-0.5">
                      {selectedGeoHop.isp || selectedGeoHop.asnOrg || 'Enterprise Transit Carrier'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Origin ASN</span>
                    <span className="text-cyan-300 font-mono font-bold text-xs block mt-0.5">
                      {selectedGeoHop.asn || (selectedGeoHop.isPrivate ? 'AS64512 (Private)' : 'AS-Transit')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Autonomous System Organization</span>
                    <span className="text-slate-300 text-[11px] block mt-0.5">
                      {selectedGeoHop.asnOrg || selectedGeoHop.isp || 'Global IP Transit Provider'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Path Telemetry Summary */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-cyan-300 font-bold text-xs block">
                    RTT: {selectedGeoHop.avgRtt} ms • Jitter: {selectedGeoHop.jitter} ms
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Packet Loss: {selectedGeoHop.lossPercent}% ({selectedGeoHop.recvCount}/{selectedGeoHop.sentCount} probes)
                  </span>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard述(selectedGeoHop.ip);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-bold transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy IP</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedGeoHop(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
