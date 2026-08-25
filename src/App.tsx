import React, { useState, useEffect, useRef } from 'react';
import { DiagnosticTab, DiagnosticSession, SubnetAnalysis, HostScanResult, AiTroubleshootingReport, NetworkPreset } from './types';
import { generateTraceroutePath, calculateSubnetAnalysis, generateIpRangeScan } from './utils/networkCalc';
import { generateEnterprisePdfReport } from './utils/pdfGenerator';
import { Header, PRESETS } from './components/Header';
import { Navigation } from './components/Navigation';
import { HopVisualizer } from './components/HopVisualizer';
import { HopTable } from './components/HopTable';
import { LatencyJitterChart } from './components/LatencyJitterChart';
import { SubnetCalculator } from './components/SubnetCalculator';
import { IpScanner } from './components/IpScanner';
import { AdvancedTools } from './components/AdvancedTools';
import { ReportViewer } from './components/ReportViewer';
import { AiTroubleshooter } from './components/AiTroubleshooter';
import { Activity, ShieldAlert, Zap, Globe, Server, Play, Pause, RefreshCw, Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('mtr');
  const [currentScenario, setCurrentScenario] = useState<string>('healthy');
  const [targetInput, setTargetInput] = useState('8.8.8.8');
  const [packetSize, setPacketSize] = useState<number>(64);
  const [dscpMark, setDscpMark] = useState<string>('CS0');
  const [isLiveProbing, setIsLiveProbing] = useState(false);
  const [cycleCounter, setCycleCounter] = useState(1);

  // Diagnostic Session State (Hop by Hop MTR)
  const [session, setSession] = useState<DiagnosticSession>(() => {
    return generateTraceroutePath('8.8.8.8', 'healthy', 1);
  });

  // Subnet Analysis State
  const [subnet, setSubnet] = useState<SubnetAnalysis>(() => {
    return calculateSubnetAnalysis('192.168.10.0/24');
  });

  // Scanned Hosts State
  const [scanResults, setScanResults] = useState<HostScanResult[]>(() => {
    return generateIpRangeScan('10.0.4.1 - 10.0.4.24');
  });

  // AI Troubleshooting Report State
  const [aiReport, setAiReport] = useState<AiTroubleshootingReport | null>(null);

  // Live Probing Interval Ref
  const probeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle continuous live MTR updates
  useEffect(() => {
    if (isLiveProbing) {
      probeIntervalRef.current = setInterval(() => {
        setCycleCounter(prev => {
          const nextCycle = prev + 1;
          setSession(generateTraceroutePath(targetInput, currentScenario as any, nextCycle));
          return nextCycle;
        });
      }, 1500);
    } else {
      if (probeIntervalRef.current) clearInterval(probeIntervalRef.current);
    }

    return () => {
      if (probeIntervalRef.current) clearInterval(probeIntervalRef.current);
    };
  }, [isLiveProbing, targetInput, currentScenario]);

  const handleToggleLive = () => {
    setIsLiveProbing(prev => !prev);
  };

  const handleRunSingleCycle = () => {
    const nextCycle = cycleCounter + 1;
    setCycleCounter(nextCycle);
    setSession(generateTraceroutePath(targetInput, currentScenario as any, nextCycle));
  };

  const handleSelectPreset = (preset: NetworkPreset) => {
    setCurrentScenario(preset.simulatedScenario);
    setTargetInput(preset.target);
    setSession(generateTraceroutePath(preset.target, preset.simulatedScenario, 1));
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;
    setSession(generateTraceroutePath(targetInput.trim(), currentScenario as any, 1));
  };

  const handleScanSubnet = (cidr: string) => {
    setActiveTab('scanner');
  };

  const handleTraceHost = (ip: string) => {
    setTargetInput(ip);
    setSession(generateTraceroutePath(ip, 'healthy', 1));
    setActiveTab('mtr');
  };

  const handleExportPdf = () => {
    const doc = generateEnterprisePdfReport({
      session,
      subnet,
      scanResults,
      aiReport,
      ticketNumber: 'NET-DIAG-8042',
      engineerName: 'Lead Network Operations Team',
      environment: 'Enterprise DC & SD-WAN'
    });
    doc.save(`Network_Diagnostic_Report_${session.target.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const packetLossCount = session.hops.filter(h => h.lossPercent > 0 && h.status !== 'rate-limited').length;

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-100 flex flex-col font-sans bg-[#0a0f1d] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Frosted Gradient Canvas Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            background: 'radial-gradient(circle at 0% 0%, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
          }}
        />
        {/* Ambient atmospheric lighting orbs for glass refraction */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* Top Enterprise Header */}
      <div className="relative z-40">
        <Header
          session={session}
          isLiveProbing={isLiveProbing}
          onToggleLiveProbe={handleToggleLive}
          onRunSingleCycle={handleRunSingleCycle}
          onSelectPreset={handleSelectPreset}
          onExportPdf={handleExportPdf}
          currentScenario={currentScenario}
        />
      </div>

      {/* Module Navigation Tabs */}
      <div className="relative z-30">
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          packetLossCount={packetLossCount}
        />
      </div>

      {/* Main Workspace Canvas */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'mtr' && (
          <div className="space-y-6">
            {/* Custom Target Configuration Bar - Frosted Glass */}
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <form onSubmit={handleCustomTargetSubmit} className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[280px]">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Probe Target (Hostname / IPv4)
                    </label>
                    <input
                      type="text"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      placeholder="e.g. 8.8.8.8, 1.1.1.1, gateway.internal.corp"
                      className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 shadow-inner"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Frame MTU
                    </label>
                    <select
                      value={packetSize}
                      onChange={(e) => setPacketSize(Number(e.target.value))}
                      className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400/50"
                    >
                      <option value={64} className="bg-slate-900">64 Bytes</option>
                      <option value={512} className="bg-slate-900">512 Bytes</option>
                      <option value={1472} className="bg-slate-900">1472 Bytes</option>
                      <option value={1500} className="bg-slate-900">1500 Bytes</option>
                    </select>
                  </div>

                  <div className="w-36">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      DSCP / ToS
                    </label>
                    <select
                      value={dscpMark}
                      onChange={(e) => setDscpMark(e.target.value)}
                      className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400/50"
                    >
                      <option value="CS0" className="bg-slate-900">CS0 (Best Effort)</option>
                      <option value="EF" className="bg-slate-900">EF (VoIP / Audio)</option>
                      <option value="AF41" className="bg-slate-900">AF41 (Video)</option>
                      <option value="AF31" className="bg-slate-900">AF31 (Critical Data)</option>
                      <option value="CS6" className="bg-slate-900">CS6 (Routing)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 sm:pt-0">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md text-xs font-bold shadow-lg shadow-cyan-950/50 transition duration-150 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Run Traceroute</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Interactive Hop Topology Graph */}
            <HopVisualizer
              hops={session.hops}
              target={session.target}
              isLiveProbing={isLiveProbing}
            />

            {/* Latency & Jitter Timeline Recharts */}
            <LatencyJitterChart
              hops={session.hops}
              target={session.target}
            />

            {/* High Density Hop Telemetry Matrix */}
            <HopTable
              hops={session.hops}
              probeCount={session.probeCount}
            />
          </div>
        )}

        {activeTab === 'subnet' && (
          <SubnetCalculator
            subnet={subnet}
            onChangeSubnet={setSubnet}
            onScanSubnet={handleScanSubnet}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'scanner' && (
          <IpScanner
            initialRange="10.0.4.1 - 10.0.4.24"
            onTraceHost={handleTraceHost}
            onExportPdf={handleExportPdf}
            onScanComplete={setScanResults}
          />
        )}

        {activeTab === 'tools' && (
          <AdvancedTools
            initialTarget={session.target}
            onTraceTarget={handleTraceHost}
          />
        )}

        {activeTab === 'report' && (
          <ReportViewer
            session={session}
            subnet={subnet}
            scanResults={scanResults}
            aiReport={aiReport}
          />
        )}

        {activeTab === 'ai' && (
          <AiTroubleshooter
            session={session}
            subnet={subnet}
            scanResults={scanResults}
            aiReport={aiReport}
            onUpdateReport={setAiReport}
          />
        )}
      </main>

      {/* Frosted Footer */}
      <footer className="relative z-10 bg-white/5 backdrop-blur-xl border-t border-white/10 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="font-mono text-slate-300">RFC 3393 Jitter • RFC 2681 One-Way Latency • RFC 1889 RTCP MOS</span>
          </div>
          <div className="text-slate-400">
            Enterprise Network Diagnostic Suite • Built for Network Engineers & NetOps
          </div>
        </div>
      </footer>
    </div>
  );
}
