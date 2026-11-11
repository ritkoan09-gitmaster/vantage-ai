"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const FEATURES = [
  {
    id: "vault",
    title: "Global Snippet Vault",
    description: "Your codebase synced across 42 edge networks globally. Access your cognitive workspace from Tokyo to San Francisco in under 10ms.",
    colSpan: "md:col-span-2",
    accent: "bg-neon-cyan",
    glow: "#00f0ff", 
    code: "await Vault.sync({ region: 'global', latency: '<10ms' });",
    hasImage: true, 
    imageSrc: "/image1.png"
  },
  {
    id: "search",
    title: "O(1) Retrieval",
    description: "Constant-time search algorithms ensure your query speed never degrades, regardless of repository size.",
    colSpan: "md:col-span-1",
    accent: "bg-blue-500",
    glow: "#3b82f6", 
    code: "const node = graph.find(O(1));",
    hasImage: true,
    imageSrc: "/image2.png"
  },
  {
    id: "polyglot",
    title: "Polyglot Engine",
    description: "Translate abstract logic into Rust, Go, or Python instantly with context-aware semantic parsing.",
    colSpan: "md:col-span-1",
    accent: "bg-purple-500",
    glow: "#a855f7", 
    code: "engine.translate('ts -> rs');",
    hasImage: true,
    imageSrc: "/image.png"
  },
  {
    id: "complexity",
    title: "Complexity Calculator",
    description: "Real-time Big O notation analysis as you type. Catch memory leaks and quadratic time complexities before they reach production.",
    colSpan: "md:col-span-2",
    accent: "bg-neon-magenta",
    glow: "#ff00ff", 
    code: "if (O(N^2)) warn('Quadratic time complexity detected');",
    hasImage: true,
    imageSrc: "/image3.png"
  }
];

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  },
};

export default function BentoGrid() {
  return (
    <section id="platform" className="relative w-full bg-black py-32 px-4 md:px-8 z-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight transform-gpu">
            Intelligence, <span className="text-zinc-500">distributed.</span>
          </h2>
          <p className="mt-6 text-zinc-400 text-lg md:text-xl max-w-2xl transform-gpu">
            A frictionless ecosystem engineered for sub-millisecond response times. Zero bloat, pure execution.
          </p>
        </div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -150px 0px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{ y: -4 }} 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative group rounded-[25px] p-[2px] transform-gpu will-change-transform overflow-hidden bg-white/5 ${feature.colSpan}`}
            >
              
              {/* --- BLOOM LAYER --- */}
              <div 
                className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform-gpu will-change-transform blur-2xl z-0"
                style={{ background: `conic-gradient(from 0deg, transparent 30%, ${feature.glow} 80%, #ffffff 100%)`, animation: "spin 3s linear infinite" }}
              />

              {/* --- CORE LASER BEAM --- */}
              <div 
                className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform-gpu will-change-transform z-0"
                style={{ background: `conic-gradient(from 0deg, transparent 20%, ${feature.glow} 70%, ${feature.glow} 85%, #ffffff 90%, #ffffff 100%)`, animation: "spin 3s linear infinite" }}
              />
              
              {/* --- CARD SURFACE --- */}
              <div className="relative h-full w-full rounded-[23px] bg-[#1E1E26] p-8 md:p-10 z-10 flex flex-col justify-between overflow-hidden">
                
                {/* Base Slate Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#12121A] to-[#07070A] z-0 pointer-events-none" />

                {/* --- FULL CARD IMAGE --- */}
                {feature.hasImage && (
                  <div className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2000ms] ease-out"
                      style={{ 
                        backgroundImage: `url('${feature.imageSrc}')`,
                        backgroundSize: 'cover'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/50 to-transparent" />
                  </div>
                )}

                {/* Internal Reactor Glow */}
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none z-10"
                  style={{ background: `radial-gradient(circle at center, ${feature.glow}50 0%, transparent 70%)` }}
                />

                {/* Text Content */}
                <div className="relative z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-2 h-2 rounded-full ${feature.accent} shadow-[0_0_15px_rgba(255,255,255,0.8)]`} />
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed max-w-sm relative font-medium drop-shadow-lg">
                    {feature.description}
                  </p>
                </div>
                
                {/* --- PURE GLASSMORPHISM TERMINAL --- */}
                <div className="relative z-20 mt-12 w-full rounded-xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
                   
                   {/* Inner glow to enhance the glass feel */}
                   <div className="absolute inset-0 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] rounded-xl pointer-events-none" />

                   <div className="relative font-mono text-sm text-zinc-200 w-full overflow-hidden drop-shadow-md">
                     {feature.code}
                     
                     {/* Glassmorphism Sliding Mask */}
                     <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/40 backdrop-blur-md translate-x-0 group-hover:translate-x-[105%] transition-transform duration-[1200ms] ease-out will-change-transform flex items-center">
                        <div className="w-[2px] h-4 bg-neon-cyan animate-pulse" />
                     </div>
                   </div>

                   <span className="hidden sm:block text-white/50 font-mono text-xs group-hover:text-white/80 transition-colors duration-300 ml-4 whitespace-nowrap drop-shadow-md">
                     {"// telemetry active"}
                   </span>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}