import React, { useMemo } from 'react';
import GlassPanel from './GlassPanel';
import { Guest } from '../types';

interface AnalyticsChartProps {
  guests: Guest[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ guests }) => {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const counts = last7Days.map(date => {
      const count = guests.filter(g => {
        const gDate = new Date(g.createdAt).toISOString().split('T')[0];
        return gDate === date;
      }).length;
      return { date, count };
    });

    const max = Math.max(...counts.map(c => c.count), 1); // Evita divisione per 0
    return { data: counts, max };
  }, [guests]);

  return (
    <GlassPanel intensity="medium" className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Andamento</h3>
            <p className="text-xs text-gray-400">Registrazioni ultimi 7 giorni</p>
        </div>
        <div className="text-right">
            <span className="text-2xl font-black text-white">{guests.length}</span>
            <span className="text-[10px] text-gray-500 uppercase block font-bold">Totale</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-32 w-full pt-4 border-b border-white/5 relative z-10">
        {chartData.data.map((item, index) => {
            const height = (item.count / chartData.max) * 100;
            const dayName = new Date(item.date).toLocaleDateString('it-IT', { weekday: 'short' });
            
            return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                    <div className="relative w-full flex justify-center items-end h-full">
                        {/* Bar */}
                        <div 
                            className="w-full max-w-[20px] bg-gradient-to-t from-red-900/50 to-red-500 rounded-t-sm transition-all duration-1000 ease-out group-hover:to-red-400 relative"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-20">
                                {item.count} iscritti
                            </div>
                        </div>
                    </div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold">{dayName}</span>
                </div>
            );
        })}
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
    </GlassPanel>
  );
};