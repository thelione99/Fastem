import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../components/logo.png";
import { useSettings } from './SettingsContext';

// Helper per convertire HEX in RGB (necessario per gestire le opacità)
const hexToRgbString = (hex: string | undefined) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return '220, 38, 38'; // Default Red (DC2626)
  let c = hex.substring(1).split('');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  const r = parseInt(c.slice(0, 2).join(''), 16);
  const g = parseInt(c.slice(2, 4).join(''), 16);
  const b = parseInt(c.slice(4, 6).join(''), 16);
  return `${r}, ${g}, ${b}`;
};

export const GlassCard: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettings();
  
  // Calcolo del colore RGB basato sulle impostazioni
  const buttonRgb = hexToRgbString(settings.buttonColor);

  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line1Completed, setLine1Completed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const staticText = settings.eventTime || "01.00 - 06.00 AM";
  const randomPhrases = [
    "Non fartelo raccontare.", "L'evento dell'anno.", "Not for all.",
    "Il caos ti attende.", "Red Passion.", "Chiudi gli occhi."
  ];

  // Typing Effect
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
  }, [line2, isDeleting, line1Completed, loopNum, typingSpeed, randomPhrases]);

  const handleEnter = () => {
    navigate('/register');
  };

  // CSS Dinamico per il bottone
  const dynamicButtonStyle = `
    .glass-btn-custom:hover .glass-btn-border {
      border-color: rgba(${buttonRgb}, 0.5) !important;
    }
    .glass-btn-glow {
      background-color: rgba(${buttonRgb}, 0.2) !important;
    }
    .glass-btn-icon {
      color: rgb(${buttonRgb}) !important;
    }
  `;

  return (
    <div className="relative flex flex-col items-center text-center z-10 animate-in fade-in zoom-in duration-1000">
      
      {/* Iniezione dello stile dinamico */}
      <style>{dynamicButtonStyle}</style>

      {/* Logo con Glow Dinamico */}
      <div className="mb-12 relative group cursor-default">
        <div 
            className="absolute inset-0 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"
            style={{ backgroundColor: settings.primaryColor }}
        ></div>
        <div className="relative">
          <img src={logo} alt="Logo" className="w-32 h-32 object-contain block relative z-20 drop-shadow-2xl" />
        </div>
      </div>

      {/* TITOLO DINAMICO */}
      <h1 
        className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b mb-8 tracking-tight drop-shadow-xl text-center uppercase"
        style={{ 
            backgroundImage: `linear-gradient(to bottom, ${settings.primaryColor}, ${settings.secondaryColor})` 
        }}
      >
        <span className="block leading-none">{settings.eventName}</span>
        <span 
            className="block text-xl md:text-2xl font-light italic opacity-80 mt-2 tracking-widest"
            style={{ color: settings.secondaryColor }}
        >
            "{settings.eventSubtitle}"
        </span>
      </h1>

      <div className="flex flex-col items-center gap-2 mb-16 h-20">
        <p className="text-neutral-400 text-lg md:text-xl font-light tracking-wide min-h-[1.5rem]">
          {line1}<span className={`${!line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1`}>|</span>
        </p>
        <p 
            className="text-lg md:text-xl font-light italic tracking-wider min-h-[1.5rem] transition-colors duration-300"
            style={{ color: settings.secondaryColor }}
        >
          {line2}
          <span 
            className={`${line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1`}
            style={{ color: settings.accentColor }}
          >|</span>
        </p>
      </div>

      {/* BOTTONE DINAMICO STILE GLASS */}
      <button 
        onClick={handleEnter} 
        className="glass-btn-custom group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500 hover:scale-105 cursor-pointer"
      >
        {/* Bordo dinamico (via classe glass-btn-border) */}
        <div className="glass-btn-border absolute inset-0 border border-neutral-800 rounded-full transition-colors duration-500"></div>
        
        {/* Glow dinamico (via classe glass-btn-glow) */}
        <div className="glass-btn-glow absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative flex items-center gap-4 text-neutral-300 group-hover:text-white transition-colors duration-300 font-light tracking-[0.2em] uppercase text-sm">
          <span>Entra</span>
          {/* Icona dinamica (via classe glass-btn-icon) */}
          <ArrowRight className="glass-btn-icon w-4 h-4 -ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </button>

    </div>
  );
};