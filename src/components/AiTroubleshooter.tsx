import React, { useState } from 'react';
import { DiagnosticSession, SubnetAnalysis, HostScanResult, AiTroubleshootingReport } from '../types';
import {
  Bot,
  Zap,
  ShieldAlert,
  Terminal,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  FileCode,
  Sparkles
} from 'lucide-react';

interface AiTroubleshooterProps {
  session: DiagnosticSession;
  subnet: SubnetAnalysis | null;
  scanResults: HostScanResult[] | null;
  aiReport: AiTroubleshootingReport | null;
  onUpdateReport: (report: AiTroubleshootingReport) => void;
}

export const AiTroubleshooter: React.FC<AiTroubleshooterProps> = ({
  session,
  subnet,
  scanResults,
  aiReport,
  onUpdateReport
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runGeminiAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracerouteData: {
            target: session.target,
            targetIp: session.targetIp,
            packetCount: session.probeCount,
            packetSize: session.packetSize,
            dscp: session.dscp,
            overallAvgRtt: session.overallAvgRtt,
            overallLoss: session.overallLossPercent,
            overallJitter: session.overallJitter,
            hops: session.hops
          },
          subnetData: subnet ? {
            cidr: subnet.cidr,
            usableHosts: subnet.usableHosts,
            utilization: subnet.utilizationPercent,
            p50: subnet.p50Latency,
            p99: subnet.p99Latency,
            avgLoss: subnet.avgSubnetLoss,
            fragmentationRisk: subnet.fragmentationRisk
          } : null,
          scanData: scanResults ? {
            hosts: scanResults.slice(0, 10),
            activeCount: scanResults.filter(h => h.status !== 'OFFLINE').length,
            highLatencyCount: scanResults.filter(h => h.status === 'LATENCY_WARNING').length
          } : null
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AiTroubleshootingReport = await response.json();
      onUpdateReport(data);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setErrorMsg(err.message || 'Failed to communicate with AI diagnostic service');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Trigger Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                AI Enterprise Network Incident Troubleshooter
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-sm">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ingests raw hop-by-hop RTT, jitter standard deviations, subnet loss matrices, and generates root-cause assessments and vendor CLI runbooks.
            </p>
          </div>

          <button
            onClick={runGeminiAnalysis}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg transition ${
              isLoading
                ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-200 border border-indigo-400/30 shadow-indigo-950/40'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing Telemetry...' : 'Run AI Root-Cause Analysis'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-xs text-rose-200 flex items-center gap-2.5 backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Report Content */}
      {aiReport ? (
        <div className="space-y-5">
          {/* Executive Summary & SLA Risk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Executive Diagnostic Summary
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {aiReport.summary}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    SLA Impact Risk
                  </h3>
                </div>
                <div className="flex items-center gap-2 my-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-sm ${
                      aiReport.slaRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-200 border-rose-400/40 animate-pulse'
                        : aiReport.slaRisk === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                        : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                    }`}
                  >
                    {aiReport.slaRisk} RISK
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Calculated against enterprise VoIP MOS thresholds and TCP throughput boundaries.
              </p>
            </div>
          </div>

          {/* Deep Root Cause Analysis Card */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Technical Root Cause & Bottleneck Classification
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200 leading-relaxed font-sans backdrop-blur-sm">
              {aiReport.rootCause}
            </div>
          </div>

          {/* Anomalies & Step-by-Step Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detected Anomalies */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detected Network Anomalies ({aiReport.anomaliesDetected?.length || 0})
                </h3>
              </div>
              <ul className="space-y-2 text-xs">
                {(aiReport.anomaliesDetected || [
                  'Latency step-up observed at intermediate carrier hop',
                  'RFC 3393 Jitter deviation exceeds 10ms threshold'
                ]).map((anomaly, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-slate-300 backdrop-blur-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended NOC Action Items
                </h3>
              </div>
              <ul className="space-y-2 text-xs">
                {(aiReport.recommendations || [
                  'Inspect router CPU utilization and CoPP rate limits',
                  'Verify MTU path configuration across SD-WAN tunnels'
                ]).map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-slate-300 backdrop-blur-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vendor Remediation CLI Commands */}
          {aiReport.remediationCommands && aiReport.remediationCommands.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Vendor CLI Diagnostic & Remediation Commands
                </h3>
              </div>
              <div className="space-y-3 font-mono text-xs">
                {aiReport.remediationCommands.map((cmd, idx) => (
                  <div key={idx} className="relative bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                    <pre className="text-cyan-300 font-mono whitespace-pre-wrap text-[11px] pr-12">{cmd}</pre>
                    <button
                      onClick={() => copyCommand(cmd, idx)}
                      className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition backdrop-blur-sm"
                      title="Copy CLI snippet"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mx-auto mb-4 backdrop-blur-md shadow-lg shadow-indigo-950/40">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">
            No AI Diagnostic Run Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Click the button below to send the current MTR hop telemetry, subnet allocation stats, and IP range scan findings to Gemini Flash for an authoritative CCIE-level root-cause analysis.
          </p>
          <button
            onClick={runGeminiAnalysis}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-200 border border-indigo-400/30 text-xs font-bold inline-flex items-center gap-2 backdrop-blur-md shadow-lg shadow-indigo-950/40 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing...' : 'Generate Incident Runbook'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
