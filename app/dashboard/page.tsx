'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Sidebar, TabType } from '@/components/ui/Sidebar';
import { SnippetCard } from '@/components/snippet/SnippetCard';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { SnippetFormModal } from '@/components/snippet/SnippetFormModal';
import { SnippetEditModal } from '@/components/snippet/SnippetEditModal';
import { Menu, Search, Plus, Code2, Flame, Clock, GitBranch, Share2, Terminal, LogOut, CheckCircle2, ShieldAlert, Sparkles, Activity, Cpu, LayoutGrid, Copy, CreditCard, ShieldCheck, X, BookOpen, Star, Bell, Trash2, Edit2, Zap, BrainCircuit, AlertTriangle, Eye, Server, Gift } from 'lucide-react';
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
  
  // 🔥 Dynamic Notifications State
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
      localStorage.setItem('vault_seen_pricing', 'true');
      localStorage.removeItem('vault_pending_offer');

      setActiveTier('Pro Plan Monthly');
      setMonthlyEditsLeft(5);
      setSubDates({ activation: formatDate(today.toISOString()), expiry: formatDate(nextMonth.toISOString()) });
      setShowOfferPopup(false);

    } catch (error) {
      console.error("Network error claiming trial:", error);
    }
  };

  const handleSelectTier = (selectedTier: SubscriptionTier) => {
    if (selectedTier === 'Free Trial') {
      setActiveTier(selectedTier);
      localStorage.setItem('vault_tier', selectedTier);
      localStorage.setItem('vault_seen_pricing', 'true');
      setMonthlyEditsLeft(0); 
      
      const todayIso = new Date().toISOString();
      localStorage.setItem('vault_activation_date', todayIso);
      localStorage.setItem('vault_expiry_date', 'Lifetime');
      setSubDates({ activation: formatDate(todayIso), expiry: 'Lifetime' });

      setShowPricingPopup(false);
    } else {
      setCheckoutPlan(selectedTier);
    }
  };

  const executePaymentPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 4 || cardCvc.length < 3) {
      setPaymentError('Invalid billing parameters.');
      return;
    }

    if (checkoutPlan) {
      setPaymentSuccess(true);
      setActiveTier(checkoutPlan);
      localStorage.setItem('vault_tier', checkoutPlan);
      localStorage.setItem('vault_seen_pricing', 'true');
      
      const currentExpiryIso = localStorage.getItem('vault_expiry_date');
      let baseDate = new Date();
      if (currentExpiryIso && currentExpiryIso !== 'Lifetime' && currentExpiryIso !== 'Expired') {
         const currentExpiry = new Date(currentExpiryIso);
         if (currentExpiry > baseDate) baseDate = currentExpiry;
      }

      let newExpiryIso = 'Lifetime';
      if (checkoutPlan === 'Pro Plan Monthly') {
        setMonthlyEditsLeft(5);
        const nextMonth = new Date(baseDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        newExpiryIso = nextMonth.toISOString();
      } else if (checkoutPlan === 'Yearly Max Plan') {
        setMonthlyEditsLeft(999);
        const nextYear = new Date(baseDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        newExpiryIso = nextYear.toISOString();
      }

      const activationIso = new Date().toISOString();
      localStorage.setItem('vault_activation_date', activationIso);
      localStorage.setItem('vault_expiry_date', newExpiryIso);
      setSubDates({ activation: formatDate(activationIso), expiry: formatDate(newExpiryIso) });

      setTimeout(() => {
        setPaymentSuccess(false);
        setCheckoutPlan(null);
        setShowPricingPopup(false);
      }, 2500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vault_auth');
    localStorage.removeItem('vault_seen_pricing');
    localStorage.removeItem('vault_tier');
    router.push('/login');
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('vault_auth');
    if (!authStatus) { router.push('/signup'); return; }
    setIsAuthenticated(true);

    const username = localStorage.getItem('vault_username') || 'Developer';

    setProfile({
      username: username,
      email: localStorage.getItem('vault_email') || 'user@vault.ai',
      phone: localStorage.getItem('vault_phone') || '+91 0000000000'
    });

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

  // 🔥 TRENDING CALCULATION  
  const maxCopies = Math.max(...snippets.map(s => s.copies || 0), 0);
  const maxViews = Math.max(...snippets.map(s => s.views || 0), 0);

  const dynamicLanguages = Array.from(new Set(snippets.map(s => s.language)));
  const filterOptions = ["All", "Starred", ...dynamicLanguages];

  const totalSnippetsCount = snippets.length;
  // ✅ Safe Math applied here to prevent TypeScript errors
  const globalCopiesCount = snippets.reduce((acc, curr) => acc + (curr.copies || 0), 0);
  const totalViewsCount = snippets.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const handleMetricUpdate = async (id: string, type: 'copies' | 'views') => {
    // 1. UI update
    setSnippets(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [type]: (s[type] || 0) + 1 };
      }
      return s;
    }));

    // 2. DB Update
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
      console.error("Failed to update metric", error);
    }
  };

  const handleAddSnippet = async (newSnippet: Snippet) => {
    setSnippets([newSnippet, ...snippets]);
    
    // 🔥 Notification Push Add
    setNotifications(prev => [{ id: Date.now().toString(), title: 'Snippet Committed', message: `Added new ${newSnippet.language} snippet: ${newSnippet.title}`, color: 'bg-emerald-400' }, ...prev]);
    setUnreadCount(prev => prev + 1);

    const username = localStorage.getItem('vault_username');
    try {
      await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippet: newSnippet })
      });
    } catch (error) { console.error("Failed to save snippet to DB", error); }
  };

  const handleToggleStar = async (id: string) => {
    const snippetToUpdate = snippets.find(s => s.id === id);
    if (!snippetToUpdate) return;
    
    const updatedSnippet = { ...snippetToUpdate, starred: !snippetToUpdate.starred };
    setSnippets(snippets.map(s => s.id === id ? updatedSnippet : s));
    
    const username = localStorage.getItem('vault_username');
    try {
      await fetch('/api/snippets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, snippet: updatedSnippet })
      });
    } catch (error) { console.error("Failed to star", error); }
  };

  const handleDeleteSnippet = async (id: string) => {
    const snippetToDelete = snippets.find(s => s.id === id);
    setSnippets(snippets.filter(s => s.id !== id));
    if (viewSnippet?.id === id) setViewSnippet(null);
    
    // 🔥 Notification Push Delete
    if (snippetToDelete) {
      setNotifications(prev => [{ id: Date.now().toString(), title: 'Snippet Purged', message: `Deleted snippet: ${snippetToDelete.title}`, color: 'bg-red-500' }, ...prev]);
      setUnreadCount(prev => prev + 1);
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

  const renderSnippetsView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Cognitive Workspace Vault</h1>
        <p className="mt-2 text-[14px] text-white/60 tracking-wide">Secure, morph, and analyze your development components with AI precision.</p>
      </div>

      <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-purple-500/40 bg-[#1a0b2e]/50 p-6 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Active Units</p>
            <p className="text-2xl font-black mt-1 text-white">{totalSnippetsCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300"><LayoutGrid size={20}/></div>
        </div>
        <div className="rounded-2xl border border-purple-500/40 bg-[#1a0b2e]/50 p-6 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Total Executions</p>
            <p className="text-2xl font-black mt-1 text-emerald-400">{globalCopiesCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300"><Copy size={20}/></div>
        </div>
        <div className="rounded-2xl border border-purple-500/40 bg-[#1a0b2e]/50 p-6 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Network Views</p>
            <p className="text-2xl font-black mt-1 text-cyan-400">{totalViewsCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300"><Activity size={20}/></div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button 
              key={option} 
              onClick={() => setActiveFilter(option)} 
              className={`rounded-full border px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${activeFilter === option ? 'border-purple-500/60 bg-purple-500/30 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-purple-500/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >
              {option === 'Starred' ? <span className="flex items-center gap-1.5"><Star size={12} fill="currentColor"/> {option}</span> : option}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-xl border border-purple-500/40 bg-[#120524] p-1">
          <button onClick={() => setSortBy('newest')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${sortBy === 'newest' ? 'bg-purple-500/30 text-purple-200' : 'text-white/50 hover:text-white/80'}`}><Clock className="h-3 w-3" /> Newest</button>
          <button onClick={() => setSortBy('deployed')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${sortBy === 'deployed' ? 'bg-purple-500/30 text-purple-200' : 'text-white/50 hover:text-white/80'}`}><Flame className="h-3 w-3" /> Deployed</button>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleSnippets.map((s, i) => {
            // 🔥 Trending Logic added here
            const isTrending = (maxCopies > 0 && s.copies === maxCopies) || (maxViews > 0 && s.views === maxViews);

            return (
              <motion.div layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: i * 0.05 }} key={s.id} className="h-full">
                {/* ✅ BUG FIXED: onUpdateMetric & isTrending are passed perfectly */}
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
    </motion.div>
  );

  const renderLanguagesView = () => {
    const langStats = snippets.reduce((acc, curr) => {
      if (!acc[curr.language]) acc[curr.language] = { count: 0, lines: 0, copies: 0 };
      acc[curr.language].count += 1;
      acc[curr.language].lines += curr.code.split('\n').length;
      acc[curr.language].copies += (curr.copies || 0);
      return acc;
    }, {} as Record<string, { count: number, lines: number, copies: number }>);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Language Matrix</h1>
          <p className="mt-2 text-[14px] text-white/60">Advanced analytics of your neural architecture deployment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(langStats).map(([lang, stats]) => (
            <div key={lang} className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[#1a0b2e]/60 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                <Code2 className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white">{lang}</h3>
              <p className="mt-1 text-sm text-purple-200/80">{stats.count} active snippet{stats.count !== 1 && 's'}</p>
              
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Total LOC</span>
                  <span className="text-sm font-bold text-white/90">{stats.lines} lines</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Utilization</span>
                  <span className="text-sm font-bold text-emerald-400">{stats.copies} deploys</span>
                </div>
              </div>

              <div className="mt-5 h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${Math.min((stats.count / snippets.length) * 100 * 2, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderIntegrationsView = () => {
    const integrations = [
      { name: 'GitHub Gists', desc: 'Auto-sync your vault to private Gists.', icon: GitBranch, connected: githubConnected, pro: false, loading: githubLoading, setLoad: setGithubLoading, setConn: setGithubConnected },
      { name: 'VS Code Sync', desc: 'Access your snippets directly in your IDE.', icon: Terminal, connected: vscodeConnected, pro: true, loading: vscodeLoading, setLoad: setVscodeLoading, setConn: setVscodeConnected },
      { name: 'Raycast', desc: 'Global command-line access to your vault.', icon: Search, connected: false, pro: false, loading: false, setLoad: ()=>{}, setConn: ()=>{} },
      { name: 'API Webhooks', desc: 'Trigger external actions on snippet creation.', icon: Share2, connected: false, pro: true, loading: false, setLoad: ()=>{}, setConn: ()=>{} },
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">System Integrations</h1>
          <p className="mt-2 text-[14px] text-white/60">Connect Vantage AI to your external workflows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrations.map((int) => (
            <div key={int.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-purple-500/30 bg-[#1a0b2e]/60 p-6 backdrop-blur-md transition-all hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${int.connected ? 'border-emerald-500/50 bg-emerald-500/20' : 'border-purple-500/40 bg-purple-500/20'}`}>
                  <int.icon className={`h-6 w-6 ${int.connected ? 'text-emerald-300' : 'text-purple-300'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {int.name}
                    {int.connected && <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Connected</span>}
                    {int.pro && !int.connected && <span className="rounded bg-gradient-to-r from-purple-500 to-cyan-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">PRO</span>}
                  </h3>
                  <p className="mt-1 text-sm text-white/60">{int.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(int.name === 'Raycast' || int.name === 'API Webhooks') return;
                  int.setLoad(true); 
                  setTimeout(() => { int.setConn(true); int.setLoad(false); }, 1500); 
                }} 
                disabled={int.connected || int.loading} 
                className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${int.connected ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 cursor-default' : 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(124,58,237,0.5)] hover:bg-purple-500 active:scale-95'}`}
              >
                {int.loading ? 'Connecting...' : int.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderSettingsView = () => {
    const tiers: Tier[] = [
      { name: "Free Trial", price: "$0", period: "/forever", desc: "For individual developers.", features: ["Up to 3 snippets", "Manual ingestion", "Basic search"], highlight: false },
      { name: "Pro Plan Monthly", price: "$9", period: "/mo", desc: "For professionals needing AI.", features: ["Unlimited snippets", "Neural AI Scanner", "5 Neural Morphs/mo", "Cognitive X-Ray"], highlight: true },
      { name: "Yearly Max Plan", price: "$89", period: "/yr", desc: "Best value for power users.", features: ["Everything in Pro", "Infinite Neural Morphs", "Priority Support"], highlight: true }
    ];

    const userInitials = profile.username.slice(0, 2).toUpperCase() || 'VI';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Settings & Billing</h1>
            <p className="mt-2 text-[14px] text-white/60">Manage your account, profile details, and subscription tier.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2.5 text-[13px] font-bold text-red-300 transition-all hover:bg-red-500/30 active:scale-95">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="mb-10 rounded-2xl border border-purple-500/40 bg-[#1a0b2e]/60 p-6 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 mb-4 border-b border-purple-500/20 pb-2">Developer Profile</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-3xl font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.5)]">
              {userInitials}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4 flex-1 w-full">
              <div><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Username</span><p className="font-bold text-white font-mono">@{profile.username}</p></div>
              <div><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Account Email</span><p className="font-bold text-white font-mono">{profile.email}</p></div>
              <div><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Phone Link</span><p className="font-bold text-white font-mono">{profile.phone}</p></div>
              
              <div className="pt-2"><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Active Plan</span><p className="font-bold text-cyan-300 uppercase tracking-wide">{activeTier}</p></div>
              <div className="pt-2"><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Activation Date</span><p className="font-bold text-emerald-400 font-mono">{subDates.activation}</p></div>
              <div className="pt-2"><span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Expiry Date</span><p className="font-bold text-red-400 font-mono">{subDates.expiry}</p></div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative flex flex-col rounded-2xl border ${tier.highlight ? 'border-cyan-500/60 bg-gradient-to-b from-[#1a0b2e]/90 to-[#120524]/90' : 'border-purple-500/30 bg-[#1a0b2e]/50'} p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,58,237,0.25)]`}>
              {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">Most Popular</div>}
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{tier.price}</span>
                <span className="text-sm font-medium text-white/60">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-white/70">{tier.desc}</p>
              <div className="my-6 h-[1px] w-full bg-white/20" />
              <ul className="mb-8 flex flex-col gap-3 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleSelectTier(tier.name as SubscriptionTier)} className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95 ${activeTier === tier.name ? 'border border-purple-500/40 bg-purple-500/20 text-purple-200' : tier.highlight ? 'bg-cyan-500 text-black shadow-[0_4px_20px_rgba(6,182,212,0.6)] hover:bg-cyan-400' : 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(124,58,237,0.5)] hover:bg-purple-500'}`}>
                {activeTier === tier.name ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderAboutView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-4xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Documentation & Guide</h1>
        <p className="mt-2 text-[14px] text-white/60">Complete operational manual for Vantage AI features and workflows.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-[#12121A]/80 p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Server className="text-neon-cyan"/> How Vantage AI Works</h2>
          <p className="text-white/70 leading-relaxed text-sm mb-4">Vantage AI is a cognitive workspace and snippet repository. Instead of manually organizing code, you simply paste raw sequences into the system. The Gemini Neural Engine automatically analyzes the syntax, deduces the programming language, generates a descriptive title, and assigns searchable tags. Everything is instantly synced and accessible via the global Command Palette.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5"><span className="text-cyan-400 font-black text-lg block mb-1">01</span><h4 className="font-bold text-white text-sm mb-1">Commit</h4><p className="text-xs text-white/50">Paste raw code into the Vault.</p></div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5"><span className="text-purple-400 font-black text-lg block mb-1">02</span><h4 className="font-bold text-white text-sm mb-1">Process</h4><p className="text-xs text-white/50">AI generates metadata and tags.</p></div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5"><span className="text-emerald-400 font-black text-lg block mb-1">03</span><h4 className="font-bold text-white text-sm mb-1">Deploy</h4><p className="text-xs text-white/50">Search, copy, and ship instantly.</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-cyan-500/30 bg-[#1a0b2e]/60 p-6 backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/40"><Sparkles className="h-5 w-5 text-cyan-300" /></div>
            <h3 className="text-lg font-bold text-white mb-2">Neural Morph Engine</h3>
            <p className="text-white/60 text-xs leading-relaxed mb-3"><strong>Use Case:</strong> Porting code between different tech stacks.</p>
            <p className="text-white/60 text-xs leading-relaxed">Open any snippet in the edit modal, select a target language from the dropdown, and execute the Morph. The AI will instantly rewrite the logic into the new syntax while preserving the core algorithm.</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-[#1a0b2e]/60 p-6 backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40"><BrainCircuit className="h-5 w-5 text-emerald-300" /></div>
            <h3 className="text-lg font-bold text-white mb-2">Cognitive X-Ray</h3>
            <p className="text-white/60 text-xs leading-relaxed mb-3"><strong>Use Case:</strong> Debugging and algorithm optimization.</p>
            <p className="text-white/60 text-xs leading-relaxed">Click 'Run Diagnostics' on any snippet card. The AI calculates Big-O Time & Space complexity, breaks down the execution flow step-by-step, and scans for critical edge-case vulnerabilities.</p>
          </div>
          
          <div className="rounded-2xl border border-purple-500/30 bg-[#1a0b2e]/60 p-6 backdrop-blur-md md:col-span-2">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/40"><Search className="h-5 w-5 text-purple-300" /></div>
            <h3 className="text-lg font-bold text-white mb-2">Global Command Palette</h3>
            <p className="text-white/60 text-xs leading-relaxed mb-3"><strong>Use Case:</strong> Lightning-fast retrieval during active development.</p>
            <p className="text-white/60 text-xs leading-relaxed">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 mx-1 font-mono">⌘K</kbd> from anywhere in the dashboard to trigger the fuzzy search matrix. Search by title, language, or AI-generated tags to instantly locate and view your exact neural pathway without leaving your keyboard.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden text-white selection:bg-cyan-500/30">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0e0e14]/85 px-5 py-3 backdrop-blur-2xl">
          <button onClick={() => setSideOpen(true)} className="rounded-lg border border-white/20 bg-white/10 p-2 text-white/80 lg:hidden hover:bg-white/20 hover:text-white transition-colors cursor-pointer"><Menu className="h-5 w-5" /></button>
          
          <div onClick={() => setCmdOpen(true)} className="flex flex-1 max-w-sm cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:border-neon-cyan/50 hover:bg-white/10">
            <Search className="h-4 w-4 text-neon-cyan" />
            <span className="flex-1 text-[13px] text-zinc-400">Search workspace...</span>
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400">⌘K</kbd>
          </div>
          
          <div className="flex-1" />

          {/* 🔥 JARVIS MIC ADDED HERE */}
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
          
          {/* 🔥 MODIFIED: Notification Bell with Badge Logic */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => { setNotificationsOpen(!notificationsOpen); setUnreadCount(0); }} 
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:border-neon-cyan/50 transition-all relative shadow-lg cursor-pointer"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 h-4 w-4 rounded-full bg-neon-cyan text-[9px] flex items-center justify-center font-bold text-black border border-black">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 mt-2 w-80 rounded-2xl border border-white/10 bg-[#12121A]/95 p-4 shadow-2xl backdrop-blur-3xl z-50">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Log</h3>
                    {unreadCount > 0 && <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-white/50 text-center py-4">No recent activity.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="flex gap-3 items-start p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                          <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)] ${notif.color}`}></div>
                          <div>
                            <p className="text-sm text-white font-bold">{notif.title}</p>
                            <p className="text-xs text-white/70 mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setActiveTab('about')} className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-200 hover:text-white px-3 py-2 rounded-lg transition-colors border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/40">
            <BookOpen size={14} /> View Docs
          </button>
          
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-px active:scale-95">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Snippet</span>
          </button>
        </header>

        <div className="flex-1 p-6 lg:p-8">
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

      <AnimatePresence>
        {activeViewSnippet && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-purple-500/50 bg-[#110726]/95 shadow-2xl backdrop-blur-3xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-5 bg-[#1a0b2e]/60">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-200 uppercase tracking-wider">{activeViewSnippet.language}</span>
                  <h2 className="text-xl font-bold text-white">{activeViewSnippet.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDeleteSnippet(activeViewSnippet.id)} className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-red-500/30 hover:text-red-300 transition-colors" title="Delete Snippet"><Trash2 size={18} /></button>
                  <button onClick={() => { setEditSnippet(activeViewSnippet); setViewSnippet(null); }} className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-cyan-500/30 hover:text-cyan-300 transition-colors" title="Edit Snippet"><Edit2 size={18} /></button>
                  <button onClick={() => handleToggleStar(activeViewSnippet.id)} className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-amber-500/30 hover:text-amber-300 transition-colors" title="Star Snippet"><Star size={18} fill={activeViewSnippet.starred ? "#f59e0b" : "none"} color={activeViewSnippet.starred ? "#f59e0b" : "currentColor"} /></button>
                  <div className="w-px h-6 bg-white/20 mx-1"></div>
                  <button onClick={() => setViewSnippet(null)} className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"><X size={20} /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-6">
                <p className="text-sm text-white/90 leading-relaxed border-l-2 border-purple-500 pl-4">{activeViewSnippet.description}</p>
                
                <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-[#0a0314]/80 shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/60">
                    <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Source Array</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 uppercase"><Activity size={12}/> {activeViewSnippet.views} Views</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 uppercase"><Copy size={12}/> {activeViewSnippet.copies} Copies</span>
                      <div className="w-px h-3 bg-white/20"></div>
                      <button onClick={() => { navigator.clipboard.writeText(activeViewSnippet.code); }} className="text-[10px] font-bold flex items-center gap-1.5 text-purple-300 hover:text-purple-200"><Copy size={12}/> Copy Code</button>
                    </div>
                  </div>
                  <SyntaxHighlighter language={activeViewSnippet.language.toLowerCase()} style={vscDarkPlus} customStyle={{ margin: 0, padding: '20px', fontSize: '13px', fontFamily: 'var(--font-mono)', background: 'transparent' }}>
                    {activeViewSnippet.code}
                  </SyntaxHighlighter>
                </div>

                <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-5 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-5 w-5 text-cyan-400 ${viewSnippetAnalyzing ? 'animate-pulse' : ''}`} />
                      <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">Cognitive Diagnostics</h3>
                    </div>
                    {!activeViewSnippet.xray && (
                      <button onClick={runModalXRay} disabled={viewSnippetAnalyzing} className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-all hover:bg-cyan-500/30 disabled:opacity-50">
                        <BrainCircuit className={`h-3.5 w-3.5 ${viewSnippetAnalyzing ? 'animate-spin' : ''}`} />
                        {viewSnippetAnalyzing ? 'Scanning...' : 'Run Diagnostics'}
                      </button>
                    )}
                  </div>

                  {activeViewSnippet.xray ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <div className="flex-1 rounded-lg border border-cyan-500/30 bg-black/50 p-3 text-center shadow-inner">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Time Complexity</div>
                            <div className="mt-1 text-lg font-black text-cyan-300 font-mono">{activeViewSnippet.xray.timeComplexity}</div>
                          </div>
                          <div className="flex-1 rounded-lg border border-purple-500/30 bg-black/50 p-3 text-center shadow-inner">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Space Complexity</div>
                            <div className="mt-1 text-lg font-black text-purple-300 font-mono">{activeViewSnippet.xray.spaceComplexity}</div>
                          </div>
                        </div>
                        <div>
                           <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400">
                             <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Edge Cases
                           </div>
                           <ul className="space-y-1.5">
                             {activeViewSnippet.xray.vulnerabilities.map((item, idx) => (
                               <li key={idx} className="text-xs leading-relaxed text-red-100 pl-3 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-red-500">{item}</li>
                             ))}
                           </ul>
                        </div>
                      </div>
                      <div>
                         <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70">
                           <Eye className="h-3.5 w-3.5 text-white/70" /> Execution Flow
                         </div>
                         <ul className="space-y-1.5">
                           {activeViewSnippet.xray.explanation.map((item, idx) => (
                             <li key={idx} className="text-xs leading-relaxed text-white/90 pl-3 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-cyan-400">{item}</li>
                           ))}
                         </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-cyan-400/60 flex flex-col items-center gap-2">
                      <BrainCircuit size={32} className="opacity-30" />
                      <p>Neural pathways unmapped. Run diagnostics to generate X-Ray.</p>
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

      {/* 1-Month Free Pro Trial Intercept Modal */}
      <AnimatePresence>
        {showOfferPopup && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md overflow-hidden rounded-3xl border border-neon-cyan/40 bg-[#12121A]/95 shadow-[0_40px_100px_rgba(0,240,255,0.2)] backdrop-blur-3xl text-center p-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Welcome to Vantage AI</h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                As a new developer on the platform, you have unlocked a <strong className="text-neon-cyan">1-Month Free Trial</strong> of our Pro Plan. Access the Polyglot Morph Engine and Complexity X-Ray at zero cost.
              </p>
              <div className="space-y-3">
                <button onClick={handleClaimOffer} className="w-full rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 py-3.5 text-sm font-semibold text-white uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer">
                  Activate Free Pro Plan
                </button>
                <button onClick={() => { setShowOfferPopup(false); localStorage.removeItem('vault_pending_offer'); }} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/50 uppercase hover:bg-white/10 hover:text-white transition-colors">
                  Skip to Basic Tier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPricingPopup && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl overflow-hidden rounded-3xl border border-purple-500/50 bg-[#110726]/95 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
              <div className="border-b border-purple-500/30 px-8 py-6 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Initialize Configuration</h2>
                <p className="mt-2 text-sm text-white/70">Select an operational tier to initialize your neural engine components.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-purple-500/30">
                {[
                  { name: "Free Trial", price: "$0", desc: "For individual developers.", btn: "Start Free", highlight: false },
                  { name: "Pro Plan Monthly", price: "$9", desc: "For professionals needing AI.", btn: "Start Pro", highlight: true },
                  { name: "Yearly Max Plan", price: "$89", desc: "Best value for power users.", btn: "Start Yearly", highlight: true }
                ].map(tier => (
                  <div key={tier.name} className={`flex flex-col p-8 transition-colors hover:bg-white/[0.05] ${tier.highlight ? 'bg-purple-500/10' : ''}`}>
                    {tier.highlight && <span className="mb-3 w-max rounded-full bg-cyan-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/40">Most Popular</span>}
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <div className="mt-2 text-3xl font-black text-white">{tier.price}</div>
                    <p className="mt-2 text-sm text-white/60 mb-8">{tier.desc}</p>
                    <button onClick={() => handleSelectTier(tier.name as SubscriptionTier)} className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95 ${tier.highlight ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-black shadow-[0_4px_20px_rgba(124,58,237,0.6)]' : 'border border-purple-500/40 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'}`}>
                      {tier.btn}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-[350] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#110726] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative">
              {paymentSuccess ? (
                <div className="py-12 text-center space-y-4 animate-scale-in">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-300">
                    <ShieldCheck size={24}/>
                  </div>
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Payment Processing Successful</h3>
                  <p className="text-xs text-white/60">Securing configuration tier updates onto live workspace contexts...</p>
                </div>
              ) : (
                <form onSubmit={executePaymentPipeline} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Secure Encrypted Checkout</h3>
                      <p className="text-[11px] text-purple-200 font-mono mt-0.5">Target Plan: {checkoutPlan}</p>
                    </div>
                    <button type="button" onClick={() => setCheckoutPlan(null)} className="text-white/60 hover:text-white p-1 rounded bg-white/10"><X size={14}/></button>
                  </div>

                  {paymentError && <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 text-xs text-red-300">{paymentError}</div>}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4111 2222 3333 4444" className="w-full bg-black/50 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Expiration</label>
                      <input type="text" required value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">CVC Code</label>
                      <input type="password" required value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="•••" maxLength={4} className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 text-center font-mono" />
                    </div>
                  </div>

                  <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 text-[10px] text-white/60 leading-relaxed mt-2">
                    {"⚠️"} <span className="font-bold text-white/80">Strict Transaction Notice:</span> All digital allocation operations are final; no cancellation requests, rollbacks, or partial computational refunds are supported after core provisioning confirms execution.
                  </div>

                  <button type="submit" className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/40 hover:opacity-90 transition-all">
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