import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '../services/storage';
import { AppSettings, DesignStyle, BackgroundType } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Save, ArrowLeft, Calendar, Palette, Type, 
  MapPin, Instagram, Lock, RotateCcw, LayoutTemplate, 
  Eye, Download, Upload, Smartphone, Zap, Check, Layers, 
  Grid, CircleDot, Waves
} from 'lucide-react';
import logo from "../components/logo.png";

// --- CONFIGURAZIONE DEFAULT ---
const defaultSettings: AppSettings = {
  eventName: 'RUSSOLOCO',
  eventSubtitle: 'Private Access Only',
  eventDate: '25 Dic 2025',
  eventTime: '01:00 - 06:00',
  eventLocation: 'Secret Location',
  enableLocation: 'true',
  eventDescription: 'Il rosso ci avvolge, il ritmo ci guida.',
  instagramUrl: 'https://www.instagram.com/',
  enablePromoterCode: 'true',
  
  // Design Defaults
  designStyle: 'glass',
  bgType: 'dots',
  bgColor: '#000000',
  bgDotColor: '#262626',
  bgDotActiveColor: '#ef4444',
  primaryColor: '#ffffff',
  secondaryColor: '#9ca3af',
  accentColor: '#ef4444',
  buttonColor: '#ef4444',
  
  // Limits
  maxGuests: '500',
  maxPromoters: '20'
};

