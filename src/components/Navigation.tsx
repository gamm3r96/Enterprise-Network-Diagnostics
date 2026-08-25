import React from 'react';
import { LayoutDashboard, Network, Cpu, Scan, FileText, Bot, Zap, Settings } from 'lucide-react';
import { DiagnosticTab } from '../types';

interface NavigationProps {
  activeTab: DiagnosticTab;
  onSelectTab: (tab: DiagnosticTab) => void;
  packetLossCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  packetLossCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as DiagnosticTab,
      label: 'Executive NOC Dashboard',
      sublabel: 'Overview & SLA KPIs',
      icon: LayoutDashboard,
      badge: 'NOC View',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 'mtr' as DiagnosticTab,
      label: 'Hop-by-Hop MTR & Latency',
      sublabel: 'Traceroute & Loss Topology',
      icon: Network,
      badge: packetLossCount > 0 ? `${packetLossCount} Drops` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'subnet' as DiagnosticTab,
      label: 'Subnet Performance Matrix',
      sublabel: 'CIDR & Latency Distribution',
      icon: Cpu,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'scanner' as DiagnosticTab,
      label: 'IP Range Scanner',
      sublabel: 'Port Audit & Fingerprinting',
      icon: Scan,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'tools' as DiagnosticTab,
      label: 'Advanced Network Tools',
      sublabel: 'DNS, TCP, MTU, BGP, VoIP & IPv6',
      icon: Zap,
      badge: '6 Tools',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 'report' as DiagnosticTab,
      label: 'Executive Diagnostic Report',
      sublabel: 'Exportable Audit & PDF',
      icon: FileText,
      badge: 'PDF Ready',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'ai' as DiagnosticTab,
      label: 'AI Root-Cause Analyzer',
      sublabel: 'Gemini 3.7 Technical Runbook',
      icon: Bot,
      badge: 'GenAI',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800'
    },
    {
      id: 'settings' as DiagnosticTab,
      label: 'Settings & Themes',
      sublabel: 'Palettes, SLAs & Sounds',
      icon: Settings,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <div className="bg-slate-950/30 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-2.5 overflow-x-auto py-3 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition whitespace-nowrap border backdrop-blur-md ${
                  isActive
                    ? 'bg-white/10 text-cyan-300 border-cyan-400/40 shadow-[0_4px_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold leading-none">{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold backdrop-blur-sm ${tab.badgeColor}`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{tab.sublabel}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
