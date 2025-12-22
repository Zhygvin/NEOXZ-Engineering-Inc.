import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { 
    XMarkIcon, ExclamationTriangleIcon, FingerPrintIcon, VideoCameraIcon, 
    MicrophoneIcon, ShieldCheckIcon, ArrowPathIcon, CubeTransparentIcon, 
    DocumentCheckIcon, LockClosedIcon, GlobeAltIcon, SparklesIcon,
    CreditCardIcon, WifiIcon, CommandLineIcon, PowerIcon,
    BuildingOfficeIcon, UserGroupIcon, KeyIcon, StopCircleIcon, CheckCircleIcon,
    ChartBarIcon, SignalIcon, BeakerIcon, ScaleIcon, IdentificationIcon,
    AcademicCapIcon, MagnifyingGlassIcon, BugAntIcon, NewspaperIcon,
    PresentationChartLineIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
    UserIcon, BoltIcon, FireIcon, StarIcon, HeartIcon, Cog6ToothIcon, ShieldExclamationIcon,
    EyeSlashIcon, LifebuoyIcon, SunIcon, MoonIcon,
    PhotoIcon, ChatBubbleLeftRightIcon, CpuChipIcon
} from '@heroicons/react/24/outline';
import { arrayBufferToBase64, sha256 } from './services/cryptoUtils';
import { ledgerService } from './services/ledgerService';
import { 
    discoverDigitalFootprint,
    auditEntityAccountability,
    performSecurityScan,
    generateSovereignCertificate,
    generateBreachDossier,
    analyzeWebResource,
    WebAnalysisResult,
    fastResponse,
    complexThink,
    generateSovereignImage,
    generateSovereignVideo
} from './services/aiService';
import { reportToAuthority } from './services/authorityService';
import { LedgerBlock, ConnectedAccount, AccountabilityReport, SecurityScanResult } from './types';

// --- THEME UTILS ---

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
};

// --- DEPLOYMENT SEAL COMPONENT ---

const DeploymentSeal = () => (
    <div className="flex flex-col items-center justify-center p-3 border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg backdrop-blur-md animate-pulse">
        <ShieldCheckIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-1" />
        <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Sovereignty Sealed</div>
        <div className="text-[8px] font-mono text-emerald-700 dark:text-emerald-600">v4.2.1 / PRODUCTION LIVE</div>
    </div>
);

// --- NEURAL THINKER APP ---

