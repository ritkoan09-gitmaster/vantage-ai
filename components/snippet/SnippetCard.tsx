'use client';

import { useState, useEffect } from 'react';
import { Snippet } from '@/types';
import { Star, Copy, Edit2, Zap, BrainCircuit, RotateCcw, AlertTriangle, Eye, Activity, Trash2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANG_COLORS: Record<string, string> = { 
  TypeScript: "#00f0ff", JavaScript: "#f7df1e", Python: "#3b82f6", SQL: "#a855f7", HTML: "#ff00ff" 
};

interface SnippetCardProps {
  snippet: Snippet;
  isTrending?: boolean; 
  onToggleStar: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onUpdateMetric: (id: string, type: 'copies' | 'views') => void; 
}

export function SnippetCard({ snippet, isTrending, onToggleStar, onEdit, onDelete, onUpdateMetric }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [localXRay, setLocalXRay] = useState(snippet.xray);

  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

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
    setTiltX(((y - centerY) / centerY) * -6);
    setTiltY(((x - centerX) / centerX) * 6);
  };

  const handleMouseLeave = () => { setTiltX(0); setTiltY(0); };

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
          explanation: data.xray.improvements?.length ? data.xray.improvements : ['Core logic is highly optimized.', 'Execution flow is stable.'],
          vulnerabilities: data.xray.bugs?.length ? data.xray.bugs : ['No critical vulnerabilities detected. 100% Secure.']
        };

        setLocalXRay(newXRay);
        setIsFlipped(true);

        const username = localStorage.getItem('vault_username');
        if (username) {
          fetch('/api/snippets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              snippet: { ...snippet, xray: newXRay }
            })
          }).catch(err => console.error("Failed to save XRay:", err));
        }

      } else {
        alert("🚨 Cognitive Diagnostics Failed: " + (data.error || 'Server error'));
      }
    } catch (error) {
      alert("Network error during Cognitive Diagnostics.");
    } finally {
      setAnalyzing(false);
    }
  };

  const lc = LANG_COLORS[snippet.language] || "#00f0ff";

  return (
    <div className="relative h-[470px] w-full [perspective:1500px]">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="h-full w-full [transform-style:preserve-3d]"
      >
        <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }} className="relative h-full w-full [transform-style:preserve-3d]">
          
          {/* FRONT SIDE */}
          <div className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border ${isTrending ? 'border-neon-cyan/70 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : 'border-white/10'} bg-[#12121A]/90 p-5 shadow-xl backdrop-blur-xl [backface-visibility:hidden] hover:border-neon-cyan/50 hover:shadow-[0_15px_40px_rgba(0,240,255,0.15)] transition-all`}>
            
            {/* Ambient Reactor Glow on Hover */}
            <div 
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none blur-2xl z-0"
              style={{ backgroundColor: lc }}
            />

            <header className="mb-3.5 flex items-start justify-between z-10">
              <div className="min-w-0 pr-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span 
                    style={{ color: lc, borderColor: `${lc}40`, backgroundColor: `${lc}15` }} 
                    className="inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase"
                  >
                    {snippet.language}
                  </span>
                  
                  {isTrending && (
                    <div className="rounded-md bg-neon-cyan/10 border border-neon-cyan/30 flex items-center gap-1 px-2 py-0.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                      <Flame size={11} className="text-neon-cyan" />
                      <span className="text-[9px] font-mono font-bold uppercase text-neon-cyan tracking-wider">Edge Synced</span>
                    </div>
                  )}
                </div>

                <h3 className="truncate text-base font-bold text-white tracking-tight">{snippet.title}</h3>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button onClick={() => onDelete(snippet.id)} className="p-1.5 text-zinc-400 transition-all hover:text-red-400 hover:scale-110 active:scale-95 cursor-pointer" title="Delete Snippet"><Trash2 size={15} /></button>
                <button onClick={() => onEdit(snippet)} className="p-1.5 text-zinc-400 transition-all hover:text-neon-cyan hover:scale-110 active:scale-95 cursor-pointer" title="Edit Snippet"><Edit2 size={15} /></button>
                <button onClick={() => onToggleStar(snippet.id)} className="p-1.5 text-zinc-400 transition-all hover:scale-110 active:scale-95 cursor-pointer" title="Star Snippet"><Star size={15} fill={snippet.starred ? "#00f0ff" : "none"} color={snippet.starred ? "#00f0ff" : "currentColor"} /></button>
              </div>
            </header>

            {/* TERMINAL */}
            <div className="relative mb-3.5 overflow-hidden rounded-xl border border-white/10 bg-[#07070A]/95 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] z-10">
              <SyntaxHighlighter language={snippet.language.toLowerCase()} style={vscDarkPlus} customStyle={{ margin: 0, padding: '12px 14px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', background: 'transparent', maxHeight: '150px' }}>{snippet.code}</SyntaxHighlighter>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#07070A] to-transparent pointer-events-none" />
            </div>

            {/* DESCRIPTION */}
            <p className="mb-3.5 flex-1 text-xs text-zinc-400 leading-relaxed overflow-y-auto pr-1 scrollbar-thin z-10">{snippet.description}</p>

            <div className="mt-auto flex flex-col gap-3 z-10">
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5"><Copy className="h-3.5 w-3.5 text-neon-cyan" /> {snippet.copies}</span>
                  <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-neon-magenta" /> {snippet.views}</span>
                </div>
                <button 
                  onClick={handleCopy} 
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${copied ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>

              <button 
                onClick={triggerXRay} 
                disabled={analyzing} 
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <BrainCircuit className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? 'Calculating Complexity...' : localXRay ? 'View Complexity Analysis' : 'Run Complexity Calculator'}
              </button>
            </div>
          </div>

          {/* BACK SIDE (Complexity Diagnostics) */}
          <div className="absolute inset-0 flex flex-col rounded-2xl border border-neon-cyan/40 bg-[#0B0F19]/95 p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] backdrop-blur-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-neon-cyan animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-neon-cyan">Cognitive Diagnostics</span>
              </div>
              <button 
                onClick={() => setIsFlipped(false)} 
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Flip Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-3.5 text-center shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Time Complexity</div>
                <div className="mt-1 text-2xl font-black text-neon-cyan font-mono">{localXRay?.timeComplexity}</div>
              </div>
              <div className="rounded-xl border border-neon-magenta/30 bg-neon-magenta/10 p-3.5 text-center shadow-[0_0_15px_rgba(255,0,255,0.1)]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Space Complexity</div>
                <div className="mt-1 text-2xl font-black text-neon-magenta font-mono">{localXRay?.spaceComplexity}</div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-neon-cyan">
                  <Eye className="h-3.5 w-3.5 text-neon-cyan" /> Optimization Insights
                </div>
                <ul className="space-y-1.5">
                  {localXRay?.explanation?.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs leading-relaxed text-zinc-300 pl-3.5 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-neon-cyan">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Vulnerabilities / Edge Cases
                </div>
                <ul className="space-y-1.5">
                  {localXRay?.vulnerabilities?.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs leading-relaxed text-red-300/90 pl-3.5 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-red-400">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
