import React from 'react';
import { useSettings } from './SettingsContext';

const LiquidBackground: React.FC = () => {
  const { primaryColor, accentColor, bgDotColor } = useSettings();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Blobs sfocati */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] md:blur-[120px] opacity-20 animate-float"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] md:blur-[120px] opacity-20 animate-float"
        style={{ backgroundColor: accentColor, animationDelay: '2s' }}
      />
      <div 
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full blur-[60px] md:blur-[100px] opacity-10 animate-pulse-slow"
        style={{ backgroundColor: bgDotColor }}
      />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
    </div>
  );
};

export default LiquidBackground;