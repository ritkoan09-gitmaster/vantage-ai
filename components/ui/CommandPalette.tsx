'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Code2, ChevronRight, Hash } from 'lucide-react';
import { Snippet } from '@/types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (snippet: Snippet) => void;
  snippets: Snippet[];
}

export function CommandPalette({ open, onClose, onSelect, snippets }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQ(""); }
  }, [open]);

  const results = useMemo(() => {
    const lq = q.toLowerCase();
    if (!lq) return snippets.slice(0, 5);
    return snippets.filter(s => 
      s.title.toLowerCase().includes(lq) || 
      s.language.toLowerCase().includes(lq) || 
      s.tags.some(t => t.toLowerCase().includes(lq))
    ).slice(0, 6);
  }, [q, snippets]);

  const handleSelect = (snippet: Snippet) => {
    onSelect(snippet);
    onClose();
  };

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[500] flex items-start justify-center pt-[10vh] sm:pt-[14vh] bg-black/80 backdrop-blur-md px-3 sm:px-4">
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[580px] rounded-2xl border border-slate-700/60 bg-[#161f30]/95 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.95),0_0_0_1px_rgba(99,102,241,0.2)] animate-slide-down overflow-hidden">
        {/* Top Specular Edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/50 bg-slate-900/40">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Search size={16} />
          </div>
          <input 
            ref={inputRef} 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Search vault by title, language, or tags..." 
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 focus:outline-none placeholder:text-slate-500 font-sans" 
          />
          <kbd className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-mono tracking-widest uppercase">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No snippets matched query &quot;{q}&quot;
            </div>
          ) : (
            results.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleSelect(s)}
                className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all border border-transparent hover:bg-slate-800/60 hover:border-indigo-500/30"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 shrink-0">
                  <Code2 size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-bold text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{s.language}</span>
                    <span className="truncate max-w-[220px] text-slate-500 text-[10px]">{s.tags.map(t => `#${t}`).join(' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider hidden sm:inline">Open</span>
                  <ChevronRight size={14} className="text-indigo-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
