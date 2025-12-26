import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';
import { scanQRCode } from '../services/storage';
import { ScanResult } from '../types';
import GlassPanel from '../components/GlassPanel';
import StepProgress from '../components/StepProgress';
import { XCircle, CheckCircle, AlertTriangle, RefreshCcw, X, Camera, Crown, TrendingUp, Zap, User } from 'lucide-react';
import Button from '../components/Button';

// Suoni Base64 per non dover caricare file mp3
const AUDIO_SUCCESS = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVOpauymmo+OVCZr7GYbD45Tp2tspxqQDlOmquxm2tBOEuZqrGca0E4SpirsZxrQTdLmaqwGmNCN0qaqrCc'; // Short beep (placeholder, browser generated tones work better usually but this keeps it simple)
// Nota: Per un suono migliore in produzione, usa file reali. Qui uso un trucco per generare un beep sintetico al volo.

const beep = (type: 'success' | 'error' | 'warning') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }
};

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [flash, setFlash] = useState(false);
  const navigate = useNavigate();
  
  const scanLoopRef = useRef<number | null>(null);
  const lastScanTime = useRef<number>(0);

  const startCamera = async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsCameraActive(true);
        scanLoopRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Errore camera: ${err.name}. Usa HTTPS e Safari/Chrome.`);
    }
  };

  const stopCamera = useCallback(() => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
  }, []);

  useEffect(() => {
      return () => stopCamera();
  }, [stopCamera]);

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        scanLoopRef.current = requestAnimationFrame(tick);
        return;
    }

    const now = performance.now();
    if (now - lastScanTime.current < 300) { // Più reattivo (300ms)
        scanLoopRef.current = requestAnimationFrame(tick);
        return;
    }
    lastScanTime.current = now;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (canvas && !scanResult) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const scanSize = Math.min(canvas.width, canvas.height) * 0.7; // Area scansione più ampia
          const sx = (canvas.width - scanSize) / 2;
          const sy = (canvas.height - scanSize) / 2;
          
          const imageData = ctx.getImageData(sx, sy, scanSize, scanSize);
          const code = jsQR(imageData.data, scanSize, scanSize, { inversionAttempts: "dontInvert" });

          if (code && code.data) {
             triggerScan(code.data);
             return;
          }
        }
    }
    
    if (!scanResult) scanLoopRef.current = requestAnimationFrame(tick);
  };

  const triggerScan = (data: string) => {
      setFlash(true);
      if (navigator.vibrate) navigator.vibrate(50); // Feedback aptico immediato
      setTimeout(() => setFlash(false), 200);
      handleScan(data);
  };

  const handleScan = async (data: string) => {
    stopCamera();
    const result = await scanQRCode(data);
    
    // Feedback Sonoro & Aptico avanzato in base al risultato
    if (result.valid) {
        beep('success');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
    } else if (result.type === 'warning') {
        beep('warning');
        if (navigator.vibrate) navigator.vibrate([300]);
    } else {
        beep('error');
        if (navigator.vibrate) navigator.vibrate([500]);
    }

    setScanResult(result);
  };

  const resetScan = () => {
    setScanResult(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
      
      {/* Flash Effect */}
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-200 ${flash ? 'opacity-80' : 'opacity-0'}`} />

      {/* Navbar Mobile */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Zap size={16} className="text-red-500 fill-red-500 animate-pulse" /> Scanner Pro
          </h3>
          <button onClick={() => navigate('/')} className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-colors active:scale-95">
              <X size={20} />
          </button>
      </div>

      {/* Start Screen */}
      {!isCameraActive && !scanResult && (
        <div className="z-20 text-center p-6 w-full max-w-md animate-in fade-in zoom-in duration-500">
            <GlassPanel intensity="high" className="p-10 border-red-500/30 flex flex-col items-center gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
                
                <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center border-4 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.4)] relative group">
                    <div className="absolute inset-0 rounded-full border-t-4 border-red-500 animate-spin opacity-50" />
                    <Camera className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">INGRESSO</h2>
                    <p className="text-gray-400 text-sm">Sistema controllo accessi attivo.</p>
                </div>
                <Button onClick={startCamera} className="w-full py-4 text-sm tracking-[0.2em] font-black shadow-lg shadow-red-900/40" variant="primary">
                    SCANSIONA
                </Button>
                {errorMsg && <p className="text-red-400 text-xs bg-red-950/50 px-3 py-2 rounded border border-red-900/50 mt-2">{errorMsg}</p>}
            </GlassPanel>
        </div>
      )}

      {/* Camera Viewfinder */}
      <div className={`absolute inset-0 z-0 bg-black ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}>
        <video ref={videoRef} className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        {isCameraActive && (
            <>
                <div className="absolute inset-0 bg-black/40 z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.9)] rounded-[2rem] border border-white/20" />
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 z-20 pointer-events-none rounded-[2rem] overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-xl" />
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/0 via-red-500/10 to-red-500/0 animate-[shimmer_2s_infinite] translate-y-[-100%]" />
                </div>
                
                <p className="absolute bottom-24 left-0 right-0 text-center text-xs font-bold text-white uppercase tracking-[0.2em] z-20 animate-pulse text-shadow">
                    Inquadra il codice QR
                </p>
            </>
        )}
      </div>

      {/* Risultato Scansione */}
      {scanResult && (
        <div className="relative z-30 p-4 w-full max-w-md animate-in slide-in-from-bottom-10 duration-500 ease-out">
           
           {scanResult.type === 'promoter' && scanResult.promoter ? (
             <GlassPanel intensity="high" className="p-0 border border-purple-500/50 shadow-[0_0_100px_rgba(168,85,247,0.4)] overflow-hidden">
                <div className="bg-gradient-to-b from-purple-600 via-purple-900 to-black p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-4 bg-white text-purple-600 rounded-full mb-4 shadow-xl">
                            <Crown className="w-12 h-12" strokeWidth={2} />
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-1">{scanResult.promoter.firstName}</h2>
                        <h3 className="text-xl font-light text-purple-200 uppercase tracking-widest mb-4">{scanResult.promoter.lastName}</h3>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-purple-400/30 rounded-full backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                            <span className="text-xs font-bold text-white tracking-widest font-mono">STAFF PR VERIFICATO</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-black/80 backdrop-blur-md border-t border-purple-500/20">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14}/> Performance</span>
                        <span className="text-3xl font-black text-white">{scanResult.promoter.invites_count} <span className="text-[10px] text-gray-500 font-normal">GUESTS</span></span>
                    </div>
                    <StepProgress currentInvites={scanResult.promoter.invites_count} levels={JSON.parse(scanResult.promoter.rewards_config as any || '[]')} />
                </div>

                <div className="p-4 bg-black border-t border-white/10">
                    <Button onClick={resetScan} className="w-full h-14 bg-white text-black hover:bg-gray-200 border-none font-black tracking-wider">
                        <RefreshCcw className="w-4 h-4 mr-2" /> NUOVA SCANSIONE
                    </Button>
                </div>
             </GlassPanel>
           ) : (
             <GlassPanel intensity="high" 
                className={`p-0 overflow-hidden border-0 shadow-2xl ring-1 ring-white/10 ${
                    scanResult.type === 'success' ? 'shadow-green-500/40' : 
                    scanResult.type === 'warning' ? 'shadow-yellow-500/40' : 
                    'shadow-red-500/40'
                }`}
             >
                <div className={`p-10 text-center relative overflow-hidden ${
                    scanResult.type === 'success' ? 'bg-gradient-to-br from-green-500 to-green-800' : 
                    scanResult.type === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-amber-700' : 
                    'bg-gradient-to-br from-red-500 to-red-800'
                }`}>
                    {/* Noise Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-4 scale-125 bg-black/20 p-4 rounded-full backdrop-blur-sm shadow-inner">
                            {scanResult.type === 'success' && <CheckCircle size={48} className="text-white drop-shadow-md" strokeWidth={3} />}
                            {scanResult.type === 'error' && <XCircle size={48} className="text-white drop-shadow-md" strokeWidth={3} />}
                            {scanResult.type === 'warning' && <AlertTriangle size={48} className="text-white drop-shadow-md" strokeWidth={3} />}
                        </div>
                        
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg mb-2">{scanResult.message}</h2>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/80 mix-blend-plus-lighter">
                            {scanResult.type === 'success' ? 'Accesso Consentito' : scanResult.type === 'warning' ? 'Già Scansionato' : 'Accesso Negato'}
                        </p>
                    </div>
                </div>
                  
                {scanResult.guest && (
                    <div className="p-6 bg-neutral-900/95 space-y-5 border-t border-white/10">
                      <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg">
                              <User size={28} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="text-2xl font-black text-white truncate uppercase tracking-tight">{scanResult.guest.firstName}</p>
                              <p className="text-xl font-light text-gray-300 truncate uppercase tracking-wide leading-none">{scanResult.guest.lastName}</p>
                              <p className="text-xs text-gray-500 truncate font-mono mt-1">@{scanResult.guest.instagram.replace('@','')}</p>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Lista PR</p>
                              <p className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                                  {scanResult.guest.invitedBy ? <><Crown size={12} className="text-yellow-500" /> {scanResult.guest.invitedBy}</> : 'Nessuna Lista'}
                              </p>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Stato Ingresso</p>
                              <p className={`text-sm font-bold ${scanResult.guest.isUsed ? 'text-yellow-400' : 'text-green-400'}`}>
                                {scanResult.guest.isUsed ? 'GIÀ ENTRATO' : 'DA ENTRARE'}
                              </p>
                          </div>
                      </div>
                    </div>
                )}

                <div className="p-4 bg-black border-t border-white/10">
                  <Button onClick={resetScan} className="w-full h-14 text-sm font-bold tracking-widest shadow-xl bg-white text-black hover:bg-gray-200 border-none" variant="secondary">
                    <RefreshCcw className="w-4 h-4 mr-2" /> PROSSIMO OSPITE
                  </Button>
                </div>
             </GlassPanel>
           )}
        </div>
      )}
    </div>
  );
};

export default Scanner;