import React from 'react';
import { WifiOff, HardDrive, CheckCircle2 } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-500/20 backdrop-blur-md border-b border-amber-400/40 px-4 py-2 text-amber-200 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="font-semibold text-amber-100">
            Offline Mode Active:
          </span>
          <span className="text-amber-200/90 hidden sm:inline">
            Local calculation tools (Subnet Matrix, MTU/MSS PMTUD, VoIP MOS, TCP Mathis, & cached reports) remain fully operational without internet.
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-400/30 text-[10px] font-mono text-amber-300">
          <HardDrive className="w-3 h-3" />
          <span>OFFLINE CACHE</span>
        </div>
      </div>
    </div>
  );
};
