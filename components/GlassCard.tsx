import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "./logo.png";
import { useSettings } from './SettingsContext'; // Assicurati che questo import sia presente

export const GlassCard: React.FC = () => {
  const navigate = useNavigate();
  
  // QUESTA RIGA È FONDAMENTALE: Recupera le impostazioni
  const settings = useSettings(); 

  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line1Completed, setLine1Completed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // Usa l'orario delle impostazioni o un fallback
  const staticText = settings.eventTime || "01.00 - 06.00 AM";
  const randomPhrases = [
    "Non fartelo raccontare.", "L'evento dell'anno.", "Not for all.",
    "Il caos ti attende.", "Red Passion.", "Chiudi gli occhi."
  ];

  // Effetto Macchina da scrivere (Line 1)
  useEffect(() => {
    let index1 = 0;
    const timer1 = setInterval(() => {
      if (index1 <= staticText.length) {
        setLine1(staticText.slice(0, index1));
        index1++;
      } else {
        clearInterval(timer1);
        setLine1Completed(true);
      }
    }, 50);
    return () => clearInterval(timer1);
  }, [staticText]);

  // Effetto Macchina da scrivere (Line 2 - Loop)
  useEffect(() => {
    if (!line1Completed) return;
    const handleType = () => {
      const i = loopNum % randomPhrases.length;
      const fullText = randomPhrases[i];
      setLine2(isDeleting ? fullText.substring(0, line2.length - 1) : fullText.substring(0, line2.length + 1));
      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && line2 === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && line2 === '') {
        setIsDeleting(false);
        setLoopNum(Math.floor(Math.random() * randomPhrases.length));
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [line2, isDeleting, line1Completed, loopNum, typingSpeed]);

  const handleEnter = () => {
    navigate('/register');
  };

  return (
    <div className="relative flex flex-col items-center text-center z-10 animate-in fade-in zoom-in duration-1000">
      
      {/* Logo */}
      <div className="mb-12 relative group cursor-default">
        {/* Glow dinamico basato sul colore primario */}
        <div 
            className="absolute inset-0 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"
            style={{ backgroundColor: settings.primaryColor || '#dc2626' }}
        ></div>
        <div className="relative">
          <div 
            className="absolute inset-0 blur-[80px] opacity-20 z-0"
            style={{ backgroundColor: settings.primaryColor || '#dc2626' }}
          ></div>
          <img src={logo} alt="Logo" className="w-32 h-32 object-cover rounded-xl block relative z-20" />
        </div>
      </div>

      {/* TITOLO DINAMICO */}
      <h1 
        className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b mb-8 tracking-tight drop-shadow-xl text-center uppercase"
        style={{ 
            backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor || '#ffffff'}, ${settings.secondaryColor || '#9ca3af'})` 
        }}
      >
        <span className="block">{settings.eventName || 'RUSSOLOCO'}</span>
        <span 
            className="block text-3xl md:text-4xl font-light italic opacity-80"
            style={{ color: settings.secondaryColor || '#9ca3af' }}
        >
            "{settings.eventSubtitle || 'Private Access Only'}"
        </span>
      </h1>

      <div className="flex flex-col items-center gap-2 mb-16 h-20">
        <p className="text-neutral-400 text-lg md:text-xl font-light tracking-wide min-h-[1.5rem]">
          {line1}<span className={`${!line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1`}>|</span>
        </p>
        <p 
            className="text-lg md:text-xl font-light italic tracking-wider min-h-[1.5rem] transition-colors duration-300"
            style={{ color: settings.secondaryColor || '#737373' }}
        >
          {line2}
          <span 
            className={`${line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1`}
            style={{ color: settings.accentColor || '#ef4444' }}
          >|</span>
        </p>
      </div>

      {/* BOTTONE ENTRA */}
      <button onClick={handleEnter} className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500 hover:scale-105 cursor-pointer">
        <div className="absolute inset-0 border border-neutral-800 group-hover:border-opacity-50 rounded-full transition-colors duration-500" style={{ borderColor: settings.buttonColor ? `${settings.buttonColor}50` : undefined }}></div>
        <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: settings.buttonColor || '#ef4444' }}></div>
        <div className="relative flex items-center gap-4 text-neutral-300 group-hover:text-white transition-colors duration-300 font-light tracking-[0.2em] uppercase text-sm">
          <span>ENTRA</span>
          <ArrowRight 
            className="w-4 h-4 -ml-1 group-hover:translate-x-1 transition-transform duration-300" 
            style={{ color: settings.buttonColor || '#ef4444' }}
          />
        </div>
      </button>

    </div>
  );
};