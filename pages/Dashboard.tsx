import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuests, approveRequest, rejectRequest, resetData, getPromoters, createPromoter } from '../services/storage';
import { Guest, RequestStatus, Promoter, LevelConfig } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import StepProgress from '../components/StepProgress';
import { 
  Check, X, Search, RefreshCw, Trash2, 
  Users, UserCheck, Clock, Activity, Plus, Crown, LogOut, QrCode, XCircle,
  LayoutGrid, Grid3X3, StretchHorizontal, Filter, ChevronRight, Settings
} from 'lucide-react';

// --- SOTTO-COMPONENTI ---

const StatCard = ({ icon: Icon, label, value, color, bgGradient }: any) => (
  <GlassPanel className="relative overflow-hidden group p-5 transition-all duration-300 hover:-translate-y-1" intensity="medium">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 bg-[length:200%_200%] animate-flow`} />
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
         <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color} shadow-lg shadow-black/20 backdrop-blur-md`}>
            <Icon size={22} strokeWidth={2.5} />
         </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-md">{value}</p>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      </div>
    </div>
  </GlassPanel>
);

const GuestCard = ({ guest, onApprove, onReject }: { guest: Guest, onApprove: any, onReject: any }) => {
  const isApproved = guest.status === RequestStatus.APPROVED;
  const isPending = guest.status === RequestStatus.PENDING;
  const isUsed = guest.isUsed;
  
  return (
    <GlassPanel className={`group relative flex flex-col h-full transition-all duration-300 ${isUsed ? 'opacity-60 grayscale' : 'hover:border-white/20'}`} intensity="low">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isApproved ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-red-500'} opacity-80`} />
      <div className="p-4 pl-5 flex flex-col h-full gap-3">
        <div className="flex justify-between items-start">
           <div className="overflow-hidden pr-2">
             <h3 className="font-bold text-lg text-white truncate leading-tight mb-0.5">{guest.firstName} {guest.lastName}</h3>
             <a 
                href={`https://instagram.com/${guest.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-red-400 hover:text-red-300 transition-colors truncate block"
             >
               @{guest.instagram.replace('@', '')}
             </a>
           </div>
           <div className={`
              shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-inner
              ${isApproved ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                isPending ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 
                'bg-red-500/10 border-red-500/30 text-red-500'}
           `}>
              {isApproved ? <UserCheck size={14} strokeWidth={2.5} /> : isPending ? <Clock size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
           </div>
        </div>
        <div className="space-y-1.5">
           <p className="text-[10px] text-gray-500 font-mono truncate bg-black/20 p-1.5 rounded border border-white/5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> {guest.email}
           </p>
           {guest.invitedBy && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 bg-amber-900/10 px-2 py-1 rounded border border-amber-500/20 w-fit">
                  <Crown size={10} fill="currentColor" /> PR: {guest.invitedBy}
              </div>
           )}
        </div>
        <div className="mt-auto pt-3 border-t border-white/5">
            {isApproved ? (
              <div className="flex items-center justify-between gap-3">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Status Ingresso</span>
                    {isUsed ? (
                        <span className="text-[10px] font-bold text-black bg-green-500 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.4)] w-fit">ENTRATO</span>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10 w-fit">IN ATTESA</span>
                    )}
                 </div>
                 <div className="bg-white p-1 rounded hover:scale-150 transition-transform origin-bottom-right shadow-lg cursor-pointer">
                    <QRCode value={guest.qrCode || ''} size={32} />
                 </div>
              </div>
            ) : isPending && (
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onReject(guest.id)} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all text-xs font-bold group/btn">
                      <X size={14} className="group-hover/btn:scale-110 transition-transform" /> RIFIUTA
                  </button>
                  <button onClick={() => onApprove(guest.id)} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 border border-green-500/30 transition-all text-xs font-bold group/btn">
                      <Check size={14} className="group-hover/btn:scale-110 transition-transform" /> APPROVA
                  </button>
              </div>
            )}
            {!isApproved && !isPending && (
                <div className="text-center py-1">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Richiesta Rifiutata</span>
                </div>
            )}
        </div>
      </div>
    </GlassPanel>
  );
};

// --- DASHBOARD ---
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'GUESTS' | 'PROMOTERS'>('GUESTS');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridModel, setGridModel] = useState<1 | 2 | 3>(2);

  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [viewQrPromoter, setViewQrPromoter] = useState<Promoter | null>(null);
  const [newPR, setNewPR] = useState({ firstName: '', lastName: '', code: '', password: '' });
  const [numLevels, setNumLevels] = useState(3);
  const [levelsConfig, setLevelsConfig] = useState<LevelConfig[]>([
      { level: 1, threshold: 0, reward: 'Start' },
      { level: 2, threshold: 10, reward: 'Reward 2' },
      { level: 3, threshold: 25, reward: 'Reward 3' },
      { level: 4, threshold: 50, reward: 'Reward 4' },
      { level: 5, threshold: 100, reward: 'Reward 5' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'GUESTS') {
            const data = await getGuests();
            setGuests(data);
        } else {
            const data = await getPromoters();
            const parsed = data.map(p => ({
                ...p,
                rewards_config: typeof p.rewards_config === 'string' ? JSON.parse(p.rewards_config) : p.rewards_config
            }));
            setPromoters(parsed);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [refreshKey, activeTab]);

  const handleCreatePromoter = async (e: React.FormEvent) => {
      e.preventDefault();
      const finalLevels = levelsConfig.slice(0, numLevels);
      try {
          await createPromoter({ ...newPR, rewardsConfig: finalLevels });
          setShowPromoterModal(false);
          setNewPR({ firstName: '', lastName: '', code: '', password: '' });
          handleRefresh();
          alert("Promoter Creato con successo!");
      } catch (e: any) { alert("Errore: " + e.message); }
  }

  const updateLevel = (index: number, field: 'threshold' | 'reward', value: string | number) => {
      const newLevels = [...levelsConfig];
      if (field === 'threshold') newLevels[index].threshold = Number(value);
      else newLevels[index].reward = String(value);
      setLevelsConfig(newLevels);
  };

  const handleRefresh = () => setRefreshKey(p => p + 1);
  const handleLogout = () => { if(window.confirm("Sei sicuro di voler uscire?")) { sessionStorage.removeItem('russoloco_admin_auth'); window.location.reload(); } };
  const handleApprove = async (id: string) => { if (!window.confirm("Confermi l'approvazione?")) return; try { await approveRequest(id); handleRefresh(); } catch (e) { handleRefresh(); } };
  const handleReject = async (id: string) => { if(!window.confirm("Rifiutare questa richiesta?")) return; await rejectRequest(id); handleRefresh(); };
  const handleReset = async () => { if(window.confirm('ATTENZIONE: Questo cancellerà TUTTI gli ospiti. Continuare?')) { await resetData(); handleRefresh(); } }
  
  const filteredGuests = guests.filter(g => {
    const s = searchTerm.toLowerCase();
    const matchesFilter = filter === 'ALL' ? true : g.status === filter;
    const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
    const matchesSearch = 
        fullName.includes(s) || 
        g.email.toLowerCase().includes(s) || 
        g.instagram.toLowerCase().includes(s) || 
        (g.invitedBy && g.invitedBy.toLowerCase().includes(s));
    return matchesFilter && matchesSearch;
  });

  const getGridClass = () => {
      if (gridModel === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5";
      if (gridModel === 2) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4";
      return "grid-cols-1 md:grid-cols-2"; 
  };

  const filterOptions = [
    { id: 'ALL', label: 'Tutti' },
    { id: RequestStatus.PENDING, label: 'Attesa' },
    { id: RequestStatus.APPROVED, label: 'Approvati' },
    { id: RequestStatus.REJECTED, label: 'Rifiutati' }
  ];
  const activeFilterIndex = filterOptions.findIndex(f => f.id === filter);

  return (
    <div className="min-h-screen w-full bg-transparent text-white selection:bg-red-500 selection:text-white flex flex-col">
      
      {/* Top Navbar Sticky */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tighter">
                    RUSSO<span className="text-red-600">LOCO</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-bold tracking-widest uppercase">Dashboard</span>
                </h1>
                
                {/* Mobile Logout */}
                <div className="md:hidden flex gap-2">
                     <button onClick={handleRefresh} className="p-2 rounded-full bg-white/5 text-white"><RefreshCw size={16} /></button>
                     <button onClick={handleLogout} className="p-2 rounded-full bg-red-900/20 text-red-500"><LogOut size={16} /></button>
                </div>
            </div>

            {/* Desktop Toolbar */}
            <div className="hidden md:flex items-center gap-3">
                 
                 {/* Sliding Menu Principale (Guest List / PR Team) */}
                 <div className="relative bg-white/5 p-1 rounded-xl border border-white/5 flex w-64 h-10">
                     {/* GLIDER */}
                     <div 
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-transform duration-500 ease-glider z-0 border border-white/5 backdrop-blur-sm"
                        style={{ transform: `translateX(${activeTab === 'GUESTS' ? '0%' : '100%'})`, left: activeTab === 'GUESTS' ? '4px' : '0' }}
                     />
                     
                     <button 
                        onClick={() => setActiveTab('GUESTS')}
                        className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${activeTab === 'GUESTS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                        GUEST LIST
                     </button>
                     <button 
                        onClick={() => setActiveTab('PROMOTERS')}
                        className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${activeTab === 'PROMOTERS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                        PR TEAM
                     </button>
                 </div>
                 
                 <div className="h-6 w-px bg-white/10 mx-2" />

                 <Button onClick={handleRefresh} variant="secondary" className="!p-2.5 rounded-xl"><RefreshCw size={16} /></Button>
                 
                 {/* Bottone Cestino sempre presente, ma nascosto se non in GUESTS */}
                 <Button 
                    onClick={handleReset} 
                    variant="secondary" 
                    disabled={activeTab !== 'GUESTS'}
                    className={`!p-2.5 rounded-xl hover:bg-red-900/20 hover:text-red-500 hover:border-red-500/30 transition-all duration-300 ${activeTab === 'GUESTS' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                 >
                    <Trash2 size={16} />
                 </Button>

                 <Button onClick={() => navigate('/admin/settings')} variant="secondary" className="!p-2.5 rounded-xl hover:text-white"><Settings size={16} /></Button>

                 <Button onClick={handleLogout} variant="secondary" className="!p-2.5 rounded-xl hover:text-red-400"><LogOut size={16} /></Button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex mb-6 bg-white/5 p-1 rounded-xl border border-white/5 relative">
             <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/10 transition-transform duration-500 ease-glider z-0"
                style={{ transform: `translateX(${activeTab === 'GUESTS' ? '0%' : '100%'})`, left: activeTab === 'GUESTS' ? '4px' : '0' }}
             />
             <button onClick={() => setActiveTab('GUESTS')} className={`flex-1 py-2 relative z-10 rounded-lg text-xs font-bold transition-colors ${activeTab === 'GUESTS' ? 'text-white' : 'text-gray-500'}`}>GUESTS</button>
             <button onClick={() => setActiveTab('PROMOTERS')} className={`flex-1 py-2 relative z-10 rounded-lg text-xs font-bold transition-colors ${activeTab === 'PROMOTERS' ? 'text-white' : 'text-gray-500'}`}>PROMOTERS</button>
        </div>

        {activeTab === 'GUESTS' ? (
            <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users} label="Totale Richieste" value={guests.length} color="text-blue-400" bgGradient="from-blue-500 to-cyan-500" />
                    <StatCard icon={Clock} label="In Attesa" value={guests.filter(g => g.status==='PENDING').length} color="text-yellow-400" bgGradient="from-yellow-500 to-orange-500" />
                    <StatCard icon={UserCheck} label="Approvati" value={guests.filter(g => g.status==='APPROVED').length} color="text-green-400" bgGradient="from-green-500 to-emerald-500" />
                    <StatCard icon={Activity} label="Ingressi Effettivi" value={guests.filter(g => g.isUsed).length} color="text-red-500" bgGradient="from-red-500 to-pink-500" />
                </div>

                {/* Filter Toolbar Stickiness */}
                <div className="sticky top-20 z-30 mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        
                        {/* SEARCH BAR */}
                        <div className="flex-1 relative group z-10">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/30 via-purple-500/30 to-blue-500/30 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 bg-[length:200%_auto] animate-flow -z-10" />
                            <div className="bg-neutral-950/90 backdrop-blur-xl border border-white/10 p-1 pl-4 rounded-2xl flex gap-3 items-center transition-all group-focus-within:border-white/30 group-focus-within:bg-black group-hover:border-white/20 h-full">
                                <Search className="text-gray-500 group-focus-within:text-red-400 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Cerca ospite, email o instagram..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 outline-none py-3 text-sm font-medium" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                             {/* FILTRI CON GLIDER */}
                             <div className="relative flex bg-neutral-900/80 backdrop-blur-md p-1 rounded-2xl border border-white/5 items-center">
                                 <div className="px-3 text-gray-500 z-10"><Filter size={14} /></div>
                                 <div className="h-4 w-px bg-white/10 mr-1 z-10" />
                                 <div className="relative grid grid-cols-4 gap-0 w-auto bg-black/20 rounded-xl p-1">
                                     <div 
                                        className="absolute top-1 bottom-1 w-[calc(25%-2px)] bg-gradient-to-r from-white via-gray-200 to-gray-400 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-transform duration-500 ease-glider z-0"
                                        style={{ transform: `translateX(${activeFilterIndex * 100}%)`, left: '1px' }}
                                     />
                                     {filterOptions.map((f) => (
                                         <button 
                                            key={f.id} 
                                            onClick={() => setFilter(f.id as any)} 
                                            className={`relative z-10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors duration-300 whitespace-nowrap min-w-[80px] ${filter === f.id ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                                         >
                                            {f.label}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                            
                             {/* View Toggle */}
                             <div className="flex bg-neutral-900/80 backdrop-blur-md p-1 rounded-2xl border border-white/5 items-center shrink-0">
                                <button onClick={() => setGridModel(1)} className={`p-2 rounded-xl transition-all ${gridModel === 1 ? 'bg-white/20 text-white' : 'text-gray-500'}`}><StretchHorizontal size={16} /></button>
                                <button onClick={() => setGridModel(2)} className={`p-2 rounded-xl transition-all ${gridModel === 2 ? 'bg-white/20 text-white' : 'text-gray-500'}`}><LayoutGrid size={16} /></button>
                                <button onClick={() => setGridModel(3)} className={`p-2 rounded-xl transition-all ${gridModel === 3 ? 'bg-white/20 text-white' : 'text-gray-500'}`}><Grid3X3 size={16} /></button>
                             </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                   <div className="text-center py-20 animate-pulse">
                       <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                       <p className="text-gray-500 text-sm font-mono uppercase">Caricamento ospiti...</p>
                   </div>
                ) : filteredGuests.length === 0 ? (
                   <div className="text-center py-32 opacity-50">
                       <Search size={48} className="mx-auto mb-4 text-gray-600" />
                       <p className="text-gray-400 font-bold">Nessun risultato trovato</p>
                       <p className="text-gray-600 text-sm">Prova a cambiare i filtri di ricerca</p>
                   </div>
                ) : (
                    <div className={`grid ${getGridClass()} gap-4 pb-20`}>
                        {filteredGuests.map(g => (
                            <GuestCard key={g.id} guest={g} onApprove={handleApprove} onReject={handleReject} />
                        ))}
                    </div>
                )}
            </>
        ) : (
            // --- PROMOTER TAB ---
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-red-900/20 to-transparent p-6 rounded-3xl border border-red-500/10">
                    <div>
                        <h2 className="text-2xl font-black text-white italic">SQUADRA PR</h2>
                        <p className="text-gray-400 text-sm mt-1">Gestisci le performance e i livelli di ricompensa.</p>
                    </div>
                    {/* BOTTOME NUOVO PR CON STILE GLASS */}
                    <Button onClick={() => setShowPromoterModal(true)} variant="glass"><Plus size={18} /> NUOVO PR</Button>
                </div>

                {loading ? <div className="text-center py-20 text-gray-500">Caricamento...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promoters.map((pr) => (
                            <GlassPanel key={pr.id} className="p-0 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px] group hover:border-red-500/30 transition-colors" intensity="medium">
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/50">
                                                {pr.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white leading-none">{pr.firstName} {pr.lastName}</h3>
                                                <span className="text-red-400 font-mono text-xs font-bold tracking-wider mt-1 block opacity-80 group-hover:opacity-100 transition-opacity">{pr.code}</span>
                                            </div>
                                        </div>
                                        <div className="text-right bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                            <p className="text-2xl font-black text-white leading-none">{pr.invites_count}</p>
                                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Invitati</p>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar Container */}
                                    <div className="mb-2 bg-black/20 rounded-xl p-2 border border-white/5">
                                        <StepProgress currentInvites={pr.invites_count} levels={(pr.rewards_config as any) || []} />
                                    </div>
                                </div>

                                <div className="mt-auto px-6 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Attivo
                                    </span>
                                    <button onClick={() => setViewQrPromoter(pr)} className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-all group/btn">
                                        <QrCode size={14} /> MOSTRA QR <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                                    </button>
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- MODALS --- */}
      
      {/* View QR Modal */}
      {viewQrPromoter && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setViewQrPromoter(null)}>
              <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setViewQrPromoter(null)} className="absolute top-4 right-4 text-black/30 hover:text-black transition-colors"><XCircle size={28} /></button>
                  <h3 className="text-2xl font-black text-black uppercase mb-1">{viewQrPromoter.firstName}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-8 tracking-widest">CODE: {viewQrPromoter.code}</p>
                  
                  <div className="p-4 border-4 border-black rounded-2xl inline-block mb-4 relative group">
                      <div className="absolute inset-0 border-[3px] border-dashed border-gray-300 rounded-xl m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <QRCode value={viewQrPromoter.id} size={200} />
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Scansiona all'ingresso</p>
              </div>
          </div>
      )}

      {/* Create PR Modal */}
      {showPromoterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
              <GlassPanel className="max-w-md w-full p-8 my-10 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]" intensity="high">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Crown size={20} className="text-red-500" /> Nuovo Promoter</h3>
                      <button onClick={() => setShowPromoterModal(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleCreatePromoter} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Nome</label><input required value={newPR.firstName} onChange={e => setNewPR(p => ({...p, firstName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none transition-colors" /></div>
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Cognome</label><input required value={newPR.lastName} onChange={e => setNewPR(p => ({...p, lastName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none transition-colors" /></div>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-400 uppercase font-boldMl-1 mb-1 block">Codice Univoco</label>
                          <div className="relative">
                            <input required value={newPR.code} onChange={e => setNewPR(p => ({...p, code: e.target.value.toUpperCase().replace(/\s/g, '')}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white font-mono tracking-widest focus:border-red-500/50 outline-none uppercase" placeholder="MARIO25" />
                            <div className="absolute left-3 top-3.5 text-gray-500 font-bold text-xs">#</div>
                          </div>
                      </div>
                      <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Password Accesso</label><input required type="password" value={newPR.password} onChange={e => setNewPR(p => ({...p, password: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" placeholder="******" /></div>

                      <div className="py-2"><hr className="border-white/10" /></div>

                      <div>
                          <div className="flex justify-between items-center mb-3">
                               <label className="text-[10px] text-gray-400 uppercase font-bold">Configurazione Livelli</label>
                               <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                                   <span className="text-xs text-white font-bold">{numLevels}</span>
                                   <input type="range" min="1" max="5" value={numLevels} onChange={e => setNumLevels(Number(e.target.value))} className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                               </div>
                          </div>

                          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                              {Array.from({ length: numLevels }).map((_, i) => (
                                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                                      <div className="w-8 h-8 rounded-lg bg-red-900/20 text-red-500 font-bold flex items-center justify-center text-xs border border-red-500/20 shadow-sm">{i + 1}</div>
                                      <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2">
                                              <span className="text-[9px] text-gray-500 uppercase font-bold w-12 text-right">Target</span>
                                              <input type="number" value={levelsConfig[i].threshold} onChange={e => updateLevel(i, 'threshold', e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-red-500/40 outline-none" />
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <span className="text-[9px] text-gray-500 uppercase font-bold w-12 text-right">Premio</span>
                                              <input type="text" value={levelsConfig[i].reward} onChange={e => updateLevel(i, 'reward', e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-red-500/40 outline-none" placeholder="Es. Drink Omaggio" />
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <Button type="submit" className="w-full mt-2 h-12 shadow-red-900/20">SALVA PROMOTER</Button>
                  </form>
              </GlassPanel>
          </div>
      )}
    </div>
  );
};

export default Dashboard;