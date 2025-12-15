import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import PromoterDashboard from './pages/PromoterDashboard';
import AdminSettings from './pages/AdminSettings';
import AuthGuard from './components/AuthGuard';
import DotGrid from './components/DotGrid';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import { ToastProvider } from './components/Toast'; // <--- IMPORT NUOVO

const ThemeInjector: React.FC = () => {
  const settings = useSettings();
  
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-bg', settings.bgColor);
    document.documentElement.style.setProperty('--theme-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--theme-secondary', settings.secondaryColor);
    document.documentElement.style.setProperty('--theme-accent', settings.accentColor);
    document.documentElement.style.setProperty('--theme-btn', settings.buttonColor);
    
    document.title = settings.eventName || "Event App";
  }, [settings]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700" style={{ backgroundColor: settings.bgColor }}>
        <DotGrid 
            dotSize={2} 
            gap={25} 
            baseColor={settings.bgDotColor || '#262626'} 
            activeColor={settings.accentColor} 
            proximity={150} 
            shockStrength={10} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ToastProvider> {/* <--- WRAP NUOVO */}
        <HashRouter>
          <div className="relative min-h-screen text-white font-sans selection:bg-red-500/30 selection:text-white overflow-x-hidden">
            <ThemeInjector />
            <div className="relative z-10 min-h-screen">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/register" element={<Home />} />
                  <Route path="/admin" element={<AuthGuard><Dashboard /></AuthGuard>} />
                  <Route path="/admin/settings" element={<AuthGuard><AdminSettings /></AuthGuard>} />
                  <Route path="/scanner" element={<AuthGuard><Scanner /></AuthGuard>} />
                  <Route path="/pr" element={<PromoterDashboard />} />
                </Routes>
            </div>
          </div>
        </HashRouter>
      </ToastProvider>
    </SettingsProvider>
  );
};

export default App;