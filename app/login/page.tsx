'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InteractiveBackground from '@/components/InteractiveBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('vault_auth', 'true');
      localStorage.setItem('vault_username', data.user.username);
      localStorage.setItem('vault_email', data.user.email);
      localStorage.setItem('vault_phone', data.user.phone);

      if (data.user.subscription && data.user.subscription.tier) {
        localStorage.setItem('vault_tier', data.user.subscription.tier);
        localStorage.setItem('vault_activation_date', data.user.subscription.activationDate);
        localStorage.setItem('vault_expiry_date', data.user.subscription.expiryDate);
        localStorage.setItem('vault_seen_pricing', 'true');
      } else {
        localStorage.setItem('vault_tier', 'Free Trial');
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-black p-4 sm:p-8 selection:bg-cyan-500/30">
      <InteractiveBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[400px] sm:max-w-md max-h-[95dvh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Vantage AI Logo & Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
            <span className="text-white font-bold text-2xl tracking-tight">Vantage<span className="text-zinc-500">AI</span></span>
          </Link>
          <p className="text-xs font-mono tracking-widest text-neon-cyan uppercase">
            Cognitive Workspace // Authentication
          </p>
        </div>

        <div className="min-h-6 mb-3">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-center text-xs font-medium text-red-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 transition-all focus:border-neon-cyan focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-zinc-500 transition-all focus:border-neon-cyan focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button 
            disabled={isSubmitting} 
            type="submit" 
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={18} /> Authenticating...</>
            ) : (
              <>Log In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <Link href="/signup" className="text-xs sm:text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Need an account? <span className="text-neon-cyan">Sign Up</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
