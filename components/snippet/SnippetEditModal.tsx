'use client';

import { useState, useEffect } from 'react';
import { Snippet } from '@/types';
import { X, Lock, Sparkles, Zap, Code2, Check, RefreshCw } from 'lucide-react';

const LANGUAGE_CATEGORIES = [
  { category: "Frontend & UI", langs: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "Bootstrap"] },
  { category: "Backend & Systems", langs: ["Python", "Node.js", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Django", "Flask"] },
  { category: "Database & Cloud", langs: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "GraphQL"] },
  { category: "Scripts & Configs", langs: ["Bash", "Shell", "PowerShell", "YAML", "JSON", "Dockerfile", "Markdown"] }
];

interface SnippetEditModalProps {
  snippet: Snippet | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Snippet) => void;
  activeTier: string;
  monthlyEditsLeft: number;
  onUpgradeClick: () => void;
}

export function SnippetEditModal({ snippet, open, onClose, onSave, activeTier, monthlyEditsLeft, onUpgradeClick }: SnippetEditModalProps) {
  const [form, setForm] = useState<Snippet | null>(null);
  const [morphTarget, setMorphTarget] = useState('TypeScript');
  const [morphing, setMorphing] = useState(false);

  useEffect(() => { 
    if (snippet) {
      setForm({ ...snippet }); 
      setMorphTarget(snippet.language);
    }
  }, [snippet]);

  if (!open || !form) return null;

  const isLocked = activeTier === 'Hobby' || (activeTier === 'Pro Monthly' && monthlyEditsLeft <= 0);

  const handleSave = () => {
    if (isLocked || !form.title.trim() || !form.code.trim()) return;
    
    const finalForm = { ...form };
    if (snippet && snippet.code !== form.code) {
      finalForm.xray = undefined;
    }
    
    onSave(finalForm);
  };

  const runNeuralMorph = async () => {
    if (isLocked) return;
    if (morphTarget === form.language) return;

    setMorphing(true);
    
    try {
      const response = await fetch('/api/morph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          targetLanguage: morphTarget,
          currentLanguage: form.language
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            code: data.translatedCode,
            language: morphTarget,
            xray: undefined
          };
        });
      } else {
        console.error("Morph Error:", data.error);
        alert("AI Error: " + data.error);
      }
    } catch (error) {
      console.error("Network Error during Morph:", error);
      alert("Failed to connect to the Morph Engine.");
    } finally {
      setMorphing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e14]/95 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col">
        
        {isLocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <Lock className="h-7 w-7 text-neon-cyan" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Editing is Locked</h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              {activeTier === 'Hobby' ? "Free users cannot modify the neural vault. Upgrade to a Pro tier to unlock the Morph Engine." : "You have exhausted your monthly edits. Upgrade to Yearly for infinite access."}
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-white/10">Cancel</button>
              <button onClick={onUpgradeClick} className="rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,240,255,0.35)]">Upgrade to Pro</button>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-[#12121A]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Modify Architecture</h2>
              {activeTier === 'Pro Monthly' && !isLocked && <p className="text-[11px] text-emerald-400 font-mono">{monthlyEditsLeft} edits remaining this month.</p>}
              {activeTier === 'Pro Yearly' && <p className="text-[11px] text-neon-cyan font-mono flex items-center gap-1"><Zap size={12}/> Infinite edits active.</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
          {/* Left: Code & Title */}
          <div className="lg:col-span-2 flex flex-col gap-4 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-1.5">Snippet Title</label>
              <input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-neon-cyan/60" 
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-1.5">Source Array (Code)</label>
              <textarea 
                value={form.code} 
                onChange={e => setForm({...form, code: e.target.value})} 
                rows={11} 
                className="w-full resize-none rounded-xl border border-white/10 bg-[#07070A] px-4 py-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30"
              />
            </div>
          </div>

          {/* Right: AI Morph & Actions */}
          <div className="p-4 sm:p-6 bg-white/[0.02] flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-neon-cyan font-bold text-xs sm:text-sm mb-2">
                <Sparkles size={16} className="text-neon-cyan" /> Neural Morph Engine
              </div>
              <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                Port algorithm logic to other frameworks via AI without manual refactoring.
              </p>
              
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">Target Tech Stack</label>
                <select 
                  value={morphTarget} 
                  onChange={e => setMorphTarget(e.target.value)} 
                  className="w-full rounded-xl border border-white/10 bg-[#07070A] text-xs text-white p-2.5 focus:outline-none focus:border-neon-cyan/60 cursor-pointer"
                >
                  <option value="" disabled>Select Target</option>
                  {LANGUAGE_CATEGORIES.map(group => (
                    <optgroup key={group.category} label={group.category} className="bg-[#12121A] font-bold text-neon-cyan">
                      {group.langs.map(lang => (
                        <option key={lang} value={lang} className="text-white bg-black">{lang}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button 
                  onClick={runNeuralMorph} 
                  disabled={morphing || morphTarget === form.language} 
                  className="w-full rounded-xl bg-gradient-to-r from-neon-cyan/20 to-blue-600/20 border border-neon-cyan/40 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-neon-cyan hover:bg-neon-cyan/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} className={morphing ? 'animate-spin' : ''} />
                  {morphing ? 'Morphing...' : `Morph to ${morphTarget}`}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              <button 
                onClick={handleSave} 
                className="w-full rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 p-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:opacity-90 active:scale-95 transition-all"
              >
                Save Changes
              </button>
              <button 
                onClick={onClose} 
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
