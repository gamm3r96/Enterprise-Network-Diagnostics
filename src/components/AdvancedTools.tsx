import React, { useState, useEffect } from 'react';
import {
  AdvancedToolId,
  DnsLookupResult,
  TcpThroughputResult,
  MtuOverheadResult,
  BgpLookingGlassResult,
  VoipEModelResult,
  Ipv6AnalysisResult
} from '../types';
import {
  performLiveDnsLookup,
  calculateTcpThroughput,
  calculateMtuOverhead,
  ENCAPSULATION_PROFILES,
  lookupBgpLookingGlass,
  calculateVoipEModel,
  VOIP_CODEC_PROFILES,
  analyzeIpv6Address
} from '../utils/advancedToolsCalc';
import {
  Globe,
  Gauge,
  Layers,
  Share2,
  PhoneCall,
  Binary,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Server,
  Zap,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface AdvancedToolsProps {
  initialTarget?: string;
  onTraceTarget?: (ip: string) => void;
}

export const AdvancedTools: React.FC<AdvancedToolsProps> = ({
  initialTarget = '8.8.8.8',
  onTraceTarget
}) => {
  const [activeSubTool, setActiveSubTool] = useState<AdvancedToolId>('dns');

  // -------------------------------------------------------------
  // Tool 1: DNS State
  // -------------------------------------------------------------
  const [dnsDomain, setDnsDomain] = useState('google.com');
  const [dnsRecordType, setDnsRecordType] = useState('A');
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState<DnsLookupResult | null>(null);

  // -------------------------------------------------------------
  // Tool 2: TCP Mathis & BDP State
  // -------------------------------------------------------------
  const [tcpCapacityMbps, setTcpCapacityMbps] = useState(1000);
  const [tcpRttMs, setTcpRttMs] = useState(45);
  const [tcpLossPct, setTcpLossPct] = useState(0.5);
  const [tcpMssBytes, setTcpMssBytes] = useState(1460);
  const [tcpResult, setTcpResult] = useState<TcpThroughputResult>(() =>
    calculateTcpThroughput(1000, 45, 0.5, 1460)
  );

  // -------------------------------------------------------------
  // Tool 3: MTU / MSS Overhead State
  // -------------------------------------------------------------
  const [encapProfile, setEncapProfile] = useState('wireguard_vpn');
  const [customBaseMtu, setCustomBaseMtu] = useState(1500);
  const [enableDfBit, setEnableDfBit] = useState(true);
  const [mtuResult, setMtuResult] = useState<MtuOverheadResult>(() =>
    calculateMtuOverhead('wireguard_vpn', 1500, true)
  );

  // -------------------------------------------------------------
  // Tool 4: BGP Looking Glass State
  // -------------------------------------------------------------
  const [bgpPrefix, setBgpPrefix] = useState('8.8.8.0/24');
  const [bgpResult, setBgpResult] = useState<BgpLookingGlassResult>(() =>
    lookupBgpLookingGlass('8.8.8.0/24')
  );

  // -------------------------------------------------------------
  // Tool 5: VoIP E-Model MOS State
  // -------------------------------------------------------------
  const [voipCodec, setVoipCodec] = useState('g711u');
  const [voipOneWayDelay, setVoipOneWayDelay] = useState(30);
  const [voipJitter, setVoipJitter] = useState(6.0);
  const [voipLoss, setVoipLoss] = useState(0.8);
  const [voipResult, setVoipResult] = useState<VoipEModelResult>(() =>
    calculateVoipEModel('g711u', 30, 6.0, 0.8)
  );

  // -------------------------------------------------------------
  // Tool 6: IPv6 Subnetting State
  // -------------------------------------------------------------
  const [ipv6Input, setIpv6Input] = useState('2001:db8:85a3::8a2e:370:7334/64');
  const [ipv6Mac, setIpv6Mac] = useState('00:1A:2B:3C:4D:5E');
  const [ipv6Result, setIpv6Result] = useState<Ipv6AnalysisResult>(() =>
    analyzeIpv6Address('2001:db8:85a3::8a2e:370:7334/64', '00:1A:2B:3C:4D:5E')
  );

  // Copied toast state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run initial DNS lookup
  useEffect(() => {
    handleRunDns();
  }, []);

  const handleRunDns = async (overrideDomain?: string, overrideType?: string) => {
    const domainToQuery = overrideDomain || dnsDomain;
    const typeToQuery = overrideType || dnsRecordType;
    setDnsLoading(true);
    try {
      const res = await performLiveDnsLookup(domainToQuery, typeToQuery);
      setDnsResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setDnsLoading(false);
    }
  };

  // Re-calculate TCP throughput
  const updateTcp = (cap: number, rtt: number, loss: number, mss: number) => {
    setTcpCapacityMbps(cap);
    setTcpRttMs(rtt);
    setTcpLossPct(loss);
    setTcpMssBytes(mss);
    setTcpResult(calculateTcpThroughput(cap, rtt, loss, mss));
  };

  // Re-calculate MTU
  const updateMtu = (profile: string, mtu: number, df: boolean) => {
    setEncapProfile(profile);
    setCustomBaseMtu(mtu);
    setEnableDfBit(df);
    setMtuResult(calculateMtuOverhead(profile, mtu, df));
  };

  // Re-calculate BGP
  const updateBgp = (prefix: string) => {
    setBgpPrefix(prefix);
    setBgpResult(lookupBgpLookingGlass(prefix));
  };

  // Re-calculate VoIP
  const updateVoip = (codec: string, delay: number, jitter: number, loss: number) => {
    setVoipCodec(codec);
    setVoipOneWayDelay(delay);
    setVoipJitter(jitter);
    setVoipLoss(loss);
    setVoipResult(calculateVoipEModel(codec, delay, jitter, loss));
  };

  // Re-calculate IPv6
  const updateIpv6 = (ip: string, mac: string) => {
    setIpv6Input(ip);
    setIpv6Mac(mac);
    setIpv6Result(analyzeIpv6Address(ip, mac));
  };

  const subTools = [
    { id: 'dns' as AdvancedToolId, label: 'DNS & DoH Multi-Resolver', icon: Globe, desc: 'Live DNS-over-HTTPS & Global Resolvers' },
    { id: 'tcp_mathis' as AdvancedToolId, label: 'TCP Mathis & BDP Estimator', icon: Gauge, desc: 'Loss vs Throughput & Buffer Sizing' },
    { id: 'mtu_calc' as AdvancedToolId, label: 'MTU / MSS & Tunnel Overhead', icon: Layers, desc: 'PMTUD, WireGuard, IPsec & VXLAN' },
    { id: 'bgp_looking_glass' as AdvancedToolId, label: 'BGP AS-Path & RPKI Validator', icon: Share2, desc: 'Origin AS, Upstream Transits & ROV' },
    { id: 'voip_emodel' as AdvancedToolId, label: 'VoIP ITU-T G.107 MOS Engine', icon: PhoneCall, desc: 'Voice Quality, Jitter Buffer & Codecs' },
    { id: 'ipv6_toolkit' as AdvancedToolId, label: 'IPv6 Subnet & SLAAC EUI-64', icon: Binary, desc: 'Dual-Stack, Canonical & Multicast' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner - Frosted Glass */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 backdrop-blur-sm">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Enterprise Advanced Networking Engineering Suite
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Precision mathematical calculators and real-time protocol inspectors for NetOps, Cloud Architects, and NOC Engineers.
            </p>
          </div>
        </div>

        {/* Sub-tool Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5">
          {subTools.map(t => {
            const Icon = t.icon;
            const isSelected = activeSubTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTool(t.id)}
                className={`p-3 rounded-xl text-left border transition backdrop-blur-md flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/15 border-cyan-400/50 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{t.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-1">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DNS & DoH MULTI-RESOLVER INSPECTOR */}
      {/* ========================================================================= */}
      {activeSubTool === 'dns' && (
        <div className="space-y-5">
          {/* Query Bar */}
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Domain or Hostname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dnsDomain}
                      onChange={e => setDnsDomain(e.target.value)}
                      placeholder="e.g. google.com, cloudflare.com, api.internal.net"
                      className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                      onKeyDown={e => e.key === 'Enter' && handleRunDns()}
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Record Type
                  </label>
                  <select
                    value={dnsRecordType}
                    onChange={e => {
                      setDnsRecordType(e.target.value);
                      handleRunDns(dnsDomain, e.target.value);
                    }}
                    className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA', 'SRV', 'PTR'].map(t => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-4">
                <button
                  onClick={() => handleRunDns()}
                  disabled={dnsLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md text-xs font-bold shadow-lg shadow-cyan-950/40 transition flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dnsLoading ? 'animate-spin' : ''}`} />
                  <span>{dnsLoading ? 'Querying DoH...' : 'Resolve Records'}</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Domains */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Quick Benchmarks:</span>
              {['google.com', 'cloudflare.com', 'github.com', 'openai.com', 'microsoft.com', 'amazon.com'].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setDnsDomain(d);
                    handleRunDns(d, dnsRecordType);
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/5 transition"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* DNS Lookup Results */}
          {dnsResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Records Table */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-300" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Authoritative DNS Records: {dnsResult.domain} ({dnsRecordType})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Query: {dnsResult.queryTimeMs}ms</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
                      DNSSEC {dnsResult.dnssecValid ? 'VALIDATED' : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-black/40 text-slate-400 text-[10px] uppercase font-sans border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3.5">Type</th>
                        <th className="py-2.5 px-3.5">Host / FQDN</th>
                        <th className="py-2.5 px-3.5">Value / Target IP</th>
                        <th className="py-2.5 px-3.5 text-right">TTL</th>
                        <th className="py-2.5 px-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-black/20">
                      {dnsResult.records.map((r, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition">
                          <td className="py-2.5 px-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-cyan-300 border border-white/10">
                              {r.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-300 text-[11px] truncate max-w-[140px]">{r.name}</td>
                          <td className="py-2.5 px-3.5 font-bold text-white text-[11px] break-all">{r.data}</td>
                          <td className="py-2.5 px-3.5 text-right text-slate-400 text-[11px]">{r.ttl}s</td>
                          <td className="py-2.5 px-3.5 text-center">
                            <button
                              onClick={() => copyToClipboard(r.data, `dns_${idx}`)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition"
                              title="Copy value"
                            >
                              {copiedKey === `dns_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 flex flex-wrap items-center justify-between">
                  <span>Authoritative Nameserver: <strong className="text-slate-200 font-mono">{dnsResult.authoritativeServer}</strong></span>
                  {dnsResult.canonicalName && <span>CNAME: <strong className="text-cyan-300 font-mono">{dnsResult.canonicalName}</strong></span>}
                </div>
              </div>

              {/* Multi-Resolver Propagation Matrix */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Global Resolver Benchmark
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {dnsResult.resolvers.map((res, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{res.name}</span>
                          {res.dnssecSupported && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                              DNSSEC
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{res.ip}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${res.latencyMs < 12 ? 'text-emerald-400' : res.latencyMs < 25 ? 'text-cyan-300' : 'text-amber-400'}`}>
                          {res.latencyMs} ms
                        </span>
                        <span className="block text-[10px] text-emerald-400 font-semibold">SYNCHRONIZED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TCP PERFORMANCE & MATHIS FORMULA / BDP ESTIMATOR */}
      {/* ========================================================================= */}
      {activeSubTool === 'tcp_mathis' && (
        <div className="space-y-5">
          {/* Sliders & Parameters */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  TCP Mathis Formula & Bandwidth Delay Product (BDP) Simulator
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                RFC 2581 / Mathis Formula
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Capacity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Link Capacity</span>
                  <span className="font-mono font-bold text-cyan-300">{tcpCapacityMbps} Mbps</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={10000}
                  step={50}
                  value={tcpCapacityMbps}
                  onChange={e => updateTcp(Number(e.target.value), tcpRttMs, tcpLossPct, tcpMssBytes)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10M</span>
                  <span>1Gbps</span>
                  <span>10Gbps</span>
                </div>
              </div>

              {/* RTT Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Round-Trip Time (RTT)</span>
                  <span className="font-mono font-bold text-cyan-300">{tcpRttMs} ms</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={300}
                  step={1}
                  value={tcpRttMs}
                  onChange={e => updateTcp(tcpCapacityMbps, Number(e.target.value), tcpLossPct, tcpMssBytes)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1ms (LAN)</span>
                  <span>70ms (WAN)</span>
                  <span>300ms (Satellite)</span>
                </div>
              </div>

              {/* Packet Loss % Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Packet Loss %</span>
                  <span className={`font-mono font-bold ${tcpLossPct > 1 ? 'text-rose-400' : tcpLossPct > 0.1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tcpLossPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={5.0}
                  step={0.05}
                  value={tcpLossPct}
                  onChange={e => updateTcp(tcpCapacityMbps, tcpRttMs, Number(e.target.value), tcpMssBytes)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.01% (Clean)</span>
                  <span>1.0% (Congested)</span>
                  <span>5.0% (Severe)</span>
                </div>
              </div>

              {/* MSS Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  TCP Maximum Segment Size (MSS)
                </label>
                <select
                  value={tcpMssBytes}
                  onChange={e => updateTcp(tcpCapacityMbps, tcpRttMs, tcpLossPct, Number(e.target.value))}
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value={1460} className="bg-slate-900">1460 Bytes (Standard 1500 MTU)</option>
                  <option value={1380} className="bg-slate-900">1380 Bytes (WireGuard / VPN)</option>
                  <option value={1360} className="bg-slate-900">1360 Bytes (IPsec Encapsulation)</option>
                  <option value={8960} className="bg-slate-900">8960 Bytes (Jumbo Frame 9000 MTU)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Payload capacity per frame</span>
              </div>
            </div>
          </div>

          {/* Results KPIs & Recharts Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* KPI Cards */}
            <div className="space-y-3.5">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Theoretical Max TCP Throughput
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-mono font-bold ${tcpResult.theoreticalMaxThroughputMbps < tcpCapacityMbps * 0.5 ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {tcpResult.theoreticalMaxThroughputMbps.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">Mbps (of {tcpCapacityMbps} Mbps line rate)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Degradation: <strong className="text-slate-200">{tcpResult.lossImpactFactor}</strong>
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Bandwidth Delay Product (BDP)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-mono font-bold text-cyan-300">
                    {(tcpResult.bandwidthDelayProductBytes / 1024).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">KB in flight</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Optimal TCP Buffer: <strong className="text-slate-200">{tcpResult.optimalTcpWindowKBytes} KB</strong>
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Estimated File Transfer Durations
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">100 MB Payload</span>
                    <span className="font-bold text-white">{tcpResult.transferTime100MBSeconds}s</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">1 GB Payload</span>
                    <span className="font-bold text-white">{tcpResult.transferTime1GBSeconds}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Throughput vs Loss Curve */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    TCP Throughput vs. Packet Loss Curve (Mathis Formula)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Visualizing how minor packet loss collapses effective TCP window size at {tcpRttMs}ms RTT.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/15 text-slate-200">
                  Bottleneck: {tcpResult.limitingFactor}
                </span>
              </div>

              <div className="h-56 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tcpResult.curveData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="lossPercent"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit="%"
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit="M"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        backdropFilter: 'blur(12px)'
                      }}
                      formatter={(val: any) => [`${val} Mbps`, 'Effective TCP Throughput']}
                      labelFormatter={(l: any) => `Packet Loss: ${l}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="throughputMbps"
                      stroke="#22d3ee"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#22d3ee' }}
                      activeDot={{ r: 6, fill: '#67e8f9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300 mt-2">
                <strong>Rule of Thumb:</strong> Even a 0.5% packet loss on a 1 Gbps link with 45ms RTT reduces usable TCP speed by &gt;70%. Enable BBR congestion control or DSCP prioritization on lossy transits.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MTU / MSS & TUNNEL ENCAPSULATION OVERHEAD */}
      {/* ========================================================================= */}
      {activeSubTool === 'mtu_calc' && (
        <div className="space-y-5">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Path MTU Discovery (PMTUD) & Protocol Overhead Calculator
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDfBit}
                    onChange={e => updateMtu(encapProfile, customBaseMtu, e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Don&apos;t Fragment (DF) Bit Set</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Encapsulation Protocol / Tunnel Type
                </label>
                <select
                  value={encapProfile}
                  onChange={e => updateMtu(e.target.value, customBaseMtu, enableDfBit)}
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {Object.entries(ENCAPSULATION_PROFILES).map(([key, prof]) => (
                    <option key={key} value={key} className="bg-slate-900">{prof.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Physical Underlay L2 MTU
                </label>
                <input
                  type="number"
                  value={customBaseMtu}
                  onChange={e => updateMtu(encapProfile, Number(e.target.value), enableDfBit)}
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* MTU Protocol Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* KPI Stack */}
            <div className="space-y-3.5">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Recommended Overlay IP MTU
                </span>
                <span className="text-3xl font-mono font-bold text-emerald-300 block mt-1">
                  {mtuResult.effectiveIpMtu} Bytes
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Header Overhead: <strong className="text-rose-400 font-mono">+{mtuResult.totalHeaderOverheadBytes - 40} Bytes</strong>
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Optimal TCP MSS Clamp Value
                </span>
                <span className="text-3xl font-mono font-bold text-cyan-300 block mt-1">
                  {mtuResult.effectiveTcpMss} Bytes
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Sets TCP SYN MSS option (<code className="text-slate-200">ip tcp adjust-mss {mtuResult.effectiveTcpMss}</code>)
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Fragmentation & DF Drop Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${mtuResult.fragmentationRisk === 'NONE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'}`}>
                    {mtuResult.fragmentationRisk}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                  DF Action: {mtuResult.dfBitAction}
                </span>
              </div>
            </div>

            {/* Protocol Stack Visualizer */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Frame Header Encapsulation Stack Breakdown
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Total Frame: {mtuResult.baseL2Mtu} Bytes
                </span>
              </div>

              {/* Visual packet slice */}
              <div className="w-full flex rounded-xl overflow-hidden border border-white/10 text-[10px] font-mono font-bold text-center h-10 shadow-inner">
                {mtuResult.breakdown.map((b, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center p-1 truncate ${idx % 2 === 0 ? 'bg-cyan-600/30 text-cyan-200 border-r border-white/10' : 'bg-indigo-600/30 text-indigo-200 border-r border-white/10'}`}
                    style={{ width: `${Math.max(12, (b.overheadBytes / mtuResult.totalHeaderOverheadBytes) * 60)}%` }}
                    title={`${b.protocol} (${b.overheadBytes} Bytes)`}
                  >
                    {b.protocol.split(' ')[0]} ({b.overheadBytes}B)
                  </div>
                ))}
                <div className="flex-1 bg-emerald-600/25 text-emerald-200 flex items-center justify-center font-bold">
                  TCP Payload ({mtuResult.effectiveTcpMss} Bytes)
                </div>
              </div>

              {/* Table of Layers */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-black/40 text-slate-400 text-[10px] uppercase font-sans border-b border-white/10">
                    <tr>
                      <th className="py-2 px-3">Layer</th>
                      <th className="py-2 px-3">Protocol Component</th>
                      <th className="py-2 px-3 text-right">Bytes</th>
                      <th className="py-2 px-3 font-sans">Role / Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/20">
                    {mtuResult.breakdown.map((b, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-bold text-cyan-300">{b.layer}</td>
                        <td className="py-2 px-3 text-slate-200">{b.protocol}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-300">+{b.overheadBytes}B</td>
                        <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">{b.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
                <strong className="text-white">Engineering Recommendation: </strong>
                {mtuResult.recommendation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BGP LOOKING GLASS & RPKI VALIDATOR */}
      {/* ========================================================================= */}
      {activeSubTool === 'bgp_looking_glass' && (
        <div className="space-y-5">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  BGP Autonomous System Routing & RPKI ROV Analyzer
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  RPKI {bgpResult.rpkiValidation}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/15">
                  Route Damping: {bgpResult.routeFlapDamping}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target BGP Prefix or IPv4/IPv6 Address
                </label>
                <input
                  type="text"
                  value={bgpPrefix}
                  onChange={e => updateBgp(e.target.value)}
                  placeholder="e.g. 8.8.8.0/24, 1.1.1.0/24, 13.107.4.0/24"
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                {['8.8.8.0/24', '1.1.1.0/24', '13.107.4.0/24'].map(p => (
                  <button
                    key={p}
                    onClick={() => updateBgp(p)}
                    className="text-xs font-mono px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/5 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AS Path Hop Visualizer */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AS-Path Routing Sequence (Ingress → Tier-1 Backbone → Origin AS{bgpResult.originAsn})
            </h4>

            <div className="flex flex-wrap items-center gap-3 py-2">
              {bgpResult.hops.map((hop, idx) => (
                <React.Fragment key={hop.asn}>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md min-w-[200px] flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-cyan-300">AS{hop.asn}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">{hop.role}</span>
                    </div>
                    <p className="text-xs font-bold text-white">{hop.orgName}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>{hop.country}</span>
                      <span className="text-emerald-400">RPKI Valid</span>
                    </div>
                  </div>
                  {idx < bgpResult.hops.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* BGP Communities & IXP Interconnects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  BGP Standard & Large Communities
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {bgpResult.communities.map((c, idx) => (
                    <div key={idx} className="flex justify-between p-1.5 rounded bg-white/5">
                      <span className="text-cyan-300 font-bold">{c.tag}</span>
                      <span className="text-slate-300 font-sans text-[11px]">{c.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Major Peering Internet Exchanges (IXPs)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bgpResult.ixpInterconnects.map((ixp, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                      {ixp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VOIP / QOS ITU-T G.107 E-MODEL MOS ENGINE */}
      {/* ========================================================================= */}
      {activeSubTool === 'voip_emodel' && (
        <div className="space-y-5">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  VoIP / RTC Quality ITU-T G.107 E-Model MOS Estimator
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ITU-T G.107 E-Model
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Codec Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Voice Codec</label>
                <select
                  value={voipCodec}
                  onChange={e => updateVoip(e.target.value, voipOneWayDelay, voipJitter, voipLoss)}
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {Object.entries(VOIP_CODEC_PROFILES).map(([key, c]) => (
                    <option key={key} value={key} className="bg-slate-900">{c.name} ({c.bitrate} kbps)</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">Nominal bitrate & compression</span>
              </div>

              {/* One-way delay slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">One-Way Delay</span>
                  <span className="font-mono font-bold text-cyan-300">{voipOneWayDelay} ms</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={voipOneWayDelay}
                  onChange={e => updateVoip(voipCodec, Number(e.target.value), voipJitter, voipLoss)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>&lt;50ms (Toll)</span>
                  <span>150ms (ITU Limit)</span>
                  <span>&gt;250ms</span>
                </div>
              </div>

              {/* Jitter slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">RFC 3393 Jitter</span>
                  <span className="font-mono font-bold text-cyan-300">{voipJitter} ms</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={voipJitter}
                  onChange={e => updateVoip(voipCodec, voipOneWayDelay, Number(e.target.value), voipLoss)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2ms</span>
                  <span>20ms</span>
                  <span>50ms</span>
                </div>
              </div>

              {/* Packet Loss slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">RTP Packet Loss %</span>
                  <span className={`font-mono font-bold ${voipLoss > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>{voipLoss}%</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={10.0}
                  step={0.2}
                  value={voipLoss}
                  onChange={e => updateVoip(voipCodec, voipOneWayDelay, voipJitter, Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0%</span>
                  <span>2% (Max VoIP)</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* VoIP Evaluation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-center flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Mean Opinion Score (MOS)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-5xl font-mono font-bold ${voipResult.mosScore >= 4.0 ? 'text-emerald-300' : voipResult.mosScore >= 3.6 ? 'text-cyan-300' : voipResult.mosScore >= 3.0 ? 'text-amber-300' : 'text-rose-400'}`}>
                  {voipResult.mosScore.toFixed(2)}
                </span>
                <span className="text-sm text-slate-400">/ 4.50</span>
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-300">
                Quality: <strong className="text-white">{voipResult.qualityRating}</strong>
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-center flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Transmission Rating (R-Factor)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-mono font-bold text-cyan-300">
                  {voipResult.rFactor.toFixed(1)}
                </span>
                <span className="text-sm text-slate-400">/ 100</span>
              </div>
              <span className="mt-2 text-xs font-mono text-slate-400">
                Delay Impairment: -{voipResult.delayImpairment} | Equipment Impairment: -{voipResult.equipmentImpairment}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Jitter Buffer Sizing
                </span>
                <span className="text-2xl font-mono font-bold text-white block">
                  {voipResult.jitterBufferDelayMs} ms
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Total Effective One-Way Delay: <strong className="text-cyan-300 font-mono">{voipResult.effectiveDelayMs} ms</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-3 p-2.5 rounded-xl bg-black/30 border border-white/5">
                {voipResult.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. IPv6 SUBNETTING & SLAAC EUI-64 TOOLKIT */}
      {/* ========================================================================= */}
      {activeSubTool === 'ipv6_toolkit' && (
        <div className="space-y-5">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-cyan-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  IPv6 Address Canonical Formatter, Subnet Calculator & SLAAC EUI-64
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                RFC 5952 / RFC 4291
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  IPv6 Address with CIDR Prefix
                </label>
                <input
                  type="text"
                  value={ipv6Input}
                  onChange={e => updateIpv6(e.target.value, ipv6Mac)}
                  placeholder="e.g. 2001:db8:85a3::8a2e:370:7334/64"
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Host NIC MAC Address (for EUI-64 Generation)
                </label>
                <input
                  type="text"
                  value={ipv6Mac}
                  onChange={e => updateIpv6(ipv6Input, e.target.value)}
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* IPv6 Computed Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Format Canonical Breakdown */}
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-3.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Address Representation & Classification
              </h4>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">RFC 5952 Canonical Compressed</span>
                  <span className="font-bold text-cyan-300 text-sm break-all">{ipv6Result.compressedCanonical}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Full 128-bit Expanded Notation</span>
                  <span className="font-bold text-white text-xs break-all">{ipv6Result.fullExpanded}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Scope & Type</span>
                    <span className="font-bold text-emerald-300">{ipv6Result.addressType}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Prefix Length</span>
                    <span className="font-bold text-slate-100">/{ipv6Result.prefixLength}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SLAAC & Reverse DNS */}
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-3.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                SLAAC EUI-64 & Multicast Calculation
              </h4>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Auto-Generated SLAAC EUI-64 Address (from MAC {ipv6Result.macUsed})</span>
                  <span className="font-bold text-emerald-300 text-xs break-all">{ipv6Result.eui64Address}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Solicited-Node Multicast Group</span>
                  <span className="font-bold text-indigo-300 text-xs break-all">{ipv6Result.solicitedNodeMulticast}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Reverse DNS PTR (ip6.arpa)</span>
                  <span className="font-bold text-slate-300 text-[10px] break-all">{ipv6Result.reverseDnsPtr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
