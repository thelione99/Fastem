import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import { createRequest } from '../services/storage';
import { useToast } from '../components/Toast';
import { useSettings } from '../components/SettingsContext';
import { User, Mail, Instagram, Send, Calendar, Clock, Info, CheckCircle, Lock } from 'lucide-react';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const settings = useSettings(); // Hook impostazioni
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    instagram: '',
    email: '',
    promoterCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCodeLocked, setIsCodeLocked] = useState(false);

  useEffect(() => {
      const refCode = searchParams.get('ref');
      if (refCode) {
          setFormData(prev => ({ ...prev, promoterCode: refCode.toUpperCase() }));
          setIsCodeLocked(true);
      }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRequest(formData);
      setSubmitted(true);
      addToast('Richiesta inviata con successo!', 'success');
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Errore durante l\'invio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramRedirect = () => {
    window.open(settings.instagramUrl || 'https://www.instagram.com/', '_blank');
  };

  // Stile condiviso per le icone (usa accentColor)
  const iconStyle = { color: settings.accentColor };
  // Stile per il focus degli input
  const inputStyle = { borderColor: 'rgba(255,255,255,0.1)' };

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full p-8 text-center space-y-6" borderRed>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-white/10" style={{ backgroundColor: `${settings.accentColor}20`, borderColor: `${settings.accentColor}40` }}>
            <CheckMark color={settings.accentColor} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider">RICHIESTA INVIATA</h2>
          <p className="text-gray-300 leading-relaxed">
            La tua richiesta è in fase di valutazione.
            <br />
            Segui la pagina ufficiale per aggiornamenti.
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={handleInstagramRedirect} className="w-full">
              VAI ALLA PAGINA INSTAGRAM <Instagram className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-12 relative">
      
      {/* HEADER DINAMICO */}
      <div className="mb-8 text-center space-y-2">
        <h1 
            className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b tracking-tighter uppercase"
            style={{ backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` }}
        >
          {settings.eventName}
        </h1>
        <p className="text-sm tracking-[0.3em] uppercase opacity-80" style={{ color: settings.accentColor }}>{settings.eventSubtitle}</p>
      </div>

      <div className="max-w-md w-full space-y-6">
        
        {/* INFO CARD */}
        <GlassPanel className="p-6 space-y-4" intensity="medium">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}><Calendar size={20} /></div>
                <div>
                   <p className="text-xs text-gray-400 uppercase">Data</p>
                   <p className="font-semibold text-white">{settings.eventDate}</p>
                </div>
             </div>
             <div className="flex items-center gap-3 text-right">
                <div>
                   <p className="text-xs text-gray-400 uppercase">Orario</p>
                   <p className="font-semibold text-white">{settings.eventTime}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}><Clock size={20} /></div>
             </div>
          </div>
          <div className="pt-2 text-center md:text-left">
            <div className="flex items-start gap-3">
               <div className="p-2 bg-white/5 rounded-lg text-gray-300 hidden md:block"><Info size={18} /></div>
               <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Descrizione Evento</p>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {settings.eventDescription}
                  </p>
               </div>
            </div>
          </div>
        </GlassPanel>

        {/* FORM */}
        <GlassPanel className="p-8" intensity="high">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Richiedi Partecipazione
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: settings.accentColor }}></span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Nome</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 w-4 h-4 transition-colors group-focus-within:text-white" style={{ color: settings.secondaryColor }} />
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Mario" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-opacity-50 transition-all"
                    style={{ '--tw-ring-color': settings.accentColor } as any}
                    onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Cognome</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Rossi" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none transition-all"
                    onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Instagram</label>
              <div className="relative group">
                <Instagram className="absolute left-3 top-3.5 w-4 h-4 transition-colors group-focus-within:text-white" style={{ color: settings.secondaryColor }} />
                <input required name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none transition-all"
                    onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 transition-colors group-focus-within:text-white" style={{ color: settings.secondaryColor }} />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nome@email.com" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none transition-all"
                    onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {settings.enablePromoterCode === 'true' && (
                <div className="pt-2 border-t border-white/5 mt-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider pl-1 flex justify-between items-center">
                            <span>Codice PR / Invito</span>
                            {isCodeLocked ? (
                                <span className="text-[10px] flex items-center gap-1 font-bold animate-pulse" style={{ color: settings.primaryColor }}>
                                    <CheckCircle size={10} /> LINK ATTIVO
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-600 lowercase">(opzionale)</span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                name="promoterCode"
                                value={formData.promoterCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, promoterCode: e.target.value.toUpperCase() }))}
                                readOnly={isCodeLocked} 
                                placeholder="Es. MARIO25"
                                className={`w-full border rounded-xl py-3 px-4 text-white text-center tracking-widest placeholder-gray-700 focus:outline-none transition-all ${
                                    isCodeLocked 
                                    ? 'bg-white/10 border-white/20 cursor-not-allowed font-bold' 
                                    : 'bg-white/5 border-white/10'
                                }`}
                                style={{ borderColor: isCodeLocked ? settings.accentColor : undefined }}
                                onFocus={(e) => !isCodeLocked && (e.target.style.borderColor = settings.accentColor)}
                                onBlur={(e) => !isCodeLocked && (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                            />
                            {isCodeLocked && (
                                <Lock className="absolute right-3 top-3.5 w-4 h-4 opacity-50" style={{ color: settings.accentColor }} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="w-full h-12">
                RICHIEDI ACCESSO <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>

      <footer className="mt-8 text-gray-600 text-xs text-center pb-20 uppercase tracking-widest">
        &copy; 2025 {settings.eventName}. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

const CheckMark = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Home;