import React from 'react';
import { useSettings } from './SettingsContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  isLoading?: boolean;
}

// Helper per ottenere i valori RGB (es. "220, 38, 38") dal colore delle impostazioni
const hexToRgbString = (hex: string) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return '220, 38, 38'; // Default Red
  let c = hex.substring(1).split('');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  const r = parseInt(c.slice(0, 2).join(''), 16);
  const g = parseInt(c.slice(2, 4).join(''), 16);
  const b = parseInt(c.slice(4, 6).join(''), 16);
  return `${r}, ${g}, ${b}`;
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '',
  ...props 
}) => {
  const { buttonColor } = useSettings();
  const rgb = hexToRgbString(buttonColor);

  // Stili Base (Layout, Font, Transizioni) - Identici al tuo esempio
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  // Generiamo lo stile dinamico per il Primary per replicare le classi Tailwind (bg-red-600/80, ecc)
  // ma con il colore scelto da te.
  const primaryDynamicStyle = `
    .btn-primary-custom {
      background-color: rgba(${rgb}, 0.8); /* bg-red-600/80 */
      color: white;
      border: 1px solid rgba(${rgb}, 0.5); /* border-red-500/50 */
      box-shadow: 0 0 20px rgba(${rgb}, 0.3); /* shadow-[...] */
      backdrop-filter: blur(4px); /* backdrop-blur-sm */
    }
    .btn-primary-custom:hover {
      background-color: rgb(${rgb}); /* hover:bg-red-600 */
      box-shadow: 0 0 30px rgba(${rgb}, 0.5); /* hover:shadow-[...] */
    }
  `;

  // Mappatura Varianti
  const variants = {
    primary: "btn-primary-custom", // Usa la classe dinamica generata sopra
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 backdrop-blur-sm",
    danger: "bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
    glass: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10" // Fallback per glass
  };

  return (
    <>
      {/* Iniettiamo lo stile CSS solo se è un bottone primary */}
      {variant === 'primary' && <style>{primaryDynamicStyle}</style>}

      <button 
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isLoading || props.disabled}
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
        
        {/* Liquid shine effect on hover - ESATTAMENTE QUELLO CHE VOLEVI */}
        {variant === 'primary' && (
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" />
        )}
      </button>
    </>
  );
};

export default Button;