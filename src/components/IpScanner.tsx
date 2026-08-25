import React, { useState } from 'react';
import { HostScanResult, ScanSession } from '../types';
import { generateIpRangeScan } from '../utils/networkCalc';
import {
  Scan,
  Play,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Shield,
  Activity,
  Terminal
} from 'lucide-react';

interface IpScannerProps {
  initialRange: string;
  onTraceHost: (ip: string) => void;
  onExportPdf: () => void;
  onScanComplete?: (results: HostScanResult[]) => void;
}

const COMMON_PORTS = [
  { port: 22, name: 'SSH (22)', desc: 'Secure Shell / Router CLI' },
  { port: 80, name: 'HTTP (80)', desc: 'Web Server' },
  { port: 443, name: 'HTTPS (443)', desc: 'SSL Management Web UI' },
  { port: 53, name: 'DNS (53)', desc: 'Domain Name System' },
  { port: 3389, name: 'RDP (3389)', desc: 'Windows Remote Desktop' },
  { port: 161, name: 'SNMP (161)', desc: 'SNMPv3 Monitoring Agent' },
  { port: 179, name: 'BGP (179)', desc: 'BGP Routing Daemon' },
  { port: 4789, name: 'VXLAN (4789)', desc: 'Data Center Overlay' }
];

