'use client';

import { Code2, Star, Copy, Activity } from 'lucide-react';

const STATS = [
  { label: "Active Snippets", value: "24", delta: "+3 this week", icon: Code2, glow: "#00f0ff", accent: "text-neon-cyan", border: "hover:border-neon-cyan/40", shadow: "hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]" },
  { label: "Starred Snippets", value: "8", delta: "Top priority", icon: Star, glow: "#3b82f6", accent: "text-blue-400", border: "hover:border-blue-500/40", shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]" },
  { label: "Total Deployed", value: "1.4k", delta: "Sub-10ms cache", icon: Copy, glow: "#ff00ff", accent: "text-neon-magenta", border: "hover:border-neon-magenta/40", shadow: "hover:shadow-[0_0_30px_rgba(255,0,255,0.15)]" },
  { label: "O(1) Health Score", value: "98%", delta: "Quadratic-free", icon: Activity, glow: "#00f0ff", accent: "text-neon-cyan", border: "hover:border-neon-cyan/40", shadow: "hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]" },
];

export function BentoStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div 
            key={i} 
            className={`group relative flex flex-col p-5 rounded-2xl bg-[#12121A]/85 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:-translate-y-1 ${s.border} ${s.shadow} overflow-hidden`}
          >
            {/* Subtle radial reactor glow */}
            <div 
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none blur-xl"
              style={{ backgroundColor: s.glow }}
            />

            <div className="flex items-center justify-between mb-3 z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{s.label}</span>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 transition-colors" 
                style={{ backgroundColor: `${s.glow}15` }}
              >
                <Icon size={14} style={{ color: s.glow }} />
              </div>
            </div>

            <div className="text-3xl font-extrabold text-white tracking-tight mb-1 z-10 font-mono">{s.value}</div>
            <div className={`text-[11px] font-mono flex items-center gap-1 z-10 ${s.accent}`}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: s.glow }} />
              {s.delta}
            </div>
          </div>
        );
      })}
    </div>
  );
}
