import React, { useState } from 'react';
import { SubnetAnalysis } from '../types';
import { calculateSubnetAnalysis } from '../utils/networkCalc';
import {
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Scan,
  ShieldCheck,
  Zap,
  Server
} from 'lucide-react';

interface SubnetCalculatorProps {
  subnet: SubnetAnalysis;
  onChangeSubnet: (newSubnet: SubnetAnalysis) => void;
  onScanSubnet: (cidr: string) => void;
  onExportPdf: () => void;
}

export const SubnetCalculator: React.FC<SubnetCalculatorProps> = ({
  subnet,
  onChangeSubnet,
  onScanSubnet,
  onExportPdf
}) => {
  const [inputCidr, setInputCidr] = useState(subnet.cidr);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCalculate = (val: string) => {
    setInputCidr(val);
    const result = calculateSubnetAnalysis(val);
    onChangeSubnet(result);
  };

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const presets = [
    { label: 'Standard Enterprise /24', cidr: '192.168.10.0/24' },
    { label: 'Data Center VLAN /26', cidr: '10.240.12.0/26' },
    { label: 'Kubernetes Pod CIDR /22', cidr: '10.100.0.0/22' },
    { label: 'Branch Office /28', cidr: '172.16.50.0/28' },
    { label: 'Point-to-Point Transit /30', cidr: '10.255.255.248/30' },
    { label: 'Corporate Core /16', cidr: '10.10.0.0/16' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Input & Quick CIDR Selector Card - Frosted Glass */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-cyan-300" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Granular Subnet Performance & Capacity Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculate CIDR boundaries, usable host allocations, latency distributions, and IP cluster loss heatmaps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScanSubnet(subnet.cidr)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 transition"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span>Scan this Subnet</span>
            </button>
            <button
              onClick={onExportPdf}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 backdrop-blur-md transition shadow-sm"
            >
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* CIDR Input Box */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Enter IPv4 Subnet / CIDR Prefix
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputCidr}
                onChange={(e) => handleCalculate(e.target.value)}
                placeholder="e.g. 192.168.1.0/24 or 10.0.0.0/16"
                className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 font-bold shadow-inner"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                /{subnet.prefixLength}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Enterprise CIDR Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.cidr}
                  onClick={() => handleCalculate(p.cidr)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition backdrop-blur-md ${
                    inputCidr === p.cidr
                      ? 'bg-white/15 border-cyan-400/40 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-400/30'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {p.label} <span className="text-cyan-400 font-bold">({p.cidr})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bitwise Subnet Parameters Matrix (8-Grid KPI Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Network Address</span>
            <button onClick={() => copyVal(subnet.networkAddress, 'net')} className="hover:text-cyan-300 text-slate-400">
              {copiedKey === 'net' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-sm font-mono font-bold text-white">{subnet.networkAddress}</p>
          <span className="text-[10px] text-slate-400 font-mono">Base Network Boundary</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Subnet Netmask</span>
            <button onClick={() => copyVal(subnet.netmask, 'mask')} className="hover:text-cyan-300 text-slate-400">
              {copiedKey === 'mask' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-sm font-mono font-bold text-white">{subnet.netmask}</p>
          <span className="text-[10px] text-slate-400 font-mono">Wildcard: {subnet.wildcardMask}</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Usable Host Range</span>
            <button onClick={() => copyVal(`${subnet.firstUsableIp} - ${subnet.lastUsableIp}`, 'range')} className="hover:text-cyan-300 text-slate-400">
              {copiedKey === 'range' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs font-mono font-bold text-cyan-300 truncate">
            {subnet.firstUsableIp} - {subnet.lastUsableIp}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{subnet.usableHosts.toLocaleString()} Usable IPs</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Broadcast Address</span>
            <button onClick={() => copyVal(subnet.broadcastAddress, 'bcast')} className="hover:text-cyan-300 text-slate-400">
              {copiedKey === 'bcast' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-sm font-mono font-bold text-amber-300">{subnet.broadcastAddress}</p>
          <span className="text-[10px] text-slate-400 font-mono">Hex: {subnet.hexSubnet}</span>
        </div>
      </div>

      {/* Granular Subnet Performance Breakdown (Percentiles & Allocation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latency Percentiles Card */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Subnet Latency Percentiles
              </h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono border border-white/10 backdrop-blur-sm">
              RFC 2681
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm">
              <span className="text-slate-400 font-sans">p50 (Median Delay)</span>
              <span className="font-bold text-emerald-300">{subnet.p50Latency} ms</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm">
              <span className="text-slate-400 font-sans">p90 (90th Percentile)</span>
              <span className="font-bold text-cyan-300">{subnet.p90Latency} ms</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm">
              <span className="text-slate-400 font-sans">p95 (95th Percentile)</span>
              <span className="font-bold text-amber-300">{subnet.p95Latency} ms</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm">
              <span className="text-slate-400 font-sans">p99 (Tail Spike)</span>
              <span className="font-bold text-rose-300">{subnet.p99Latency} ms</span>
            </div>
          </div>
        </div>

        {/* Utilization & Capacity Card */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Capacity & Utilization
              </h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-mono border border-emerald-400/30 backdrop-blur-sm">
              {subnet.utilizationPercent}% Used
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${Math.min(100, subnet.utilizationPercent)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block font-sans">Active Allocated</span>
                <span className="text-sm font-bold text-white">{subnet.activeHosts} IPs</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block font-sans">Free Unassigned</span>
                <span className="text-sm font-bold text-emerald-300">
                  {Math.max(0, subnet.usableHosts - subnet.activeHosts)} IPs
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Classification:</span>
              <span className="font-semibold text-slate-200">{subnet.scope}</span>
            </div>
          </div>
        </div>

        {/* MTU & Fragmentation Vulnerability */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                MTU & Fragmentation
              </h3>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono font-bold border backdrop-blur-sm ${
              subnet.fragmentationRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' :
              subnet.fragmentationRisk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-200 border-amber-400/40' :
              'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
            }`}>
              {subnet.fragmentationRisk} RISK
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono backdrop-blur-sm">
              <span className="text-slate-400 font-sans">Path MTU:</span>
              <span className="font-bold text-white">{subnet.pathMtu} Bytes</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono backdrop-blur-sm">
              <span className="text-slate-400 font-sans">Subnet Loss Rate:</span>
              <span className={`font-bold ${subnet.avgSubnetLoss > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {subnet.avgSubnetLoss}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono backdrop-blur-sm">
              <span className="text-slate-400 font-sans">Binary Netmask:</span>
              <span className="text-[10px] text-cyan-300 font-bold truncate max-w-[140px]" title={subnet.binaryNetmask}>
                {subnet.binaryNetmask}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Subnet Clusters / IP Block Heatmap Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Granular Sub-Block Allocation & Performance Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of subnet into sub-blocks to isolate packet loss hot spots and high-latency nodes.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {subnet.clusters.length} Sub-Clusters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-black/40 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px] font-sans">
                <th className="py-3 px-4">Sub-Block CIDR</th>
                <th className="py-3 px-4">IP Range</th>
                <th className="py-3 px-4 text-center">Allocated IPs</th>
                <th className="py-3 px-4 text-center">Utilization</th>
                <th className="py-3 px-4 text-right">Avg Latency</th>
                <th className="py-3 px-4 text-center">Loss Rate</th>
                <th className="py-3 px-4 font-sans">Dominant Role</th>
                <th className="py-3 px-4 text-center font-sans">Cluster Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subnet.clusters.map((c, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition duration-150">
                  <td className="py-3 px-4 font-bold text-cyan-300">{c.block}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">{c.range}</td>
                  <td className="py-3 px-4 text-center text-slate-200 font-bold">
                    {c.activeIps} / {c.totalIps}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]"
                          style={{ width: `${c.utilization}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{c.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {c.avgLatency} ms
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className={c.lossRate > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                      {c.lossRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                    {c.dominantRole}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {c.status === 'PACKET_LOSS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/40 backdrop-blur-sm">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Loss Hotspot
                      </span>
                    ) : c.status === 'ELEVATED_RTT' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40 backdrop-blur-sm">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Elevated Delay
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
