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
  Grid, CircleDot, Waves, Sparkles, MousePointer2
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
      className={`relative group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
        activeSection === id 
        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
        : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-0' : 'group-hover:rotate-12'}`} /> 
      {label}
    </button>
  );

  const ColorInput = ({ label, name, value }: any) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-gray-200 transition-colors">{label}</span>
            <span className="text-[10px] font-mono text-gray-600 group-hover:text-gray-500">{value}</span>
        </div>
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shadow-inner group-hover:scale-110 transition-transform cursor-pointer">
            <input 
                type="color" 
                name={name} 
                value={value} 
                onChange={handleChange} 
                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0" 
            />
        </div>
    </div>
  );

  const StyleCard = ({ id, label, current, onClick, icon: Icon }: any) => (
      <button 
        type="button"
        onClick={onClick}
        className={`relative flex-1 p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
            current === id 
            ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-105 z-10' 
            : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
        }`}
      >
          <div className="relative z-10 flex flex-col items-center gap-2">
            {Icon ? <Icon size={20} /> : <div className="w-5 h-5 rounded border-2 border-current" />}
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
          </div>
          
          {/* Active Indicator Background */}
          {current === id && <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-white opacity-100 z-0" />}
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
        
        {/* Background Layer */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
            {settings.bgType === 'grid' && (
                <div className="w-full h-full" style={{ 
                    backgroundImage: `linear-gradient(${settings.bgDotColor} 1px, transparent 1px), linear-gradient(90deg, ${settings.bgDotColor} 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }} />
            )}
            {settings.bgType === 'dots' && (
                <div className="w-full h-full" style={{ 
                    backgroundImage: `radial-gradient(${settings.bgDotColor} 1.5px, transparent 1.5px)`, 
                    backgroundSize: '20px 20px' 
                }} />
            )}
            {settings.bgType === 'liquid' && (
                <>
                    <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[80%] rounded-full blur-[60px] opacity-40 animate-pulse-slow" style={{ backgroundColor: settings.primaryColor }} />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[120%] h-[80%] rounded-full blur-[60px] opacity-40 animate-float" style={{ backgroundColor: settings.accentColor }} />
                </>
            )}
        </div>
        
        {/* Content Layer */}
        <div className="relative z-10 w-full flex flex-col items-center text-center space-y-8 scale-90 md:scale-100 origin-center">
            <div className="relative group">
                <div className="absolute inset-0 blur-[40px] opacity-30 rounded-full transition-colors duration-500" style={{ backgroundColor: settings.primaryColor }} />
                <img src={logo} alt="Logo" className="w-20 h-20 object-contain relative z-10 drop-shadow-2xl" />
            </div>

            <div className="space-y-1">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b uppercase tracking-tighter leading-none"
                    style={{ backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
                    {settings.eventName || 'EVENT NAME'}
                </h1>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70" style={{ color: settings.accentColor }}>
                    {settings.eventSubtitle || 'SUBTITLE'}
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <div className="text-[9px] font-mono tracking-widest py-3 border bg-white/5 backdrop-blur-md text-gray-300 flex justify-center items-center gap-2"
                    style={{ borderRadius: radius, border }}>
                    <span>{settings.eventDate}</span>
                    <span className="w-1 h-1 bg-white/30 rounded-full"/>
                    <span>{settings.eventTime}</span>
                </div>

                <div className="h-12 flex items-center justify-center text-[10px] font-black tracking-[0.2em] text-white uppercase transition-all cursor-pointer relative overflow-hidden group"
                    style={{ 
                        background: settings.buttonColor, 
                        borderRadius: radius,
                        border: settings.designStyle === 'brutal' ? '2px solid white' : 'none',
                        boxShadow: shadow
                    }}>
                    <span className="relative z-10">ENTRA ORA</span>
                    {settings.designStyle !== 'minimal' && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                    )}
                </div>
            </div>
        </div>
        
        {/* Notch & Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-16 h-2 bg-neutral-900 rounded-full" />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 mix-blend-difference" />
        </div>
    );
  }, [settings]);

  // Reusable Form Field
  const InputField = ({ label, name, icon: Icon, ...props }: any) => (
      <div className="group space-y-1.5">
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 flex items-center gap-1.5 group-focus-within:text-white transition-colors">
              {Icon && <Icon size={10} />} {label}
          </label>
          <div className="relative">
              <input 
                  name={name} 
                  value={(settings as any)[name]} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-700 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all"
                  {...props} 
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
          </div>
      </div>
  );

  return (
    <div className="min-h-screen w-full bg-transparent text-white flex flex-col">
      
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/admin')} variant="secondary" className="!p-2 rounded-full hover:bg-white/10 border-white/10"><ArrowLeft size={18} /></Button>
          <div className="hidden md:block">
              <h1 className="text-sm font-black text-white tracking-wider">CONFIGURAZIONE</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Personalizza l'esperienza</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-1 mr-4">
                <Button onClick={importConfig} variant="ghost" className="text-[10px] !px-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Upload size={12} className="mr-2"/> Importa</Button>
                <Button onClick={exportConfig} variant="ghost" className="text-[10px] !px-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Download size={12} className="mr-2"/> Esporta</Button>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />
            <Button onClick={handleReset} variant="ghost" className="text-[10px] !px-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg">
                <RotateCcw size={14} className="md:mr-2" /> <span className="hidden md:inline">RESET</span>
            </Button>
            <Button onClick={handleSave} isLoading={loading} className="text-xs font-bold px-6 py-2.5 bg-white text-black hover:bg-gray-200 border-none rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
                <Save size={16} className="md:mr-2" /> <span className="hidden md:inline">SALVA MODIFICHE</span>
            </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: SETTINGS */}
        <div className="lg:col-span-7 space-y-8 pb-32 lg:pb-0">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide sticky top-20 z-30 py-2 -mx-4 px-4 md:mx-0 md:px-0 bg-gradient-to-b from-black via-black/95 to-transparent lg:static lg:bg-none">
                <NavButton id="info" icon={LayoutTemplate} label="Contenuti" />
                <NavButton id="design" icon={Palette} label="Design" />
                <NavButton id="limits" icon={Lock} label="Accessi" />
            </div>

            <form onSubmit={handleSave} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                
                {/* --- TAB: INFO --- */}
                {activeSection === 'info' && (
                    <div className="space-y-6">
                        <GlassPanel intensity="low" className="p-6 space-y-6 border-l-2 border-l-blue-500 bg-neutral-900/40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20"><Type size={20} /></div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Identità Evento</h2>
                                    <p className="text-[10px] text-gray-500">Informazioni principali visibili nella landing page.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Nome Evento" name="eventName" placeholder="RUSSOLOCO" />
                                <InputField label="Sottotitolo" name="eventSubtitle" placeholder="Private Party" />
                                <InputField label="Data" name="eventDate" placeholder="25 Dic" icon={Calendar} />
                                <InputField label="Orario" name="eventTime" placeholder="23:00 - 05:00" />
                                
                                <div className="md:col-span-2 space-y-2 pt-2">
                                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1">Descrizione</label>
                                    <textarea name="eventDescription" value={settings.eventDescription} onChange={handleChange} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 outline-none resize-none transition-all" />
                                </div>
                            </div>
                        </GlassPanel>

                        <GlassPanel intensity="low" className="p-6 border-l-2 border-l-indigo-500 bg-neutral-900/40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20"><MapPin size={20} /></div>
                                <h2 className="text-base font-bold text-white">Logistica & Social</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Luogo Evento" name="eventLocation" placeholder="Secret Location" icon={MapPin} disabled={settings.enableLocation === 'false'} />
                                <div className="flex items-end pb-3">
                                    <label className="flex items-center gap-3 cursor-pointer group w-full p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${settings.enableLocation === 'true' ? 'bg-indigo-500' : 'bg-gray-700'}`} onClick={() => toggle('enableLocation')}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.enableLocation === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white">Mostra Location</span>
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <InputField label="Link Instagram" name="instagramUrl" placeholder="https://instagram.com/..." icon={Instagram} />
                                </div>
                            </div>
                        </GlassPanel>
                    </div>
                )}

                {/* --- TAB: DESIGN --- */}
                {activeSection === 'design' && (
                    <div className="space-y-6">
                        {/* THEME PRESETS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {THEMES.map(theme => (
                                <button key={theme.id} type="button" onClick={() => applyTheme(theme)} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/40 transition-all text-left h-24 shadow-lg">
                                    <div className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" 
                                         style={{ background: `linear-gradient(135deg, ${theme.colors.bgColor} 0%, ${theme.colors.primaryColor} 50%, ${theme.colors.accentColor} 100%)` }} />
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
                                            {theme.name}
                                            {settings.bgColor === theme.colors.bgColor && <div className="bg-white text-black rounded-full p-0.5"><Check size={8} /></div>}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* STRUTTURA */}
                            <GlassPanel intensity="low" className="p-6 space-y-4 bg-neutral-900/40">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Layers size={14} /> Layout & Stile</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    <StyleCard id="glass" label="Glass" current={settings.designStyle} onClick={() => setDesignStyle('glass')} icon={Sparkles} />
                                    <StyleCard id="minimal" label="Minimal" current={settings.designStyle} onClick={() => setDesignStyle('minimal')} icon={MousePointer2} />
                                    <StyleCard id="brutal" label="Brutal" current={settings.designStyle} onClick={() => setDesignStyle('brutal')} icon={LayoutTemplate} />
                                    <StyleCard id="soft" label="Soft" current={settings.designStyle} onClick={() => setDesignStyle('soft')} icon={CircleDot} />
                                </div>
                                <div className="pt-2">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase mb-2 block">Pattern Sfondo</label>
                                    <div className="flex gap-2">
                                        <StyleCard id="dots" label="Dots" current={settings.bgType} onClick={() => setBgType('dots')} icon={CircleDot} />
                                        <StyleCard id="grid" label="Grid" current={settings.bgType} onClick={() => setBgType('grid')} icon={Grid} />
                                        <StyleCard id="liquid" label="Liquid" current={settings.bgType} onClick={() => setBgType('liquid')} icon={Waves} />
                                    </div>
                                </div>
                            </GlassPanel>

                            {/* COLORI */}
                            <GlassPanel intensity="low" className="p-6 space-y-4 bg-neutral-900/40">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Palette size={14} /> Palette Cromatica</h2>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-3">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Sfondo</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            <ColorInput label="Base Background" name="bgColor" value={settings.bgColor} />
                                            <ColorInput label="Elementi Pattern" name="bgDotColor" value={settings.bgDotColor} />
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-3">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Brand</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorInput label="Titolo Start" name="primaryColor" value={settings.primaryColor} />
                                            <ColorInput label="Titolo End" name="secondaryColor" value={settings.secondaryColor} />
                                            <ColorInput label="Accento" name="accentColor" value={settings.accentColor} />
                                            <ColorInput label="Bottoni" name="buttonColor" value={settings.buttonColor} />
                                        </div>
                                    </div>
                                </div>
                            </GlassPanel>
                        </div>
                    </div>
                )}

                {/* --- TAB: LIMITS --- */}
                {activeSection === 'limits' && (
                    <GlassPanel intensity="low" className="p-6 space-y-6 border-l-2 border-l-red-500 bg-neutral-900/40">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20"><Lock size={20} /></div>
                            <div>
                                <h2 className="text-base font-bold text-white">Sicurezza & Capienza</h2>
                                <p className="text-[10px] text-gray-500">Gestisci i limiti delle registrazioni.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Capienza Ospiti</label>
                                <div className="relative">
                                    <input type="number" name="maxGuests" value={settings.maxGuests} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 outline-none font-mono text-xl tracking-widest font-bold" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-bold">PAX</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Capienza Promoter</label>
                                <div className="relative">
                                    <input type="number" name="maxPromoters" value={settings.maxPromoters} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 outline-none font-mono text-xl tracking-widest font-bold" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-bold">PR</div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => toggle('enablePromoterCode')}>
                                <div>
                                    <p className="font-bold text-sm text-white group-hover:text-green-400 transition-colors">Richiedi Codice PR</p>
                                    <p className="text-xs text-gray-500">Se attivo, mostra un campo opzionale nel form di registrazione.</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.enablePromoterCode === 'true' ? 'bg-green-500' : 'bg-gray-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.enablePromoterCode === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                )}

            </form>
        </div>

        {/* RIGHT COLUMN: STICKY PREVIEW */}
        <div className="hidden lg:block lg:col-span-5 relative pl-8">
            <div className="sticky top-28 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={14} /> Anteprima Live</span>
                    {loading && <span className="text-xs text-green-400 animate-pulse flex items-center gap-1"><Zap size={10} /> Syncing...</span>}
                </div>
                
                {/* MOCKUP DEVICE */}
                <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col justify-start overflow-hidden ring-1 ring-white/10">
                    <div className="h-[32px] bg-gray-800 w-full absolute top-0 left-0 right-0 z-20 rounded-t-[1.5rem]"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black relative">
                        {LivePreviewContent}
                    </div>
                </div>

                <div className="text-center px-8">
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                        L'anteprima mostra come apparirà la landing page sui dispositivi degli utenti in base alle impostazioni correnti.
                    </p>
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
            <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowMobilePreview(false)}>
                <div className="relative mx-auto border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[80vh] w-full max-w-sm shadow-2xl flex flex-col justify-start overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white cursor-pointer backdrop-blur-md border border-white/10" onClick={() => setShowMobilePreview(false)}>
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