import React from 'react';
import { PR_LEVELS } from '../types';
import { Lock, Unlock, Gift } from 'lucide-react';

interface LevelProgressProps {
  currentInvites: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ currentInvites }) => {
  const maxInvites = PR_LEVELS[PR_LEVELS.length - 1].threshold;
  
  const calculateGlobalProgress = () => {
    if (currentInvites >= maxInvites) return 100;
    return (currentInvites / maxInvites) * 100;
  };

  return (
    <div className="w-full py-8 select-none">
      <div className="relative h-3 bg-white/5 rounded-full mt-8 mb-12 mx-4">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(220,38,38,0.6)]"
          style={{ width: `${calculateGlobalProgress()}%` }}
        >
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse" />
        </div>

        {PR_LEVELS.map((level, index) => {
          const positionPercent = (level.threshold / maxInvites) * 100;
          const isReached = currentInvites >= level.threshold;
          const isNext = !isReached && (index === 0 || currentInvites >= PR_LEVELS[index - 1].threshold);

          if (index === 0) return null;

          return (
            <div 
              key={level.level}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group"
              style={{ left: `${positionPercent}%` }}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500
                ${isReached 
                  ? 'bg-red-600 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.8)] scale-110' 
                  : 'bg-black border-white/20'
                }
              `}>
                {isReached ? <Unlock size={14} className="text-white" /> : <Lock size={14} className="text-gray-500" />}
              </div>

              <div className="absolute -top-8 text-xs font-bold text-white/50 whitespace-nowrap">
                {level.threshold} <span className="text-[9px] uppercase">invitati</span>
              </div>

              <div className={`
                absolute top-10 w-32 p-2 rounded-lg border backdrop-blur-md text-center transition-all duration-500
                ${isReached 
                  ? 'bg-red-900/40 border-red-500/30 text-white opacity-100 translate-y-0' 
                  : isNext 
                    ? 'bg-neutral-900/60 border-white/10 text-gray-400 opacity-100 grayscale'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }
              `}>
                <div className="flex justify-center mb-1">
                    <Gift size={16} className={isReached ? 'text-red-400' : 'text-gray-600'} />
                </div>
                <p className="text-[10px] leading-tight font-medium">{level.reward}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelProgress;