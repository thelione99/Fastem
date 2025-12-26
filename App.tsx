import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import DotGrid from './components/DotGrid';
import GridPattern from './components/GridPattern';
import LiquidBackground from './components/LiquidBackground';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import { ToastProvider } from './components/Toast';

const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));
const PromoterDashboard = lazy(() => import('./pages/PromoterDashboard'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

const LoadingScreen = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-t-2 border-red-500 rounded-full animate-spin"></div>
    </div>
);

const ThemeInjector: React.FC = () => {
  const settings = useSettings();
  
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--theme-bg', settings.bgColor);
    root.style.setProperty('--theme-primary', settings.primaryColor);
    root.style.setProperty('--theme-secondary', settings.secondaryColor);
    root.style.setProperty('--theme-accent', settings.accentColor);
    root.style.setProperty('--theme-btn', settings.buttonColor);

    switch (settings.designStyle) {
        case 'minimal':
            root.style.setProperty('--theme-radius', '4px');
            root.style.setProperty('--theme-border-width', '1px');
            root.style.setProperty('--theme-blur', '0px');
            root.style.setProperty('--theme-glass-opacity', '0.95');
            root.style.setProperty('--theme-shadow', 'none');
            break;
        case 'brutal':
            root.style.setProperty('--theme-radius', '0px');
            root.style.setProperty('--theme-border-width', '2px');
            root.style.setProperty('--theme-blur', '0px');
            root.style.setProperty('--theme-glass-opacity', '1');
            root.style.setProperty('--theme-shadow', '4px 4px 0px var(--theme-accent)');
            break;
        case 'soft':
            root.style.setProperty('--theme-radius', '24px');
            root.style.setProperty('--theme-border-width', '0px');
            root.style.setProperty('--theme-blur', '20px');
            root.style.setProperty('--theme-glass-opacity', '0.4');
            root.style.setProperty('--theme-shadow', '0 10px 40px -10px rgba(0,0,0,0.5)');
            break;
        case 'glass':
        default:
            root.style.setProperty('--theme-radius', '16px');
            root.style.setProperty('--theme-border-width', '1px');
            root.style.setProperty('--theme-blur', '24px'); // Aumentato da 16 a 24 per più effetto "sfocato"
            root.style.setProperty('--theme-glass-opacity', '0.3'); // Opacità base ridotta drasticamente
            root.style.setProperty('--theme-shadow', '0 8px 32px 0 rgba(0, 0, 0, 0.36)');
            break;
    }
    
    document.title = settings.eventName || "RUSSOLOCO";
  }, [settings]);

  const renderBackground = () => {
      switch(settings.bgType) {
          case 'grid': return <GridPattern />;
          case 'liquid': return <LiquidBackground />;
          case 'dots': 
          default: 
            return (
                <DotGrid 
                    dotSize={2} 
                    gap={25} 
                    baseColor={settings.bgDotColor || '#262626'} 
                    activeColor={settings.bgDotActiveColor || settings.accentColor} 
                    proximity={150} 
                    shockStrength={10} 
                />
            );
      }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700" style={{ backgroundColor: settings.bgColor }}>
        {renderBackground()}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ToastProvider>
        <HashRouter>
          <div className="relative min-h-screen text-white font-sans selection:bg-red-500/30 selection:text-white overflow-x-hidden">
            <ThemeInjector />
            <div className="relative z-10 min-h-screen">
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/register" element={<Home />} />
                      <Route path="/admin" element={<AuthGuard><Dashboard /></AuthGuard>} />
                      <Route path="/admin/settings" element={<AuthGuard><AdminSettings /></AuthGuard>} />
                      <Route path="/scanner" element={<AuthGuard><Scanner /></AuthGuard>} />
                      <Route path="/pr" element={<PromoterDashboard />} />
                    </Routes>
                </Suspense>
            </div>
          </div>
        </HashRouter>
      </ToastProvider>
    </SettingsProvider>
  );
};

export default App;