export const IpScanner: React.FC<IpScannerProps> = ({
  initialRange,
  onTraceHost,
  onExportPdf,
  onScanComplete
}) => {
  const [rangeInput, setRangeInput] = useState(initialRange || '10.0.4.1 - 10.0.4.24');
  const [selectedPorts, setSelectedPorts] = useState<number[]>([22, 80, 443, 53, 3389, 161, 179]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'WARNING' | 'OFFLINE'>('ALL');

  // Initial Scan Results
  const [scanResults, setScanResults] = useState<HostScanResult[]>(() => {
    return generateIpRangeScan(initialRange || '10.0.4.1 - 10.0.4.24', [22, 80, 443, 53, 3389, 161, 179]);
  });

  const togglePort = (port: number) => {
    if (selectedPorts.includes(port)) {
      setSelectedPorts(selectedPorts.filter(p => p !== port));
    } else {
      setSelectedPorts([...selectedPorts, port]);
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          const results = generateIpRangeScan(rangeInput, selectedPorts);
          setScanResults(results);
          setIsScanning(false);
          if (onScanComplete) onScanComplete(results);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const activeCount = scanResults.filter(h => h.status !== 'OFFLINE').length;
  const warningCount = scanResults.filter(h => h.status === 'LATENCY_WARNING' || h.status === 'LOSS_WARNING').length;
  const offlineCount = scanResults.filter(h => h.status === 'OFFLINE').length;

  const filteredHosts = scanResults.filter(h => {
    const matchesSearch = 
      h.ip.includes(filterText) ||
      h.hostname.toLowerCase().includes(filterText.toLowerCase()) ||
      h.osFingerprint.toLowerCase().includes(filterText.toLowerCase()) ||
      h.deviceVendor.toLowerCase().includes(filterText.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ONLINE') return h.status === 'ONLINE';
    if (statusFilter === 'WARNING') return h.status === 'LATENCY_WARNING' || h.status === 'LOSS_WARNING';
    if (statusFilter === 'OFFLINE') return h.status === 'OFFLINE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Scan Control Header Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Scan className="w-5 h-5 text-cyan-300" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Enterprise IP Range & Port Scanner
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit active hosts, identify open management ports, OS fingerprints, and detect high-latency endpoints.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition backdrop-blur-md shadow-lg ${
                isScanning
                  ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/30 shadow-cyan-950/40'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isScanning ? `Scanning (${progress}%)...` : 'Launch Scan'}</span>
            </button>

            <button
              onClick={onExportPdf}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-md text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Scan to PDF</span>
            </button>
          </div>
        </div>

        {/* Range Input & Port Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Range */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              IP Range or CIDR
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 10.0.4.1 - 10.0.4.30 or 192.168.1.0/24"
              className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-bold shadow-inner"
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              Supports CIDR (e.g. /26) or Dash Range (e.g. 10.0.0.1 - 10.0.0.50)
            </span>
          </div>

          {/* Target Ports Toggles */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target TCP / Management Ports ({selectedPorts.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PORTS.map((p) => {
                const isSelected = selectedPorts.includes(p.port);
                return (
                  <button
                    key={p.port}
                    onClick={() => togglePort(p.port)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition backdrop-blur-md ${
                      isSelected
                        ? 'bg-white/15 border-cyan-400/40 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-400/30'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200 hover:bg-white/10'
                    }`}
                    title={p.desc}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Bar when scanning */}
        {isScanning && (
          <div className="mt-4 pt-3.5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span>Probing ICMP echo & TCP SYN handshakes...</span>
              <span className="font-bold text-cyan-300">{progress}%</span>
            </div>
            <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-200 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scan Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Probed</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white">{scanResults.length}</p>
          <span className="text-[10px] text-slate-400">Target Range Endpoints</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Online</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-300">{activeCount}</p>
          <span className="text-[10px] text-emerald-400/80">Responding to ICMP/TCP</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Latency / Loss Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-mono font-bold text-amber-300">{warningCount}</p>
          <span className="text-[10px] text-amber-400/80">RTT &gt; 25ms or Loss &gt; 5%</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Unresponsive</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-mono font-bold text-slate-400">{offlineCount}</p>
          <span className="text-[10px] text-slate-400">Filtered or Offline</span>
        </div>
      </div>

      {/* Host Inventory Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        {/* Table Filters Bar */}
        <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Scanned Host Inventory & Port Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing device fingerprints, round-trip times, open ports, and MAC addresses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 backdrop-blur-md text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ALL' ? 'bg-white/15 text-cyan-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({scanResults.length})
              </button>
              <button
                onClick={() => setStatusFilter('ONLINE')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-400/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Online ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('WARNING')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'WARNING' ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Warnings ({warningCount})
              </button>
              <button
                onClick={() => setStatusFilter('OFFLINE')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'OFFLINE' ? 'bg-white/10 text-slate-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Offline ({offlineCount})
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search IP, Hostname, OS..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-black/30 backdrop-blur-md text-xs text-slate-200 border border-white/10 rounded-xl pl-8 pr-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-48 shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/40 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Host IP Address</th>
                <th className="py-3 px-4">Hostname & FQDN</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">RTT</th>
                <th className="py-3 px-4 text-center">Loss %</th>
                <th className="py-3 px-4 text-center">TTL</th>
                <th className="py-3 px-4">Device Fingerprint / OS</th>
                <th className="py-3 px-4">Open Ports</th>
                <th className="py-3 px-4 text-center">Diagnostic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredHosts.map((host) => {
                const isOffline = host.status === 'OFFLINE';
                const openPortsList = host.openPorts.filter(p => p.status === 'open');

                return (
                  <tr key={host.ip} className="hover:bg-white/5 transition duration-150">
                    {/* IP */}
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300">{host.ip}</span>
                      </div>
                      {host.macAddress && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          MAC: {host.macAddress}
                        </div>
                      )}
                    </td>

                    {/* Hostname */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200 text-xs truncate max-w-[170px]" title={host.hostname}>
                        {host.hostname}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {host.deviceVendor}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center font-sans">
                      {isOffline ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/5">
                          OFFLINE
                        </span>
                      ) : host.status === 'LOSS_WARNING' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/40 animate-pulse backdrop-blur-sm">
                          LOSS DROP
                        </span>
                      ) : host.status === 'LATENCY_WARNING' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40 backdrop-blur-sm">
                          HIGH RTT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                          ONLINE
                        </span>
                      )}
                    </td>

                    {/* RTT */}
                    <td className="py-3 px-4 text-right">
                      {isOffline ? (
                        <span className="text-slate-600">-</span>
                      ) : (
                        <span className={`font-bold ${host.rtt > 25 ? 'text-amber-300' : 'text-emerald-300'}`}>
                          {host.rtt} ms
                        </span>
                      )}
                    </td>

                    {/* Loss % */}
                    <td className="py-3 px-4 text-center">
                      <span className={host.packetLoss > 0 ? 'text-rose-300 font-bold' : 'text-slate-400'}>
                        {host.packetLoss}%
                      </span>
                    </td>

                    {/* TTL */}
                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                      {isOffline ? '-' : host.ttl}
                    </td>

                    {/* OS Fingerprint */}
                    <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                        <span className="truncate max-w-[180px]" title={host.osFingerprint}>
                          {host.osFingerprint}
                        </span>
                      </div>
                    </td>

                    {/* Open Ports */}
                    <td className="py-3 px-4 font-sans">
                      {openPortsList.length === 0 ? (
                        <span className="text-slate-500 text-[11px]">No Open Ports</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {openPortsList.map(p => (
                            <span
                              key={p.port}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-cyan-300 border border-white/10 font-bold backdrop-blur-sm"
                              title={p.service}
                            >
                              {p.port}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onTraceHost(host.ip)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/30 text-cyan-300 hover:text-white text-[11px] font-sans font-semibold border border-white/10 hover:border-cyan-400/40 backdrop-blur-sm transition shadow-sm"
                      >
                        Trace MTR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
