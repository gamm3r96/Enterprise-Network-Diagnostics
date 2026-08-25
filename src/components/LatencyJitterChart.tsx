import React, { useState } from 'react';
import { HopDiagnostic } from '../types';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Radio } from 'lucide-react';

interface LatencyJitterChartProps {
  hops: HopDiagnostic[];
  target: string;
}

export const LatencyJitterChart: React.FC<LatencyJitterChartProps> = ({ hops, target }) => {
  const [chartView, setChartView] = useState<'latency_profile' | 'loss_distribution' | 'jitter_analysis'>('latency_profile');

  // Format data for Hop Latency Progression
  const hopData = hops.map(h => ({
    hop: `H${h.hop}`,
    name: `Hop ${h.hop} (${h.ip})`,
    ip: h.ip,
    host: h.host,
    avgRtt: h.avgRtt,
    minRtt: h.bestRtt,
    maxRtt: h.worstRtt,
    jitter: h.jitter,
    lossPercent: h.lossPercent,
    isRateLimited: h.status === 'rate-limited',
    degradationDelta: h.degradationDelta
  }));

  // Format data for Sequence Jitter over recent samples
  const maxHistoryLength = Math.max(...hops.map(h => h.rttHistory.length), 0);
  const sequenceData = [];

  for (let i = 0; i < maxHistoryLength; i++) {
    const point: any = { sample: `P${i + 1}` };
    hops.forEach(h => {
      if (h.rttHistory[i] !== undefined) {
        point[`Hop_${h.hop}`] = h.rttHistory[i];
      }
    });
    sequenceData.push(point);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/20 p-3.5 rounded-xl shadow-2xl text-xs font-mono">
          <p className="font-bold text-cyan-300 font-sans mb-1">{data.name || `Probe ${label}`}</p>
          {data.ip && <p className="text-slate-300">IP: <span className="text-white font-semibold">{data.ip}</span></p>}
          {data.avgRtt !== undefined && <p className="text-emerald-300 font-bold">Avg RTT: {data.avgRtt} ms</p>}
          {data.minRtt !== undefined && (
            <p className="text-slate-300">Min: {data.minRtt} ms / Max: {data.maxRtt} ms</p>
          )}
          {data.jitter !== undefined && <p className="text-amber-300">Jitter: {data.jitter} ms</p>}
          {data.lossPercent !== undefined && (
            <p className={data.lossPercent > 0 ? 'text-rose-300 font-bold' : 'text-emerald-300'}>
              Loss: {data.lossPercent}% {data.isRateLimited ? '(CoPP Rate-Limited)' : ''}
            </p>
          )}
          {data.degradationDelta > 0 && (
            <p className="text-cyan-300 mt-1">Step Delta: +{data.degradationDelta} ms</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
      {/* Chart Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Latency Step-Up & Jitter Telemetry Graph
            </h3>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-white/10 text-cyan-300 border border-white/10 backdrop-blur-sm">
              Target: {target}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify exact router nodes where latency steps up or bufferbloat causes RTT variance.
          </p>
        </div>

        <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 backdrop-blur-md text-xs">
          <button
            onClick={() => setChartView('latency_profile')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition ${
              chartView === 'latency_profile'
                ? 'bg-white/15 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Hop Latency Curve</span>
          </button>
          <button
            onClick={() => setChartView('loss_distribution')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition ${
              chartView === 'loss_distribution'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Packet Loss %</span>
          </button>
          <button
            onClick={() => setChartView('jitter_analysis')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition ${
              chartView === 'jitter_analysis'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Jitter Histogram</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'latency_profile' ? (
            <AreaChart data={hopData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rttGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="hop" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="ms" tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="maxRtt" stroke="#f59e0b" fillOpacity={1} fill="url(#maxGradient)" name="Max RTT" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="avgRtt" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#rttGradient)" name="Avg RTT" />
              <Line type="monotone" dataKey="minRtt" stroke="#10b981" strokeWidth={1.5} dot={false} name="Min RTT" />
            </AreaChart>
          ) : chartView === 'loss_distribution' ? (
            <BarChart data={hopData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="hop" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" tickLine={false} domain={[0, 25]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '1% SLA Threshold', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '5% Enterprise Critical', fill: '#ef4444', fontSize: 10 }} />
              <Bar dataKey="lossPercent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Packet Loss %" />
            </BarChart>
          ) : (
            <AreaChart data={hopData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="jitterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="hop" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="ms" tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="jitter" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#jitterGrad)" name="RFC 3393 Jitter" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Metric Callouts Below Chart */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <span className="text-slate-400">Total Path Latency:</span>
          <span className="font-mono font-bold text-white">{hops[hops.length - 1]?.avgRtt || 0} ms</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-slate-400">Best Propagation:</span>
          <span className="font-mono font-bold text-emerald-300">{hops[hops.length - 1]?.bestRtt || 0} ms</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
          <span className="text-slate-400">Max Jitter Spread:</span>
          <span className="font-mono font-bold text-amber-300">
            {Math.max(...hops.map(h => h.jitter), 0)} ms
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
          <span className="text-slate-400">Worst Hop Loss:</span>
          <span className="font-mono font-bold text-rose-300">
            {Math.max(...hops.map(h => h.lossPercent), 0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
