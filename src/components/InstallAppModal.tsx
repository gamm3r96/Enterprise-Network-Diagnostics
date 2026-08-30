import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  Monitor,
  Smartphone,
  Laptop,
  Layers,
  Zap,
  HardDrive,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Command
} from 'lucide-react';
import { OSPlatform } from '../hooks/usePwaInstall';
import appLogo from '../assets/images/app_logo_icon_1786884494503.jpg';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: OSPlatform;
  onTriggerInstall: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isStandalone,
  platform,
  onTriggerInstall
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<OSPlatform>(platform);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstallStatus('prompting');
    const result = await onTriggerInstall();
    if (result === 'accepted') {
      setInstallStatus('success');
    } else if (result === 'dismissed') {
      setInstallStatus('dismissed');
    } else {
      setInstallStatus('manual');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-slate-900 flex-shrink-0">
              <img
                src={appLogo}
                alt="NetTrace Enterprise"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Install NetTrace Enterprise App</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">Desktop & Mobile Standalone Network Diagnostics Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Action Feedback Banner */}
          {installStatus === 'success' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Installation approved! NetTrace is now installed on your system.</span>
            </div>
          )}
          {installStatus === 'manual' && (
            <div className="p-3.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Select your operating system tab below for the direct browser install steps.</span>
            </div>
          )}

          {/* Status Banner */}
          {isStandalone || isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">App Already Installed / Running in Standalone Window</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  NetTrace is running as a dedicated native progressive app with offline caching, high-frequency timer execution, and low-latency hardware rendering.
                </p>
              </div>
            </div>
          ) : (
            /* Quick Install Trigger Banner */
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Direct 1-Click Installation
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Launch from your Desktop, Taskbar, or Dock without address bar chrome.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isInstallable ? 'Install Now' : 'Add to System'}
              </button>
            </div>
          )}

          {/* Benefits Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Why Install as a Standalone Desktop App?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-200">100% Offline Utilities</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Subnet calculators, MTU/MSS formulas, TCP Mathis models, and VoIP MOS engines work with zero internet.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <Monitor className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-200">Dedicated Window UI</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Zero browser tab clutter. Pin NetTrace to your Windows Taskbar, macOS Dock, or Linux Panel.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
                  <Zap className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-200">Fast Keyboard Probing</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Use CCIE hotkeys (<code className="text-cyan-300">Space</code>, <code className="text-cyan-300">R</code>, <code className="text-cyan-300">1-7</code>, <code className="text-cyan-300">T</code>) without browser shortcut clashes.
                </p>
              </div>
            </div>
          </div>

          {/* OS-Specific Step-by-Step Guide Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Installation Instructions by Operating System
              </h4>
              <span className="text-[10px] text-cyan-400 font-mono">
                Detected: {platform.toUpperCase()}
              </span>
            </div>

            {/* Platform Selector Buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 mb-3">
              <button
                onClick={() => setActivePlatformTab('macos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activePlatformTab === 'macos'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                macOS
              </button>
              <button
                onClick={() => setActivePlatformTab('windows')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activePlatformTab === 'windows'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Windows 11 / 10
              </button>
              <button
                onClick={() => setActivePlatformTab('ios')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activePlatformTab === 'ios'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                iOS / iPadOS (Safari)
              </button>
              <button
                onClick={() => setActivePlatformTab('android')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activePlatformTab === 'android'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Android (Chrome)
              </button>
              <button
                onClick={() => setActivePlatformTab('linux')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activePlatformTab === 'linux'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Linux / Chromium
              </button>
            </div>

            {/* OS Specific Instructions Card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs space-y-3">
              {activePlatformTab === 'macos' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Laptop className="w-4 h-4" />
                    <span>macOS (Google Chrome, Microsoft Edge, or Safari)</span>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300 text-[11.5px] leading-relaxed">
                    <li>
                      <strong>Google Chrome / Edge / Brave:</strong> Look at the right side of the URL address bar and click the <strong>Install NetTrace</strong> icon (<Download className="w-3 h-3 inline text-cyan-400" />), then confirm <strong>Install</strong>.
                    </li>
                    <li>
                      <strong>Apple Safari (macOS Sonoma+):</strong> Click <strong>File</strong> in the top menu bar &rarr; select <strong>Add to Dock...</strong> &rarr; click <strong>Add</strong>.
                    </li>
                    <li>
                      The app will now launch in its own self-contained native window directly from your Applications folder, Launchpad, or Dock!
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'windows' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Monitor className="w-4 h-4" />
                    <span>Windows 11 & Windows 10 (Microsoft Edge or Google Chrome)</span>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300 text-[11.5px] leading-relaxed">
                    <li>
                      <strong>Microsoft Edge:</strong> Click the <strong>App available</strong> icon in the address bar, or click <strong>... (Settings) &rarr; Apps &rarr; Install NetTrace Enterprise</strong>.
                    </li>
                    <li>
                      <strong>Google Chrome:</strong> Click the <strong>Install</strong> icon on the right side of the omnibox address bar.
                    </li>
                    <li>
                      Check <strong>Pin to Taskbar</strong> and <strong>Pin to Start Menu</strong> for instantaneous 1-click diagnostic access.
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'ios' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>iOS & iPadOS (Apple Safari)</span>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300 text-[11.5px] leading-relaxed">
                    <li>
                      Open this app URL in <strong>Apple Safari</strong> on your iPhone or iPad.
                    </li>
                    <li>
                      Tap the <strong>Share</strong> button (<Share2 className="w-3.5 h-3.5 inline text-cyan-400" />) in the Safari toolbar (bottom on iPhone, top on iPad).
                    </li>
                    <li>
                      Scroll down the share sheet and tap <strong>Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />).
                    </li>
                    <li>
                      Tap <strong>Add</strong> in the top-right corner. NetTrace will now appear as a dedicated app icon with fullscreen viewport support.
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'android' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Android (Google Chrome, Firefox, or Samsung Internet)</span>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300 text-[11.5px] leading-relaxed">
                    <li>
                      Tap the <strong>Install Now</strong> button at the top of this dialog, or tap the Chrome three-dot menu (<strong>⋮</strong>).
                    </li>
                    <li>
                      Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </li>
                    <li>
                      Confirm <strong>Install</strong>. Android will create an integrated WebAPK in your App Drawer with full system permissions.
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'linux' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Linux (Chromium, Google Chrome, Brave, Edge)</span>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300 text-[11.5px] leading-relaxed">
                    <li>
                      In Chromium/Chrome, click the <strong>Install</strong> icon in the address bar.
                    </li>
                    <li>
                      A <code>.desktop</code> entry is automatically added to your GNOME / KDE / XFCE application menu.
                    </li>
                    <li>
                      Launch via your application launcher or terminal (<code>chromium --app=https://...</code>).
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted HTTPS • Zero External Telemetry Tracking</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
