import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';
import { scanQRCode } from '../services/storage';
import { ScanResult } from '../types';
import GlassPanel from '../components/GlassPanel';
import StepProgress from '../components/StepProgress';
import { XCircle, CheckCircle, AlertTriangle, RefreshCcw, X, Camera, Crown, TrendingUp, Zap, User } from 'lucide-react';
import Button from '../components/Button';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [flash, setFlash] = useState(false);
  const navigate = useNavigate();
  
  // Ref per gestire il loop di scansione senza causare re-render
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
        videoRef.current.setAttribute("playsinline", "true"); // Importante per iOS
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsCameraActive(true);
        // Avvia il loop di scansione
        scanLoopRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Errore camera: ${err.name}. Assicurati di usare HTTPS e concedere i permessi.`);
    }
  };

  const stopCamera = () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
  };

  useEffect(() => {
      return () => stopCamera(); // Cleanup on unmount
  }, []);

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        scanLoopRef.current = requestAnimationFrame(tick);
        return;
    }

    // THROTTLING: Scansiona solo ogni 500ms per salvare CPU/Batteria
    const now = performance.now();
    if (now - lastScanTime.current < 500) {
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
          
          // Ottimizzazione: Leggi solo la parte centrale (50% dell'area)
          const scanSize = Math.min(canvas.width, canvas.height) * 0.6;
          const sx = (canvas.width - scanSize) / 2;
          const sy = (canvas.height - scanSize) / 2;
          
          const imageData = ctx.getImageData(sx, sy, scanSize, scanSize);
          const code = jsQR(imageData.data, scanSize, scanSize, { inversionAttempts: "dontInvert" });

          if (code && code.data) {
             triggerScan(code.data);
             return; // Stop loop
          }
        }
    }
    
    if (!scanResult) scanLoopRef.current = requestAnimationFrame(tick);
  };

  const triggerScan = (data: string) => {
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      handleScan(data);
  };

  const handleScan = async (data: string) => {
    stopCamera();
    if (navigator.vibrate) navigator.vibrate(200);
    const result = await scanQRCode(data);
    setScanResult(result);
  };

  const resetScan = () => {
    setScanResult(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden text-white">
      
      {/* Flash Effect */}
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-50' : 'opacity-0'}`} />

      {/* Navbar Mobile */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
          <h3 className="text-sm font-bold text-white/90 tracking-widest uppercase flex items-center gap-2">
              <Zap size={16} className="text-red-500 fill-red-500 animate-pulse" /> Scanner v2.0
          </h3>
          <button onClick={() => navigate('/')} className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-colors">
              <X size={20} />
          </button>
      </div>

      {/* Start Screen */}
      {!isCameraActive && !scanResult && (
        <div className="z-20 text-center p-6 w-full max-w-md animate-in fade-in zoom-in duration-500">
            <GlassPanel intensity="high" className="p-10 border-red-500/30 flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <Camera className="w-10 h-10 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">ACCESSO STAFF</h2>
                    <p className="text-gray-400 text-sm">Pronto per la scansione.</p>
                </div>
                <Button onClick={startCamera} className="w-full py-4 text-sm tracking-widest font-bold" variant="primary">
                    AVVIA CAMERA
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
                {/* Overlay Oscuro */}
                <div className="absolute inset-0 bg-black/50 z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] rounded-3xl" />
                </div>

                {/* Mirino Grafico */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 z-20 pointer-events-none border border-white/10 rounded-3xl">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-500 rounded-tl-2xl shadow-[0_0_10px_#ef4444]" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-500 rounded-tr-2xl shadow-[0_0_10px_#ef4444]" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-500 rounded-bl-2xl shadow-[0_0_10px_#ef4444]" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-500 rounded-br-2xl shadow-[0_0_10px_#ef4444]" />
                    
                    <div className="absolute inset-0 border-t-2 border-red-500/50 animate-[float_1.5s_ease-in-out_infinite] opacity-50 shadow-[0_0_20px_#ef4444]" />
                </div>
                
                <p className="absolute bottom-20 left-0 right-0 text-center text-xs font-bold text-white/60 uppercase tracking-widest z-20 animate-pulse">
                    Ricerca Codice in corso...
                </p>
            </>
        )}
      </div>

      {/* Risultato Scansione */}
      {scanResult && (
        <div className="relative z-30 p-4 w-full max-w-md animate-in slide-in-from-bottom-10 duration-500">
           
           {scanResult.type === 'promoter' && scanResult.promoter ? (
             <GlassPanel intensity="high" className="p-0 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden">
                <div className="bg-gradient-to-b from-purple-900/60 to-black/80 p-8 text-center relative">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-3 bg-purple-500/20 rounded-full mb-3 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Crown className="w-12 h-12 text-purple-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{scanResult.promoter.firstName} {scanResult.promoter.lastName}</h2>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-950/50 border border-purple-500/30 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-purple-200 tracking-widest font-mono">{scanResult.promoter.code}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-black/60 backdrop-blur-md">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><TrendingUp size={14}/> Stats</span>
                        <span className="text-2xl font-black text-white">{scanResult.promoter.invites_count} <span className="text-[10px] text-gray-500 font-normal">INVITI</span></span>
                    </div>
                    <StepProgress currentInvites={scanResult.promoter.invites_count} levels={JSON.parse(scanResult.promoter.rewards_config as any || '[]')} />
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5">
                    <Button onClick={resetScan} className="w-full h-14" variant="secondary">
                        <RefreshCcw className="w-4 h-4 mr-2" /> NUOVA SCANSIONE
                    </Button>
                </div>
             </GlassPanel>
           ) : (
             <GlassPanel intensity="high" 
                className={`p-0 overflow-hidden border-2 shadow-2xl ${
                    scanResult.type === 'success' ? 'border-green-500/50 shadow-green-500/20' : 
                    scanResult.type === 'warning' ? 'border-yellow-500/50 shadow-yellow-500/20' : 
                    'border-red-500/50 shadow-red-500/20'
                }`}
             >
                <div className={`p-8 text-center relative ${
                    scanResult.type === 'success' ? 'bg-gradient-to-b from-green-900/60 to-black' : 
                    scanResult.type === 'warning' ? 'bg-gradient-to-b from-yellow-900/60 to-black' : 
                    'bg-gradient-to-b from-red-900/60 to-black'
                }`}>
                    <div className="mb-6 flex justify-center scale-125">
                        {scanResult.type === 'success' && <div className="p-4 bg-green-500 rounded-full text-black shadow-[0_0_30px_#22c55e] animate-bounce"><CheckCircle size={40} strokeWidth={3} /></div>}
                        {scanResult.type === 'error' && <div className="p-4 bg-red-500 rounded-full text-white shadow-[0_0_30px_#ef4444] animate-shake"><XCircle size={40} strokeWidth={3} /></div>}
                        {scanResult.type === 'warning' && <div className="p-4 bg-yellow-500 rounded-full text-black shadow-[0_0_30px_#eab308]"><AlertTriangle size={40} strokeWidth={3} /></div>}
                    </div>
                    
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 leading-none drop-shadow-md">{scanResult.message}</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mix-blend-screen">
                        {scanResult.type === 'success' ? 'Accesso Verificato' : scanResult.type === 'warning' ? 'Attenzione' : 'Accesso Negato'}
                    </p>
                </div>
                  
                {scanResult.guest && (
                    <div className="p-6 bg-neutral-900/80 space-y-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10">
                              <User size={24} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="text-xl font-bold text-white truncate">{scanResult.guest.firstName} {scanResult.guest.lastName}</p>
                              <p className="text-sm text-gray-400 truncate font-mono">@{scanResult.guest.instagram.replace('@','')}</p>
                          </div>
                      </div>
                      
                      <div className="flex gap-2 text-center mt-2">
                          <div className="flex-1 bg-black/40 p-2 rounded border border-white/5">
                              <p className="text-[9px] text-gray-500 uppercase font-bold">Lista</p>
                              <p className="text-xs font-bold text-white">{scanResult.guest.invitedBy || 'Standard'}</p>
                          </div>
                          <div className="flex-1 bg-black/40 p-2 rounded border border-white/5">
                              <p className="text-[9px] text-gray-500 uppercase font-bold">Stato</p>
                              <p className={`text-xs font-bold ${scanResult.guest.isUsed ? 'text-green-400' : 'text-gray-300'}`}>
                                {scanResult.guest.isUsed ? 'Entrato' : 'Da entrare'}
                              </p>
                          </div>
                      </div>
                    </div>
                )}

                <div className="p-4 bg-black border-t border-white/10">
                  <Button onClick={resetScan} className="w-full h-14 text-sm shadow-xl" variant="secondary">
                    <RefreshCcw className="w-4 h-4 mr-2" /> SCANSIONA PROSSIMO
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