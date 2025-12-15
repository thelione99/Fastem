import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../components/logo.png";
import { useSettings } from './SettingsContext';

export const GlassCard: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettings();

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

  // Stili dinamici per il bottone in base al designStyle
  const getButtonStyle = () => {
      const base = {
          backgroundColor: settings.buttonColor,
          color: '#ffffff',
          boxShadow: `0 0 20px ${settings.buttonColor}40`,
          borderRadius: 'var(--theme-radius)', // Usa la variabile globale iniettata da App.tsx
          border: 'none'
      };

      if (settings.designStyle === 'brutal') {
          return { ...base, border: '2px solid white', boxShadow: '4px 4px 0px white', borderRadius: '0px' };
      }
      if (settings.designStyle === 'minimal') {
          return { ...base, backgroundColor: 'transparent', border: `1px solid ${settings.buttonColor}`, color: settings.buttonColor, boxShadow: 'none' };
      }
      // Glass & Soft usano i default (pieni)
      return base;
  };

  return (
    <div className="relative flex flex-col items-center text-center z-10 animate-in fade-in zoom-in duration-1000">
      
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

      {/* BOTTONE ENTRA DINAMICO */}
      <button 
        onClick={handleEnter} 
        className="group relative px-12 py-4 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-3 font-bold tracking-[0.2em] uppercase text-sm"
        style={getButtonStyle()}
      >
        <span>ENTRA</span>
        <ArrowRight 
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
        />
        
        {/* Shine Effect solo per stili pieni */}
        {settings.designStyle !== 'minimal' && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
        )}
      </button>

    </div>
  );
};