'use client';

import { useState, useEffect } from 'react';
import { Snippet, XRayData } from '@/types';
import { Star, Copy, Edit2, Zap, BrainCircuit, RotateCcw, AlertTriangle, Eye, Activity, Trash2, Flame, ArrowUpRight, GitBranch, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const LANG_ACCENTS: Record<string, { color: string; gradient: string; border: string; glow: string }> = {
  TypeScript: { 
    color: '#38bdf8', 
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
    border: 'hover:border-sky-500/60',
    glow: 'rgba(56, 189, 248, 0.25)'
  },
  JavaScript: { 
    color: '#facc15', 
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'hover:border-amber-500/60',
    glow: 'rgba(250, 204, 21, 0.25)'
  },
  Python: { 
    color: '#60a5fa', 
    gradient: 'from-blue-500/20 via-sky-500/10 to-transparent',
    border: 'hover:border-blue-500/60',
    glow: 'rgba(96, 165, 250, 0.25)'
  },
  HTML: { 
    color: '#34d399', 
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    border: 'hover:border-emerald-500/60',
    glow: 'rgba(52, 211, 153, 0.25)'
  },
  CSS: { 
    color: '#a78bfa', 
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    border: 'hover:border-purple-500/60',
    glow: 'rgba(167, 139, 250, 0.25)'
  },
  SQL: { 
    color: '#f472b6', 
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    border: 'hover:border-pink-500/60',
    glow: 'rgba(244, 114, 182, 0.25)'
  },
};

interface SnippetCardProps {
  snippet: Snippet;
  isTrending?: boolean; 
  onToggleStar: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onUpdateMetric: (id: string, type: 'copies' | 'views') => void; 
  onUpdateXRay?: (id: string, xray: XRayData, isHighRisk?: boolean) => void;
}

export function SnippetCard({ snippet, isTrending, onToggleStar, onEdit, onDelete, onUpdateMetric, onUpdateXRay }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [localXRay, setLocalXRay] = useState(snippet.xray);

  // 3D Tilt State
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLocalXRay(snippet.xray);
    if (!snippet.xray) setIsFlipped(false);
  }, [snippet.xray, snippet.code]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTiltX(((y - centerY) / centerY) * -8);
    setTiltY(((x - centerX) / centerX) * 8);
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000);
    if (onUpdateMetric) {
      onUpdateMetric(snippet.id, 'copies');
    }
  };

  const triggerXRay = async () => {
    if (onUpdateMetric) {
      onUpdateMetric(snippet.id, 'views');
    }

    if (localXRay && Object.keys(localXRay).length > 0) { 
      setIsFlipped(true); 
      return; 
    }
    
    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: snippet.code, language: snippet.language })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newXRay = {
          timeComplexity: data.xray.timeComplexity || 'O(?)',
          spaceComplexity: data.xray.spaceComplexity || 'O(?)',
          explanation: data.xray.improvements?.length ? data.xray.improvements : ['Algorithm execution is optimal.', 'Memory allocation is bounded.'],
          vulnerabilities: data.xray.bugs?.length ? data.xray.bugs : ['Zero edge-case vulnerabilities found.']
        };

        const vulnsCount = newXRay.vulnerabilities?.length || 0;
        const hasHeavyComplexity = /(n\^|n²|n³|2\^|n!)/i.test(newXRay.timeComplexity || '');
        const isHighRisk = vulnsCount > 3 || (hasHeavyComplexity && vulnsCount > 1);

        setLocalXRay(newXRay);
        setIsFlipped(true);

        if (onUpdateXRay) {
          onUpdateXRay(snippet.id, newXRay, isHighRisk);
        }

        const username = localStorage.getItem('vault_username');
        if (username) {
          fetch('/api/snippets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              snippet: { ...snippet, xray: newXRay, highRisk: isHighRisk }
            })
          }).catch(err => console.error("Failed to save XRay:", err));
        }

      } else {
        alert("Diagnostics Failed: " + (data.error || 'Server error'));
      }
    } catch (error) {
      alert("Network error during Diagnostics.");
    } finally {
      setAnalyzing(false);
    }
  };

  const accent = LANG_ACCENTS[snippet.language] || {
    color: '#6366f1',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    border: 'hover:border-indigo-500/60',
    glow: 'rgba(99, 102, 241, 0.25)'
  };

  return (
    <div 
      className="relative h-[480px] w-full [perspective:1400px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        animate={{ 
          rotateX: isFlipped ? 0 : tiltX, 
          rotateY: isFlipped ? 180 : tiltY,
          scale: isHovered && !isFlipped ? 1.02 : 1
        }} 
        transition={{ type: 'spring', stiffness: 350, damping: 25 }} 
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        
        {/* FRONT SIDE - Ultra-Modern Glassmorphism Card */}
        <div 
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d131f]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300 [backface-visibility:hidden] ${accent.border}`}
          style={{
            boxShadow: isHovered 
              ? `0 25px 60px -10px ${accent.glow}, 0 0 30px -5px ${accent.glow}, 0 0 0 1px rgba(255, 255, 255, 0.2)` 
              : '0 10px 30px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Dynamic Top Ambient Glow Gradient */}
          <div 
            className={`absolute -top-24 -right-24 h-60 w-60 rounded-full bg-gradient-to-br ${accent.gradient} blur-3xl pointer-events-none transition-all duration-500 ${isHovered ? 'opacity-100 scale-150' : 'opacity-35'}`} 
          />
          <div 
            className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" 
          />

          {/* Header */}
          <header className="mb-4 flex items-start justify-between relative z-10">
            <div className="min-w-0 pr-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span 
                  style={{ color: accent.color, borderColor: `${accent.color}45`, backgroundColor: `${accent.color}15` }}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent.color }} />
                  {snippet.language}
                </span>
                
                {isTrending && (
                  <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/35 flex items-center gap-1 px-2 py-0.5 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                    <Flame size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wide">Edge Synced</span>
                  </div>
                )}

                {(snippet.highRisk || (localXRay?.vulnerabilities && localXRay.vulnerabilities.length > 3)) && (
                  <div className="rounded-lg bg-rose-500/15 border border-rose-500/35 flex items-center gap-1 px-2 py-0.5 shadow-[0_0_12px_rgba(244,63,94,0.25)]" title="Multiple high complexity risks contained by AI diagnostics">
                    <ShieldAlert size={12} className="text-rose-400" />
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wide">Risk Saved</span>
                  </div>
                )}
              </div>

              <h3 className="truncate text-base font-extrabold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                {snippet.title}
              </h3>
            </div>
            
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-900/60 border border-white/5 p-1 backdrop-blur-md">
              <button 
                onClick={() => onToggleStar(snippet.id)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all cursor-pointer" 
                title="Star"
              >
                <Star size={15} fill={snippet.starred ? "#f59e0b" : "none"} color={snippet.starred ? "#f59e0b" : "currentColor"} />
              </button>
              <button 
                onClick={() => onEdit(snippet)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-all cursor-pointer" 
                title="Edit"
              >
                <Edit2 size={15} />
              </button>
              <button 
                onClick={() => onDelete(snippet.id)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer" 
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </header>

          {/* CODE TERMINAL WITH GLASS MORPHISM */}
          <div className="relative mb-3.5 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1d]/90 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] backdrop-blur-md z-10 flex flex-col justify-between">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-slate-900/40">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500/70" />
                <span className="h-2 w-2 rounded-full bg-amber-500/70" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Readout</span>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <SyntaxHighlighter 
                language={snippet.language.toLowerCase()} 
                style={vscDarkPlus} 
                customStyle={{ margin: 0, padding: '12px 14px', fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'transparent', maxHeight: '140px' }}
              >
                {snippet.code}
              </SyntaxHighlighter>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0f1d] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="mb-4 text-xs text-slate-300 leading-relaxed line-clamp-2 z-10">
            {snippet.description || 'Raw algorithm sequence synced to Vantage distributed edge.'}
          </p>

          {/* FOOTER ACTIONS */}
          <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-white/10 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300" title="Deployments / Copies">
                  <Copy className="h-3.5 w-3.5 text-sky-400" /> {snippet.copies || 0}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300" title="Diagnostic Scans">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" /> {snippet.views || 0}
                </span>
                {(snippet.conversionCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-emerald-300" title="Language Conversions">
                    <GitBranch className="h-3.5 w-3.5 text-emerald-400" /> {snippet.conversionCount}
                  </span>
                )}
              </div>
              <button 
                onClick={handleCopy} 
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                  copied 
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <button 
              onClick={triggerXRay} 
              disabled={analyzing} 
              className="relative group/btn flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 p-px shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_6px_28px_rgba(99,102,241,0.55)] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-slate-950/40 px-4 py-2.5 transition-colors group-hover/btn:bg-transparent">
                <BrainCircuit className={`h-4 w-4 text-white ${analyzing ? 'animate-spin' : ''}`} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {analyzing ? 'Analyzing Architecture...' : localXRay ? 'View Complexity Diagnostic' : 'Run Cognitive X-Ray'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* BACK SIDE (Cognitive Diagnostics) */}
        <div className="absolute inset-0 flex flex-col rounded-3xl border border-indigo-500/40 bg-[#111827]/95 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-sky-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">Diagnostics Matrix</span>
            </div>
            <button 
              onClick={() => setIsFlipped(false)} 
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Flip Back
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-center shadow-inner">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Time Complexity</div>
              <div className="mt-1 text-xl font-black text-sky-300 font-mono">{localXRay?.timeComplexity}</div>
            </div>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-center shadow-inner">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Space Complexity</div>
              <div className="mt-1 text-xl font-black text-indigo-300 font-mono">{localXRay?.spaceComplexity}</div>
            </div>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 scrollbar-thin">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <Eye className="h-3.5 w-3.5 text-sky-400" /> Algorithmic Bounds
              </div>
              <ul className="space-y-1.5">
                {localXRay?.explanation?.map((item: string, idx: number) => (
                  <li key={idx} className="text-xs leading-relaxed text-slate-300 pl-3 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-sky-400">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Vulnerabilities & Bounds
              </div>
              <ul className="space-y-1.5">
                {localXRay?.vulnerabilities?.map((item: string, idx: number) => (
                  <li key={idx} className="text-xs leading-relaxed text-rose-200 pl-3 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-400">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
