'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Code2, ChevronRight } from 'lucide-react';
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
    return snippets.filter(s => s.title.toLowerCase().includes(lq) || s.language.toLowerCase().includes(lq) || s.tags.some(t => t.toLowerCase().includes(lq))).slice(0, 5);
  }, [q, snippets]);

  const handleSelect = (snippet: Snippet) => {
    // Open the View Snippet modal
    onSelect(snippet);
    // Close the command palette
    onClose();
  };

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[500] flex items-start justify-center pt-[14vh] bg-black/60 backdrop-blur-sm px-4">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[560px] rounded-2xl border border-purple-500/30 bg-[#0b0518]/95 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.1)] animate-slide-down overflow-hidden">
        
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-purple-500/20 bg-white/5">
          <Search size={16} className="text-purple-500/80" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search vault by title, language, or tag..." className="flex-1 bg-transparent border-none text-[13px] text-white focus:outline-none placeholder:text-white/30" />
          <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-[10px] text-white/50 font-medium tracking-widest uppercase">ESC</kbd>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-white/30">No neural pathways match your query.</div>
          ) : (
            results.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleSelect(s)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-transparent hover:bg-purple-500/10 hover:border-purple-500/20"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-purple-500/10">
                  <Code2 size={14} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5 flex gap-2">
                    <span className="text-purple-300/70 font-medium">{s.language}</span>
                    <span className="truncate max-w-[200px]">{s.tags.map(t => `#${t}`).join(' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">View</span>
                  <ChevronRight size={14} className="text-purple-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}