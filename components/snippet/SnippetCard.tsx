'use client';

import { useState, useEffect } from 'react';
import { Snippet } from '@/types';
import { Star, Copy, Edit2, Zap, BrainCircuit, RotateCcw, AlertTriangle, Eye, Activity, Trash2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANG_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  TypeScript: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  JavaScript: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  Python: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  HTML: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  CSS: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  SQL: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
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

  useEffect(() => {
    setLocalXRay(snippet.xray);
    if (!snippet.xray) setIsFlipped(false);
  }, [snippet.xray, snippet.code]);

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
        alert("Diagnostics Failed: " + (data.error || 'Server error'));
      }
    } catch (error) {
      alert("Network error during Diagnostics.");
    } finally {
      setAnalyzing(false);
    }
  };

  const badgeStyle = LANG_BADGE[snippet.language] || { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };

  return (
    <div className="relative h-[460px] w-full [perspective:1200px]">
      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="relative h-full w-full [transform-style:preserve-3d]">
        
        {/* FRONT SIDE - Premium Slate Card */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:border-slate-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all [backface-visibility:hidden]">
          
          <header className="mb-3.5 flex items-start justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {snippet.language}
                </span>
                
                {isTrending && (
                  <div className="rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-300 tracking-wide">+49%</span>
                  </div>
                )}
              </div>

              <h3 className="truncate text-base font-bold text-slate-100 tracking-tight">{snippet.title}</h3>
            </div>
            
            <div className="flex shrink-0 items-center gap-1">
              <button onClick={() => onToggleStar(snippet.id)} className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors" title="Star Snippet">
                <Star size={15} fill={snippet.starred ? "#f59e0b" : "none"} color={snippet.starred ? "#f59e0b" : "currentColor"} />
              </button>
              <button onClick={() => onEdit(snippet)} className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors" title="Edit Snippet">
                <Edit2 size={15} />
              </button>
              <button onClick={() => onDelete(snippet.id)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" title="Delete Snippet">
                <Trash2 size={15} />
              </button>
            </div>
          </header>

          {/* CODE TERMINAL */}
          <div className="relative mb-3.5 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] shadow-inner">
            <SyntaxHighlighter language={snippet.language.toLowerCase()} style={vscDarkPlus} customStyle={{ margin: 0, padding: '12px 14px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', background: 'transparent', maxHeight: '140px' }}>
              {snippet.code}
            </SyntaxHighlighter>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none" />
          </div>

          {/* DESCRIPTION */}
          <p className="mb-3.5 flex-1 text-xs text-slate-400 leading-relaxed overflow-y-auto pr-1">
            {snippet.description || 'No description provided.'}
          </p>

          {/* BOTTOM METRICS & ACTIONS */}
          <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Copy className="h-3.5 w-3.5 text-sky-400" /> {snippet.copies}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" /> {snippet.views}
                </span>
              </div>
              <button 
                onClick={handleCopy} 
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                  copied 
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' 
                    : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>

            <button 
              onClick={triggerXRay} 
              disabled={analyzing} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <BrainCircuit className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyzing Architecture...' : localXRay ? 'View Analysis' : 'Run Diagnostics'}
            </button>
          </div>
        </div>

        {/* BACK SIDE (Diagnostics) */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-indigo-500/40 bg-[#1e293b] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">Diagnostics Matrix</span>
            </div>
            <button 
              onClick={() => setIsFlipped(false)} 
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Flip Back
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-3 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Time Complexity</div>
              <div className="mt-1 text-xl font-bold text-sky-400 font-mono">{localXRay?.timeComplexity}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-3 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Space Complexity</div>
              <div className="mt-1 text-xl font-bold text-indigo-400 font-mono">{localXRay?.spaceComplexity}</div>
            </div>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <Eye className="h-3.5 w-3.5 text-sky-400" /> Operational Insights
              </div>
              <ul className="space-y-1">
                {localXRay?.explanation?.map((item: string, idx: number) => (
                  <li key={idx} className="text-xs leading-relaxed text-slate-300 pl-3 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-sky-400">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Vulnerabilities / Constraints
              </div>
              <ul className="space-y-1">
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
