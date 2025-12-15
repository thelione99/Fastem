import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '',
  style = {}, // Accetta stili extra
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold tracking-wide transition-all duration-500 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group z-0 flex items-center justify-center gap-2";
  
  // Logica per stile dinamico basata sulle variabili CSS
  let dynamicStyle: React.CSSProperties = { ...style };

  if (variant === 'primary') {
    dynamicStyle = {
      ...dynamicStyle,
      // Forza l'uso delle variabili CSS definite in App.tsx
      background: `linear-gradient(90deg, var(--theme-btn), var(--theme-accent), var(--theme-btn))`,
      backgroundSize: '200% auto',
      borderColor: 'rgba(255,255,255,0.1)',
      color: '#ffffff', // Testo sempre bianco su bottone colorato
      boxShadow: `0 0 20px color-mix(in srgb, var(--theme-btn) 40%, transparent)`
    };
  }

  const variants = {
    // Primary: le classi qui gestiscono l'animazione, il colore è gestito da dynamicStyle sopra
    primary: "animate-flow border", 
    
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/30 backdrop-blur-sm",
    danger: "bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-900/50",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
    
    // Glass: Stile neutro ma elegante
    glass: `
      bg-[rgba(255,255,255,0.06)] 
      text-[#e5e5e5] hover:text-white
      backdrop-blur-xl 
      shadow-[inset_1px_1px_4px_rgba(255,255,255,0.2),inset_-1px_-1px_6px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)]
      hover:shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),inset_-1px_-1px_6px_rgba(0,0,0,0.2),0_0_15px_rgba(255,255,255,0.1)]
      border border-transparent hover:border-white/10
    `
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      style={dynamicStyle}
      {...props}
    >
      <span className={`relative z-10 flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {variant === 'primary' && !isLoading && (
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay">
           <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </div>
      )}

      {variant === 'glass' && !isLoading && (
         <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </button>
  );
};

export default Button;