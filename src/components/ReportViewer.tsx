import React, { useState } from 'react';
import { DiagnosticSession, SubnetAnalysis, HostScanResult, AiTroubleshootingReport } from '../types';
import { generateEnterprisePdfReport } from '../utils/pdfGenerator';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Layers,
  Activity,
  Server
} from 'lucide-react';

interface ReportViewerProps {
  session: DiagnosticSession;
  subnet: SubnetAnalysis | null;
  scanResults: HostScanResult[] | null;
  aiReport: AiTroubleshootingReport | null;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  session,
  subnet,
  scanResults,
  aiReport
}) => {
  const [ticketNumber, setTicketNumber] = useState('INC-NET-8042');
  const [engineerName, setEngineerName] = useState('Network Infrastructure Operations (NetOps)');
  const [environment, setEnvironment] = useState('Production DC & Cloud Hybrid');
  const [customNotes, setCustomNotes] = useState(
    'Conducted full-path diagnostic telemetry probe. MTU 1500 bytes validated. Subnet performance within enterprise SLA boundaries.'
  );

  const handleDownloadPdf = () => {
    const doc = generateEnterprisePdfReport({
      session,
      subnet,
      scanResults,
      aiReport,
      ticketNumber,
      engineerName,
      environment,
      notes: customNotes
    });
    doc.save(`${ticketNumber}_Network_Diagnostic_Report.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration & Export Controls - Frosted Glass */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-300" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Enterprise Diagnostic Report & PDF Generator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate audit-ready PDF summaries combining Hop-by-Hop MTR, Subnet metrics, and IP scan findings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 backdrop-blur-md transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Ticket / Audit Reference ID
            </label>
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Lead Engineer / Team
            </label>
            <input
              type="text"
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Environment
            </label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Printable Interactive Report Canvas */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-6 text-slate-200 font-sans print:bg-white print:text-black print:p-0 print:border-none">
        {/* Report Banner */}
        <div className="border-b border-white/10 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
              ENTERPRISE NETWORK AUDIT & DIAGNOSTIC REPORT
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">
              Network Path Assessment: {session.target}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Target IP: <span className="font-mono text-slate-200 font-semibold">{session.targetIp}</span> • Date:{' '}
              {new Date(session.timestamp).toLocaleString()} • Probed {session.probeCount} packets ({session.packetSize}B, DSCP {session.dscp})
            </p>
          </div>

          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/15 text-slate-200 backdrop-blur-sm">
              Ref: {ticketNumber}
            </span>
            <div className="text-[11px] text-slate-400 mt-2">
              Env: <span className="text-slate-200 font-semibold">{environment}</span>
            </div>
          </div>
        </div>

        {/* Executive Verdict Banner */}
        <div
          className={`p-4 rounded-xl border backdrop-blur-md flex items-center justify-between ${
            session.healthVerdict === 'CRITICAL'
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-200'
              : session.healthVerdict === 'DEGRADED'
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
              : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {session.healthVerdict === 'CRITICAL' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                AUDIT ASSESSMENT VERDICT: {session.healthVerdict}
              </span>
              <span className="text-[11px] opacity-90">
                {session.healthVerdict === 'CRITICAL'
                  ? 'Severe packet loss or latency degradation violates enterprise SLA bounds.'
                  : session.healthVerdict === 'DEGRADED'
                  ? 'Elevated jitter or intermediate transit node rate-limiting detected.'
                  : 'Path forwarding metrics and propagation delay are optimal (0% loss).'}
              </span>
            </div>
          </div>

          <div className="text-right font-mono font-bold text-sm">
            MOS: {session.mosScore} / 4.5
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mean Round-Trip Time</span>
            <span className="text-lg font-mono font-bold text-white">{session.overallAvgRtt} ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Min: {session.overallMinRtt} / Max: {session.overallMaxRtt}</span>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">RFC 3393 Jitter</span>
            <span className="text-lg font-mono font-bold text-cyan-300">{session.overallJitter} ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">StdDev: {session.hops[session.hops.length - 1]?.stdDevRtt || 0}ms</span>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">End-to-End Packet Loss</span>
            <span className={`text-lg font-mono font-bold ${session.overallLossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {session.overallLossPercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{session.totalHops} Transit Nodes</span>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Voice Quality (MOS)</span>
            <span className="text-lg font-mono font-bold text-emerald-300">{session.mosScore}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">G.711 Codec Score</span>
          </div>
        </div>

        {/* Section 1: Hop-by-Hop Telemetry Table */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            1. Hop-by-Hop MTR Diagnostic Telemetry
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-black/40 text-slate-400 text-[10px] uppercase font-sans">
                <tr>
                  <th className="py-2.5 px-3.5 text-center">#</th>
                  <th className="py-2.5 px-3.5">Node Address</th>
                  <th className="py-2.5 px-3.5">Hostname / FQDN</th>
                  <th className="py-2.5 px-3.5">Carrier ASN</th>
                  <th className="py-2.5 px-3.5 text-center">Loss %</th>
                  <th className="py-2.5 px-3.5 text-right">Avg RTT</th>
                  <th className="py-2.5 px-3.5 text-right">Min/Max</th>
                  <th className="py-2.5 px-3.5 text-right">Jitter</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {session.hops.map((h) => (
                  <tr key={h.hop} className="hover:bg-white/5 transition duration-150">
                    <td className="py-2 px-3.5 text-center text-slate-400">{h.hop}</td>
                    <td className="py-2 px-3.5 font-bold text-cyan-300">{h.ip}</td>
                    <td className="py-2 px-3.5 text-slate-300 text-[11px] truncate max-w-[150px] font-sans">{h.host}</td>
                    <td className="py-2 px-3.5 text-slate-300 text-[11px] font-sans">{h.asn || 'Private'}</td>
                    <td className="py-2 px-3.5 text-center font-bold">
                      <span className={h.lossPercent > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                        {h.lossPercent}%
                      </span>
                    </td>
                    <td className="py-2 px-3.5 text-right font-bold text-white">{h.avgRtt} ms</td>
                    <td className="py-2 px-3.5 text-right text-slate-400 text-[10px]">{h.bestRtt}/{h.worstRtt}</td>
                    <td className="py-2 px-3.5 text-right text-slate-300">{h.jitter} ms</td>
                    <td className="py-2 px-3.5 text-center font-sans text-[10px]">
                      {h.status === 'rate-limited' ? (
                        <span className="text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30">Rate-Ltd</span>
                      ) : h.lossPercent > 5 ? (
                        <span className="text-rose-300 font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30">High Loss</span>
                      ) : (
                        <span className="text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/25">Optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Subnet Analysis (if present) */}
        {subnet && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              2. Subnet Performance & Capacity Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-slate-400 block text-[10px] font-sans">Subnet CIDR</span>
                <span className="font-bold text-cyan-300">{subnet.cidr}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-slate-400 block text-[10px] font-sans">Usable Range</span>
                <span className="font-bold text-slate-200 truncate">{subnet.firstUsableIp} - {subnet.lastUsableIp}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-slate-400 block text-[10px] font-sans">Total Usable Hosts</span>
                <span className="font-bold text-emerald-300">{subnet.usableHosts.toLocaleString()} IPs</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-slate-400 block text-[10px] font-sans">p50 / p99 Latency</span>
                <span className="font-bold text-white">{subnet.p50Latency}ms / {subnet.p99Latency}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: IP Range Scan Summary (if present) */}
        {scanResults && scanResults.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              3. IP Range Scan Sample Findings ({scanResults.length} hosts probed)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-black/40 text-slate-400 text-[10px] uppercase font-sans">
                  <tr>
                    <th className="py-2.5 px-3.5">IP Address</th>
                    <th className="py-2.5 px-3.5">Hostname</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3.5 text-right">RTT</th>
                    <th className="py-2.5 px-3.5">Device Fingerprint</th>
                    <th className="py-2.5 px-3.5">Open Ports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {scanResults.slice(0, 8).map((h) => (
                    <tr key={h.ip}>
                      <td className="py-2 px-3.5 font-bold text-cyan-300">{h.ip}</td>
                      <td className="py-2 px-3.5 text-slate-300 font-sans text-[11px]">{h.hostname}</td>
                      <td className="py-2 px-3.5 text-center font-sans text-[10px]">
                        <span className={h.status === 'ONLINE' ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                          {h.status}
                        </span>
                      </td>
                      <td className="py-2 px-3.5 text-right">{h.status === 'OFFLINE' ? '-' : `${h.rtt} ms`}</td>
                      <td className="py-2 px-3.5 text-slate-300 font-sans text-[11px]">{h.osFingerprint}</td>
                      <td className="py-2 px-3.5 text-cyan-300 text-[11px]">
                        {h.openPorts.filter(p => p.status === 'open').map(p => p.port).join(', ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Root Cause Findings */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            4. Diagnostic Root-Cause Findings & Mitigation
          </h3>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-xs space-y-2 backdrop-blur-sm">
            <p className="text-slate-300">
              <strong className="text-white">Primary Finding: </strong>
              {aiReport?.rootCause || (
                session.overallLossPercent > 5
                  ? `Forwarding-plane packet loss of ${session.overallLossPercent}% detected on intermediate carrier transit. Jitter standard deviation is ${session.hops[session.hops.length - 1]?.stdDevRtt}ms.`
                  : `Path propagation latency is stable at ${session.overallAvgRtt}ms with 0% end-to-end packet loss. All routing nodes operating within enterprise SLA threshold.`
              )}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-slate-400 text-[11px]">
              <span>SLA Risk: <strong className="text-slate-200">{aiReport?.slaRisk || (session.overallLossPercent > 5 ? 'HIGH' : 'LOW')}</strong></span>
              <span>Path MTU: <strong className="text-slate-200">1500 Bytes</strong></span>
              <span>DSCP Mark: <strong className="text-slate-200">{session.dscp}</strong></span>
            </div>
          </div>
        </div>

        {/* Sign-off Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            Lead Engineer: <span className="text-slate-200 font-semibold">{engineerName}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            CONFIDENTIAL • NETTRACE ENTERPRISE REPORTING ENGINE
          </div>
        </div>
      </div>
    </div>
  );
};