const NeuralThinkerApp = ({ onClose }: { onClose: () => void }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const handleAction = async (mode: 'FAST' | 'DEEP') => {
        if (!prompt.trim() && !image) return;
        setLoading(true);
        try {
            if (mode === 'FAST') {
                const res = await fastResponse(prompt);
                setResponse(res);
            } else {
                const res = await complexThink(prompt, image?.split(',')[1]);
                setResponse(res);
            }
        } catch (e) {
            console.error(e);
            setResponse("Error: Forensic uplink interrupted.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-full flex flex-col font-mono bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
                    <CpuChipIcon className="w-4 h-4" /> Neural Thinker v1.0
                </div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:hover:text-white" /></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs dark:text-slate-200 outline-none focus:ring-2 ring-indigo-500/50"
                            placeholder="Identify pattern or request complex reasoning..."
                        />
                        <div className="flex flex-wrap gap-4 items-center">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                <PhotoIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Attach Evidence</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            {image && <div className="text-[8px] text-emerald-500 font-bold uppercase">Image Loaded</div>}
                            <div className="flex-1"></div>
                            <button onClick={() => handleAction('FAST')} disabled={loading} className="px-6 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                <BoltIcon className="w-3 h-3 inline mr-1" /> Fast Respond
                            </button>
                            <button onClick={() => handleAction('DEEP')} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-900/20">
                                <SparklesIcon className="w-3 h-3 inline mr-1" /> Deep Thinking
                            </button>
                        </div>
                    </div>
                    {loading && (
                        <div className="flex flex-col items-center py-12 space-y-4">
                            <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin" />
                            <div className="text-[10px] text-slate-500 uppercase animate-pulse">Engaging Neural Enclave...</div>
                        </div>
                    )}
                    {response && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-fadeIn">
                            <div className="text-[8px] text-slate-500 uppercase mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Analysis Output</div>
                            <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{response}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MEDIA FACTORY APP ---

const MediaFactoryApp = ({ onClose }: { onClose: () => void }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [status, setStatus] = useState('');

    const generate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setStatus(mediaType === 'IMAGE' ? 'Synthesizing Visuals...' : 'Rendering Kinetic Frames (Veo 3)...');
        try {
            if (mediaType === 'IMAGE') {
                const url = await generateSovereignImage(prompt, aspectRatio);
                setOutput(url);
            } else {
                const url = await generateSovereignVideo(prompt, aspectRatio as any);
                setOutput(url);
            }
        } catch (e) {
            console.error(e);
            setStatus("Error: Generation pipeline severed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-widest text-[10px]">
                    <SparklesIcon className="w-4 h-4" /> Media Factory v1.0
                </div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-black dark:hover:text-white" /></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Generation Type</label>
                        <div className="flex gap-2">
                            <button onClick={() => setMediaType('IMAGE')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${mediaType === 'IMAGE' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Image</button>
                            <button onClick={() => setMediaType('VIDEO')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${mediaType === 'VIDEO' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Video</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9'].map(r => (
                                <button key={r} onClick={() => setAspectRatio(r)} className={`py-1 text-[9px] font-mono border rounded transition-all ${aspectRatio === r ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Creative Prompt</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500" placeholder="Describe your sovereign vision..." />
                    </div>
                    <button onClick={generate} disabled={loading || !prompt.trim()} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition-all disabled:opacity-50">{loading ? 'Synthesizing...' : 'Ignite Engine'}</button>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-black/40 p-12 flex flex-col items-center justify-center relative">
                    {loading ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase animate-pulse">{status}</div>
                        </div>
                    ) : output ? (
                        <div className="max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group relative">
                            {mediaType === 'IMAGE' ? <img src={output} className="max-h-[70vh] object-contain" alt="Generated" /> : <video src={output} controls className="max-h-[70vh] object-contain" autoPlay loop />}
                            <button onClick={() => setOutput(null)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="text-center opacity-20"><SparklesIcon className="w-24 h-24 mx-auto mb-4" /><div className="text-sm font-black uppercase tracking-widest">Awaiting Visualization</div></div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- WEB GUARDIAN SHIELD APP ---

const WebGuardianApp = ({ onClose }: { onClose: () => void }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WebAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const res = await analyzeWebResource(input);
            setResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    <ShieldCheckIcon className="w-4 h-4" /> Cognitive Web Guardian v1.0
                </div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-black dark:hover:text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center space-y-2">
                        <EyeSlashIcon className="w-12 h-12 text-indigo-500 mx-auto" />
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Fraud & Misdirection Shield</h2>
                        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Identify Malicious Intent, Phishing, and Deceptive Claims.</p>
                    </div>
                    <div className="space-y-4">
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter URL or Suspicious Content..." className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-sm focus:border-indigo-500 outline-none transition-all" />
                        <button onClick={handleAnalyze} disabled={loading || !input.trim()} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Execute Intent Analysis'}
                        </button>
                    </div>
                    {result && (
                        <div className={`p-8 rounded-3xl border animate-fadeIn ${result.isMalicious ? 'bg-red-50 dark:bg-red-950/20 border-red-500/50' : 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-500/30'}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${result.isMalicious ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {result.isMalicious ? <ExclamationTriangleIcon className="w-8 h-8" /> : <ShieldCheckIcon className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black uppercase tracking-widest ${result.isMalicious ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {result.threatLevel} Threat Detected
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {result.threatTypes.map(t => <span key={t} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[8px] font-black uppercase">{t}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500 uppercase font-black">Misdirection</div>
                                    <div className={`text-3xl font-black ${result.misdirectionScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>{result.misdirectionScore}%</div>
                                </div>
                            </div>
                            <div className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/40 p-6 rounded-2xl border border-white/5">
                                <p className="mb-4">{result.analysis}</p>
                                <div className={`pt-4 border-t border-slate-200 dark:border-white/10 font-bold ${result.isMalicious ? 'text-red-500' : 'text-emerald-500'}`}>VERDICT: {result.verdict}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SOVEREIGN MARKET APP ---

const SovereignMarketApp = ({ onClose }: { onClose: () => void }) => {
    const [assets, setAssets] = useState<any[]>([
        { id: '1', ticker: 'NXZ', name: 'NEOXZ Core', price: 1420.69, change: 4.2, marketCap: '4.21T', peRatio: 24.5, volume: '840M', volatility: 'MEDIUM', history: [1410, 1415, 1408, 1420, 1422, 1420] },
        { id: '2', ticker: 'PPE', name: 'Perpetual Engine A', price: 882.10, change: -1.2, marketCap: '1.10T', peRatio: 18.2, volume: '320M', volatility: 'LOW', history: [890, 888, 885, 880, 882, 882] },
        { id: '3', ticker: 'NBR', name: 'NE.B.RU Ventures', price: 339.10, change: 2.4, marketCap: '142B', peRatio: 31.8, volume: '95M', volatility: 'MEDIUM', history: [330, 335, 332, 338, 340, 339] },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAssets(prev => prev.map(a => {
                const move = (Math.random() - 0.5) * 5;
                const newPrice = a.price + move;
                return { ...a, price: newPrice, change: a.change + (move / a.price) * 10, history: [...a.history.slice(1), newPrice] };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col font-sans bg-slate-950">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center text-cyan-400">
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><PresentationChartLineIcon className="w-4 h-4" /> Sovereign Exchange</div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                    <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div><div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{asset.ticker}</div><h3 className="text-white font-bold">{asset.name}</h3></div>
                            <div className={`text-xs font-bold ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</div>
                        </div>
                        <div className="text-2xl font-black text-white font-mono mb-4">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800 text-[10px] text-slate-400 uppercase font-black">
                            <div>Cap: {asset.marketCap}</div><div className="text-right">Vol: {asset.volume}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BOOT SEQUENCE ---

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => { const timer = setTimeout(onComplete, 2500); return () => clearTimeout(timer); }, [onComplete]);
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono p-4">
            <div className="w-64 space-y-4">
                <div className="flex justify-between text-[10px] text-emerald-500 font-bold uppercase"><span>NEOXZ_BOOT_PROTOCOL</span><span className="animate-pulse">RUNNING...</span></div>
                <div className="h-1 w-full bg-slate-900 overflow-hidden rounded-full border border-emerald-500/20"><div className="h-full bg-emerald-500 animate-[scan_2s_ease-in-out_infinite]"></div></div>
                <div className="text-[8px] text-slate-500 uppercase space-y-1 animate-fadeIn"><div>Initializing kernel modules...</div><div className="[animation-delay:200ms]">Mounting sovereign ledger...</div><div className="[animation-delay:400ms]">Establishing authority handshake...</div></div>
            </div>
        </div>
    );
};

// --- AUTH MODALS ---

const BiometricSentinel = ({ onClose, onVerified }: { onClose: () => void, onVerified: () => void }) => {
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS'>('IDLE');
    const startScan = () => { setStatus('SCANNING'); setTimeout(() => { setStatus('SUCCESS'); setTimeout(onVerified, 1000); }, 2000); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-8 text-center shadow-2xl">
                <div className="relative w-48 h-48 mx-auto mb-8 border-4 border-emerald-500/20 rounded-full flex items-center justify-center overflow-hidden">
                    <VideoCameraIcon className="w-20 h-20 text-emerald-500/50" />
                    {status === 'SCANNING' && <div className="absolute inset-0 bg-emerald-500/20 animate-[scan_1.5s_linear_infinite] border-t border-emerald-400"></div>}
                </div>
                <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-8">AI-SENTINEL BIOMETRIC UPLINK</h3>
                {status === 'IDLE' ? <button onClick={startScan} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Begin Scan</button> : <div className="text-emerald-500 text-xs font-mono animate-pulse uppercase">Analyzing facial patterns...</div>}
                <button onClick={onClose} className="mt-4 text-slate-500 text-[10px] uppercase hover:text-red-500">Abort</button>
            </div>
        </div>
    );
};

const ResponsibilityModal = ({ onAccept }: { onAccept: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6"><ScaleIcon className="w-10 h-10 text-amber-500" /><h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Sovereign Accountability</h2></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono space-y-4 leading-relaxed overflow-y-auto max-h-64 pr-2">
                    <p>By entering, you acknowledge all digital signatures within are legally binding under the NEOXZ PERPETUAL ENGINE PROTOCOL.</p>
                    <p>You assume full liability for actions using your profile. Any sabotage will be reported to Authority NE.B.RU.</p>
                    <p>This system utilizes advanced AI auditing to detect misdirection, fraud, and scamming intent. Identity theft is strictly prohibited.</p>
                </div>
                <button onClick={onAccept} className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Accept Full Accountability</button>
            </div>
        </div>
    );
};

// --- WORKSTATION DESKTOP ---

const WorkstationDesktop = ({ onLogout }: { onLogout: () => void }) => {
    const [ledgerChain, setLedgerChain] = useState<LedgerBlock[]>([]);
    const [openApp, setOpenApp] = useState<string | null>(null);
    const { isDark, toggle } = useTheme();

    useEffect(() => { 
        setLedgerChain(ledgerService.getChain());
        const interval = setInterval(() => setLedgerChain(ledgerService.getChain()), 2000);
        return () => clearInterval(interval);
    }, []);
    
    const renderWindow = () => {
        if (!openApp) return null;
        return (
            <div className="fixed inset-4 md:inset-10 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col animate-fadeIn overflow-hidden">
                {openApp === 'guardian' && <WebGuardianApp onClose={() => setOpenApp(null)} />}
                {openApp === 'thinker' && <NeuralThinkerApp onClose={() => setOpenApp(null)} />}
                {openApp === 'media' && <MediaFactoryApp onClose={() => setOpenApp(null)} />}
                {openApp === 'sax' && <SovereignMarketApp onClose={() => setOpenApp(null)} />}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-rose-500/5 pointer-events-none"></div>
            
            {/* Top Bar */}
            <div className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 shadow-sm">
                <div className="flex items-center gap-6 text-[10px] font-mono font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><CpuChipIcon className="w-4 h-4 text-emerald-500" /> NEOXZ OS v4.2.1</span>
                    <span className="hidden md:flex items-center gap-2 text-emerald-600 animate-pulse"><SignalIcon className="w-3 h-3" /> Integrity: 100%</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggle} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{isDark ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-500" />}</button>
                    <span className="text-[10px] font-mono opacity-50">{new Date().toLocaleTimeString()}</span>
                    <button onClick={onLogout} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors"><PowerIcon className="w-4 h-4" /></button>
                </div>
            </div>
            
            {/* Desktop Icons */}
            <div className="p-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
                {[
                    { id: 'thinker', label: 'Thinker', icon: CpuChipIcon, color: 'text-indigo-500' },
                    { id: 'guardian', label: 'WebGuard', icon: ShieldCheckIcon, color: 'text-emerald-500' },
                    { id: 'media', label: 'Factory', icon: SparklesIcon, color: 'text-rose-500' },
                    { id: 'sax', label: 'Exchange', icon: PresentationChartLineIcon, color: 'text-cyan-500' },
                ].map(app => (
                    <button key={app.id} onClick={() => setOpenApp(app.id)} className="group flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all shadow-lg shadow-black/5 group-hover:border-${app.color.split('-')[1]}-500/50`}>
                            <app.icon className={`w-8 h-8 ${app.color}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{app.label}</span>
                    </button>
                ))}
            </div>

            <div className="fixed bottom-8 right-8 z-20"><DeploymentSeal /></div>
            {renderWindow()}
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
    const [systemState, setSystemState] = useState<'BOOT' | 'LOCKED' | 'DESKTOP'>('BOOT');
    const [showLoginModal, setShowLoginModal] = useState<'SENTINEL' | 'BADGE' | 'THUMB' | null>(null);
    const [showLiabilityModal, setShowLiabilityModal] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.aistudio?.hasSelectedApiKey) {
            window.aistudio.hasSelectedApiKey().then(setHasApiKey);
        } else {
            setHasApiKey(true); // Fallback for local testing
        }
    }, []);

    const handleLoginSuccess = () => { setShowLoginModal(null); setShowLiabilityModal(true); };
    const handleLiabilityAccepted = () => { setSystemState('DESKTOP'); setShowLiabilityModal(false); };
    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio?.openSelectKey) { await window.aistudio.openSelectKey(); setHasApiKey(true); }
    };

    if (systemState === 'BOOT') return <BootSequence onComplete={() => setSystemState('LOCKED')} />;
    if (systemState === 'DESKTOP') return <WorkstationDesktop onLogout={() => setSystemState('LOCKED')} />;

    if (!hasApiKey) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
                <DeploymentSeal />
                <h1 className="text-3xl font-black mt-8 mb-4 tracking-tighter uppercase text-slate-900 dark:text-white">Uplink Authentication Required</h1>
                <p className="text-slate-500 text-center max-w-sm mb-12 text-sm leading-relaxed">Access to the Sovereign Realm requires a valid Cyber Authority API key. Please authenticate via Google Cloud.</p>
                <button onClick={handleSelectKey} className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full transition-all shadow-xl shadow-indigo-900/20 hover:scale-105 uppercase tracking-widest text-xs">Authorize Cyber Key</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"></div>
            <div className="z-10 text-center max-w-md w-full animate-fadeIn">
                <div className="mb-12">
                    <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl mx-auto flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform">
                        <LockClosedIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase">SignaSovereign</h1>
                    <p className="text-emerald-500 text-[10px] mt-4 font-mono font-bold tracking-[0.4em] uppercase opacity-80">v4.2.1 PRODUCTION READY</p>
                </div>
                <div className="space-y-4 bg-white/50 dark:bg-slate-900/60 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                    <button onClick={() => setShowLoginModal('SENTINEL')} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/10">
                        <VideoCameraIcon className="w-5 h-5" /> Sentinel Verification
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowLoginModal('BADGE')} className="py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2"><CreditCardIcon className="w-6 h-6" /><span className="text-[10px] uppercase font-black">Badge</span></button>
                        <button onClick={() => setShowLoginModal('THUMB')} className="py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2"><FingerPrintIcon className="w-6 h-6" /><span className="text-[10px] uppercase font-black">Touch</span></button>
                    </div>
                    <div className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-800"><DeploymentSeal /></div>
                </div>
            </div>
            {showLoginModal === 'SENTINEL' && <BiometricSentinel onClose={() => setShowLoginModal(null)} onVerified={handleLoginSuccess}/>}
            {showLoginModal === 'BADGE' && <SignaSovereignBadge onClose={() => setShowLoginModal(null)} onVerified={handleLoginSuccess}/>}
            {showLoginModal === 'THUMB' && <ThumbPrintScanner onClose={() => setShowLoginModal(null)} onVerified={handleLoginSuccess}/>}
            {showLiabilityModal && <ResponsibilityModal onAccept={handleLiabilityAccepted}/>}
            <style>{`
                @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default App;
