'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Sidebar, TabType } from '@/components/ui/Sidebar';
import { SnippetCard } from '@/components/snippet/SnippetCard';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { SnippetFormModal } from '@/components/snippet/SnippetFormModal';
import { SnippetEditModal } from '@/components/snippet/SnippetEditModal';
import { 
  Menu, Search, Plus, Code2, Flame, Clock, GitBranch, Share2, Terminal, 
  LogOut, CheckCircle2, ShieldAlert, Sparkles, Activity, Cpu, LayoutGrid, 
  Copy, CreditCard, ShieldCheck, X, BookOpen, Star, Bell, Trash2, Edit2, 
  Zap, BrainCircuit, AlertTriangle, Eye, Server, Gift, Filter, ArrowUpRight
} from 'lucide-react';
import { Snippet, SubscriptionTier } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { JarvisMic } from '@/components/ui/JarvisMic';

interface Tier {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight: boolean;
}

export default function Dashboard() {
  const router = useRouter(); 
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editSnippet, setEditSnippet] = useState<Snippet | null>(null);
  
  const [viewSnippet, setViewSnippet] = useState<Snippet | null>(null);
  const [viewSnippetAnalyzing, setViewSnippetAnalyzing] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  interface AppNotification { id: string; title: string; message: string; color: string; }
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeTab, setActiveTab] = useState<TabType>('snippets');
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState<'newest' | 'deployed'>('newest');
  
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionTier | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const [activeTier, setActiveTier] = useState<SubscriptionTier>('Free Trial');
  const [monthlyEditsLeft, setMonthlyEditsLeft] = useState(5);
  
  const [profile, setProfile] = useState({ username: '', email: '', phone: '' });
  const [subDates, setSubDates] = useState({ activation: 'N/A', expiry: 'Lifetime' });
  
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  
  const [githubConnected, setGithubConnected] = useState(false);
  const [vscodeConnected, setVscodeConnected] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [vscodeLoading, setVscodeLoading] = useState(false);

  const formatDate = (isoStr: string) => {
    if (!isoStr || isoStr === 'Lifetime' || isoStr === 'Expired') return isoStr;
    try { return new Date(isoStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } 
    catch { return isoStr; }
  };

  const handleClaimOffer = async () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const username = localStorage.getItem('vault_username');

    try {
      if (username) {
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            tier: 'Pro Plan Monthly',
            activationDate: today.toISOString(),
            expiryDate: nextMonth.toISOString()
          }),
        });
        
        if (!res.ok) console.error("Database update failed");
      }

      localStorage.setItem('vault_tier', 'Pro Plan Monthly');
      localStorage.setItem('vault_is_trial', 'true');
      localStorage.setItem('vault_activation_date', today.toISOString());
      localStorage.setItem('vault_expiry_date', nextMonth.toISOString());
      localStorage.removeItem('vault_pending_offer');

      setActiveTier('Pro Plan Monthly');
      setMonthlyEditsLeft(5);
      setSubDates({
        activation: formatDate(today.toISOString()),
        expiry: formatDate(nextMonth.toISOString())
      });

      setShowOfferPopup(false);
    } catch (err) {
      console.error("Failed to activate offer", err);
      setShowOfferPopup(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vault_auth');
    localStorage.removeItem('vault_username');
    localStorage.removeItem('vault_email');
    localStorage.removeItem('vault_phone');
    localStorage.removeItem('vault_tier');
    localStorage.removeItem('vault_is_trial');
    localStorage.removeItem('vault_activation_date');
    localStorage.removeItem('vault_expiry_date');
    localStorage.removeItem('vault_seen_pricing');
    localStorage.removeItem('vault_pending_offer');
    router.push('/login');
  };

  const handleSelectTier = (tierName: SubscriptionTier) => {
    setShowPricingPopup(false);
    localStorage.setItem('vault_seen_pricing', 'true');

    if (tierName === 'Free Trial') {
      const today = new Date().toISOString();
      setActiveTier('Free Trial');
      setMonthlyEditsLeft(0);
      setSubDates({ activation: formatDate(today), expiry: 'Lifetime' });
      localStorage.setItem('vault_tier', 'Free Trial');
      localStorage.setItem('vault_activation_date', today);
      localStorage.setItem('vault_expiry_date', 'Lifetime');
      
      const username = localStorage.getItem('vault_username');
      if (username) {
        fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            tier: 'Free Trial',
            activationDate: today,
            expiryDate: 'Lifetime'
          }),
        }).catch(e => console.error(e));
      }
      return;
    }

    setCheckoutPlan(tierName);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const executePaymentPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setPaymentError('All encrypted payment fields are mandatory.');
      return;
    }

    setPaymentError('');
    setPaymentSuccess(true);

    setTimeout(() => {
      if (checkoutPlan) {
        const today = new Date();
        const expiryDate = new Date(today);
        if (checkoutPlan === 'Pro Plan Monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        if (checkoutPlan === 'Yearly Max Plan') expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const username = localStorage.getItem('vault_username');
        if (username) {
          fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              tier: checkoutPlan,
              activationDate: today.toISOString(),
              expiryDate: expiryDate.toISOString()
            }),
          }).catch(e => console.error("Database sync failed", e));
        }

        setActiveTier(checkoutPlan);
        setMonthlyEditsLeft(checkoutPlan === 'Yearly Max Plan' ? 999 : 5);
        setSubDates({
          activation: formatDate(today.toISOString()),
          expiry: formatDate(expiryDate.toISOString())
        });

        localStorage.setItem('vault_tier', checkoutPlan);
        localStorage.setItem('vault_activation_date', today.toISOString());
        localStorage.setItem('vault_expiry_date', expiryDate.toISOString());
      }
      setCheckoutPlan(null);
      setPaymentSuccess(false);
    }, 1800);
  };

  useEffect(() => {
    const auth = localStorage.getItem('vault_auth');
    if (!auth) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);

    const username = localStorage.getItem('vault_username') || 'Developer';
    const email = localStorage.getItem('vault_email') || '';
    const phone = localStorage.getItem('vault_phone') || '';
    setProfile({ username, email, phone });

    setNotifications([
      { id: '1', title: 'Cognitive Engine Active', message: 'Gemini-2.5-flash online and ready.', color: 'bg-neon-cyan' },
      { id: '2', title: 'System Security', message: 'End-to-end telemetry encryption active.', color: 'bg-emerald-400' }
    ]);
    setUnreadCount(2);

    const loadSnippets = async () => {
      try {
        const res = await fetch(`/api/snippets?username=${username}`);
        const data = await res.json();
        if (data.success && data.snippets) {
          const formattedSnippets = data.snippets.map((s: any) => ({
            ...s,
            id: s.snippetId 
          }));
          setSnippets(formattedSnippets);
        }
      } catch (err) {
        console.error("Failed to load snippets", err);
      }
    };
    loadSnippets();

    const pendingOffer = localStorage.getItem('vault_pending_offer');
    const savedTier = localStorage.getItem('vault_tier') as SubscriptionTier || 'Free Trial';
    const savedExpiryIso = localStorage.getItem('vault_expiry_date');

    let currentTier = savedTier;
    let isExpired = false;

    if (savedExpiryIso && savedExpiryIso !== 'Lifetime') {
      const expiryDate = new Date(savedExpiryIso);
      if (new Date() > expiryDate) {
        isExpired = true;
        currentTier = 'Free Trial';
        localStorage.setItem('vault_tier', 'Free Trial');
        localStorage.removeItem('vault_is_trial');
        setShowPricingPopup(true); 
      }
    }

    setActiveTier(currentTier);
    if (currentTier === 'Yearly Max Plan') setMonthlyEditsLeft(999);
    else if (currentTier === 'Pro Plan Monthly') setMonthlyEditsLeft(5);
    else setMonthlyEditsLeft(0);

    const actIso = localStorage.getItem('vault_activation_date') || new Date().toISOString();
    
    setSubDates({
      activation: formatDate(actIso),
      expiry: isExpired ? 'Expired' : formatDate(savedExpiryIso || 'Lifetime')
    });

    if (pendingOffer === 'true') {
      setShowOfferPopup(true);
    } else {
      const hasSeenPricing = localStorage.getItem('vault_seen_pricing');
      if (!hasSeenPricing && !isExpired && !showPricingPopup) {
        const timer = setTimeout(() => setShowPricingPopup(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [router, showPricingPopup]);

  const visibleSnippets = snippets
    .filter(s => {
      if (activeFilter === "Starred") return s.starred;
      if (activeFilter !== "All") return s.language === activeFilter;
      return true;
    })
    .sort((a, b) => sortBy === 'deployed' ? (b.copies || 0) - (a.copies || 0) : b.id.localeCompare(a.id));

  const maxCopies = Math.max(...snippets.map(s => s.copies || 0), 0);
  const maxViews = Math.max(...snippets.map(s => s.views || 0), 0);

  const dynamicLanguages = Array.from(new Set(snippets.map(s => s.language)));
  const filterOptions = ["All", "Starred", ...dynamicLanguages];

  const totalSnippetsCount = snippets.length;
  const globalCopiesCount = snippets.reduce((acc, curr) => acc + (curr.copies || 0), 0);
  const totalViewsCount = snippets.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const handleMetricUpdate = async (id: string, type: 'copies' | 'views') => {
    setSnippets(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [type]: (s[type] || 0) + 1 };
      }
      return s;
    }));

    const username = localStorage.getItem('vault_username');
    const snippetToUpdate = snippets.find(s => s.id === id);
    if (!snippetToUpdate || !username) return;

    const updatedSnippet = { ...snippetToUpdate, [type]: (snippetToUpdate[type] || 0) + 1 };

    try {
      await fetch('/api/snippets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippet: updatedSnippet })
      });
    } catch (error) {
      console.error("Metric sync failed", error);
    }
  };

  const handleToggleStar = async (id: string) => {
    const updated = snippets.map(s => s.id === id ? { ...s, starred: !s.starred } : s);
    setSnippets(updated);

    const username = localStorage.getItem('vault_username');
    const snippetToUpdate = updated.find(s => s.id === id);
    if (snippetToUpdate && username) {
      try {
        await fetch('/api/snippets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, snippet: snippetToUpdate })
        });
      } catch (err) { console.error("Failed to update star", err); }
    }
  };

  const handleAddSnippet = async (snippet: Snippet) => {
    const username = localStorage.getItem('vault_username');
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippet })
      });
      const data = await res.json();
      if (data.success) {
        setSnippets([{ ...snippet, id: data.snippet.snippetId || snippet.id }, ...snippets]);
        
        const newNotif = {
          id: Date.now().toString(),
          title: 'Snippet Added',
          message: `Saved "${snippet.title}" to vault.`,
          color: 'bg-neon-cyan'
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to create snippet", error);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    setSnippets(snippets.filter(s => s.id !== id));
    if (viewSnippet?.id === id) {
      setViewSnippet(null);
    }

    const username = localStorage.getItem('vault_username');
    try {
      await fetch('/api/snippets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippetId: id })
      });
    } catch (error) { console.error("Failed to delete", error); }
  };

  const handleSaveEdit = async (updated: Snippet) => {
    setSnippets(snippets.map(s => s.id === updated.id ? updated : s));
    if (activeTier === 'Pro Plan Monthly') setMonthlyEditsLeft(prev => Math.max(0, prev - 1));
    setEditSnippet(null);
    
    const username = localStorage.getItem('vault_username');
    try {
      await fetch('/api/snippets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippet: updated })
      });
    } catch (error) { console.error("Failed to save edit", error); }
  };

  const activeViewSnippet = viewSnippet ? snippets.find(s => s.id === viewSnippet.id) || viewSnippet : null;

  const runModalXRay = () => {
    if (!activeViewSnippet) return;
    setViewSnippetAnalyzing(true);
    setTimeout(() => {
      const updatedXRay = {
        timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
        explanation: ['Analyzes sequence constraints locally.', 'Executes securely inside isolated edge sandbox.'],
        vulnerabilities: ['May crash if input array exceeds maximum payload limits.']
      };
      setSnippets(snippets.map(s => s.id === activeViewSnippet.id ? { ...s, xray: updatedXRay } : s));
      setViewSnippetAnalyzing(false);
    }, 2000);
  };

  if (!isAuthenticated) return null;

  // TAB 1: SNIPPETS VIEW
  const renderSnippetsView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_#00f0ff]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neon-cyan">Cognitive Engine Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Cognitive Vault</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">Manage, morph, and analyze production code sequences with neural AI.</p>
        </div>

        <button 
          onClick={() => setAddOpen(true)} 
          className="sm:hidden flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] active:scale-95"
        >
          <Plus size={16} /> New Snippet
        </button>
      </div>

      {/* Cyberpunk Neon Stat Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121A]/85 p-5 backdrop-blur-xl group hover:border-neon-cyan/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-neon-cyan/10 blur-xl group-hover:bg-neon-cyan/20 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">Vault Capacity</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white tracking-tight">{totalSnippetsCount} <span className="text-xs font-normal text-zinc-500 font-mono">units</span></p>
            </div>
            <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <LayoutGrid size={20}/>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <span className="text-neon-cyan font-bold">{snippets.filter(s => s.starred).length}</span> starred in quick access
          </div>
        </div>

        {/* Stat 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121A]/85 p-5 backdrop-blur-xl group hover:border-emerald-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">Total Deploys</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400 tracking-tight">{globalCopiesCount} <span className="text-xs font-normal text-zinc-500 font-mono">copies</span></p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Copy size={20}/>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <span className="text-emerald-400 font-bold">100%</span> zero-latency retrieval
          </div>
        </div>

        {/* Stat 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121A]/85 p-5 backdrop-blur-xl group hover:border-neon-magenta/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-neon-magenta/10 blur-xl group-hover:bg-neon-magenta/20 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">Diagnostic Scans</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-neon-magenta tracking-tight">{totalViewsCount} <span className="text-xs font-normal text-zinc-500 font-mono">views</span></p>
            </div>
            <div className="p-3 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 text-neon-magenta shadow-[0_0_15px_rgba(255,0,255,0.2)]">
              <Activity size={20}/>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <span className="text-neon-magenta font-bold">{snippets.filter(s => s.xray).length}</span> snippets with X-Ray active
          </div>
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Horizontal scrollable pill filters on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterOptions.map(option => (
            <button 
              key={option} 
              onClick={() => setActiveFilter(option)} 
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === option 
                  ? 'border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option === 'Starred' ? (
                <span className="flex items-center gap-1.5"><Star size={12} fill="currentColor" className="text-amber-400"/> {option}</span>
              ) : option}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex items-center self-start sm:self-auto rounded-xl border border-white/10 bg-white/5 p-1">
          <button 
            onClick={() => setSortBy('newest')} 
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              sortBy === 'newest' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="h-3 w-3" /> Newest
          </button>
          <button 
            onClick={() => setSortBy('deployed')} 
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              sortBy === 'deployed' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="h-3 w-3" /> Deployed
          </button>
        </div>
      </div>

      {/* Snippet Grid */}
      {visibleSnippets.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#12121A]/60 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-500">
            <Code2 size={24} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Snippets Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            {activeFilter !== "All" ? `No snippets match filter "${activeFilter}".` : "Your neural vault is currently empty. Add your first code block to get started."}
          </p>
          <button 
            onClick={() => setAddOpen(true)} 
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.35)]"
          >
            <Plus size={14} /> Add Snippet Now
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleSnippets.map((s, i) => {
              const isTrending = (maxCopies > 0 && s.copies === maxCopies) || (maxViews > 0 && s.views === maxViews);

              return (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  transition={{ duration: 0.25, delay: i * 0.04 }} 
                  key={s.id} 
                  className="h-full"
                >
                  <SnippetCard 
                    snippet={s} 
                    isTrending={isTrending}
                    onToggleStar={handleToggleStar} 
                    onEdit={setEditSnippet} 
                    onDelete={handleDeleteSnippet} 
                    onUpdateMetric={handleMetricUpdate}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );

  // TAB 2: LANGUAGES MATRIX
  const renderLanguagesView = () => {
    const langStats = snippets.reduce((acc, curr) => {
      if (!acc[curr.language]) acc[curr.language] = { count: 0, lines: 0, copies: 0 };
      acc[curr.language].count += 1;
      acc[curr.language].lines += curr.code.split('\n').length;
      acc[curr.language].copies += (curr.copies || 0);
      return acc;
    }, {} as Record<string, { count: number, lines: number, copies: number }>);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Polyglot Matrix</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">Deep telemetry of language usage, lines of code, and deployment frequency.</p>
        </div>

        {Object.keys(langStats).length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#12121A]/60 p-12 text-center text-zinc-500 font-mono text-xs">
            Ingest code sequences into the vault to generate matrix telemetry.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(langStats).map(([lang, stats]) => (
              <div key={lang} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 backdrop-blur-xl transition-all hover:border-neon-cyan/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan group-hover:bg-neon-cyan/20 transition-colors">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{lang}</h3>
                <p className="mt-1 text-xs text-zinc-400 font-mono">{stats.count} active snippet{stats.count !== 1 && 's'}</p>
                
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Volume</span>
                    <span className="text-sm font-bold text-white font-mono">{stats.lines} lines</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Deployment</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{stats.copies} copies</span>
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full rounded-full bg-black/60 overflow-hidden border border-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-blue-600" style={{ width: `${Math.min((stats.count / (snippets.length || 1)) * 100 * 2, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // TAB 3: INTEGRATIONS VIEW
  const renderIntegrationsView = () => {
    const integrations = [
      { name: 'GitHub Gists', desc: 'Auto-sync your vault to private Gists.', icon: GitBranch, connected: githubConnected, pro: false, loading: githubLoading, setLoad: setGithubLoading, setConn: setGithubConnected },
      { name: 'VS Code Sync', desc: 'Access your snippets directly in your IDE.', icon: Terminal, connected: vscodeConnected, pro: true, loading: vscodeLoading, setLoad: setVscodeLoading, setConn: setVscodeConnected },
      { name: 'Raycast Extension', desc: 'Global command-line access to your vault.', icon: Search, connected: false, pro: false, loading: false, setLoad: ()=>{}, setConn: ()=>{} },
      { name: 'API Webhooks', desc: 'Trigger external actions on snippet creation.', icon: Share2, connected: false, pro: true, loading: false, setLoad: ()=>{}, setConn: ()=>{} },
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">System Integrations</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">Connect Vantage AI directly into your IDE, CLI, and team workflow tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrations.map((int) => (
            <div key={int.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 backdrop-blur-xl transition-all hover:border-white/20">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${int.connected ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-neon-cyan'}`}>
                  <int.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {int.name}
                    {int.connected && <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300">Connected</span>}
                    {int.pro && !int.connected && <span className="rounded bg-neon-cyan/20 border border-neon-cyan/40 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-neon-cyan">PRO</span>}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{int.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(int.name === 'Raycast Extension' || int.name === 'API Webhooks') return;
                  int.setLoad(true); 
                  setTimeout(() => { int.setConn(true); int.setLoad(false); }, 1500); 
                }} 
                disabled={int.connected || int.loading} 
                className={`shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  int.connected 
                    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default' 
                    : 'bg-white/10 text-white border border-white/15 hover:bg-neon-cyan hover:text-black hover:border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-95'
                }`}
              >
                {int.loading ? 'Connecting...' : int.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // TAB 4: SETTINGS & BILLING
  const renderSettingsView = () => {
    const tiers: Tier[] = [
      { name: "Free Trial", price: "$0", period: "/forever", desc: "For individual developers.", features: ["Up to 3 snippets", "Manual ingestion", "Basic search"], highlight: false },
      { name: "Pro Plan Monthly", price: "$9", period: "/mo", desc: "For professionals needing AI.", features: ["Unlimited snippets", "Neural AI Scanner", "5 Neural Morphs/mo", "Cognitive X-Ray"], highlight: true },
      { name: "Yearly Max Plan", price: "$89", period: "/yr", desc: "Best value for power users.", features: ["Everything in Pro", "Infinite Neural Morphs", "Priority Support"], highlight: true }
    ];

    const userInitials = profile.username.slice(0, 2).toUpperCase() || 'VI';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-5xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Settings & Billing</h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">Manage account credentials, active tier, and security preferences.</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 active:scale-95 cursor-pointer"
          >
            <LogOut size={14} /> Disconnect Session
          </button>
        </div>

        {/* Profile Card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 backdrop-blur-xl">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-neon-cyan mb-4 border-b border-white/10 pb-2">Developer Identity</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-600 text-2xl font-bold text-white shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              {userInitials}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 flex-1 w-full">
              <div><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Username</span><p className="font-bold text-white font-mono text-sm">@{profile.username}</p></div>
              <div><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Email</span><p className="font-bold text-white font-mono text-sm truncate">{profile.email}</p></div>
              <div><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Phone</span><p className="font-bold text-white font-mono text-sm">{profile.phone || 'Not configured'}</p></div>
              
              <div className="pt-2"><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Active Plan</span><p className="font-bold text-neon-cyan uppercase tracking-wide text-sm">{activeTier}</p></div>
              <div className="pt-2"><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Activated</span><p className="font-bold text-emerald-400 font-mono text-sm">{subDates.activation}</p></div>
              <div className="pt-2"><span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1">Expires</span><p className="font-bold text-zinc-300 font-mono text-sm">{subDates.expiry}</p></div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative flex flex-col rounded-2xl border ${tier.highlight ? 'border-neon-cyan/50 bg-[#12121A]/95 shadow-[0_10px_40px_rgba(0,240,255,0.15)]' : 'border-white/10 bg-[#12121A]/60'} p-6 backdrop-blur-xl transition-all`}>
              {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-neon-cyan to-blue-600 px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-white shadow-md">Recommended</div>}
              <h3 className="text-base font-bold text-white">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white tracking-tight">{tier.price}</span>
                <span className="text-xs font-mono text-zinc-400">{tier.period}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">{tier.desc}</p>
              <div className="my-5 h-px w-full bg-white/10" />
              <ul className="mb-6 flex flex-col gap-2.5 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={14} className="text-neon-cyan shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSelectTier(tier.name as SubscriptionTier)} 
                className={`mt-auto w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                  activeTier === tier.name 
                    ? 'border border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan' 
                    : tier.highlight 
                      ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:opacity-90' 
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {activeTier === tier.name ? 'Active Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // TAB 5: ABOUT & DOCUMENTATION
  const renderAboutView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-4xl mx-auto w-full pb-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Documentation & Manual</h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">Complete architectural guide to Vantage AI workflows and capabilities.</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 sm:p-8 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Server className="text-neon-cyan" size={18} /> How Vantage AI Operates
          </h2>
          <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm mb-4">
            Vantage AI is a distributed cognitive workspace for code components. Instead of manually bookmarking scripts, paste raw code sequences into the vault. The Gemini Neural Engine automatically isolates syntax, determines language constraints, derives semantic metadata, and builds searchable vector tags.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-neon-cyan font-mono font-black text-base block mb-1">01. INGEST</span>
              <h4 className="font-bold text-white text-xs mb-1">Input Code</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">Paste raw snippets or record voice instructions via Jarvis.</p>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-neon-magenta font-mono font-black text-base block mb-1">02. ANALYZE</span>
              <h4 className="font-bold text-white text-xs mb-1">AI Metadata</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">Complexity scanner maps Big-O bounds and potential bugs.</p>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-emerald-400 font-mono font-black text-base block mb-1">03. SHIP</span>
              <h4 className="font-bold text-white text-xs mb-1">Zero-Latency Sync</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">Instant ⌘K retrieval and cross-language Polyglot morphing.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 backdrop-blur-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Polyglot Morph Engine</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-3"><strong>Core Utility:</strong> Multi-stack logic conversion without rewrites.</p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Open any snippet in the edit modal, select a target language from the dropdown, and execute Morph. The neural engine rewires the implementation while preserving strict algorithmic invariants.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12121A]/85 p-6 backdrop-blur-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Cognitive X-Ray</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-3"><strong>Core Utility:</strong> Algorithmic profiling and vulnerability audits.</p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Click &apos;Run Diagnostics&apos; on any snippet card. The system benchmarks Big-O Time & Space complexities, traces operational paths, and alerts on edge-case memory bounds.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden text-white selection:bg-neon-cyan/30">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        {/* Responsive Dashboard Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#07070A]/90 px-4 sm:px-6 py-3 backdrop-blur-2xl">
          {/* Left: Mobile Menu + Search */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <button 
              onClick={() => setSideOpen(true)} 
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 lg:hidden hover:bg-white/10 hover:text-white transition-colors cursor-pointer active:scale-95 shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div 
              onClick={() => setCmdOpen(true)} 
              className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-neon-cyan/50 hover:bg-white/10"
            >
              <Search className="h-4 w-4 text-neon-cyan shrink-0" />
              <span className="flex-1 text-xs text-zinc-400 truncate">Search vault...</span>
              <kbd className="hidden sm:inline-block rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">⌘K</kbd>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Jarvis Mic */}
            <div className="hidden sm:block">
              <JarvisMic onSnippetGenerated={(newAiSnippet) => {
                handleAddSnippet({
                  id: crypto.randomUUID(),
                  title: newAiSnippet.title || "Jarvis Snippet",
                  language: newAiSnippet.language || "TypeScript",
                  code: newAiSnippet.code || "",
                  tags: newAiSnippet.tags || [],
                  description: newAiSnippet.description || "",
                  starred: false,
                  copies: 0,
                  views: 0
                });
              }} />
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setUnreadCount(0); }} 
                className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-neon-cyan/50 transition-all relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-neon-cyan text-[8px] flex items-center justify-center font-bold text-black shadow-[0_0_8px_#00f0ff]">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="absolute right-0 top-12 mt-2 w-72 sm:w-80 rounded-2xl border border-white/10 bg-[#12121A]/95 p-4 shadow-2xl backdrop-blur-3xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Activity Stream</h3>
                      {unreadCount > 0 && <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full font-mono">{unreadCount} New</span>}
                    </div>
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-4 font-mono">No recent activity.</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="flex gap-2.5 items-start p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.color}`}></div>
                            <div>
                              <p className="text-xs text-white font-bold">{notif.title}</p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Docs link */}
            <button 
              onClick={() => setActiveTab('about')} 
              className="hidden md:flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 hover:text-white px-3 py-2 rounded-xl transition-all border border-white/10 bg-white/5 hover:border-neon-cyan/40"
            >
              <BookOpen size={13} /> Docs
            </button>
            
            {/* Primary Add Button */}
            <button 
              onClick={() => setAddOpen(true)} 
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add Snippet</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'snippets' && renderSnippetsView()}
            {activeTab === 'languages' && renderLanguagesView()}
            {activeTab === 'integrations' && renderIntegrationsView()}
            {activeTab === 'settings' && renderSettingsView()}
            {activeTab === 'about' && renderAboutView()} 
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSelect={setViewSnippet} snippets={snippets} />

      {/* Snippet Detail Modal */}
      <AnimatePresence>
        {activeViewSnippet && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e14]/95 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4 bg-[#12121A]/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-2.5 py-1 text-[10px] font-mono font-bold text-neon-cyan uppercase tracking-wider shrink-0">
                    {activeViewSnippet.language}
                  </span>
                  <h2 className="text-sm sm:text-lg font-bold text-white truncate">{activeViewSnippet.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleDeleteSnippet(activeViewSnippet.id)} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-300 transition-colors" title="Delete"><Trash2 size={15} /></button>
                  <button onClick={() => { setEditSnippet(activeViewSnippet); setViewSnippet(null); }} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors" title="Edit"><Edit2 size={15} /></button>
                  <button onClick={() => handleToggleStar(activeViewSnippet.id)} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors" title="Star"><Star size={15} fill={activeViewSnippet.starred ? "#f59e0b" : "none"} color={activeViewSnippet.starred ? "#f59e0b" : "currentColor"} /></button>
                  <div className="w-px h-5 bg-white/10 mx-1"></div>
                  <button onClick={() => setViewSnippet(null)} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"><X size={17} /></button>
                </div>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
                {activeViewSnippet.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed border-l-2 border-neon-cyan pl-3.5">
                    {activeViewSnippet.description}
                  </p>
                )}
                
                {/* Code Highlighter */}
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#07070A] shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Source Array</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400"><Activity size={11} className="text-neon-magenta"/> {activeViewSnippet.views}</span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400"><Copy size={11} className="text-emerald-400"/> {activeViewSnippet.copies}</span>
                      <div className="w-px h-3 bg-white/10"></div>
                      <button 
                        onClick={() => { 
                          navigator.clipboard.writeText(activeViewSnippet.code); 
                          handleMetricUpdate(activeViewSnippet.id, 'copies');
                        }} 
                        className="text-[10px] font-mono font-bold flex items-center gap-1 text-neon-cyan hover:underline cursor-pointer"
                      >
                        <Copy size={11}/> Copy Code
                      </button>
                    </div>
                  </div>
                  <SyntaxHighlighter 
                    language={activeViewSnippet.language.toLowerCase()} 
                    style={vscDarkPlus} 
                    customStyle={{ margin: 0, padding: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', background: 'transparent' }}
                  >
                    {activeViewSnippet.code}
                  </SyntaxHighlighter>
                </div>

                {/* Diagnostics Section */}
                <div className="rounded-xl border border-neon-cyan/30 bg-[#12121A]/80 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-4 w-4 text-neon-cyan ${viewSnippetAnalyzing ? 'animate-pulse' : ''}`} />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neon-cyan">Cognitive Diagnostics</h3>
                    </div>
                    {!activeViewSnippet.xray && (
                      <button 
                        onClick={runModalXRay} 
                        disabled={viewSnippetAnalyzing} 
                        className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-mono font-bold text-neon-cyan transition-all hover:bg-neon-cyan/20 disabled:opacity-50 cursor-pointer"
                      >
                        <BrainCircuit className={`h-3.5 w-3.5 ${viewSnippetAnalyzing ? 'animate-spin' : ''}`} />
                        {viewSnippetAnalyzing ? 'Scanning...' : 'Run Diagnostics'}
                      </button>
                    )}
                  </div>

                  {activeViewSnippet.xray ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                          <div className="flex-1 rounded-lg border border-neon-cyan/30 bg-black/40 p-2.5 text-center">
                            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">Time Complexity</div>
                            <div className="mt-1 text-base font-black text-neon-cyan font-mono">{activeViewSnippet.xray.timeComplexity}</div>
                          </div>
                          <div className="flex-1 rounded-lg border border-white/10 bg-black/40 p-2.5 text-center">
                            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">Space Complexity</div>
                            <div className="mt-1 text-base font-black text-white font-mono">{activeViewSnippet.xray.spaceComplexity}</div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
                            <AlertTriangle className="h-3 w-3 text-red-400" /> Vulnerabilities & Bounds
                          </div>
                          <ul className="space-y-1">
                            {activeViewSnippet.xray.vulnerabilities.map((item, idx) => (
                              <li key={idx} className="text-[11px] leading-relaxed text-red-200/90 pl-3 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-red-500">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                          <Eye className="h-3 w-3 text-neon-cyan" /> Execution Walkthrough
                        </div>
                        <ul className="space-y-1">
                          {activeViewSnippet.xray.explanation.map((item, idx) => (
                            <li key={idx} className="text-[11px] leading-relaxed text-zinc-300 pl-3 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-neon-cyan">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-zinc-500 font-mono flex flex-col items-center gap-1.5">
                      <BrainCircuit size={24} className="opacity-40 text-neon-cyan" />
                      <p>Neural pathways unmapped. Run diagnostics to benchmark complexity.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SnippetFormModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddSnippet} />
      <SnippetEditModal snippet={editSnippet} open={editSnippet !== null} onClose={() => setEditSnippet(null)} onSave={handleSaveEdit} activeTier={activeTier} monthlyEditsLeft={monthlyEditsLeft} onUpgradeClick={() => { setEditSnippet(null); setActiveTab('settings'); }} />

      {/* Free Pro Trial Modal */}
      <AnimatePresence>
        {showOfferPopup && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md overflow-hidden rounded-3xl border border-neon-cyan/40 bg-[#12121A]/95 shadow-[0_40px_100px_rgba(0,240,255,0.2)] backdrop-blur-3xl text-center p-6 sm:p-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">Welcome to Vantage AI</h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                You have unlocked a <strong className="text-neon-cyan">1-Month Free Trial</strong> of our Pro Plan. Access the Polyglot Morph Engine and Complexity X-Ray at zero cost.
              </p>
              <div className="space-y-2.5">
                <button onClick={handleClaimOffer} className="w-full rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 py-3 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer">
                  Activate Free Pro Plan
                </button>
                <button onClick={() => { setShowOfferPopup(false); localStorage.removeItem('vault_pending_offer'); }} className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-zinc-400 uppercase hover:bg-white/10 hover:text-white transition-colors">
                  Skip to Basic Tier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing Upgrade Modal */}
      <AnimatePresence>
        {showPricingPopup && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md overflow-y-auto py-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e14]/95 shadow-[0_40px_100px_rgba(0,0,0,0.9)] backdrop-blur-3xl">
              <div className="border-b border-white/10 px-6 sm:px-8 py-5 text-center bg-[#12121A]/60">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Initialize Configuration</h2>
                <p className="mt-1 text-xs text-zinc-400">Select an operational tier to initialize your neural engine components.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {[
                  { name: "Free Trial", price: "$0", desc: "For individual developers.", btn: "Start Free", highlight: false },
                  { name: "Pro Plan Monthly", price: "$9", desc: "For professionals needing AI.", btn: "Start Pro", highlight: true },
                  { name: "Yearly Max Plan", price: "$89", desc: "Best value for power users.", btn: "Start Yearly", highlight: true }
                ].map(tier => (
                  <div key={tier.name} className={`flex flex-col p-6 sm:p-8 transition-colors ${tier.highlight ? 'bg-neon-cyan/[0.03]' : ''}`}>
                    {tier.highlight && <span className="mb-2 w-max rounded-full bg-neon-cyan/20 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-neon-cyan border border-neon-cyan/30">Recommended</span>}
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{tier.price}</div>
                    <p className="mt-1 text-xs text-zinc-400 mb-6">{tier.desc}</p>
                    <button 
                      onClick={() => handleSelectTier(tier.name as SubscriptionTier)} 
                      className={`mt-auto w-full rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        tier.highlight 
                          ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:opacity-90' 
                          : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {tier.btn}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-[350] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0e0e14] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
              {paymentSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300">
                    <ShieldCheck size={24}/>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Processing Successful</h3>
                  <p className="text-xs text-zinc-400 font-mono">Securing configuration updates to live workspace context...</p>
                </div>
              ) : (
                <form onSubmit={executePaymentPipeline} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Secure Encrypted Checkout</h3>
                      <p className="text-[11px] text-neon-cyan font-mono mt-0.5">Target Plan: {checkoutPlan}</p>
                    </div>
                    <button type="button" onClick={() => setCheckoutPlan(null)} className="text-zinc-400 hover:text-white p-1 rounded bg-white/5"><X size={14}/></button>
                  </div>

                  {paymentError && <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 text-xs text-red-300">{paymentError}</div>}

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4111 2222 3333 4444" className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1">Expiration</label>
                      <input type="text" required value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1">CVC Code</label>
                      <input type="password" required value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="•••" maxLength={4} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan text-center font-mono" />
                    </div>
                  </div>

                  <button type="submit" className="mt-2 w-full bg-gradient-to-r from-neon-cyan to-blue-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:opacity-90 transition-all cursor-pointer">
                    Authorize Charge
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
