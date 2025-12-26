import React, { useState, useEffect } from 'react';
import GlassPanel from '../components/GlassPanel';
import StepProgress from '../components/StepProgress';
import { Promoter, LevelConfig } from '../types';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import { TrendingUp, Copy, LogOut, User, Hash, Share2, Award, Zap } from 'lucide-react';

const PromoterDashboard: React.FC = () => {
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('russoloco_pr_data');
    if (saved) setPromoter(JSON.parse(saved));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/promoter/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (typeof data.rewards_config === 'string') {
          try { data.rewards_config = JSON.parse(data.rewards_config); } catch (e) { data.rewards_config = []; }
      }
      
      setPromoter(data);
      sessionStorage.setItem('russoloco_pr_data', JSON.stringify(data));
    } catch (err) { alert("Credenziali non valide"); } 
    finally { setLoading(false); }
  };

  const handleLogout = () => { sessionStorage.removeItem('russoloco_pr_data'); setPromoter(null); }
  
  const copyCode = () => { if (promoter) { navigator.clipboard.writeText(promoter.code); alert("Codice Copiato!"); } }
  
  const shareLink = () => {
      if (!promoter) return;
      const url = `${window.location.origin}/#/register?ref=${promoter.code}`;
      const text = `Registrati in lista ${promoter.code} per il RUSSOLOCO! 🚀`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
  };

  if (!promoter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <GlassPanel className="max-w-sm w-full p-10 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]" intensity="high">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">PR ACCESS</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Portale Staff</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <input placeholder="CODICE STAFF" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-center uppercase tracking-[0.2em] font-bold focus:border-red-500/50 outline-none transition-all placeholder-gray-700" />
                <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-center tracking-widest focus:border-red-500/50 outline-none transition-all placeholder-gray-700" />
                <Button isLoading={loading} className="w-full h-14 text-sm font-black tracking-widest shadow-lg shadow-red-900/20">LOGIN</Button>
            </form>
        </GlassPanel>
      </div>
    );
  }

  const levels = (promoter.rewards_config as unknown as LevelConfig[]) || [];
  const sortedLevels = [...levels].sort((a,b) => a.threshold - b.threshold);
  const nextLevel = sortedLevels.find(l => l.threshold > promoter.invites_count);
  const toNext = nextLevel ? nextLevel.threshold - promoter.invites_count : 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 pb-32 flex flex-col items-center relative font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        
        <div className="max-w-3xl w-full space-y-6 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center px-2 py-2">
                <h1 className="text-sm font-black tracking-widest text-white/40 uppercase flex items-center gap-2"><Zap size={14} className="text-red-500" /> PR Dashboard</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-950/20 px-4 py-2 rounded-full border border-red-900/50 hover:bg-red-900/40 transition-colors uppercase tracking-wider"><LogOut size={12} /> Esci</button>
            </div>

            {/* Main ID Card */}
            <GlassPanel className="p-0 relative overflow-hidden group flex flex-col md:flex-row border-white/10 shadow-2xl" intensity="high">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-black to-black z-0 pointer-events-none" />
                
                <div className="p-8 flex-1 flex flex-col justify-center gap-8 relative z-10">
                     <div>
                         <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 border-b border-red-500/20 pb-2 w-fit"><User size={12} /> Authorized Promoter</p>
                         <div className="space-y-0">
                            <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase">{promoter.firstName}</h2>
                            <h2 className="text-5xl font-light text-gray-500 tracking-tighter leading-[0.9] uppercase">{promoter.lastName}</h2>
                         </div>
                     </div>
                     
                     <div className="flex gap-3">
                        <div onClick={copyCode} className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 rounded-xl p-3 flex-1 transition-all group/code">
                            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Hash size={10} /> Il tuo Codice</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-mono font-bold text-white tracking-widest">{promoter.code}</span>
                                <Copy size={16} className="text-gray-600 group-hover/code:text-white transition-colors" />
                            </div>
                        </div>
                        <button onClick={shareLink} className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-5 flex items-center justify-center transition-all shadow-lg shadow-green-900/30">
                            <Share2 size={24} />
                        </button>
                     </div>
                </div>

                <div className="bg-white/5 border-t md:border-t-0 md:border-l border-white/5 p-8 flex items-center justify-center flex-col gap-4 backdrop-blur-sm z-10 relative">
                    <div className="bg-white p-3 rounded-xl shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                        <QRCode value={promoter.id} size={140} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`}/>
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] text-center font-bold">Pass Personale</p>
                </div>
            </GlassPanel>

            {/* Performance Section */}
            <div className="grid grid-cols-1 gap-6">
                <GlassPanel className="p-6 relative overflow-hidden" intensity="medium">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white"><TrendingUp className="text-red-500" size={20} /> Performance</h3>
                        <div className="text-right">
                            <span className="text-4xl font-black text-white">{promoter.invites_count}</span>
                            <span className="text-[10px] text-gray-500 ml-2 uppercase font-bold tracking-wider">Invitati</span>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-2 border border-white/5">
                        <StepProgress currentInvites={promoter.invites_count} levels={sortedLevels} />
                    </div>
                    
                    {toNext > 0 ? (
                        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            <div className="p-2 bg-red-500 rounded-full text-white animate-pulse"><Award size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-300">Prossimo obiettivo vicino!</p>
                                <p className="text-sm text-white font-bold">Mancano solo <span className="text-red-400">{toNext} persone</span> per {nextLevel?.reward}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 text-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-400 font-bold text-sm uppercase tracking-widest">🏆 Livello Massimo Raggiunto!</p>
                        </div>
                    )}
                </GlassPanel>
            </div>
        </div>
    </div>
  );
};

export default PromoterDashboard;