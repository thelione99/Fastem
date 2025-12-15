import React from 'react';
import { LevelConfig } from '../types';
import { Check, Lock, Star, Gift, Flag } from 'lucide-react';

interface StepProgressProps {
  currentInvites: number;
  levels: LevelConfig[];
}

const StepProgress: React.FC<StepProgressProps> = ({ currentInvites, levels }) => {
  
  // 1. Ordina i livelli configurati dall'utente
  const userLevels = [...levels].sort((a, b) => a.threshold - b.threshold);
  
  // 2. NORMALIZZAZIONE: Assicuriamoci che ci sia sempre un punto "0" (Start)
  let displayLevels = [...userLevels];
  
  // Se non c'è un livello a 0, lo aggiungiamo all'inizio
  if (displayLevels.length === 0 || displayLevels[0].threshold > 0) {
      displayLevels.unshift({ level: 0, threshold: 0, reward: 'Start' });
  }

  // Se dopo aver aggiunto lo 0 c'è SOLO quello (l'utente non ha messo livelli), mettiamo un target fittizio a 10
  if (displayLevels.length === 1) {
      displayLevels.push({ level: 99, threshold: 10, reward: 'Obiettivo' });
  }

  const totalSegments = displayLevels.length - 1; 

  // 3. CALCOLO PROGRESSO MATEMATICO
  const calculateProgress = () => {
    if (totalSegments <= 0) return 0;
    
    // Ogni segmento ha la stessa larghezza visiva (es. se ci sono 2 segmenti, 50% l'uno)
    const segmentWidth = 100 / totalSegments; 
    let totalProgress = 0;

    for (let i = 0; i < totalSegments; i++) {
        const startNode = displayLevels[i];
        const endNode = displayLevels[i + 1];

        // Se abbiamo superato completamente questo segmento
        if (currentInvites >= endNode.threshold) {
            totalProgress += segmentWidth;
        } 
        // Se siamo "dentro" questo segmento
        else if (currentInvites > startNode.threshold) {
            const range = endNode.threshold - startNode.threshold; // Es: 2 - 0 = 2
            const earned = currentInvites - startNode.threshold;   // Es: 1 - 0 = 1
            const percentageInSegment = Math.min(Math.max(earned / range, 0), 1); // 1 / 2 = 0.5 (50%)
            
            totalProgress += percentageInSegment * segmentWidth;
            break; 
        }
    }
    return Math.min(totalProgress, 100);
  };

  const progressPercent = calculateProgress();

  return (
    <div className="w-full pt-10 pb-4 px-4">
      <div className="relative">
        
        {/* Sfondo Linea */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0"></div>
        
        {/* Linea Progresso Attiva */}
        <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-900 to-red-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
        >
            {progressPercent > 0 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full blur-[5px] shadow-[0_0_10px_#ef4444]" />
            )}
        </div>

        {/* Nodi */}
        <div className="relative z-10 flex justify-between w-full">
          {displayLevels.map((level, index) => {
            const isReached = currentInvites >= level.threshold;
            const isLast = index === displayLevels.length - 1;
            const isStart = index === 0 && level.threshold === 0;
            
            // Logica Icone
            let Icon = Lock;
            if (isStart) Icon = Flag; // Bandierina per lo start
            else if (isReached) Icon = Check;
            else if (isLast) Icon = Star;

            return (
              <div key={index} className="flex flex-col items-center group relative" style={{ width: '24px' }}> 
                
                {/* Reward Tooltip (Sempre visibile per capire i target) */}
                <div className={`
                    absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded border backdrop-blur-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-1
                    ${isReached 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400 -translate-y-1 opacity-100' 
                        : 'bg-neutral-900 border-white/10 text-gray-400 translate-y-0 opacity-100'
                    }
                `}>
                    {!isStart && <Gift size={8} />} {level.reward}
                </div>

                {/* Nodo Cerchio */}
                <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                    ${isReached 
                        ? 'bg-green-500 border-green-400 text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                        : 'bg-black border-white/10 text-gray-600'
                    }
                `}>
                    <Icon size={12} strokeWidth={2.5} />
                </div>

                {/* Numero Soglia */}
                <div className={`absolute top-9 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold ${isReached ? 'text-white' : 'text-gray-600'}`}>
                    {level.threshold}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;