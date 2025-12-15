import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getGuests, approveRequest, rejectRequest, resetData, 
  getPromoters, createPromoter, deleteGuest, manualCheckIn, updateGuest, resendQREmail 
} from '../services/storage';
import { Guest, RequestStatus, Promoter, LevelConfig } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import StepProgress from '../components/StepProgress';
import { useToast } from '../components/Toast';
import { GuestCardSkeleton } from '../components/Skeleton';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { 
  Check, X, Search, RefreshCw, Trash2, 
  Users, UserCheck, Clock, Activity, Plus, Crown, LogOut, QrCode, XCircle,
  LayoutGrid, Grid3X3, StretchHorizontal, Filter, ChevronRight, ChevronLeft, 
  Settings, Download, LogIn, Edit2, Link as LinkIcon, Save, Mail, RotateCcw
} from 'lucide-react';

// --- HOOKS ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- SOTTO-COMPONENTI ---

const StatCard = React.memo(({ icon: Icon, label, value, color, bgGradient }: any) => (
  <GlassPanel className="relative overflow-hidden group p-5 transition-all duration-300 hover:-translate-y-1 select-none" intensity="medium">
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
));

const GuestCard = React.memo(({ guest, onApprove, onReject, onDelete, onManualCheckIn, onEdit, onResendEmail }: any) => {
  const isApproved = guest.status === RequestStatus.APPROVED;
  const isPending = guest.status === RequestStatus.PENDING;
  const isUsed = guest.isUsed;
  
  return (
    <GlassPanel className={`group relative flex flex-col h-full transition-all duration-300 ${isUsed ? 'opacity-60 grayscale' : 'hover:border-white/20'}`} intensity="low">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isApproved ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-red-500'} opacity-80`} />
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg">
          {isApproved && (
              <button onClick={() => onResendEmail(guest.id)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-colors" title="Reinvia Email QR"><Mail size={14} /></button>
          )}
          <button onClick={() => onEdit(guest)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Modifica"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(guest.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Elimina"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 pl-5 flex flex-col h-full gap-3">
        {/* Info Ospite */}
        <div className="flex justify-between items-start">
           <div className="overflow-hidden pr-2">
             <h3 className="font-bold text-lg text-white truncate leading-tight mb-0.5">{guest.firstName} {guest.lastName}</h3>
             <a href={`https://instagram.com/${guest.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:text-red-300 transition-colors truncate block">@{guest.instagram.replace('@', '')}</a>
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

        {/* Footer Actions - RIPRISTINATO STILE ORIGINALE (Padding instead of Height) */}
        <div className="mt-auto pt-3 border-t border-white/5">
            {isApproved ? (
              <div className="flex items-center justify-between gap-3">
                 <div className="flex flex-col gap-2">
                    {isUsed ? (
                        <span className="px-3 py-1 rounded bg-green-500 text-black text-[10px] font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] w-fit">ENTRATO</span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded bg-white/10 border border-white/10 text-gray-300 text-[10px] font-bold w-fit">IN ATTESA</span>
                            <button onClick={() => onManualCheckIn(guest.id)} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1.5 group/check">
                                <LogIn size={10} className="group-hover/check:translate-x-0.5 transition-transform" /> CHECK-IN
                            </button>
                        </div>
                    )}
                 </div>
                 <div className="bg-white p-1 rounded hover:scale-150 transition-transform origin-bottom-right shadow-lg cursor-pointer">
                    <QRCode value={guest.qrCode || ''} size={32} />
                 </div>
              </div>
            ) : isPending ? (
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onReject(guest.id)} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all text-xs font-bold group/btn"><X size={14} className="group-hover/btn:scale-110 transition-transform" /> RIFIUTA</button>
                  <button onClick={() => onApprove(guest.id)} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 border border-green-500/30 transition-all text-xs font-bold group/btn"><Check size={14} className="group-hover/btn:scale-110 transition-transform" /> APPROVA</button>
              </div>
            ) : (
                <div className="flex justify-between items-center py-1">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-2">RIFIUTATO</span>
                    <button onClick={() => onApprove(guest.id)} className="text-[10px] font-bold flex items-center gap-1.5 text-gray-500 hover:text-green-500 hover:bg-white/5 px-2 py-1 rounded transition-colors">
                        <RotateCcw size={10} /> RIPRISTINA
                    </button>
                </div>
            )}
        </div>
      </div>
    </GlassPanel>
  );
});

// --- DASHBOARD PRINCIPALE ---

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'GUESTS' | 'PROMOTERS'>('GUESTS');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridModel, setGridModel] = useState<1 | 2 | 3>(2);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, used: 0 });

  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [viewQrPromoter, setViewQrPromoter] = useState<Promoter | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  
  const [newPR, setNewPR] = useState({ firstName: '', lastName: '', code: '', password: '' });
  const [numLevels, setNumLevels] = useState(5);
  const [levelsConfig, setLevelsConfig] = useState<LevelConfig[]>([
      { level: 1, threshold: 5, reward: 'Free Drink' }, { level: 2, threshold: 15, reward: 'Pass Backstage' }, { level: 3, threshold: 30, reward: 'Tavolo VIP' },
      { level: 4, threshold: 50, reward: 'Bottiglia' }, { level: 5, threshold: 100, reward: 'Royal Pass' }
  ]);

  const fetchGuests = useCallback(async () => {
      if (activeTab !== 'GUESTS') return;
      setLoading(true);
      try {
          const res = await getGuests(pagination.page, pagination.limit, debouncedSearch, filter);
          if (res && res.data) {
              setGuests(res.data);
              setPagination(prev => ({ ...prev, ...res.pagination }));
              if ((res as any).stats) setStats((res as any).stats);
          }
      } catch (e) { 
          console.error(e); 
          addToast("Errore caricamento dati", "error"); 
      } finally { 
          setLoading(false); 
      }
  }, [pagination.page, debouncedSearch, filter, refreshKey, activeTab]);

  useEffect(() => {
      if (activeTab === 'PROMOTERS') {
          setLoading(true);
          getPromoters().then(data => {
              const parsed = data.map(p => ({
                  ...p,
                  rewards_config: typeof p.rewards_config === 'string' ? JSON.parse(p.rewards_config) : p.rewards_config
              }));
              setPromoters(parsed);
              setLoading(false);
          }).catch(() => {
              addToast("Errore caricamento promoter", "error");
              setLoading(false);
          });
      } else {
          fetchGuests();
      }
  }, [activeTab, refreshKey, fetchGuests]);

  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [debouncedSearch, filter]);

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
      try { 
          await action(); 
          setRefreshKey(p => p + 1); 
          addToast(successMsg, "success"); 
      } catch (e: any) { 
          addToast(e.message || "Si è verificato un errore", "error"); 
      }
  };

  const handleCreatePromoter = async (e: React.FormEvent) => {
      e.preventDefault();
      const finalLevels = levelsConfig.slice(0, numLevels);
      await handleAction(async () => {
          await createPromoter({ ...newPR, rewardsConfig: finalLevels });
          setShowPromoterModal(false);
          setNewPR({ firstName: '', lastName: '', code: '', password: '' });
      }, "Promoter creato con successo");
  }

  const handleUpdateGuest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingGuest) return;
      await handleAction(async () => {
          await updateGuest({ 
              id: editingGuest.id, 
              firstName: editingGuest.firstName, 
              lastName: editingGuest.lastName, 
              email: editingGuest.email, 
              instagram: editingGuest.instagram 
          });
          setEditingGuest(null);
      }, "Dati ospite aggiornati");
  };

  const downloadCSV = () => {
      const headers = ["ID", "Nome", "Cognome", "Email", "Instagram", "Stato", "PR Code", "Entrato", "Data"];
      const rows = guests.map(g => [ g.id, g.firstName, g.lastName, g.email, g.instagram, g.status, g.invitedBy || '', g.isUsed ? 'SI' : 'NO', new Date(g.createdAt).toLocaleString() ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `guest_list_page_${pagination.page}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Download CSV avviato (Pagina Corrente)", "success");
  };

  const copyPromoterLink = (code: string) => { 
      navigator.clipboard.writeText(`${window.location.origin}/#/register?ref=${code}`); 
      addToast("Link invito copiato!", "success"); 
  };

  const handleLogout = () => {
      if(window.confirm("Sei sicuro di voler uscire?")) {
          sessionStorage.removeItem('russoloco_admin_auth');
          window.location.reload();
      }
  };

  const getGridClass = () => { 
      if (gridModel === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"; 
      if (gridModel === 2) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4"; 
      return "grid-cols-1 md:grid-cols-2"; 
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white selection:bg-red-500 selection:text-white flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tighter">
                    RUSSO<span className="text-red-600">LOCO</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-bold tracking-widest uppercase">Admin</span>
                </h1>
                <div className="md:hidden flex gap-2">
                    <Button onClick={() => setRefreshKey(p => p + 1)} variant="secondary" className="!p-2"><RefreshCw size={16} /></Button>
                    <Button onClick={handleLogout} variant="secondary" className="!p-2 text-red-500"><LogOut size={16} /></Button>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
                 <div className="relative bg-white/5 p-1 rounded-xl border border-white/5 flex w-64 h-10">
                     <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-transform duration-500 ease-glider z-0 border border-white/5 backdrop-blur-sm" style={{ transform: `translateX(${activeTab === 'GUESTS' ? '0%' : '100%'})`, left: activeTab === 'GUESTS' ? '4px' : '0' }} />
                     <button onClick={() => setActiveTab('GUESTS')} className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${activeTab === 'GUESTS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>GUESTS</button>
                     <button onClick={() => setActiveTab('PROMOTERS')} className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${activeTab === 'PROMOTERS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>TEAM PR</button>
                 </div>
                 <div className="h-6 w-px bg-white/10 mx-2" />
                 <Button onClick={() => setRefreshKey(p => p + 1)} variant="secondary" className="!p-2.5 rounded-xl"><RefreshCw size={16} /></Button>
                 {activeTab === 'GUESTS' && (<Button onClick={downloadCSV} variant="secondary" className="!p-2.5 rounded-xl text-green-400 hover:text-green-300 border-green-500/20 hover:bg-green-500/10"><Download size={16} /></Button>)}
                 <Button onClick={() => { if(window.confirm('Reset database?')) handleAction(resetData, "Database resettato") }} variant="secondary" disabled={activeTab !== 'GUESTS'} className={`!p-2.5 rounded-xl hover:bg-red-900/20 hover:text-red-500 hover:border-red-500/30 transition-all duration-300 ${activeTab === 'GUESTS' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}><Trash2 size={16} /></Button>
                 <Button onClick={() => navigate('/admin/settings')} variant="secondary" className="!p-2.5 rounded-xl hover:text-white"><Settings size={16} /></Button>
                 <Button onClick={handleLogout} variant="secondary" className="!p-2.5 rounded-xl hover:text-red-400"><LogOut size={16} /></Button>
            </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile Tabs */}
        <div className="md:hidden flex mb-6 bg-white/5 p-1 rounded-xl border border-white/5 relative">
             <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/10 transition-transform duration-500 ease-glider z-0" style={{ transform: `translateX(${activeTab === 'GUESTS' ? '0%' : '100%'})`, left: activeTab === 'GUESTS' ? '4px' : '0' }} />
             <button onClick={() => setActiveTab('GUESTS')} className={`flex-1 py-2 relative z-10 rounded-lg text-xs font-bold transition-colors ${activeTab === 'GUESTS' ? 'text-white' : 'text-gray-500'}`}>GUESTS</button>
             <button onClick={() => setActiveTab('PROMOTERS')} className={`flex-1 py-2 relative z-10 rounded-lg text-xs font-bold transition-colors ${activeTab === 'PROMOTERS' ? 'text-white' : 'text-gray-500'}`}>PR TEAM</button>
        </div>

        {activeTab === 'GUESTS' ? (
            <>
                {/* STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users} label="Totale (DB)" value={stats.total} color="text-blue-400" bgGradient="from-blue-500 to-cyan-500" />
                    <StatCard icon={Clock} label="In Attesa" value={stats.pending} color="text-yellow-400" bgGradient="from-yellow-500 to-orange-500" />
                    <StatCard icon={UserCheck} label="Approvati" value={stats.approved} color="text-green-400" bgGradient="from-green-500 to-emerald-500" />
                    <StatCard icon={Activity} label="Ingressi" value={stats.used} color="text-red-500" bgGradient="from-red-500 to-pink-500" />
                </div>
                
                <div className="mb-8 hidden md:block"><AnalyticsChart guests={guests} /></div>

                {/* FILTERS & SEARCH */}
                <div className="sticky top-20 z-30 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group z-10">
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-1 pl-4 rounded-xl flex items-center h-full shadow-2xl min-h-[48px]">
                            <Search className="text-gray-500 group-focus-within:text-red-400 transition-colors" size={18} />
                            <input type="text" placeholder="Cerca nome, email, instagram o PR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 outline-none py-3 px-3 text-sm font-medium" />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {/* ZONA FILTRI RIPRISTINATA ORIGINALE */}
                        <div className="relative flex bg-neutral-900/90 backdrop-blur-xl p-1 rounded-xl border border-white/10 items-center">
                             {(() => {
                                 const options = [
                                     { id: 'ALL', l: 'Tutti' }, 
                                     { id: RequestStatus.PENDING, l: 'Attesa' }, 
                                     { id: RequestStatus.APPROVED, l: 'Approvati' }, 
                                     { id: RequestStatus.REJECTED, l: 'Rifiutati' }
                                 ];
                                 const activeIndex = options.findIndex(o => o.id === filter);
                                 
                                 return (
                                     <div className="relative grid grid-cols-4 gap-0 w-auto">
                                         {/* Glider Sfondo */}
                                         <div 
                                            className="absolute top-1 bottom-1 w-full rounded-lg bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-transform duration-500 ease-out z-0" 
                                            style={{ 
                                                width: 'calc(25% - 4px)', 
                                                left: '2px',
                                                transform: `translateX(${activeIndex * 100}%)` 
                                            }} 
                                         />
                                         
                                         {/* Bottoni (Padding Based) */}
                                         {options.map((f) => (
                                             <button 
                                                key={f.id} 
                                                onClick={() => setFilter(f.id as any)} 
                                                className={`
                                                    relative z-10 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors duration-300 whitespace-nowrap min-w-[80px]
                                                    ${filter === f.id ? 'text-black' : 'text-gray-400 hover:text-white'}
                                                `}
                                             >
                                                {f.l}
                                             </button>
                                         ))}
                                     </div>
                                 );
                             })()}
                        </div>

                        <div className="hidden md:flex gap-1 bg-neutral-900/90 backdrop-blur-xl p-1 rounded-xl border border-white/10 items-center">
                            {[1, 2, 3].map(m => (
                                <button key={m} onClick={() => setGridModel(m as any)} className={`p-3 rounded-lg transition-colors ${gridModel === m ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                {loading ? (
                   <div className={`grid ${getGridClass()} gap-4 pb-20`}>{Array.from({length: 12}).map((_, i) => <GuestCardSkeleton key={i} />)}</div>
                ) : guests.length === 0 ? (
                   <div className="text-center py-32 opacity-50 flex flex-col items-center">
                       <Search size={48} className="mb-4 text-gray-600" />
                       <p className="text-gray-400 font-bold text-lg">Nessun risultato trovato</p>
                       <p className="text-gray-600 text-sm">Prova a cambiare i filtri o la ricerca</p>
                   </div>
                ) : (
                    <>
                        <div className={`grid ${getGridClass()} gap-4 pb-8`}>
                            {guests.map(g => (
                                <GuestCard 
                                    key={g.id} 
                                    guest={g} 
                                    onApprove={() => handleAction(async () => { await approveRequest(g.id); }, "Ospite approvato")} 
                                    onReject={() => handleAction(async () => { await rejectRequest(g.id); }, "Richiesta rifiutata")} 
                                    onDelete={() => { if(confirm("Eliminare definitivamente?")) handleAction(async () => { await deleteGuest(g.id); }, "Eliminato") }}
                                    onManualCheckIn={() => { if(confirm("Confermi ingresso manuale?")) handleAction(async () => { await manualCheckIn(g.id); }, "Check-in effettuato") }}
                                    onEdit={setEditingGuest}
                                    onResendEmail={() => { if(confirm("Reinviare email?")) handleAction(async () => { await resendQREmail(g.id); }, "Email inviata") }}
                                />
                            ))}
                        </div>
                        
                        {/* PAGINATORE */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 pb-20 pt-6 border-t border-white/5">
                                <button 
                                    disabled={pagination.page === 1} 
                                    onClick={() => setPagination(p => ({...p, page: p.page - 1}))} 
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors shadow-lg"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center">
                                    <span className="text-sm font-mono text-gray-400 block">PAGINA</span>
                                    <span className="text-xl font-black text-white">{pagination.page} <span className="text-gray-600 text-base font-normal">/ {pagination.totalPages}</span></span>
                                </div>
                                <button 
                                    disabled={pagination.page >= pagination.totalPages} 
                                    onClick={() => setPagination(p => ({...p, page: p.page + 1}))} 
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors shadow-lg"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </>
        ) : (
            // PROMOTER VIEW
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-r from-red-900/20 to-transparent p-6 rounded-3xl border border-red-500/10">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter">SQUADRA <span className="text-red-500">PR</span></h2>
                        <p className="text-gray-400 text-sm mt-1">Gestisci performance, codici e ricompense.</p>
                    </div>
                    <Button onClick={() => setShowPromoterModal(true)} variant="glass" className="shadow-lg hover:shadow-red-500/20 transition-all"><Plus size={18} /> NUOVO PROMOTER</Button>
                </div>

                {loading ? <div className="text-center py-20 text-gray-500">Caricamento...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promoters.map((pr) => (
                            <GlassPanel key={pr.id} className="p-0 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px] group hover:border-red-500/30 transition-colors" intensity="medium">
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-900/50">{pr.firstName.charAt(0)}</div>
                                            <div>
                                                <h3 className="font-bold text-xl text-white leading-none">{pr.firstName} {pr.lastName}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-red-400 font-mono text-xs font-bold tracking-wider">{pr.code}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                    <span className="text-gray-500 text-[10px] uppercase">Livello {pr.current_level || 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                            <p className="text-3xl font-black text-white leading-none">{pr.invites_count}</p>
                                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Invitati</p>
                                        </div>
                                    </div>
                                    <div className="mb-2 bg-black/20 rounded-xl p-3 border border-white/5">
                                        <StepProgress currentInvites={pr.invites_count} levels={(pr.rewards_config as any) || []} />
                                    </div>
                                </div>
                                <div className="mt-auto px-6 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                                    <button onClick={() => copyPromoterLink(pr.code)} className="flex items-center gap-2 text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 text-gray-300 hover:text-white transition-colors"><LinkIcon size={12} /> Copia Link</button>
                                    <button onClick={() => setViewQrPromoter(pr)} className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-all group/btn"><QrCode size={14} /> QR CODE <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" /></button>
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>

      {/* MODALS */}
      {editingGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setEditingGuest(null)}>
              <GlassPanel className="max-w-md w-full p-8 border-white/20 shadow-2xl" intensity="high" onClick={(e: any) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit2 size={20} className="text-blue-400" /> Modifica Ospite</h3>
                      <button onClick={() => setEditingGuest(null)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleUpdateGuest} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Nome</label><input required value={editingGuest.firstName} onChange={e => setEditingGuest({...editingGuest, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none" /></div>
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Cognome</label><input required value={editingGuest.lastName} onChange={e => setEditingGuest({...editingGuest, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none" /></div>
                      </div>
                      <div><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Email</label><input required type="email" value={editingGuest.email} onChange={e => setEditingGuest({...editingGuest, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none" /></div>
                      <div><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Instagram</label><div className="relative"><span className="absolute left-3 top-3.5 text-gray-500">@</span><input required value={editingGuest.instagram.replace('@','')} onChange={e => setEditingGuest({...editingGuest, instagram: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-8 text-white focus:border-blue-500/50 outline-none" /></div></div>
                      <div className="flex gap-3 pt-4">
                          <Button type="button" variant="secondary" onClick={() => setEditingGuest(null)} className="flex-1">ANNULLA</Button>
                          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 border-blue-400/30 text-white"><Save size={16} /> SALVA</Button>
                      </div>
                  </form>
              </GlassPanel>
          </div>
      )}

      {showPromoterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
              <GlassPanel className="max-w-md w-full p-8 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]" intensity="high">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Crown size={20} className="text-red-500" /> Nuovo Promoter</h3>
                      <button onClick={() => setShowPromoterModal(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleCreatePromoter} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Nome</label><input required value={newPR.firstName} onChange={e => setNewPR(p => ({...p, firstName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" /></div>
                          <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Cognome</label><input required value={newPR.lastName} onChange={e => setNewPR(p => ({...p, lastName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" /></div>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Codice Univoco</label>
                          <div className="relative">
                            <input required value={newPR.code} onChange={e => setNewPR(p => ({...p, code: e.target.value.toUpperCase().replace(/\s/g, '')}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white font-mono tracking-widest focus:border-red-500/50 outline-none uppercase" placeholder="MARIO25" />
                            <div className="absolute left-3 top-3.5 text-gray-500 font-bold text-xs">#</div>
                          </div>
                      </div>
                      <div><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 mb-1 block">Password Accesso</label><input required type="password" value={newPR.password} onChange={e => setNewPR(p => ({...p, password: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" /></div>
                      
                      <div className="pt-2 border-t border-white/10 mt-4">
                          <label className="text-xs font-bold text-gray-400 mb-2 block">Livelli Ricompensa (Max 5)</label>
                          {levelsConfig.slice(0, numLevels).map((lvl, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                  <input type="number" placeholder="Inviti" value={lvl.threshold} onChange={(e) => {
                                      const newL = [...levelsConfig]; newL[idx].threshold = parseInt(e.target.value); setLevelsConfig(newL);
                                  }} className="w-20 bg-black/30 border border-white/10 rounded-lg p-2 text-white text-center text-xs" />
                                  <input placeholder="Premio" value={lvl.reward} onChange={(e) => {
                                      const newL = [...levelsConfig]; newL[idx].reward = e.target.value; setLevelsConfig(newL);
                                  }} className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-white text-xs" />
                              </div>
                          ))}
                      </div>

                      <Button type="submit" className="w-full mt-2 h-12 shadow-red-900/20">SALVA PROMOTER</Button>
                  </form>
              </GlassPanel>
          </div>
      )}

      {viewQrPromoter && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setViewQrPromoter(null)}>
              <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setViewQrPromoter(null)} className="absolute top-4 right-4 text-black/30 hover:text-black transition-colors"><XCircle size={28} /></button>
                  <h3 className="text-2xl font-black text-black uppercase mb-1">{viewQrPromoter.firstName}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-8 tracking-widest">CODE: {viewQrPromoter.code}</p>
                  <div className="p-4 border-4 border-black rounded-2xl inline-block mb-4 relative group"><div className="absolute inset-0 border-[3px] border-dashed border-gray-300 rounded-xl m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" /><QRCode value={viewQrPromoter.id} size={200} /></div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Scansiona all'ingresso</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;