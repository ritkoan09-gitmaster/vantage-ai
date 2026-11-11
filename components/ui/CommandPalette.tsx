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
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0e0e14]/95 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,240,255,0.15)] animate-slide-down overflow-hidden">
        
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search size={16} className="text-neon-cyan" />
          <input 
            ref={inputRef} 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Search vault by title, language, or tags..." 
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none placeholder:text-zinc-500 font-sans" 
          />
          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-[10px] text-zinc-400 font-mono tracking-widest uppercase">ESC</kbd>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">
              No snippets matched query &quot;{q}&quot;
            </div>
          ) : (
            results.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleSelect(s)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-transparent hover:bg-white/5 hover:border-neon-cyan/30"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-neon-cyan/10 border border-neon-cyan/20 shrink-0">
                  <Code2 size={14} className="text-neon-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold truncate text-white group-hover:text-neon-cyan transition-colors">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-neon-cyan/80 font-medium text-[10px]">{s.language}</span>
                    <span className="truncate max-w-[220px] text-zinc-500 text-[10px]">{s.tags.map(t => `#${t}`).join(' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span className="text-[10px] text-neon-cyan font-mono font-bold uppercase tracking-wider hidden sm:inline">Open</span>
                  <ChevronRight size={14} className="text-neon-cyan" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