// --- PRESET TEMI ---
const THEMES = [
  { 
    id: 'original', name: 'Russo Original', 
    style: 'glass' as DesignStyle, bg: 'dots' as BackgroundType,
    colors: { bgColor: '#000000', bgDotColor: '#262626', bgDotActiveColor: '#ef4444', primaryColor: '#ffffff', secondaryColor: '#9ca3af', accentColor: '#ef4444', buttonColor: '#ef4444' } 
  },
  { 
    id: 'cyber', name: 'Cyber Brutal', 
    style: 'brutal' as DesignStyle, bg: 'grid' as BackgroundType,
    colors: { bgColor: '#09090b', bgDotColor: '#27272a', bgDotActiveColor: '#22c55e', primaryColor: '#22c55e', secondaryColor: '#166534', accentColor: '#22c55e', buttonColor: '#16a34a' } 
  },
  { 
    id: 'soft', name: 'Soft Peach', 
    style: 'soft' as DesignStyle, bg: 'liquid' as BackgroundType,
    colors: { bgColor: '#1c1917', bgDotColor: '#44403c', bgDotActiveColor: '#fb923c', primaryColor: '#fdba74', secondaryColor: '#fed7aa', accentColor: '#fb923c', buttonColor: '#f97316' } 
  },
  { 
    id: 'minimal', name: 'Minimal Mono', 
    style: 'minimal' as DesignStyle, bg: 'dots' as BackgroundType,
    colors: { bgColor: '#ffffff', bgDotColor: '#e5e5e5', bgDotActiveColor: '#000000', primaryColor: '#000000', secondaryColor: '#525252', accentColor: '#000000', buttonColor: '#171717' } 
  }
];

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'design' | 'limits'>('info');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    getSettings().then(data => { if(data) setSettings(prev => ({ ...prev, ...data })); }).catch(() => addToast("Errore caricamento impostazioni", "error"));
  }, [addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const toggle = (key: keyof AppSettings) => {
    setSettings(s => ({ ...s, [key]: s[key] === 'true' ? 'false' : 'true' }));
  };

  const setDesignStyle = (style: DesignStyle) => setSettings(s => ({ ...s, designStyle: style }));
  const setBgType = (type: BackgroundType) => setSettings(s => ({ ...s, bgType: type }));

  const applyTheme = (theme: typeof THEMES[0]) => {
    setSettings(prev => ({ 
        ...prev, 
        ...theme.colors,
        designStyle: theme.style,
        bgType: theme.bg
    }));
    addToast(`Tema ${theme.name} applicato!`, "success");
  };

  const exportConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(settings));
    addToast("Configurazione copiata!", "success");
  };

  const importConfig = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      if (json.eventName) {
        setSettings(prev => ({ ...prev, ...json }));
        addToast("Configurazione importata!", "success");
      }
    } catch {
      addToast("Errore importazione", "error");
    }
  };

  const handleReset = () => {
    if(window.confirm("Ripristinare i valori originali?")) {
      setSettings(defaultSettings);
      addToast("Ripristinato", "info");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(settings);
      addToast('Configurazione salvata!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      addToast('Errore durante il salvataggio', 'error');
      setLoading(false);
    } 
  };

  const NavButton = ({ id, icon: Icon, label }: any) => (
    <button 
      type="button"
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
        activeSection === id 
        ? 'bg-white text-black border-white shadow-lg scale-105' 
        : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  const ColorInput = ({ label, name, value }: any) => (
    <div className="space-y-1.5 group">
        <div className="flex justify-between items-center">
            <label className="text-[9px] text-gray-400 uppercase font-bold tracking-wider group-hover:text-white transition-colors">{label}</label>
            <span className="text-[9px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors">{value}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 pr-3 hover:border-white/30 transition-all focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20">
            <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-lg shadow-inner ring-1 ring-white/10">
                <input 
                    type="color" 
                    name={name} 
                    value={value} 
                    onChange={handleChange} 
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 border-0 cursor-pointer" 
                />
            </div>
            <input 
                type="text" 
                name={name} 
                value={value} 
                onChange={handleChange} 
                className="w-full bg-transparent border-none text-white text-xs font-mono focus:ring-0 outline-none uppercase" 
            />
        </div>
    </div>
  );

  const StyleCard = ({ id, label, current, onClick, icon: Icon }: any) => (
      <button 
        type="button"
        onClick={onClick}
        className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
            current === id 
            ? 'bg-white text-black border-white shadow-lg scale-105' 
            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
        }`}
      >
          {Icon ? <Icon size={20} /> : (
              <div className={`w-8 h-8 border border-current ${
                  id === 'glass' ? 'rounded-lg' : 
                  id === 'soft' ? 'rounded-full' : 
                  id === 'brutal' ? 'rounded-none border-2' : 
                  'rounded-sm'
              }`} />
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </button>
  );

  const LivePreviewContent = useMemo(() => {
    const radius = settings.designStyle === 'glass' ? '16px' : settings.designStyle === 'soft' ? '24px' : settings.designStyle === 'brutal' ? '0px' : '4px';
    const border = settings.designStyle === 'brutal' ? '2px solid white' : '1px solid rgba(255,255,255,0.1)';
    const shadow = settings.designStyle === 'brutal' ? '4px 4px 0px white' : '0 10px 30px -10px rgba(0,0,0,0.5)';

    return (
        <div 
        className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-6 select-none transition-colors duration-500"
        style={{ backgroundColor: settings.bgColor }}
        >
        
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            {settings.bgType === 'grid' && (
                <div className="w-full h-full" style={{ 
                    backgroundImage: `linear-gradient(${settings.bgDotColor} 1px, transparent 1px), linear-gradient(90deg, ${settings.bgDotColor} 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }} />
            )}
            {settings.bgType === 'dots' && (
                <div className="w-full h-full" style={{ 
                    backgroundImage: `radial-gradient(${settings.bgDotColor} 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }} />
            )}
            {settings.bgType === 'liquid' && (
                <>
                    <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-50" style={{ backgroundColor: settings.primaryColor }} />
                    <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-2xl opacity-50" style={{ backgroundColor: settings.accentColor }} />
                </>
            )}
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center text-center space-y-6 scale-90 md:scale-100 origin-center animate-in fade-in zoom-in duration-700">
            <div className="relative group">
                <div className="absolute inset-0 blur-[50px] opacity-40 rounded-full transition-colors duration-500" style={{ backgroundColor: settings.primaryColor }} />
                <img src={logo} alt="Logo" className="w-24 h-24 object-contain relative z-10 rounded-xl drop-shadow-2xl" style={{ borderRadius: radius }} />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b uppercase tracking-tighter leading-none"
                    style={{ backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
                    {settings.eventName || 'EVENT NAME'}
                </h1>
                <p className="text-xs font-medium italic tracking-wide uppercase opacity-80" style={{ color: settings.secondaryColor }}>
                    "{settings.eventSubtitle || 'Private Access Only'}"
                </p>
            </div>

            <div className="text-[10px] font-mono tracking-[0.2em] py-2 px-4 border bg-white/5 backdrop-blur-sm text-gray-400"
                 style={{ borderRadius: radius, border }}>
                {settings.eventDate} • {settings.eventTime}
            </div>

            <div className="w-full max-w-[200px] h-12 flex items-center justify-center text-xs font-black tracking-[0.2em] text-white uppercase transition-all"
                style={{ 
                    background: settings.buttonColor, 
                    borderRadius: radius,
                    border: settings.designStyle === 'brutal' ? '2px solid white' : 'none',
                    boxShadow: shadow
                }}>
                ENTRA ORA
            </div>

            {settings.enableLocation === 'true' && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest mt-4 opacity-60" style={{ color: settings.secondaryColor }}>
                    <MapPin size={10} style={{ color: settings.accentColor }} />
                    {settings.eventLocation}
                </div>
            )}
        </div>
        
        {/* OS Bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
        </div>
    );
  }, [settings]);

  return (
    <div className="min-h-screen w-full bg-transparent text-white flex flex-col">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/admin')} variant="secondary" className="!p-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></Button>
          <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white leading-none">Configurazione</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pannello Admin</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <div className="hidden md:flex gap-2 mr-2 border-r border-white/10 pr-4">
                <Button onClick={importConfig} variant="ghost" className="text-[10px] !px-3" title="Importa JSON"><Upload size={14} className="mr-2"/> Importa</Button>
                <Button onClick={exportConfig} variant="ghost" className="text-[10px] !px-3" title="Copia JSON"><Download size={14} className="mr-2"/> Esporta</Button>
            </div>
            <Button onClick={handleReset} variant="secondary" className="text-xs !px-3 bg-red-950/20 text-red-400 border-red-500/20 hover:bg-red-950/40">
                <RotateCcw size={14} className="md:mr-2" /> <span className="hidden md:inline">RESET</span>
            </Button>
            <Button onClick={handleSave} isLoading={loading} className="text-xs font-bold px-4 md:px-6 shadow-lg shadow-red-900/20">
                <Save size={16} className="md:mr-2" /> <span className="hidden md:inline">SALVA</span>
            </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-7 space-y-6 pb-24 lg:pb-0">
            
            {/* TABS */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sticky top-20 z-30 py-2 -mx-4 px-4 md:mx-0 md:px-0 bg-gradient-to-b from-black via-black/90 to-transparent lg:static lg:bg-none">
                <NavButton id="info" icon={LayoutTemplate} label="Contenuti" />
                <NavButton id="design" icon={Palette} label="Design & Stile" />
                <NavButton id="limits" icon={Lock} label="Accessi" />
            </div>

            <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                
                {/* SECTION: INFO */}
                {activeSection === 'info' && (
                    <GlassPanel intensity="high" className="p-6 space-y-6 border-t-4 border-t-blue-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-blue-400">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><Type size={20} /></div>
                                <h2 className="text-lg font-bold text-white">Dettagli Evento</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Nome Evento</label><input name="eventName" value={settings.eventName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none transition-all" placeholder="RUSSOLOCO" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Sottotitolo</label><input name="eventSubtitle" value={settings.eventSubtitle} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none transition-all" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 flex items-center gap-2"><Calendar size={10} /> Data</label><input name="eventDate" value={settings.eventDate} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none transition-all" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Orario</label><input name="eventTime" value={settings.eventTime} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none transition-all" /></div>

                            <div className="md:col-span-2 space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-2"><MapPin size={10} /> Location</label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <span className={`text-[9px] font-bold transition-colors ${settings.enableLocation === 'true' ? 'text-green-400' : 'text-gray-500'}`}>{settings.enableLocation === 'true' ? 'VISIBILE' : 'NASCOSTA'}</span>
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${settings.enableLocation === 'true' ? 'bg-green-500' : 'bg-gray-600'}`} onClick={() => toggle('enableLocation')}>
                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${settings.enableLocation === 'true' ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                </div>
                                <input name="eventLocation" value={settings.eventLocation} onChange={handleChange} className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none transition-all ${settings.enableLocation === 'false' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`} disabled={settings.enableLocation === 'false'} />
                            </div>

                            <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Descrizione</label><textarea name="eventDescription" value={settings.eventDescription} onChange={handleChange} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none resize-none transition-all" /></div>
                            <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] text-gray-400 uppercase font-bold ml-1 flex items-center gap-2"><Instagram size={10} /> Instagram URL</label><input name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-pink-500/50 outline-none transition-all text-xs font-mono text-blue-300" /></div>
                        </div>
                    </GlassPanel>
                )}

                {/* SECTION: DESIGN */}
                {activeSection === 'design' && (
                    <div className="space-y-6">
                        {/* PRESETS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {THEMES.map(theme => (
                                <button key={theme.id} type="button" onClick={() => applyTheme(theme)} className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all text-left">
                                    <div className="h-12 w-full" style={{ background: `linear-gradient(135deg, ${theme.colors.bgColor} 0%, ${theme.colors.accentColor} 100%)` }} />
                                    <div className="p-3 bg-black/60 backdrop-blur-sm"><p className="text-[10px] font-bold text-white uppercase tracking-wider">{theme.name}</p></div>
                                    {settings.bgColor === theme.colors.bgColor && <div className="absolute top-1 right-1 bg-white text-black rounded-full p-0.5"><Check size={10} /></div>}
                                </button>
                            ))}
                        </div>

                        {/* STILE STRUTTURALE */}
                        <GlassPanel intensity="high" className="p-6 space-y-4 border-t-4 border-t-pink-500">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-pink-400"><Layers size={20} /> Stile Grafico</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Struttura</label>
                                    <div className="flex gap-2">
                                        <StyleCard id="glass" label="Glass" current={settings.designStyle} onClick={() => setDesignStyle('glass')} />
                                        <StyleCard id="minimal" label="Minimal" current={settings.designStyle} onClick={() => setDesignStyle('minimal')} />
                                        <StyleCard id="brutal" label="Brutal" current={settings.designStyle} onClick={() => setDesignStyle('brutal')} />
                                        <StyleCard id="soft" label="Soft" current={settings.designStyle} onClick={() => setDesignStyle('soft')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tipo Sfondo</label>
                                    <div className="flex gap-2">
                                        <StyleCard id="dots" label="Punti" current={settings.bgType} onClick={() => setBgType('dots')} icon={CircleDot} />
                                        <StyleCard id="grid" label="Griglia" current={settings.bgType} onClick={() => setBgType('grid')} icon={Grid} />
                                        <StyleCard id="liquid" label="Liquido" current={settings.bgType} onClick={() => setBgType('liquid')} icon={Waves} />
                                    </div>
                                </div>
                            </div>
                        </GlassPanel>

                        {/* COLORI */}
                        <GlassPanel intensity="high" className="p-6 space-y-6 border-t-4 border-t-purple-500">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-purple-400"><Palette size={20} /> Palette Colori</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <ColorInput label="Sfondo Base" name="bgColor" value={settings.bgColor} />
                                <ColorInput label="Elementi Sfondo" name="bgDotColor" value={settings.bgDotColor} />
                                <ColorInput label="Elementi Attivi" name="bgDotActiveColor" value={settings.bgDotActiveColor} />
                                <ColorInput label="Titolo (Inizio)" name="primaryColor" value={settings.primaryColor} />
                                <ColorInput label="Titolo (Fine)" name="secondaryColor" value={settings.secondaryColor} />
                                <ColorInput label="Accento / Icone" name="accentColor" value={settings.accentColor} />
                                <ColorInput label="Pulsanti" name="buttonColor" value={settings.buttonColor} />
                            </div>
                        </GlassPanel>
                    </div>
                )}

                {/* SECTION: LIMITS */}
                {activeSection === 'limits' && (
                    <GlassPanel intensity="high" className="p-6 space-y-6 border-t-4 border-t-red-500">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg"><Lock size={20} /></div>
                            <h2 className="text-lg font-bold text-white">Limiti & Sicurezza</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Capienza Max Ospiti</label>
                                <input type="number" name="maxGuests" value={settings.maxGuests} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none font-mono text-lg tracking-widest" />
                                <p className="text-[10px] text-gray-500 ml-1">Blocca registrazioni al raggiungimento.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Limite Promoter</label>
                                <input type="number" name="maxPromoters" value={settings.maxPromoters} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none font-mono text-lg tracking-widest" />
                            </div>
                            
                            <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors" onClick={() => toggle('enablePromoterCode')}>
                                <div>
                                    <p className="font-bold text-sm text-white">Campo Codice PR</p>
                                    <p className="text-xs text-gray-400">Mostra il campo opzionale nel form di registrazione.</p>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.enablePromoterCode === 'true' ? 'bg-green-500' : 'bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${settings.enablePromoterCode === 'true' ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                )}

            </form>
        </div>

        {/* RIGHT COLUMN: STICKY PREVIEW */}
        <div className="hidden lg:block lg:col-span-5 relative">
            <div className="sticky top-28 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={14} /> Anteprima Live</span>
                    {loading && <span className="text-xs text-red-400 animate-pulse flex items-center gap-1"><Zap size={10} /> Sync...</span>}
                </div>
                <div className="w-full aspect-[9/18] rounded-[2.5rem] border-[8px] border-neutral-900 bg-black shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-xl z-30" />
                    {LivePreviewContent}
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-600">L'anteprima riflette lo stile e i colori selezionati.</p>
                </div>
            </div>
        </div>

        {/* MOBILE PREVIEW FAB */}
        <button 
            onClick={() => setShowMobilePreview(true)}
            className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-50 animate-in zoom-in duration-300 hover:scale-110 transition-transform"
        >
            <Eye size={24} />
        </button>

        {/* MOBILE PREVIEW MODAL */}
        {showMobilePreview && (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowMobilePreview(false)}>
                <div className="w-full max-w-sm aspect-[9/18] rounded-[2.5rem] border-[8px] border-neutral-800 bg-black shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white cursor-pointer" onClick={() => setShowMobilePreview(false)}>
                        <ArrowLeft size={20} />
                    </div>
                    {LivePreviewContent}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default AdminSettings;