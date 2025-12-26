import React from 'react';
import { useSettings } from './SettingsContext';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  borderRed?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  borderRed = false,
  style,
  ...props 
}) => {
  const { bgColor, designStyle } = useSettings();

  // Calcolo luminosità per adattare il vetro
  const isLight = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
  };

  const isLightTheme = isLight(bgColor);

  // Mappatura Opacità Sfondo
  const bgOpacityMap = {
    low: isLightTheme ? '0.4' : '0.3',
    medium: 'var(--theme-glass-opacity)', 
    high: isLightTheme ? '0.85' : '0.9',
  };

  const baseColor = isLightTheme ? '255, 255, 255' : '20, 20, 20';
  
  // Colore Bordo
  const borderColor = borderRed 
    ? 'rgba(220, 38, 38, 0.3)' 
    : isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-500 ${className}`}
      style={{
        borderRadius: 'var(--theme-radius)',
        borderWidth: 'var(--theme-border-width)',
        borderColor: borderColor,
        backgroundColor: `rgba(${baseColor}, ${bgOpacityMap[intensity]})`,
        backdropFilter: `blur(var(--theme-blur))`,
        boxShadow: designStyle === 'minimal' ? 'none' : 'var(--theme-shadow)',
        color: isLightTheme ? '#000000' : '#ffffff',
        ...style
      }}
      {...props}
    >
      {/* HO RIMOSSO IL GRADIENTE DIAGONALE QUI SOTTO PER UN LOOK UNIFORME */}
      {/* Se vuoi un leggero bagliore uniforme, usa questo invece: */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-100" 
        style={{ 
            backgroundColor: isLightTheme ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.02)' 
        }} 
      />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;