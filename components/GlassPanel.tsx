import React from 'react';

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
  // Mappiamo l'intensity all'opacità di sfondo (usando la variabile CSS per la base)
  const bgOpacityMap = {
    low: '0.3',
    medium: 'var(--theme-glass-opacity)',
    high: '0.9',
  };

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        borderRadius: 'var(--theme-radius)',
        borderWidth: 'var(--theme-border-width)',
        borderColor: borderRed ? 'rgba(220, 38, 38, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        backgroundColor: `rgba(20, 20, 20, ${bgOpacityMap[intensity]})`,
        backdropFilter: `blur(var(--theme-blur))`,
        boxShadow: 'var(--theme-shadow)',
        ...style
      }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;