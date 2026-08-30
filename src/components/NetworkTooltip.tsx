import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle, Layers, Zap, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export type TooltipTopic = 'frame_mtu' | 'dscp_qos';

interface NetworkTooltipProps {
  topic: TooltipTopic;
  className?: string;
  buttonLabel?: string;
  iconOnly?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function NetworkTooltip({
  topic,
  className = '',
  buttonLabel,
  iconOnly = true,
  position = 'bottom'
}: NetworkTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isMtu = topic === 'frame_mtu';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        id={`tooltip-trigger-${topic}`}
        aria-label={`Explain ${isMtu ? 'Frame MTU' : 'DSCP / ToS'} networking impact`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all duration-150 flex items-center gap-1 group cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80 group-hover:text-cyan-300 transition-colors" />
        {!iconOnly && buttonLabel && (
          <span className="text-[10px] font-mono text-cyan-400/90 font-medium">{buttonLabel}</span>
        )}
      </button>

      {isOpen && (
        <div
          id={`tooltip-popover-${topic}`}
          role="tooltip"
          className={`absolute z-50 w-80 sm:w-96 p-4 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 text-slate-200 shadow-2xl shadow-cyan-950/80 text-left transition-all duration-200 pointer-events-auto ${
            position === 'bottom'
              ? 'top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
              : position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
              : position === 'left'
              ? 'right-full mr-2 top-0'
              : 'left-full ml-2 top-0'
          }`}
          style={{ maxWidth: 'calc(100vw - 32px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {isMtu ? (
            /* FRAME MTU / PACKET SIZING CONTENT */
            <div className="space-y-3">
              <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Frame MTU & Packet Size
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        L3/L2 Sizing
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Path MTU Discovery (PMTUD) & Tunnel Overhead Impact
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] leading-relaxed text-slate-300 space-y-2">
                <p>
                  Controls the byte size of active diagnostic probe packets injected into the routing path.
                </p>

                <div className="bg-slate-900/80 rounded-lg p-2.5 border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    Enterprise QoS & Networking Impact:
                  </div>
                  <ul className="space-y-1 text-[10.5px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">PMTU Black Holes:</strong> Probing with <code className="text-cyan-300 bg-black/40 px-1 rounded">1472B</code> (1500B L2 MTU) identifies paths dropping packets where ICMP <em>Fragmentation Needed</em> is blocked.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">VPN / SD-WAN Encapsulation:</strong> IPsec (56–76B), WireGuard (60–80B), & GRE (24B) reduce path MTU. Oversized frames trigger router CPU fragmentation and throughput drops.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">Voice PPS vs Throughput:</strong> <code className="text-cyan-300 bg-black/40 px-1 rounded">64B</code> simulates VoIP (RTP) packet rate pressure on switch ASIC lookup queues.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sizing Guide:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <div className="bg-black/40 p-1.5 rounded border border-white/5">
                      <span className="text-cyan-300 font-bold">64 Bytes:</span>
                      <span className="text-slate-400 block font-sans">VoIP RTP / Low Latency</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-white/5">
                      <span className="text-cyan-300 font-bold">512 Bytes:</span>
                      <span className="text-slate-400 block font-sans">Mid-tier TLS / Handshake</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-white/5">
                      <span className="text-emerald-300 font-bold">1472 Bytes:</span>
                      <span className="text-slate-400 block font-sans">Max IPv4 unfrag payload</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-white/5">
                      <span className="text-amber-300 font-bold">1500 Bytes:</span>
                      <span className="text-slate-400 block font-sans">Full Ethernet L2 MTU</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DSCP / TOS QOS CONTENT */
            <div className="space-y-3">
              <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      QoS DSCP / DiffServ Marking
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        RFC 2474 / 4594
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Traffic Classification & Hardware Queue Prioritization
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] leading-relaxed text-slate-300 space-y-2">
                <p>
                  Sets the 6-bit Differentiated Services Code Point in the IP header to test how enterprise WAN routers and carriers prioritize packets under congestion.
                </p>

                <div className="bg-slate-900/80 rounded-lg p-2.5 border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Enterprise QoS & Routing Impact:
                  </div>
                  <ul className="space-y-1 text-[10.5px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">Low Latency Queuing (LLQ):</strong> <code className="text-amber-300 bg-black/40 px-1 rounded">EF (46)</code> bypasses standard FIFO buffers for jitter-free real-time audio.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">SD-WAN Dynamic Steering:</strong> Enterprise WAN edges route high-priority DSCP classes over premium MPLS links vs commodity internet.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong className="text-slate-100">WRED Drop Precedence:</strong> Assured Forwarding classes (<code className="text-amber-300 bg-black/40 px-1 rounded">AF41</code>, <code className="text-amber-300 bg-black/40 px-1 rounded">AF31</code>) prevent tail-drop for critical ERP/video streams.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    DiffServ QoS Class Mapping:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <div className="bg-black/40 p-1.5 rounded border border-white/5">
                      <span className="text-slate-400 font-bold">CS0 (0):</span>
                      <span className="text-slate-400 block font-sans">Best Effort (Default Web)</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-rose-500/20">
                      <span className="text-rose-300 font-bold">EF (46):</span>
                      <span className="text-slate-400 block font-sans">VoIP / Strict Priority</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-amber-500/20">
                      <span className="text-amber-300 font-bold">AF41 (34):</span>
                      <span className="text-slate-400 block font-sans">Interactive Video / Conf</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-cyan-500/20">
                      <span className="text-cyan-300 font-bold">AF31 (26):</span>
                      <span className="text-slate-400 block font-sans">Critical Enterprise Data</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded border border-purple-500/20 col-span-2">
                      <span className="text-purple-300 font-bold">CS6 (48):</span>
                      <span className="text-slate-400 block font-sans">Internetwork Control Plane (BGP/OSPF)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
