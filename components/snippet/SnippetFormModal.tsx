'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { Snippet } from '@/types';
import { generateSnippetMetadata } from '@/app/actions/generate';

const LANGUAGE_CATEGORIES = [
  { category: "Frontend & UI", langs: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "Bootstrap", "jQuery"] },
  { category: "Backend & Systems", langs: ["Python", "Node.js", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Django", "Flask", "Express.js", "Spring Boot", "Laravel", "Ruby on Rails"] },
  { category: "Database & Cloud", langs: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Firebase", "GraphQL"] },
  { category: "Scripts & Configs", langs: ["Bash", "Shell", "PowerShell", "YAML", "JSON", "XML", "Dockerfile", "Markdown"] }
];

export function SnippetFormModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (s: Snippet) => void }) {
  const [form, setForm] = useState({ title: "", language: "TypeScript", code: "", tags: "", description: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!open) return null;

  const handleNeuralScan = async () => {
    if (!form.code.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const metadata = await generateSnippetMetadata(form.code);
      setForm(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        tags: metadata.tags ? metadata.tags.join(', ') : prev.tags,
        language: metadata.language || prev.language
      }));
    } catch (error: any) {
      alert(`AI Extraction Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submit = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: form.title,
      language: form.language,
      code: form.code,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      description: form.description,
      starred: false,
      copies: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    });
    onClose();
    setForm({ title: "", language: "TypeScript", code: "", tags: "", description: "" });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#12121A]/95 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-3xl animate-scale-in">
        
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">New Cognitive Snippet</h2>
              <p className="text-[11px] font-mono text-zinc-400">Sync code to Vantage AI distributed vault.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          
          {/* THE RAW CODE & AI SCANNER */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Raw Source Code</label>
              <button 
                onClick={handleNeuralScan}
                disabled={isAnalyzing || !form.code.trim()}
                className="flex items-center gap-1.5 rounded-md border border-neon-cyan/40 bg-neon-cyan/10 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neon-cyan transition-all hover:bg-neon-cyan/20 active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {isAnalyzing ? 'Extracting...' : 'AI Auto-Tag'}
              </button>
            </div>
            <textarea 
              value={form.code} 
              onChange={e => setForm({...form, code: e.target.value})} 
              placeholder="Paste raw code here to auto-detect language & metadata..." 
              rows={4} 
              className="w-full resize-none rounded-xl border border-white/10 bg-[#07070A] px-4 py-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 shadow-inner transition-colors focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-zinc-400">Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              placeholder="e.g. O(1) Cache Invalidation Matrix" 
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-zinc-400">Language</label>
              <select 
                value={form.language} 
                onChange={e => setForm({...form, language: e.target.value})} 
                className="w-full rounded-xl border border-white/10 bg-[#0e0e14] px-4 py-2.5 text-xs sm:text-sm text-white transition-colors focus:border-neon-cyan focus:outline-none"
              >
                <option value="" disabled>Select Tech Stack</option>
                {LANGUAGE_CATEGORIES.map(group => (
                  <optgroup key={group.category} label={group.category} className="bg-[#12121A] font-bold text-neon-cyan">
                    {group.langs.map(lang => (
                      <option key={lang} value={lang} className="text-white bg-black">{lang}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-zinc-400">Tags (comma separated)</label>
              <input 
                value={form.tags} 
                onChange={e => setForm({...form, tags: e.target.value})} 
                placeholder="react, vault, edge" 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40" 
              />
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-zinc-400">Description</label>
            <input 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              placeholder="What does this snippet accomplish?" 
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40" 
            />
          </div>
          
          <button 
            onClick={submit} 
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Deploy Snippet to Vault
          </button>
        </div>
      </div>
    </div>
  );
}
