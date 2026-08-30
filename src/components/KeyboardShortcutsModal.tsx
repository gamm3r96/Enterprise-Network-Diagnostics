import React from 'react';
import { Command, X, Zap, Play, RefreshCw, Layers, FileText, Palette, HardDrive, Download, HelpCircle, Volume2 } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Telemetry & Probing',
      items: [
        { key: 'Space', desc: 'Toggle Continuous Live MTR Probing (Start / Stop)' },
        { key: 'R', desc: 'Execute Single Diagnostic Probe Cycle' },
        { key: 'M', desc: 'Toggle Sound Engine Alerts (Chimes & Alarms)' },
        { key: 'P', desc: 'Generate & Export Enterprise PDF Diagnostic SLA Report' }
      ]
    },
    {
      category: 'Workspace Navigation',
      items: [
        { key: '1', desc: 'Switch to Executive NOC Dashboard' },
        { key: '2', desc: 'Switch to Hop-by-Hop MTR & Latency View' },
        { key: '3', desc: 'Switch to Subnet Performance Matrix' },
        { key: '4', desc: 'Switch to IP Range & Port Scanner' },
        { key: '5', desc: 'Switch to Advanced Protocol Tools (DNS, TCP, BGP, MTU)' },
        { key: '6', desc: 'Switch to Executive Diagnostic Report View' },
        { key: '7', desc: 'Switch to AI Root-Cause Troubleshooting Assistant' },
        { key: '8', desc: 'Switch to Settings & Theme Customization' }
      ]
    },
    {
      category: 'System & Interface',
      items: [
        { key: 'T', desc: 'Cycle Active Color Theme (Cyber Slate, Matrix, Deep Space, etc.)' },
        { key: 'I', desc: 'Open Desktop App & Mobile Installation Options (PWA)' },
        { key: '?', desc: 'Toggle this Keyboard Shortcuts Reference' },
        { key: 'Esc', desc: 'Close any active modal dialog or popover' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">CCIE Keyboard Shortcuts & Hotkeys</h3>
              <p className="text-xs text-slate-400">High-speed keyboard navigation for network engineers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {shortcuts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {group.category}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs hover:border-cyan-500/20 transition"
                  >
                    <span className="text-slate-300 text-[11.5px]">{item.desc}</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/20 text-cyan-300 font-mono font-bold text-xs shadow-inner min-w-[28px] text-center">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">?</kbd> at any time to reopen
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
