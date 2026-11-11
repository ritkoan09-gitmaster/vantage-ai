'use client';

import { useState, useEffect } from 'react';
import { Snippet } from '@/types';
import { X, Lock, Sparkles, Zap } from 'lucide-react';

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
      // Force the dropdown to display the snippet's current active language by default
      setMorphTarget(snippet.language);
    }
  }, [snippet]);

  if (!open || !form) return null;

  const isLocked = activeTier === 'Hobby' || (activeTier === 'Pro Monthly' && monthlyEditsLeft <= 0);

  const handleSave = () => {
    if (isLocked || !form.title.trim() || !form.code.trim()) return;
    
    const finalForm = { ...form };
    
    // Core Logic Fix: Wipes old diagnostic data if the user edits the raw code.
    // This forces the system to prompt for a new X-Ray scan.
    if (snippet && snippet.code !== form.code) {
      finalForm.xray = undefined;
    }
    
    onSave(finalForm);
  };

  const runNeuralMorph = async () => {
    if (isLocked) return;
    
    // Agar selected language same hi hai, toh fetch mat karo (API bacha lo)
    if (morphTarget === form.language) return;

    setMorphing(true);
    
    try {
      // Asli Gemini API ko call lagao jo humne /api/morph me banayi hai
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
        // AI ne code de diya, ab usko modal me set karo
        setForm(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            code: data.translatedCode,
            language: morphTarget, // UI mein naya tag update ho jayega
            xray: undefined // Naya code aaya hai, purane diagnostics uda do
          };
        });
      } else {
        console.error("Morph Error:", data.error);
        alert("🚨 AI Error: " + data.error); // Ab asli wajah pop-up mein dikhegi!
      }
    } catch (error) {
      console.error("Network Error during Morph:", error);
      alert("Failed to connect to the Morph Engine.");
    } finally {
      setMorphing(false); // Spinner band karo
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl animate-scale-in overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0a0516]/95 shadow-2xl backdrop-blur-3xl">
        
        {isLocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0516]/90 backdrop-blur-md p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-900 to-black border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"><Lock className="h-8 w-8 text-purple-400" /></div>
            <h2 className="text-2xl font-black text-white">Editing is Locked</h2>
            <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
              {activeTier === 'Hobby' ? "Free users cannot modify the neural vault. Upgrade to a Pro tier to unlock the Morph Engine." : "You have exhausted your monthly edits. Upgrade to Yearly for infinite access."}
            </p>
            <div className="mt-8 flex gap-3">
              <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white">Cancel</button>
              <button onClick={onUpgradeClick} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)]">Upgrade to Pro</button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-purple-500/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">Modify Architecture</h2>
            {activeTier === 'Pro Monthly' && !isLocked && <p className="mt-1 text-xs text-emerald-400 font-medium">{monthlyEditsLeft} edits remaining this month.</p>}
            {activeTier === 'Pro Yearly' && <p className="mt-1 text-xs text-purple-400 font-medium flex items-center gap-1"><Zap size={12}/> Infinite edits active.</p>}
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-2 flex flex-col gap-4 p-6 border-r border-white/5">
            <div>
              <label className="text-[10px] font-bold uppercase text-white/40 block mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-xl border border-purple-500/20 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-white/40 block mb-1">Code Array</label>
              <textarea value={form.code} onChange={e => setForm({...form, code: e.target.value})} rows={10} className="w-full resize-none rounded-xl border border-purple-500/20 bg-black/40 px-4 py-3 font-mono text-[11px] text-purple-100 focus:outline-none"></textarea>
            </div>
          </div>

          <div className="p-6 bg-purple-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-3">
                <Sparkles size={16} className="text-cyan-400" /> Neural Morph
              </div>
              <p className="text-[11px] text-white/50 mb-4">Instantly refactor code syntax via AI to adapt to new frameworks without rewriting.</p>
              
              <div className="space-y-3">
                <select value={morphTarget} onChange={e => setMorphTarget(e.target.value)} className="w-full rounded-lg border border-cyan-500/20 bg-[#0a0516] text-xs text-white p-2.5 focus:outline-none cursor-pointer">
                  <option value="" disabled>Select Tech Stack</option>
                  {LANGUAGE_CATEGORIES.map(group => (
                    <optgroup key={group.category} label={group.category} className="bg-[#1a0b2e] font-bold text-cyan-400">
                      {group.langs.map(lang => (
                        <option key={lang} value={lang} className="text-white bg-[#110726]">{lang}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button onClick={runNeuralMorph} disabled={morphing} className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3 text-xs font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50">
                  {morphing ? 'Executing Morph...' : 'Morph Code Sequence'}
                </button>
              </div>
            </div>

            <button onClick={handleSave} className="w-full rounded-xl bg-white p-3 text-sm font-bold text-black hover:bg-white/90">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}