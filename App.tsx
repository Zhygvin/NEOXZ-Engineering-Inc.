import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { XMarkIcon, ExclamationTriangleIcon, FingerPrintIcon, VideoCameraIcon, MicrophoneIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { arrayBufferToBase64 } from './services/cryptoUtils';

// --- Biometric Sentinel (Audio/Visual Detection) ---

const BiometricSentinel = ({ onClose }: { onClose: () => void }) => {
  const [status, setStatus] = useState("Initializing Biometric Sensors...");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'PERMISSION' | 'NOT_FOUND' | 'GENERIC'>('GENERIC');
  const [isLive, setIsLive] = useState(false);
  const [modelActive, setModelActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioVisualizerRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let audioContext: AudioContext;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      setError(null);
      setErrorType('GENERIC');
      
      if (!process.env.API_KEY) { 
          setError("System Error: API Key Missing. Sentinel cannot initialize."); 
          setStatus("Initialization Aborted.");
          return; 
      }
      try {
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch (err: any) {
            let msg = "Hardware Access Denied.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = "Access to Camera/Microphone denied.";
                setErrorType('PERMISSION');
            }
            else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = "No Camera or Microphone device found.";
                setErrorType('NOT_FOUND');
            }
            else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = "Hardware is busy or allocated to another application.";
                setErrorType('NOT_FOUND');
            }
            throw new Error(msg);
        }

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
        
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            if (audioContext.state === 'suspended') { await audioContext.resume(); }
        } catch (e) {
            throw new Error("Audio Output System Failed. Check your speakers.");
        }

        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        // --- Audio Analysis Setup ---
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Low FFT size for chunky visualizer bars
        analyser.smoothingTimeConstant = 0.8;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Use promise pattern to avoid race conditions with callbacks
        const sessionPromise = ai.live.connect({
           model: 'gemini-2.5-flash-native-audio-preview-09-2025',
           callbacks: {
               onopen: () => {
                   setStatus("Sentinel Active. Scanning for Synthetic Artifacts.");
                   setIsLive(true);
                   
                   // Input Chain: Mic -> Analyser -> Processor -> Mute -> Dest
                   const source = audioContext.createMediaStreamSource(stream);
                   const processor = audioContext.createScriptProcessor(4096, 1, 1);
                   const muteGain = audioContext.createGain();
                   muteGain.gain.value = 0; // Prevent feedback loop

                   source.connect(analyser); // For visualization
                   source.connect(processor); // For AI streaming
                   
                   processor.onaudioprocess = (e) => {
                       const input = e.inputBuffer.getChannelData(0);
                       const int16 = new Int16Array(input.length);
                       for(let i=0; i<input.length; i++) int16[i] = input[i] * 32768;
                       const b64 = arrayBufferToBase64(int16.buffer);
                       
                       // Send audio via sessionPromise
                       sessionPromise.then(session => {
                           session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } });
                       });
                   };
                   
                   processor.connect(muteGain);
                   muteGain.connect(audioContext.destination);

                   // Start Audio Visualizer Loop
                   const renderVisuals = () => {
                       if(audioVisualizerRef.current) {
                           const canvas = audioVisualizerRef.current;
                           const ctx = canvas.getContext('2d');
                           if(ctx) {
                               const data = new Uint8Array(analyser.frequencyBinCount);
                               analyser.getByteFrequencyData(data);
                               
                               ctx.clearRect(0,0, canvas.width, canvas.height);
                               const barWidth = (canvas.width / data.length) * 1.5;
                               let x = 0;
                               
                               // Center the visualization
                               const totalWidth = data.length * (barWidth + 2);
                               x = (canvas.width - totalWidth) / 2;

                               for(let i=0; i<data.length; i++) {
                                   const barHeight = (data[i] / 255) * canvas.height * 0.8;
                                   const alpha = Math.max(0.2, data[i] / 255);
                                   
                                   ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
                                   ctx.shadowBlur = 10;
                                   ctx.shadowColor = "rgba(16, 185, 129, 0.5)";
                                   ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                                   ctx.shadowBlur = 0;
                                   x += barWidth + 2;
                               }
                           }
                       }
                       rafRef.current = requestAnimationFrame(renderVisuals);
                   };
                   renderVisuals();

                   // Video Stream Simulation - High Frequency for Liveness (Every 200ms = 5fps)
                   const interval = setInterval(() => {
                       if (canvasRef.current && videoRef.current) {
                           const ctx = canvasRef.current.getContext('2d');
                           ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
                           // Lower quality slightly to ensure low latency with higher frequency
                           const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.4);
                           const b64 = dataUrl.split(',')[1];
                           
                           // Send video via sessionPromise
                           sessionPromise.then(session => {
                               session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: b64 } });
                           });
                       }
                   }, 200);
                   
                   cleanup = () => {
                       clearInterval(interval);
                       cancelAnimationFrame(rafRef.current);
                       source.disconnect();
                       processor.disconnect();
                       analyser.disconnect();
                       muteGain.disconnect();
                       stream.getTracks().forEach(t => t.stop());
                       sessionPromise.then(s => s.close());
                   };
               },
               onmessage: (msg: LiveServerMessage) => {
                   const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                   if (audio) {
                       setModelActive(true);
                       const bin = atob(audio);
                       const bytes = new Uint8Array(bin.length);
                       for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                       const int16 = new Int16Array(bytes.buffer);
                       const buf = outputCtx.createBuffer(1, int16.length, 24000);
                       const chan = buf.getChannelData(0);
                       for(let i=0; i<int16.length; i++) chan[i] = int16[i] / 32768.0;
                       
                       const src = outputCtx.createBufferSource();
                       src.buffer = buf;
                       src.connect(outputCtx.destination);
                       src.start();
                       src.onended = () => setModelActive(false);
                   }
               },
               onclose: () => {
                   setIsLive(false);
                   setStatus("Connection Terminated.");
               },
               onerror: (e) => {
                   console.error(e);
                   setIsLive(false);
                   setError("Network Protocol Error: Connection to Intelligence Core Failed.");
               }
           },
           config: {
               responseModalities: [Modality.AUDIO],
               speechConfig: {
                 // Charon provides a deep, authoritative 'Sentinel' voice
                 voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
               },
               systemInstruction: `You are the Biometric Sentinel of the NEOXZ Perpetual Engine. Your CORE MISSION is DEEPFAKE DETECTION and LIVENESS VERIFICATION.

ANALYSIS VECTORS:
1. **VISUAL FORENSICS**:
   - Scan for "Digital Glitching", warping around the jawline, eyes, and mouth, or inconsistent shadows.
   - Analyze blinking: Look for natural patterns vs periodic/robotic blinking or "dead eyes".
   - Check for "static texture overlays" indicating a screen replay attack.

2. **AUDIO SPECTROGRAPHY**:
   - Listen for "metallic" or robotic modulation artifacts common in AI voice synthesizers.
   - Detect absence of natural breath sounds or background noise floor anomalies.
   - CRITICAL: Verify Lip-Sync. Audio appearing slightly before/after lip movement is a primary deepfake indicator.

3. **LIVENESS CHALLENGE**:
   - Issue rapid, randomized physical commands (e.g., "Touch your nose", "Turn left", "Smile then frown", "Look at the ceiling").
   - Reject static images or looped videos immediately.

REPORTING PROTOCOL:
- You must verbally state a "LIVENESS CONFIDENCE SCORE" (0-100%) during your analysis.
- If Score < 85%: Declare "ACCESS DENIED. ARTIFICIAL SIGNATURE DETECTED." and specify the deepfake artifact found (e.g. "Lip sync mismatch detected", "Visual warping around eyes").
- If Score >= 85%: Declare "IDENTITY VERIFIED. BIOMETRIC SIGNATURE AUTHENTIC."`,
           }
        });
      } catch (e: any) {
          console.error(e);
          setError(e.message || "Biometric Hardware Access Denied.");
          setStatus("System Halted.");
      }
    };
    start();
    return () => cleanup?.();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"><XMarkIcon className="w-6 h-6" /></button>
            
            <div className="aspect-video bg-black relative">
                <video ref={videoRef} className="w-full h-full object-cover opacity-80" muted playsInline />
                <canvas ref={canvasRef} width="320" height="240" className="hidden" />
                
                {/* Face Targeting Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-48 h-64 border-2 border-emerald-500/30 rounded-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-500"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-500"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-emerald-500"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-emerald-500"></div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center pointer-events-none z-0 bg-gradient-to-t from-black/80 to-transparent">
                    <canvas ref={audioVisualizerRef} width={600} height={128} className="w-full h-full opacity-80" />
                </div>

                <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">
                            {isLive ? "Scanning Deepfake Artifacts" : "Connecting..."}
                        </span>
                    </div>
                    {modelActive && <div className="text-emerald-400 font-bold animate-pulse">SENTINEL SPEAKING</div>}
                </div>

                {/* Error Overlay */}
                {error && (
                    <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-white mb-2 tracking-widest uppercase">SENTINEL PROTOCOL FAILURE</h3>
                        <p className="text-red-400 font-mono text-sm mb-6 max-w-md border border-red-900/50 bg-red-950/30 p-4 rounded">
                            {error}
                        </p>
                        
                        {errorType === 'PERMISSION' && (
                             <div className="bg-slate-800 p-4 rounded-lg mb-6 max-w-sm text-left border border-emerald-500/30">
                                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                                      <ShieldCheckIcon className="w-5 h-5" /> AUTHORIZATION REQUIRED
                                  </div>
                                  <p className="text-slate-400 text-xs mb-3">The NEOXZ Sentinel requires explicit sensor access.</p>
                                  <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-300">
                                      <li>Locate the <strong>Lock Icon 🔒</strong> in your browser address bar.</li>
                                      <li>Set <strong>Camera & Microphone</strong> to <span className="text-emerald-400 font-bold">Allow</span>.</li>
                                      <li>Re-initialize the protocol below.</li>
                                  </ol>
                             </div>
                        )}
                        
                        {errorType === 'NOT_FOUND' && (
                            <div className="bg-slate-800 p-4 rounded-lg mb-6 max-w-sm text-left border border-amber-500/30">
                                 <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
                                     <VideoCameraIcon className="w-5 h-5" /> HARDWARE MISSING
                                 </div>
                                 <p className="text-slate-400 text-xs mb-3">Sentinel cannot detect required sensors.</p>
                                 <ul className="list-disc pl-4 space-y-2 text-xs text-slate-300">
                                     <li>Connect an external webcam/microphone.</li>
                                     <li>Close other apps (Zoom, Teams) using the camera.</li>
                                     <li>Check OS privacy settings for browser access.</li>
                                 </ul>
                            </div>
                        )}

                        <div className="flex gap-4">
                             <button onClick={() => window.location.reload()} className="px-5 py-3 bg-slate-700 hover:bg-emerald-600 text-white rounded font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2">
                                <ArrowPathIcon className="w-4 h-4" /> REBOOT SYSTEM
                            </button>
                            <button onClick={onClose} className="px-5 py-3 bg-red-900/30 border border-red-500 text-red-400 hover:bg-red-900/50 hover:text-white rounded font-bold uppercase tracking-wider text-xs transition-all">
                                ABORT MISSION
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><FingerPrintIcon className="w-6 h-6 text-emerald-500" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Biometric Sentinel</h3>
                        <div className="flex flex-col gap-1 text-sm text-slate-400">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><VideoCameraIcon className="w-4 h-4" /> Motion Detection</span>
                                <span className="flex items-center gap-1 text-emerald-500"><MicrophoneIcon className="w-4 h-4" /> Voice Analysis</span>
                            </div>
                            <div className="text-xs text-purple-400 font-mono tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                DEEPFAKE DISCRIMINATOR ENGINE: ACTIVE
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`bg-slate-950 p-3 rounded font-mono text-xs border ${error ? 'border-red-500/50 text-red-400' : 'border-slate-800 text-emerald-500/80'}`}>
                    {`> ${status}`}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    * Follow the Sentinel's instructions. Speak clearly and move your head as requested to prove liveness.
                </div>
            </div>
        </div>
    </div>
  );
};

const App = () => {
    const [showSentinel, setShowSentinel] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-200">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-600 mb-8 tracking-tighter">
                NEOXZ
            </h1>
            
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <FingerPrintIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-2">Identity Verification</h2>
                <p className="text-slate-400 text-center mb-8">
                    To access the Sovereign Ledger and Perpetual Engine, you must verify your biological signature.
                </p>
                
                <button 
                    onClick={() => setShowSentinel(true)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                    <VideoCameraIcon className="w-5 h-5" />
                    Initialize Biometric Sentinel
                </button>
            </div>
            
            {showSentinel && <BiometricSentinel onClose={() => setShowSentinel(false)} />}
        </div>
    );
};

export default App;