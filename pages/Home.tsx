import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import { createRequest } from '../services/storage';
import { useToast } from '../components/Toast';
import { useSettings } from '../components/SettingsContext';
import { User, Mail, Instagram, Send, Calendar, Clock, CheckCircle, Lock, Ticket, MapPin } from 'lucide-react';
import logo from "../components/logo.png";

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const settings = useSettings();
  
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
  
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const isLight = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
  };

  const lightTheme = isLight(settings.bgColor);
  
  const textPrimary = lightTheme ? 'text-black' : 'text-white';
  const textSecondary = lightTheme ? 'text-neutral-600' : 'text-neutral-400';
  const textMuted = lightTheme ? 'text-neutral-400' : 'text-gray-500';
  
  const inputBg = lightTheme ? 'bg-white/60 focus:bg-white' : 'bg-black/20 focus:bg-black/40';
  const inputBorder = lightTheme ? 'border-neutral-200' : 'border-white/10';
  const inputPlaceholder = lightTheme ? 'placeholder-neutral-400' : 'placeholder-white/20';

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Confetti */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-[float_4s_ease-in-out_infinite]" 
                     style={{ 
                         left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, 
                         animationDelay: `${Math.random() * 2}s`, backgroundColor: i % 2 === 0 ? settings.primaryColor : settings.accentColor, opacity: Math.random() 
                     }} 
                />
            ))}
        </div>

        <div className="max-w-sm w-full animate-in zoom-in duration-700 relative z-10">
            <GlassPanel intensity="high" className="rounded-3xl shadow-2xl">
                <div className="p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-[-60px] right-[-60px] w-40 h-40 rounded-full blur-[80px] opacity-40 transition-colors duration-500" style={{ backgroundColor: settings.primaryColor }} />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <img src={logo} alt="Logo" className="w-12 h-12 object-contain drop-shadow-md" style={{ filter: lightTheme ? 'invert(1)' : 'none' }} />
                        <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full backdrop-blur-md shadow-lg border"
                            style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor, borderColor: `${settings.accentColor}40` }}>
                            Ricevuta
                        </span>
                    </div>
                    
                    <div className="relative z-10 space-y-1">
                        <h2 className={`text-3xl font-black uppercase tracking-tighter leading-none ${textPrimary} drop-shadow-sm`}>{formData.firstName}</h2>
                        <h2 className={`text-3xl font-black uppercase tracking-tighter leading-none opacity-60 ${textPrimary}`}>{formData.lastName}</h2>
                    </div>
                    
                    <div className="mt-8 space-y-1 relative z-10">
                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1 ${textSecondary}`}>Evento</p>
                        <p className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{settings.eventName}</p>
                    </div>
                </div>

                <div className="relative h-8 flex items-center" style={{ backgroundColor: settings.bgColor }}>
                    <div className="w-4 h-8 absolute -left-2 rounded-r-full" style={{ backgroundColor: settings.bgColor }} /> 
                    <div className="w-full border-t-2 border-dashed mx-4 opacity-30" style={{ borderColor: lightTheme ? 'black' : 'white' }} />
                    <div className="w-4 h-8 absolute -right-2 rounded-l-full" style={{ backgroundColor: settings.bgColor }} />
                </div>

                <div className="p-6 text-center border-t relative transition-colors duration-500" style={{ borderColor: lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                    <p className={`text-xs mb-6 leading-relaxed font-medium relative z-10 ${textSecondary}`}>
                        La tua richiesta è stata registrata.<br/>Riceverai l'esito via email a breve.
                    </p>
                    <Button onClick={handleInstagramRedirect} className="w-full h-12 text-[10px] shadow-lg relative z-10">
                        <Instagram size={14} className="mr-2" /> SEGUI AGGIORNAMENTI
                    </Button>
                </div>
            </GlassPanel>
        </div>
      </div>
    );
  }

  return (
    // FIX SFONDO: Rimossa backgroundColor inline per lasciare visibile lo sfondo di App.tsx
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-12 relative bg-transparent">
      
      <div className="mb-8 text-center space-y-2 animate-in slide-in-from-top-10 duration-700">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b tracking-tighter uppercase drop-shadow-2xl"
            style={{ backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
          {settings.eventName}
        </h1>
        <p className="text-xs md:text-sm tracking-[0.4em] uppercase font-bold opacity-80" style={{ color: settings.accentColor }}>
            {settings.eventSubtitle}
        </p>
      </div>

      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-700 delay-150">
        
        <GlassPanel className="p-6 space-y-4" intensity="medium">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
             <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${lightTheme ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/10'}`} style={{ color: settings.primaryColor }}><Calendar size={18} /></div>
                <div>
                   <p className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${textPrimary}`}>Data</p>
                   <p className={`font-bold text-sm ${textPrimary}`}>{settings.eventDate}</p>
                </div>
             </div>
             <div className="flex items-center gap-3 text-right">
                <div>
                   <p className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${textPrimary}`}>Orario</p>
                   <p className={`font-bold text-sm ${textPrimary}`}>{settings.eventTime}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${lightTheme ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/10'}`} style={{ color: settings.primaryColor }}><Clock size={18} /></div>
             </div>
          </div>
          {settings.enableLocation === 'true' && (
              <div className="flex items-center gap-3 pt-2">
                  <div className={`p-2 rounded-lg ${lightTheme ? 'bg-black/5' : 'bg-white/5'}`} style={{ color: settings.accentColor }}><MapPin size={16} /></div>
                  <p className={`text-xs font-medium ${textSecondary}`}>{settings.eventLocation}</p>
              </div>
          )}
        </GlassPanel>

        <GlassPanel className="p-8 border-t-4" style={{ borderColor: settings.accentColor }} intensity="high">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-wide" style={{ color: settings.primaryColor }}>
            <Ticket size={20} /> Access Request
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold tracking-wider pl-1 ${textMuted}`}>Nome</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Mario" 
                    className={`w-full rounded-xl py-3.5 px-4 font-medium transition-all focus:outline-none focus:border-opacity-50 border ${inputBg} ${inputBorder} ${textPrimary} ${inputPlaceholder}`}
                    style={{ borderColor: focusedField === 'firstName' ? settings.accentColor : undefined }}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold tracking-wider pl-1 ${textMuted}`}>Cognome</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Rossi" 
                    className={`w-full rounded-xl py-3.5 px-4 font-medium transition-all focus:outline-none focus:border-opacity-50 border ${inputBg} ${inputBorder} ${textPrimary} ${inputPlaceholder}`}
                    style={{ borderColor: focusedField === 'lastName' ? settings.accentColor : undefined }}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold tracking-wider pl-1 ${textMuted}`}>Instagram</label>
              <div className="relative group">
                <Instagram 
                    className="absolute left-4 top-3.5 w-5 h-5 transition-colors duration-300"
                    style={{ color: focusedField === 'instagram' ? settings.primaryColor : settings.secondaryColor }}
                />
                <input required name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" 
                    className={`w-full rounded-xl py-3.5 pl-12 pr-4 font-medium transition-all focus:outline-none focus:border-opacity-50 border ${inputBg} ${inputBorder} ${textPrimary} ${inputPlaceholder}`}
                    style={{ borderColor: focusedField === 'instagram' ? settings.accentColor : undefined }}
                    onFocus={() => setFocusedField('instagram')}
                    onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold tracking-wider pl-1 ${textMuted}`}>Email</label>
              <div className="relative group">
                <Mail 
                    className="absolute left-4 top-3.5 w-5 h-5 transition-colors duration-300"
                    style={{ color: focusedField === 'email' ? settings.primaryColor : settings.secondaryColor }}
                />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nome@email.com" 
                    className={`w-full rounded-xl py-3.5 pl-12 pr-4 font-medium transition-all focus:outline-none focus:border-opacity-50 border ${inputBg} ${inputBorder} ${textPrimary} ${inputPlaceholder}`}
                    style={{ borderColor: focusedField === 'email' ? settings.accentColor : undefined }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {settings.enablePromoterCode === 'true' && (
                <div className="pt-4 mt-6 border-t" style={{ borderColor: lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                    <div className="space-y-2">
                        <label className={`text-[10px] uppercase font-bold tracking-wider pl-1 flex justify-between items-center ${textMuted}`}>
                            <span>Codice Invito</span>
                            {isCodeLocked && (
                                <span className="text-[9px] px-2 py-0.5 rounded border flex items-center gap-1 font-bold animate-pulse"
                                    style={{ backgroundColor: `${settings.accentColor}20`, borderColor: `${settings.accentColor}40`, color: settings.accentColor }}>
                                    <CheckCircle size={10} /> APPLICATO
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                name="promoterCode"
                                value={formData.promoterCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, promoterCode: e.target.value.toUpperCase() }))}
                                readOnly={isCodeLocked} 
                                placeholder="CODICE PR (OPZIONALE)"
                                className={`w-full border rounded-xl py-3.5 px-4 text-center tracking-[0.2em] font-mono font-bold transition-all uppercase backdrop-blur-sm focus:outline-none ${textPrimary} ${inputPlaceholder} ${
                                    isCodeLocked ? 'cursor-not-allowed opacity-80' : `${inputBg} ${inputBorder}`
                                }`}
                                style={isCodeLocked 
                                    ? { backgroundColor: `${settings.accentColor}10`, borderColor: `${settings.accentColor}30`, color: settings.accentColor } 
                                    : { borderColor: focusedField === 'promoterCode' ? settings.accentColor : undefined }
                                }
                                onFocus={() => !isCodeLocked && setFocusedField('promoterCode')}
                                onBlur={() => setFocusedField(null)}
                            />
                            {isCodeLocked && <Lock className="absolute right-4 top-3.5 w-4 h-4 opacity-50" style={{ color: settings.accentColor }} />}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4">
              {/* FIX BOTTONE: Rimosso style backgroundColor per abilitare logica Glass interna */}
              <Button type="submit" isLoading={loading} className="w-full h-14 text-sm font-black tracking-widest shadow-xl">
                INVIA RICHIESTA <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>

      <footer className={`mt-12 text-[10px] text-center pb-8 uppercase tracking-widest font-medium opacity-60 ${textPrimary}`}>
        &copy; 2025 {settings.eventName}. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;