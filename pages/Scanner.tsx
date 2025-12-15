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
  const [flash, setFlash] = useState(false); // Effetto flash alla scansione
  const navigate = useNavigate();

  const startCamera = async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Errore camera: ${err.name} (HTTPS richiesto)`);
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Ottimizzazione: Scansiona solo la zona centrale (facoltativo, ma migliora performance)
          if (imageData.data.length > 0) {
             const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
             if (code && code.data) {
                triggerScan(code.data);
                return;
             }
          }
        }
      }
    }
    if (!scanResult) requestAnimationFrame(tick);
  };

  const triggerScan = (data: string) => {
      // Effetto visivo e sonoro (opzionale)
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      handleScan(data);
  };

  const handleScan = async (data: string) => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
    
    // Piccola vibrazione su mobile
    if (navigator.vibrate) navigator.vibrate(200);

    const result = await scanQRCode(data);
    setScanResult(result);
  };

  const resetScan = () => {
    setScanResult(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Flash Effect Overlay */}
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-50' : 'opacity-0'}`} />

      {/* Header Mobile */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <h3 className="text-sm font-bold text-white/80 tracking-widest uppercase flex items-center gap-2">
              <Zap size={14} className="text-red-500 fill-red-500" /> Scanner Live
          </h3>
          <button onClick={() => navigate('/')} className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-colors">
              <X size={20} />
          </button>
      </div>

      {/* Stato Iniziale: Avvio Camera */}
      {!isCameraActive && !scanResult && (
        <div className="z-20 text-center p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
            <GlassPanel intensity="high" className="p-10 border-red-500/30 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <Camera className="w-10 h-10 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">PUNTO DI ACCESSO</h2>
                    <p className="text-gray-400 text-sm">Inquadra il QR Code del biglietto o del pass promoter per verificare l'ingresso.</p>
                </div>
                <Button onClick={startCamera} className="w-full py-4 text-sm tracking-widest font-bold" variant="primary">
                    ATTIVA SCANNER
                </Button>
                {errorMsg && <p className="text-red-500 text-xs bg-red-950/30 px-3 py-2 rounded border border-red-900/50">{errorMsg}</p>}
            </GlassPanel>
        </div>
      )}

      {/* Viewfinder Camera */}
      <div className={`absolute inset-0 z-0 bg-black ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}>
        <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="hidden" />
        
        {isCameraActive && (
            <>
                {/* Dark Overlay con buco centrale */}
                <div className="absolute inset-0 bg-black/60 z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] rounded-3xl" />
                </div>

                {/* Mirino High-Tech */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 z-20 pointer-events-none">
                    {/* Angoli */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    
                    {/* Laser Scan Animation */}
                    <div className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-[float_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
                    
                    {/* Info Text */}
                    <p className="absolute -bottom-10 left-0 right-0 text-center text-xs font-bold text-white/70 uppercase tracking-[0.2em] animate-pulse">
                        Ricerca Codice...
                    </p>
                </div>
            </>
        )}
      </div>

      {/* RISULTATI SCANSIONE */}
      {scanResult && (
        <div className="relative z-30 p-4 w-full max-w-xl animate-in slide-in-from-bottom-10 duration-500">
           
           {/* CASO 1: PROMOTER - Design Esclusivo */}
           {scanResult.type === 'promoter' && scanResult.promoter ? (
             <GlassPanel intensity="high" className="p-0 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
                {/* Header PR */}
                <div className="bg-gradient-to-b from-purple-900/40 to-black/60 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-3 bg-purple-500/20 rounded-full mb-3 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Crown className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{scanResult.promoter.firstName} {scanResult.promoter.lastName}</h2>
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-300 tracking-widest font-mono">
                            CODE: {scanResult.promoter.code}
                        </span>
                    </div>
                </div>

                {/* Stats PR */}
                <div className="p-6 bg-black/40 backdrop-blur-md">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <div className="flex items-center gap-2 text-purple-400">
                            <TrendingUp size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Performance</span>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-white">{scanResult.promoter.invites_count}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold ml-1">Invitati</span>
                        </div>
                    </div>
                    
                    <StepProgress currentInvites={scanResult.promoter.invites_count} levels={scanResult.promoter.rewards_config as any || []} />
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5">
                    <Button onClick={resetScan} className="w-full" variant="secondary">
                        <RefreshCcw className="w-4 h-4 mr-2" /> SCANSIONA NUOVO
                    </Button>
                </div>
             </GlassPanel>
           ) : (
             
             /* CASO 2: OSPITE - Design Funzionale */
             <GlassPanel intensity="high" 
                className={`p-0 overflow-hidden border-2 shadow-[0_0_60px_rgba(0,0,0,0.5)] ${
                    scanResult.type === 'success' ? 'border-green-500/50 shadow-green-900/20' : 
                    scanResult.type === 'warning' ? 'border-yellow-500/50 shadow-yellow-900/20' : 
                    'border-red-500/50 shadow-red-900/20'
                }`}
             >
                <div className={`p-8 text-center relative ${
                    scanResult.type === 'success' ? 'bg-green-950/30' : 
                    scanResult.type === 'warning' ? 'bg-yellow-950/30' : 
                    'bg-red-950/30'
                }`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    {/* Icona Risultato */}
                    <div className="mb-6 flex justify-center">
                        {scanResult.type === 'success' && <div className="p-4 bg-green-500 rounded-full text-black shadow-[0_0_30px_#22c55e] animate-bounce"><CheckCircle size={48} strokeWidth={2.5} /></div>}
                        {scanResult.type === 'error' && <div className="p-4 bg-red-500 rounded-full text-white shadow-[0_0_30px_#ef4444] animate-shake"><XCircle size={48} strokeWidth={2.5} /></div>}
                        {scanResult.type === 'warning' && <div className="p-4 bg-yellow-500 rounded-full text-black shadow-[0_0_30px_#eab308]"><AlertTriangle size={48} strokeWidth={2.5} /></div>}
                    </div>
                    
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 leading-none">{scanResult.message}</h2>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
                        scanResult.type === 'success' ? 'text-green-400' : 
                        scanResult.type === 'warning' ? 'text-yellow-400' : 
                        'text-red-400'
                    }`}>
                        {scanResult.type === 'success' ? 'Accesso Autorizzato' : scanResult.type === 'warning' ? 'Attenzione' : 'Accesso Negato'}
                    </p>
                </div>
                  
                {scanResult.guest && (
                    <div className="p-6 bg-black/60 space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                              <User size={24} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="text-lg font-bold text-white truncate">{scanResult.guest.firstName} {scanResult.guest.lastName}</p>
                              <p className="text-sm text-gray-400 truncate font-mono">@{scanResult.guest.instagram}</p>
                          </div>
                      </div>
                      
                      {/* Dettagli Extra se servono */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white/5 p-2 rounded-lg">
                              <p className="text-[9px] text-gray-500 uppercase">Lista</p>
                              <p className="text-xs font-bold text-white">{scanResult.guest.invitedBy ? scanResult.guest.invitedBy : 'Standard'}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                              <p className="text-[9px] text-gray-500 uppercase">Orario</p>
                              <p className="text-xs font-bold text-white">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                      </div>
                    </div>
                )}

                <div className="p-4 bg-black/80 border-t border-white/5">
                  <Button onClick={resetScan} className="w-full h-12 text-sm" variant="secondary">
                    <RefreshCcw className="w-4 h-4 mr-2" /> PROSSIMA SCANSIONE
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