import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '../services/storage';
import { AppSettings } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import { Save, ArrowLeft, Calendar, Palette, ToggleLeft, ToggleRight, Lock, Image as ImageIcon } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>({
    eventName: '', eventSubtitle: '', eventDate: '', eventTime: '', eventLocation: '', enableLocation: 'true',
    eventDescription: '', instagramUrl: '', enablePromoterCode: 'true',
    bgColor: '#000000', bgDotColor: '#262626', primaryColor: '#ffffff', secondaryColor: '#9ca3af', accentColor: '#ef4444', buttonColor: '#ef4444',
    maxGuests: '500', maxPromoters: '20'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSettings().then(data => { if(data) setSettings(prev => ({...prev, ...data})); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const toggle = (key: keyof AppSettings) => {
    setSettings(s => ({ ...s, [key]: s[key] === 'true' ? 'false' : 'true' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await updateSettings(settings);
      alert('Impostazioni salvate! Ricarica per vedere i cambiamenti.');
      window.location.reload();
    } catch (e) { alert('Errore salvataggio'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-4 md:p-8 flex flex-col items-center pb-32">
      <div className="max-w-4xl w-full space-y-6">
        
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/admin')} variant="secondary" className="!p-3 rounded-full"><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">CONFIGURAZIONE <span style={{ color: settings.accentColor }}>SITO</span></h1>
            <p className="text-gray-400 text-sm">Personalizza ogni aspetto dell'evento.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
            
            {/* SEZIONE 1: Dettagli Evento */}
            <GlassPanel intensity="high" className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                    <Calendar className="text-blue-400" size={18} /> DETTAGLI EVENTO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase font-bold">Nome Evento</label><input name="eventName" value={settings.eventName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase font-bold">Sottotitolo</label><input name="eventSubtitle" value={settings.eventSubtitle} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase font-bold">Data</label><input name="eventDate" value={settings.eventDate} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase font-bold">Orario</label><input name="eventTime" value={settings.eventTime} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none" /></div>
                    
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Luogo / Location</label>
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggle('enableLocation')}>
                                <span className="text-[9px] uppercase font-bold">{settings.enableLocation === 'true' ? 'VISIBILE' : 'NASCOSTO'}</span>
                                {settings.enableLocation === 'true' ? <ToggleRight className="text-green-500" size={20} /> : <ToggleLeft className="text-gray-600" size={20} />}
                            </div>
                        </div>
                        <input name="eventLocation" value={settings.eventLocation} onChange={handleChange} className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none transition-opacity ${settings.enableLocation === 'false' ? 'opacity-50' : ''}`} />
                    </div>

                    <div className="space-y-1 md:col-span-2"><label className="text-[10px] text-gray-400 uppercase font-bold">Descrizione</label><textarea name="eventDescription" value={settings.eventDescription} onChange={handleChange} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none resize-none" /></div>
                    <div className="space-y-1 md:col-span-2"><label className="text-[10px] text-gray-400 uppercase font-bold">Link Instagram</label><input name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none" /></div>
                </div>
            </GlassPanel>

            {/* SEZIONE 2: Sfondo & Atmosfera (SEPARATA) */}
            <GlassPanel intensity="high" className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                    <ImageIcon className="text-purple-400" size={18} /> SFONDO & ATMOSFERA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorInput label="Colore Sfondo Base (Background)" name="bgColor" value={settings.bgColor} onChange={handleChange} />
                    <ColorInput label="Colore Punti/Griglia (Dots)" name="bgDotColor" value={settings.bgDotColor} onChange={handleChange} />
                </div>
                <p className="text-xs text-gray-500 mt-2">I cambiamenti dello sfondo saranno visibili in tempo reale su tutta l'app.</p>
            </GlassPanel>

            {/* SEZIONE 3: Elementi Grafici */}
            <GlassPanel intensity="high" className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                    <Palette className="text-pink-400" size={18} /> ELEMENTI GRAFICI
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorInput label="Titolo (Start)" name="primaryColor" value={settings.primaryColor} onChange={handleChange} />
                    <ColorInput label="Titolo (End)" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} />
                    <ColorInput label="Accenti (Icone)" name="accentColor" value={settings.accentColor} onChange={handleChange} />
                    <ColorInput label="Bottoni" name="buttonColor" value={settings.buttonColor} onChange={handleChange} />
                </div>
                
                {/* Anteprima Live */}
                <div className="mt-4 p-6 rounded-xl border border-white/10 flex flex-col items-center gap-4 transition-colors" style={{ backgroundColor: settings.bgColor }}>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b uppercase" style={{ backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
                        {settings.eventName || 'ANTEPRIMA'}
                    </h1>
                    <button className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg" style={{ background: `linear-gradient(90deg, ${settings.buttonColor}, ${settings.accentColor}, ${settings.buttonColor})`, backgroundSize: '200% auto' }}>
                        PULSANTE
                    </button>
                </div>
            </GlassPanel>

            {/* SEZIONE 4: Limiti & Opzioni */}
            <GlassPanel intensity="high" className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                    <Lock className="text-red-400" size={18} /> LIMITI & OPZIONI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Max Ospiti</label>
                        <input type="number" name="maxGuests" value={settings.maxGuests} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" />
                        <p className="text-[9px] text-gray-500">Blocca registrazioni al raggiungimento.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Max Promoter</label>
                        <input type="number" name="maxPromoters" value={settings.maxPromoters} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 outline-none" />
                        <p className="text-[9px] text-gray-500">Blocca creazione nuovi PR.</p>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 mt-2">
                        <div>
                            <p className="text-sm font-bold text-white">Campo Codice Promoter</p>
                            <p className="text-xs text-gray-500">Se disattivato, il campo non apparirà nel modulo.</p>
                        </div>
                        <button type="button" onClick={() => toggle('enablePromoterCode')} className={`transition-colors ${settings.enablePromoterCode === 'true' ? 'text-green-500' : 'text-gray-600'}`}>
                            {settings.enablePromoterCode === 'true' ? <ToggleRight size={40} strokeWidth={1.5} /> : <ToggleLeft size={40} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </GlassPanel>

            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={loading} className="w-full md:w-auto h-14 text-lg shadow-xl" variant="glass" style={{ borderColor: settings.accentColor }}>
                    <Save size={20} /> SALVA TUTTO
                </Button>
            </div>

        </form>
      </div>
    </div>
  );
};

const ColorInput = ({ label, name, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-bold block">{label}</label>
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 pr-3 hover:border-white/30 transition-colors">
            <input type="color" name={name} value={value} onChange={onChange} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none p-0" />
            <span className="text-xs font-mono text-gray-300 uppercase">{value}</span>
        </div>
    </div>
);

export default AdminSettings;