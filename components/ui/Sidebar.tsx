'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Code2, Settings, TerminalSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';

export type TabType = 'snippets' | 'languages' | 'integrations' | 'settings' | 'about';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ open, onClose, activeTab, setActiveTab }: SidebarProps) {
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) onClose(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    onClose(); 
  };

  const NavLinks = () => (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-transform group-hover:scale-105">
            <span className="font-black text-white text-xs">V</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-1">
              Vantage<span className="text-indigo-400 font-extrabold">AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Cognitive Engine</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-col gap-1.5">
        <button 
          onClick={() => handleTabClick('snippets')} 
          className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'snippets' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_4px_16px_rgba(99,102,241,0.15)]' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <TerminalSquare className={`h-4 w-4 transition-colors ${activeTab === 'snippets' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          Code Vault
        </button>
        <button 
          onClick={() => handleTabClick('languages')} 
          className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'languages' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_4px_16px_rgba(99,102,241,0.15)]' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Code2 className={`h-4 w-4 transition-colors ${activeTab === 'languages' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          Language Analytics
        </button>
        <button 
          onClick={() => handleTabClick('integrations')} 
          className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'integrations' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_4px_16px_rgba(99,102,241,0.15)]' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Box className={`h-4 w-4 transition-colors ${activeTab === 'integrations' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          Tool Integrations
        </button>
        <button 
          onClick={() => handleTabClick('settings')} 
          className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_4px_16px_rgba(99,102,241,0.15)]' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Settings className={`h-4 w-4 transition-colors ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          Account & Plans
        </button>
      </nav>

      {/* Bottom Footer Section */}
      <div className="mt-auto flex flex-col gap-4 pt-10">
        <button 
          onClick={() => handleTabClick('about')} 
          className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'about' 
              ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <BookOpen className={`h-4 w-4 transition-colors ${activeTab === 'about' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          Docs & Guides
        </button>
        
        <div className="px-3 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">© 2026 Vantage AI</p>
          <div className="mt-1 flex justify-center gap-3 text-[11px] text-slate-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.35 }} className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-3xl lg:hidden">
              <button onClick={onClose} className="absolute right-4 top-6 rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"><X className="h-5 w-5" /></button>
              <NavLinks />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/75 p-6 backdrop-blur-3xl lg:flex z-20">
        <NavLinks />
      </aside>
    </>
  );
}
