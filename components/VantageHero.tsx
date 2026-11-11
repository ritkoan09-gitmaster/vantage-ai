"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import InteractiveBackground from "./InteractiveBackground";

// --- SCALABLE NAVIGATION ARCHITECTURE ---
// Upgraded to support optional badges and external routing
const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Network', href: '#network' },
  { label: 'API', href: '#api', badge: 'Beta' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' }
];

// --- Framer Motion Configurations ---
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  },
};

export default function VantageHero() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden selection:bg-cyan-500/30">
      
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Ultra-Optimized Canvas Layer */}
      <InteractiveBackground />

      {/* --- HIGH-PERFORMANCE NAVBAR --- */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/10 backdrop-blur-xl transform-gpu will-change-transform"
      >
        <div className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-neon-cyan to-blue-600" />
          Vantage<span className="text-zinc-500">AI</span>
        </div>
        
        {/* Expanded Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="group relative flex items-center gap-2 hover:text-white transition-opacity duration-300 hover:opacity-100 opacity-70 will-change-auto"
            >
              {link.label}
              
              {/* Optional UI Badge for specific links */}
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Global Nav Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition-opacity opacity-70 hover:opacity-100">
            Sign In
          </Link>
          <button 
            onClick={() => router.push('/signup')}
            className="relative px-5 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg overflow-hidden group transform-gpu will-change-transform cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-0" />
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-cyan/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-0" />
            <span className="relative z-10">Try Free</span>
          </button>
        </div>
      </motion.nav>

      {/* --- HERO CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center max-w-4xl mx-auto mt-16"
        >
          {/* Eyebrow Pill */}
          <motion.div 
            variants={fadeUpVariant}
            className="flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-neon-cyan/5 border border-neon-cyan/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)] transform-gpu will-change-transform"
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-widest text-neon-cyan">
              COGNITIVE WORKSPACE // v2.1
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeUpVariant}>
            <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 tracking-tighter leading-[1.1] pb-2 transform-gpu">
              Stop guessing.<br />
              Start shipping.
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p 
            variants={fadeUpVariant}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            Vantage AI is the Cognitive Workspace that calculates complexity, translates code across languages, and syncs your snippets to a globally distributed vault with sub-10ms access.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={fadeUpVariant}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          >
            <motion.button 
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-neon-cyan to-blue-600 transform-gpu will-change-transform group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-0" />
              <div className="absolute inset-0 shadow-[0_0_50px_rgba(0,240,255,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-0" />
              <span className="relative z-10">Try Vantage AI Free</span>
            </motion.button>
            
            <motion.button 
              onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative px-8 py-4 rounded-xl text-zinc-300 font-semibold bg-white/5 border border-white/10 backdrop-blur-md transform-gpu will-change-transform group cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out rounded-xl z-0" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Read Docs</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
    </div>
  );
}