"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";

const PRICING_TIERS = [
  {
    id: "hobby",
    name: "Hobby",
    priceMonthly: "0",
    priceAnnual: "0",
    description: "For individuals exploring the cognitive workspace.",
    features: [
      "100ms global sync latency",
      "3 base languages supported",
      "Community Discord support",
      "Standard O(n) search"
    ],
    buttonText: "Start Free",
    glow: "#3b82f6", // Deep Blue
    accent: "bg-blue-500",
    isPopular: false
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: "29",
    priceAnnual: "24",
    description: "For professional developers shipping to production.",
    features: [
      "<10ms edge sync latency",
      "Polyglot engine (All languages)",
      "Priority email support",
      "Real-time Complexity Calculator",
      "Unlimited snippet storage"
    ],
    buttonText: "Upgrade to Pro",
    glow: "#00f0ff", // Neon Cyan
    accent: "bg-neon-cyan",
    isPopular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    description: "For scale-ups requiring custom data sovereignty.",
    features: [
      "Sub-millisecond dedicated sync",
      "Private VPC deployment",
      "24/7 Slack connect channel",
      "Custom Polyglot translation rules",
      "SSO & Advanced Audit Logs"
    ],
    buttonText: "Contact Sales",
    glow: "#ff00ff", // Neon Magenta
    accent: "bg-neon-magenta",
    isPopular: false
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

export default function Pricing() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);

  const handleTierClick = (tierId: string) => {
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('vault_auth');
    if (isAuth) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <section id="pricing" className="relative w-full bg-black py-32 px-4 md:px-8 z-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Toggle */}
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight transform-gpu">
            Transparent pricing. <span className="text-zinc-500">Infinite scale.</span>
          </h2>
          <p className="mt-6 text-zinc-400 text-lg md:text-xl max-w-2xl transform-gpu">
            Deploy cognitive workspaces without the enterprise bloat. 
          </p>

          <div className="mt-10 flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10 transform-gpu will-change-transform">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${!isAnnual ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Monthly
              {!isAnnual && <div className="absolute inset-0 bg-white/10 rounded-full -z-10 shadow-sm" />}
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Annually
              <span className="text-[10px] uppercase tracking-wider text-neon-cyan bg-neon-cyan/10 px-1.5 py-0.5 rounded-sm border border-neon-cyan/20">Save 17%</span>
              {isAnnual && <div className="absolute inset-0 bg-white/10 rounded-full -z-10 shadow-sm" />}
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -150px 0px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center"
        >
          {PRICING_TIERS.map((tier) => (
            <motion.div
              key={tier.id}
              variants={cardVariants}
              whileHover={{ y: -4 }} 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative group rounded-[25px] transform-gpu will-change-transform overflow-hidden ${tier.isPopular ? 'p-[1.5px] shadow-[0_30px_60px_rgba(0,240,255,0.15)] md:-translate-y-4' : 'p-[1px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] opacity-90 hover:opacity-100 transition-opacity'}`}
            >
              
              {/* --- 1. THE BLOOM LAYER (ONLY ON PRO TIER) --- 
                  Rests at 30% opacity, flares to 100% on hover. */}
              {tier.isPopular && (
                <div 
                  className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform-gpu will-change-transform blur-xl z-0"
                  style={{ background: `conic-gradient(from 0deg, transparent 40%, ${tier.glow} 80%, #ffffff 100%)`, animation: "spin 3s linear infinite" }}
                />
              )}

              {/* --- 2. THE CORE LASER BEAM --- 
                  Pro Tier: ALWAYS ON (opacity-100).
                  Other Tiers: Hidden until hover (opacity-0 group-hover:opacity-100). */}
              <div 
                className={`absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none transform-gpu will-change-transform z-0 ${tier.isPopular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ background: `conic-gradient(from 0deg, transparent 20%, ${tier.glow} 70%, ${tier.glow} 90%, #ffffff 95%, #ffffff 100%)`, animation: "spin 3s linear infinite" }}
              />

              {/* Static border fallback - completely removed on Pro tier since laser is always on */}
              {!tier.isPopular && (
                <div className="absolute inset-0 bg-white/10 z-0 group-hover:opacity-0 transition-opacity duration-300" />
              )}

              {/* Card Surface */}
              <div className="relative h-full w-full rounded-[23px] bg-gradient-to-br from-[#1E1E26] to-[#0D0D14] p-8 z-10 flex flex-col shadow-[inset_0_1px_0px_rgba(255,255,255,0.08)]">
                
                {/* Internal Card Glow 
                    Pro tier rests with a slight glow. Others rest at 0. */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-500 pointer-events-none z-0 ${tier.isPopular ? 'opacity-[0.05] group-hover:opacity-[0.1]' : 'opacity-0 group-hover:opacity-[0.03]'}`}
                  style={{ backgroundColor: tier.glow }}
                />

                {/* --- UPGRADED "MOST POPULAR" BADGE --- */}
                {tier.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-neon-cyan to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] border-x border-b border-white/20 z-20">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8 mt-4 relative z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${tier.accent} shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
                    <h3 className="text-xl font-medium text-white">{tier.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {tier.priceMonthly === "Custom" ? "Custom" : `$${isAnnual ? tier.priceAnnual : tier.priceMonthly}`}
                    </span>
                    {tier.priceMonthly !== "Custom" && (
                      <span className="text-zinc-500 text-sm font-medium">/mo</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">{tier.description}</p>
                </div>

                <ul className="flex-1 space-y-4 mb-8 relative z-20">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <svg className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-neon-cyan' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleTierClick(tier.id)}
                  className={`relative w-full py-3 rounded-xl font-semibold transform-gpu will-change-transform group/btn overflow-hidden cursor-pointer ${tier.isPopular ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-white' : 'bg-white/5 border border-white/10 text-zinc-300'}`}
                >
                  {tier.isPopular ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 ease-out z-0" />
                      <div className="absolute inset-0 shadow-[0_0_30px_rgba(0,240,255,0.5)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 ease-out z-0" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 ease-out z-0" />
                  )}
                  <span className={`relative z-10 ${!tier.isPopular && 'group-hover/btn:text-white transition-colors duration-300'}`}>
                    {tier.buttonText}
                  </span>
                </button>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}