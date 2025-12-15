import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import necessario per leggere l'URL
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import { createRequest } from '../services/storage';
import { useToast } from '../components/Toast'; // Assicurati di avere il componente Toast
import { User, Mail, Instagram, Send, Calendar, Clock, Info, CheckCircle, Lock } from 'lucide-react';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams(); // Hook per i parametri URL
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    instagram: '',
    email: '',
    promoterCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCodeLocked, setIsCodeLocked] = useState(false); // Nuovo stato per bloccare l'input

  // EFFETTO: Controlla se c'è un codice nell'URL appena la pagina carica
  useEffect(() => {
      const refCode = searchParams.get('ref'); // Legge ?ref=CODICE
      if (refCode) {
          setFormData(prev => ({ ...prev, promoterCode: refCode.toUpperCase() }));
          setIsCodeLocked(true); // Blocca il campo
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
    window.open('https://www.instagram.com/russolooco/', '_blank');
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full p-8 text-center space-y-6" borderRed>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <CheckMark />
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
      
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tighter">
          RUSSO<span className="text-red-600">LOCO</span>
        </h1>
        <p className="text-red-500/80 text-sm tracking-[0.3em] uppercase">Private Access Only</p>
      </div>

      <div className="max-w-md w-full space-y-6">
        <GlassPanel className="p-6 space-y-4" intensity="medium">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Calendar size={20} /></div>
                <div>
                   <p className="text-xs text-gray-400 uppercase">Data</p>
                   <p className="font-semibold text-white">25 Dic 2025</p>
                </div>
             </div>
             <div className="flex items-center gap-3 text-right">
                <div>
                   <p className="text-xs text-gray-400 uppercase">Orario</p>
                   <p className="font-semibold text-white">01:00 - 06:00</p>
                </div>
                <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Clock size={20} /></div>
             </div>
          </div>
          <div className="pt-2 text-center md:text-left">
            <div className="flex items-start gap-3">
               <div className="p-2 bg-white/5 rounded-lg text-gray-300 hidden md:block"><Info size={18} /></div>
               <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Descrizione Evento</p>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    Il rosso ci avvolge, il ritmo ci guida. RUSSOLOCO è una tendenza esclusiva.
                  </p>
               </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-8" intensity="high">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Richiedi Partecipazione
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Mario" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Cognome</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Rossi" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input required name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nome@email.com" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 mt-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider pl-1 flex justify-between items-center">
                        <span>Codice PR / Invito</span>
                        {isCodeLocked ? (
                            <span className="text-[10px] text-green-400 flex items-center gap-1 font-bold animate-pulse">
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
                            readOnly={isCodeLocked} // Blocca scrittura se arriva da link
                            placeholder="Es. MARIO25"
                            className={`w-full border rounded-xl py-3 px-4 text-white text-center tracking-widest placeholder-gray-700 focus:outline-none transition-all ${
                                isCodeLocked 
                                ? 'bg-green-900/10 border-green-500/30 text-green-400 cursor-not-allowed font-bold' 
                                : 'bg-white/5 border-white/10 focus:border-red-500/50'
                            }`}
                        />
                        {isCodeLocked && (
                            <Lock className="absolute right-3 top-3.5 w-4 h-4 text-green-500/50" />
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="w-full h-12">
                RICHIEDI ACCESSO <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>

      <footer className="mt-8 text-gray-600 text-xs text-center pb-20">
        &copy; 2025 RUSSOLOCO. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

const CheckMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Home;