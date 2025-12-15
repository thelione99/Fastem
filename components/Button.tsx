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
  style = {},
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 font-bold tracking-wide transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group z-0 flex items-center justify-center gap-2";
  
  let dynamicStyle: React.CSSProperties = { 
      borderRadius: 'var(--theme-radius)', // Usa il raggio del tema
      borderWidth: 'var(--theme-border-width)',
      ...style 
  };

  if (variant === 'primary') {
    dynamicStyle = {
      ...dynamicStyle,
      background: `linear-gradient(90deg, var(--theme-btn), var(--theme-accent))`,
      color: '#ffffff',
      boxShadow: 'var(--theme-shadow)',
      borderColor: 'transparent'
    };
  }

  // Definizioni di varianti standard
  const variants = {
    primary: "hover:brightness-110", 
    secondary: "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/30 backdrop-blur-sm",
    danger: "bg-red-950/50 hover:bg-red-900/80 text-red-400 border-red-900/50",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent",
    glass: "bg-[rgba(255,255,255,0.06)] text-[#e5e5e5] hover:text-white backdrop-blur-xl border-transparent hover:border-white/10"
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
    </button>
  );
};

export default Button;