import React from 'react';
import { GlassCard } from '../components/GlassCard'; // GlassCard usa già useSettings() ora
import { useSettings } from '../components/SettingsContext';

const Landing: React.FC = () => {
  const settings = useSettings();
  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md flex items-center justify-center px-4">
        <GlassCard />
      </div>
      <div className="absolute bottom-4 text-neutral-500 text-xs font-mono tracking-widest z-10 pointer-events-none mix-blend-difference">
        DESIGN @gregoriogondola_ // 2025
      </div>
    </div>
  );
};
export default Landing;