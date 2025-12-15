import React from 'react';
import { useSettings } from './SettingsContext';

const GridPattern: React.FC = () => {
  const { bgDotColor, bgDotActiveColor } = useSettings();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Griglia Base */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${bgDotColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${bgDotColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
        }}
      />
      
      {/* Griglia Secondaria (Accento) - Animata */}
      <div 
        className="absolute inset-0 opacity-20 animate-pulse-slow"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${bgDotActiveColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${bgDotActiveColor} 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          backgroundPosition: '20px 20px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default GridPattern;