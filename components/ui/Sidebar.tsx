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
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Vantage<span className="text-zinc-500">AI</span></h1>
            <p className="text-[9px] uppercase tracking-widest text-neon-cyan font-mono">Cognitive Workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => handleTabClick('snippets')} 
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${activeTab === 'snippets' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
        >
          <TerminalSquare className={`h-4 w-4 transition-colors ${activeTab === 'snippets' ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} /> All Snippets
        </button>
        <button 
          onClick={() => handleTabClick('languages')} 
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${activeTab === 'languages' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
        >
          <Code2 className={`h-4 w-4 transition-colors ${activeTab === 'languages' ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} /> Polyglot Matrix
        </button>
        <button 
          onClick={() => handleTabClick('integrations')} 
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${activeTab === 'integrations' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
        >
          <Box className={`h-4 w-4 transition-colors ${activeTab === 'integrations' ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} /> System Integrations
        </button>
        <button 
          onClick={() => handleTabClick('settings')} 
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
        >
          <Settings className={`h-4 w-4 transition-colors ${activeTab === 'settings' ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} /> Settings & Billing
        </button>
      </nav>

      {/* Bottom Footer Section */}
      <div className="mt-auto flex flex-col gap-4 pt-10">
        <button 
          onClick={() => handleTabClick('about')} 
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${activeTab === 'about' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 border border-transparent'}`}
        >
          <BookOpen className={`h-4 w-4 transition-colors ${activeTab === 'about' ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} /> Documentation
        </button>
        
        <div className="px-3 text-center">
          <p className="text-[9px] uppercase tracking-widest text-zinc-600">© 2026 Vantage AI</p>
          <div className="mt-1 flex justify-center gap-3 text-[10px] text-zinc-500">
            <Link href="/" className="hover:text-neon-cyan">Home</Link>
            <span className="text-zinc-700">•</span>
            <a href="#" className="hover:text-neon-cyan">Terms</a>
            <span className="text-zinc-700">•</span>
            <a href="#" className="hover:text-neon-cyan">Privacy</a>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0e0e14] p-6 shadow-2xl lg:hidden">
              <button onClick={onClose} className="absolute right-4 top-6 rounded-lg bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"><X className="h-5 w-5" /></button>
              <NavLinks />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e0e14]/90 p-6 backdrop-blur-2xl lg:flex">
        <NavLinks />
      </aside>
    </>
  );
}
