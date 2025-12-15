import React, { useState, useEffect } from 'react';
import GlassPanel from '../components/GlassPanel';
import StepProgress from '../components/StepProgress';
import { Promoter, LevelConfig } from '../types';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import { TrendingUp, Copy, LogOut, User, Hash } from 'lucide-react';

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
  const copyCode = () => { if (promoter) { navigator.clipboard.writeText(promoter.code); alert("Copiato!"); } }

  if (!promoter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
        <GlassPanel className="max-w-sm w-full p-8" intensity="high" borderRed>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">PR ACCESS</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input placeholder="Codice Univoco" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-center uppercase tracking-widest" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-center" />
                <Button isLoading={loading} className="w-full">ENTRA</Button>
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
    <div className="min-h-screen bg-transparent text-white p-4 md:p-6 pb-32 flex flex-col items-center">
        <div className="max-w-3xl w-full space-y-8">
            <div className="flex justify-between items-center px-2">
                <h1 className="text-xl font-bold tracking-tight text-white/50">DASHBOARD PR</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-900/10 px-4 py-2 rounded-full border border-red-900/50"><LogOut size={14} /> Esci</button>
            </div>

            <GlassPanel className="p-0 relative overflow-hidden group flex flex-col md:flex-row" borderRed intensity="high">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/80 to-black/90 z-0 pointer-events-none" />
                
                <div className="p-8 flex-1 flex flex-col justify-center gap-6 relative z-10">
                     <div>
                         <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><User size={12} /> Promoter Pass</p>
                         <div className="space-y-0">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">{promoter.firstName}</h2>
                            <h2 className="text-4xl md:text-5xl font-light text-gray-400 tracking-tight leading-none">{promoter.lastName}</h2>
                         </div>
                     </div>
                     <div onClick={copyCode} className="cursor-pointer group/code w-fit">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Hash size={10} /> Codice Univoco</p>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-mono text-white tracking-widest border-b border-red-500/50 pb-1 group-hover/code:text-red-400 transition-colors">{promoter.code}</span>
                            <Copy size={16} className="text-gray-600 group-hover/code:text-white transition-colors" />
                        </div>
                     </div>
                </div>

                <div className="bg-neutral-900/50 border-t md:border-t-0 md:border-l border-white/5 p-8 flex items-center justify-center flex-col gap-4 backdrop-blur-sm z-10">
                    <div className="bg-white p-3 rounded-xl shadow-2xl">
                        <QRCode value={promoter.id} size={140} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`}/>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">SCAN ME</p>
                </div>
            </GlassPanel>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white"><TrendingUp className="text-red-500" size={20} /> Performance</h3>
                    <div className="text-right"><span className="text-3xl font-bold text-white">{promoter.invites_count}</span><span className="text-xs text-gray-500 ml-2 uppercase">Invitati totali</span></div>
                </div>

                <GlassPanel className="px-2 py-2 overflow-visible" intensity="medium">
                    <StepProgress currentInvites={promoter.invites_count} levels={sortedLevels} />
                    {toNext > 0 && (<div className="text-center mt-8 mb-4"><p className="text-xs text-gray-400">Ti mancano solo <span className="text-white font-bold">{toNext} invitati</span> per la prossima ricompensa.</p></div>)}
                </GlassPanel>
            </div>
        </div>
    </div>
  );
};

export default PromoterDashboard;