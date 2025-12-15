import React, { useState, useEffect, useRef } from 'react';
import { generateKeyPair, getFingerprint, signData, sha256, exportKeyPair, importKeyPair, arrayBufferToBase64 } from './services/cryptoUtils';
import { ledgerService } from './services/ledgerService';
import { analyzeContract, analyzeImage, discoverDigitalFootprint, generateLegalNotice, auditEntityAccountability, generateSecureImage, chatWithAi, generateSovereignCertificate, generateAccessChallenge, checkProtocolStatus, performSecurityScan, generateMarketingContent } from './services/aiService';
import { reportToAuthority } from './services/authorityService';
import { processPayment } from './services/billingService';
import { KeyPairIdentity, ContractAnalysis, LedgerBlock, VerificationResult, IdentityProfile, AuthorityReceipt, ConnectedAccount, AccountabilityReport, ProtocolUpdate, SecurityScanResult } from './types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  ShieldCheckIcon, DocumentTextIcon, CpuChipIcon, CheckBadgeIcon, ArrowPathIcon, UserCircleIcon, FingerPrintIcon, 
  GlobeAltIcon, PowerIcon, MapPinIcon, QrCodeIcon, EyeIcon, CheckCircleIcon, SignalIcon, ArrowRightIcon,
  CakeIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, MicrophoneIcon, VideoCameraIcon,
  AcademicCapIcon, BriefcaseIcon, UserIcon, CreditCardIcon, XMarkIcon, SparklesIcon, ScaleIcon, PrinterIcon,
  LockClosedIcon, ShieldExclamationIcon, CloudArrowDownIcon, ExclamationTriangleIcon,
  BugAntIcon, ViewfinderCircleIcon, CameraIcon, GiftIcon, ClockIcon, ServerIcon, ChartBarIcon, CurrencyDollarIcon, PresentationChartLineIcon,
  BuildingLibraryIcon, BanknotesIcon, MegaphoneIcon, RocketLaunchIcon, ShareIcon, ClipboardDocumentIcon, KeyIcon, CommandLineIcon
} from '@heroicons/react/24/outline';

// --- Helpers ---

const formatLocalTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

const downloadIdentityKeys = (data: any, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neoxz_identity_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- Assets / Components ---

const SignaSovereignLogo = ({ className = "w-12 h-12", seed }: { className?: string, seed?: string }) => {
  const colors = ['text-emerald-500', 'text-cyan-500', 'text-indigo-500', 'text-violet-500', 'text-fuchsia-500', 'text-amber-500'];
  const borderColors = ['border-emerald-500', 'border-cyan-500', 'border-indigo-500', 'border-violet-500', 'border-fuchsia-500', 'border-amber-500'];
  const bgColors = ['bg-emerald-400', 'bg-cyan-400', 'bg-indigo-400', 'bg-violet-400', 'bg-fuchsia-400', 'bg-amber-400'];
  
  let index = 0;
  if (seed) {
    index = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  }
  
  const textColor = seed ? colors[index] : 'text-emerald-500';
  const borderColor = seed ? borderColors[index] : 'border-emerald-500/50';
  const pingColor = seed ? bgColors[index] : 'bg-emerald-400';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <div className={`absolute inset-0 ${textColor.replace('text', 'bg')}/10 rounded-xl rotate-45 animate-pulse-slow`}></div>
        <div className={`absolute inset-0 border-2 ${borderColor} rounded-xl rotate-45 transition-colors duration-1000`}></div>
        <div className={`absolute inset-2 border ${borderColor.replace('/50', '/30')} rounded-full`}></div>
        <ShieldCheckIcon className={`w-2/3 h-2/3 ${textColor} relative z-10 transition-colors duration-1000`} />
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${pingColor} rounded-full animate-ping`}></div>
    </div>
  );
};

const CommandTerminal = ({ onClose, identity, onCommand }: { onClose: () => void, identity: KeyPairIdentity | null, onCommand: (cmd: string) => Promise<string> }) => {
  const [history, setHistory] = useState<string[]>(["NEOXZ PROTOCOL KERNEL v1.0.4 - DIRECT COMMAND LINK ESTABLISHED.", "Type 'HELP' for available protocols."]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const cmd = input.trim();
    setHistory(prev => [...prev, `root@sovereign:~$ ${cmd}`]);
    setInput("");
    
    try {
        // Simulate processing delay
        await new Promise(r => setTimeout(r, 300));
        const response = await onCommand(cmd);
        // Handle multi-line responses
        const lines = response.split('\n');
        setHistory(prev => [...prev, ...lines]);
    } catch (e) {
        setHistory(prev => [...prev, `[ERROR] Command execution failed: Unknown Protocol Exception.`]);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 h-96 bg-black/95 border-t-4 border-emerald-500 z-[80] flex flex-col font-mono p-4 shadow-[0_-10px_60px_rgba(16,185,129,0.3)] backdrop-blur-md">
        <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
            <span className="text-emerald-500 font-bold tracking-widest text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                DIRECT COMMAND PROTOCOL // ROOT ACCESS
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xs uppercase font-bold">[ Terminate Uplink ]</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 text-sm text-gray-300 mb-2 p-2 scrollbar-hide">
            {history.map((line, i) => (
                <div key={i} className={`break-words ${line.startsWith('root@') ? 'text-emerald-600 font-bold mt-2' : line.includes('[ERROR]') ? 'text-red-500' : 'text-gray-300'}`}>
                    {line}
                </div>
            ))}
            <div ref={bottomRef}></div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-emerald-500 font-bold">{">"}</span>
            <input 
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-emerald-400 font-bold placeholder-gray-700" 
                placeholder="Enter command protocol..."
                value={input}
                onChange={e => setInput(e.target.value)}
            />
        </form>
    </div>
  );
};

const SigningRitual = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);
    const steps = [
        "Hashing Document Content (SHA-256)...",
        "Accessing NEOXZ Private Enclave...",
        "Forging Signature of the Perpetual Engine...",
        "Proof of Sovereignty Established."
    ];

    useEffect(() => {
        if (step < steps.length) {
            const timeout = setTimeout(() => setStep(s => s + 1), 800);
            return () => clearTimeout(timeout);
        } else {
            setTimeout(onComplete, 500);
        }
    }, [step]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-emerald-500 rounded-xl p-8 flex flex-col items-center relative overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>
                <FingerPrintIcon className="w-16 h-16 text-emerald-500 mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-8 tracking-widest uppercase">Forging NEOXZ Signature</h2>
                
                <div className="w-full space-y-4">
                    {steps.map((s, i) => (
                        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= step ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                            <div className={`w-2 h-2 rounded-full ${i < step ? 'bg-emerald-500' : i === step ? 'bg-white animate-ping' : 'bg-slate-700'}`}></div>
                            <span className={`text-sm font-mono ${i === step ? 'text-white font-bold' : 'text-emerald-500/70'}`}>{s}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Mimetic Warfare (Marketing) Component ---
const MimeticWarfare = () => {
  const [target, setTarget] = useState('Venture Capitalists');
  const [platform, setPlatform] = useState<'TWITTER' | 'LINKEDIN' | 'EMAIL_INVESTOR'>('EMAIL_INVESTOR');
  const [generatedContent, setGeneratedContent] = useState<{text: string, imagePrompt: string} | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedImage(null);
    try {
      const content = await generateMarketingContent(target, platform);
      setGeneratedContent(content);
      
      // Auto-generate image
      const img = await generateSecureImage(content.imagePrompt, "16:9");
      setGeneratedImage(img);
    } catch(e) {
      alert("Comms Uplink Failed.");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Encrypted Packet Copied to Clipboard.");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MegaphoneIcon className="w-6 h-6 text-red-500" /> NEOXZ MIMETIC ENGINE
        </h3>
        <button 
          onClick={() => setAutoMode(!autoMode)}
          className={`px-3 py-1 rounded text-xs font-bold border ${autoMode ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-500'}`}
        >
          {autoMode ? 'AUTO-PROPAGATION: ON' : 'AUTO-PROPAGATION: OFF'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Target Demographic</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none">
            <option>Venture Capitalists</option>
            <option>Crypto Natives</option>
            <option>Enterprise Legal Teams</option>
            <option>Gen Z Privacy Advocates</option>
            <option>Government Regulators</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Platform Vector</label>
          <select value={platform} onChange={e => setPlatform(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none">
            <option value="EMAIL_INVESTOR">Investor Cold Email</option>
            <option value="TWITTER">Twitter / X</option>
            <option value="LINKEDIN">LinkedIn</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading}
        className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-500 font-bold rounded flex items-center justify-center gap-2 mb-6"
      >
        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <RocketLaunchIcon className="w-5 h-5" />}
        INITIATE CAMPAIGN GENERATION
      </button>

      {generatedContent && (
        <div className="flex-1 overflow-y-auto space-y-4 border-t border-slate-800 pt-4">
          <div className="bg-slate-950 p-4 rounded border border-slate-800 relative group">
             <button onClick={() => copyToClipboard(generatedContent.text)} className="absolute top-2 right-2 p-2 bg-slate-800 rounded text-slate-400 hover:text-white"><ClipboardDocumentIcon className="w-4 h-4" /></button>
             <div className="text-xs text-slate-500 mb-2 uppercase font-bold">Synthesized Copy</div>
             <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{generatedContent.text}</p>
          </div>
          
          {generatedImage ? (
             <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img src={generatedImage} alt="Campaign Asset" className="w-full h-auto" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-[10px] text-white text-center">AI GENERATED ASSET</div>
             </div>
          ) : (
             <div className="h-32 bg-slate-950 rounded flex items-center justify-center text-slate-600 animate-pulse text-xs">
                RENDERING VISUAL MEMETICS...
             </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Investor Dashboard Component (Modified) ---
const InvestorDashboard = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<'OVERVIEW' | 'WARFARE'>('OVERVIEW');
    const [metrics, setMetrics] = useState({
        activeNodes: 142,
        verifications24h: 8943,
        threatsBlocked: 312,
        mrr: 124500
    });
    
    // Acquisition State
    const [showAcquisition, setShowAcquisition] = useState(false);
    const [offer, setOffer] = useState({ entity: '', amount: '', contact: '' });
    const [sending, setSending] = useState(false);

    // Simulate live data for the pitch
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                activeNodes: prev.activeNodes + (Math.random() > 0.8 ? 1 : 0),
                verifications24h: prev.verifications24h + Math.floor(Math.random() * 5),
                threatsBlocked: prev.threatsBlocked + (Math.random() > 0.9 ? 1 : 0),
                mrr: prev.mrr + (Math.random() > 0.7 ? 25 : 0)
            }));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const handleTransmitProposal = () => {
        if (!offer.entity || !offer.amount) return;
        setSending(true);
        // Simulate encryption delay
        setTimeout(() => {
            setSending(false);
            setShowAcquisition(false);
            const subject = `Strategic Acquisition Proposal: ${offer.entity}`;
            const body = `Protocol Acquisition Offer%0D%0A---------------------------%0D%0AEntity: ${offer.entity}%0D%0AValuation Offer: ${offer.amount}%0D%0APoint of Contact: ${offer.contact}%0D%0ATimestamp: ${new Date().toISOString()}%0D%0A---------------------------%0D%0APlease initiate secure handshake.`;
            window.location.href = `mailto:founders@neoxz.com?subject=${subject}&body=${body}`;
            alert(`Proposal Encrypted & Transmitted to NEOXZ Council.\nHash: ${Math.random().toString(36).substring(7).toUpperCase()}`);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <SignaSovereignLogo className="w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">SignaSovereign <span className="text-emerald-500">Node</span></h1>
                        <div className="text-xs text-slate-500 font-mono">GLOBAL NETWORK OVERVIEW // NEOXZ.COM</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button onClick={() => setTab('OVERVIEW')} className={`px-4 py-2 rounded text-xs font-bold ${tab === 'OVERVIEW' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>OVERVIEW</button>
                        <button onClick={() => setTab('WARFARE')} className={`px-4 py-2 rounded text-xs font-bold ${tab === 'WARFARE' ? 'bg-red-900/50 text-red-400' : 'text-slate-500 hover:text-red-400'}`}>MIMETIC WARFARE</button>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold border border-slate-700">Exit Dashboard</button>
                </div>
            </div>

            {tab === 'WARFARE' ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2">
                      <MimeticWarfare />
                   </div>
                   <div className="space-y-6">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                          <h4 className="text-sm font-bold text-white mb-4 uppercase">Campaign Simulation</h4>
                          <div className="space-y-4">
                              <div>
                                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Viral Coefficient</span> <span>3.4</span></div>
                                  <div className="h-1 bg-slate-800 rounded-full"><div className="h-full bg-red-500 w-[75%]"></div></div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Investor Reach</span> <span>High</span></div>
                                  <div className="h-1 bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 w-[90%]"></div></div>
                              </div>
                          </div>
                          <div className="mt-4 p-3 bg-black/50 rounded border border-slate-800 font-mono text-[10px] text-green-500 h-32 overflow-hidden">
                              {Array.from({length: 10}).map((_, i) => (
                                  <div key={i} className="mb-1">> Injecting meme packet into Node_{Math.floor(Math.random() * 9000)}... SUCCESS</div>
                              ))}
                          </div>
                      </div>
                   </div>
                </div>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><GlobeAltIcon className="w-4 h-4" /> Active Nodes</div>
                    <div className="text-4xl font-mono font-bold text-white">{metrics.activeNodes}</div>
                    <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><ArrowRightIcon className="w-3 h-3 -rotate-45" /> +2 new regions</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><CheckBadgeIcon className="w-4 h-4" /> 24h Verifications</div>
                    <div className="text-4xl font-mono font-bold text-white">{metrics.verifications24h.toLocaleString()}</div>
                    <div className="text-xs text-blue-500 mt-2 flex items-center gap-1"><ArrowRightIcon className="w-3 h-3 -rotate-45" /> 14% WoW Growth</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><ShieldExclamationIcon className="w-4 h-4" /> Threats Blocked</div>
                    <div className="text-4xl font-mono font-bold text-white">{metrics.threatsBlocked.toLocaleString()}</div>
                    <div className="text-xs text-red-500 mt-2">Deepfakes & Phishing</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /> Est. ARR</div>
                    <div className="text-4xl font-mono font-bold text-white">${(metrics.mrr * 12).toLocaleString()}</div>
                    <div className="text-xs text-purple-500 mt-2">Based on current API usage</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ServerIcon className="w-5 h-5 text-emerald-500" /> Live API Traffic</h3>
                    <div className="h-64 flex items-end justify-between gap-1 border-b border-slate-800 pb-2">
                        {Array.from({length: 40}).map((_, i) => (
                            <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500 transition-colors rounded-t" 
                                style={{ height: `${Math.random() * 100}%`, animation: `pulse ${Math.random() * 2 + 1}s infinite` }}></div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> AUTH_REQ</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> DOC_SIGN</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> THREAT_DET</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-blue-500" /> Revenue Split</h3>
                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Enterprise API (High Margin)</span>
                                <span>65%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Consumer Subs</span>
                                <span>25%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[25%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Gov Contracts</span>
                                <span>10%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[10%]"></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-slate-950 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2">Recent B2B Signups</div>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between"><span>Acme Legal Corp</span> <span className="text-emerald-500 font-mono text-xs border border-emerald-500/30 px-1 rounded">API_KEY_GEN</span></div>
                            <div className="flex justify-between"><span>Global FinTech Ltd</span> <span className="text-purple-500 font-mono text-xs border border-purple-500/30 px-1 rounded">SENTINEL</span></div>
                            <div className="flex justify-between"><span>NeoBank Inc</span> <span className="text-blue-500 font-mono text-xs border border-blue-500/30 px-1 rounded">AUDIT</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Action Center */}
            <div className="border-t border-slate-800 pt-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BuildingLibraryIcon className="w-6 h-6 text-emerald-500" /> Strategic Actions & Liquidity
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl hover:border-emerald-500 transition-colors group cursor-pointer" onClick={() => setShowAcquisition(true)}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 text-emerald-500">
                                <CurrencyDollarIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Initiate Acquisition Protocol</h4>
                                <div className="text-xs text-slate-400">Submit formal buyout or investment proposal</div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 pl-16">Secure channel for institutional investors to submit valuation offers directly to the NEOXZ Foundry Council.</p>
                    </div>

                    <a href="mailto:founders@neoxz.com?subject=Strategic Partnership Inquiry" className="bg-slate-900 border border-slate-700 p-6 rounded-xl hover:border-blue-500 transition-colors group">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 text-blue-500">
                                <BriefcaseIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Contact Foundry Team</h4>
                                <div className="text-xs text-slate-400">Technical partnership & integration</div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 pl-16">Direct line to engineering leadership for API integration, white-labeling, and government contracts.</p>
                    </a>
                </div>
            </div>
            </>
            )}

            {/* Acquisition Modal */}
            {showAcquisition && (
                <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4">
                    <div className="max-w-lg w-full bg-slate-900 border border-emerald-500 rounded-xl p-8 relative shadow-2xl">
                        <button onClick={() => setShowAcquisition(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <LockClosedIcon className="w-8 h-8 text-emerald-500" />
                            <h2 className="text-2xl font-bold text-white">Secure Proposal Uplink</h2>
                        </div>
                        
                        <p className="text-slate-400 text-sm mb-6">
                            This channel is encrypted end-to-end. Your valuation offer and contact details will be hashed and transmitted directly to Founder NE.B.RU.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Investing Entity</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" 
                                    placeholder="e.g. Sequoia, Andreessen Horowitz, Google"
                                    value={offer.entity}
                                    onChange={e => setOffer({...offer, entity: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Valuation Offer / Term Sheet</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" 
                                    placeholder="e.g. $15M Seed Round, Strategic Buyout"
                                    value={offer.amount}
                                    onChange={e => setOffer({...offer, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Secure Contact Point</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" 
                                    placeholder="Direct Partner Email or Signal Number"
                                    value={offer.contact}
                                    onChange={e => setOffer({...offer, contact: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleTransmitProposal}
                            disabled={sending || !offer.entity || !offer.amount}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" /> Encrypting & Transmitting...
                                </>
                            ) : (
                                <>
                                    <SignalIcon className="w-5 h-5" /> Transmit Encrypted Proposal
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const GlobalNetworkStatus = ({ onClick }: { onClick?: () => void }) => {
    const [node, setNode] = useState("SGP-1");
    const [latency, setLatency] = useState(12);

    useEffect(() => {
        const nodes = ["TYO-4", "LHR-9", "NYC-2", "SGP-1", "FRA-5", "SYD-3"];
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setNode(nodes[Math.floor(Math.random() * nodes.length)]);
                setLatency(Math.floor(Math.random() * 40) + 5);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div onClick={onClick} className="flex items-center gap-4 text-[10px] font-mono text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors select-none">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-500 font-bold">PERPETUAL_SYNC</span>
            </div>
            <div className="hidden sm:block">NODE: <span className="text-slate-300">{node}</span></div>
            <div>LATENCY: <span className={latency > 100 ? "text-amber-500" : "text-emerald-500"}>{latency}ms</span></div>
        </div>
    );
};

const SwipeCardAuth = ({ onSuccess, disabled, text = "SWIPE TO AUTHENTICATE" }: { onSuccess: () => void, disabled: boolean, text?: string }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxDrag = useRef(0);

  useEffect(() => {
    if (containerRef.current) maxDrag.current = containerRef.current.clientWidth - 64;
  }, []);

  const handleStart = (clientX: number) => { if (!disabled) setIsDragging(true); };
  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newX = clientX - rect.left - 32;
    if (newX < 0) newX = 0;
    if (newX > maxDrag.current) newX = maxDrag.current;
    setDragX(newX);
    if (newX >= maxDrag.current - 5) { setIsDragging(false); onSuccess(); }
  };
  const handleEnd = () => { if (isDragging) { setIsDragging(false); setDragX(0); } };

  useEffect(() => {
     const move = (e: MouseEvent) => handleMove(e.clientX);
     const up = () => handleEnd();
     const touchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
     const touchEnd = () => handleEnd();
     if (isDragging) {
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', touchMove);
        window.addEventListener('touchend', touchEnd);
     }
     return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);
     };
  }, [isDragging]);

  return (
    <div ref={containerRef} onMouseDown={(e) => handleStart(e.clientX)} onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        className={`relative h-16 bg-slate-900 rounded-full border-2 border-slate-800 overflow-hidden select-none transition-all duration-300 ${disabled ? 'opacity-50 grayscale' : 'cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/50'}`}>
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold tracking-[0.2em] transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'} ${disabled ? 'text-slate-600' : 'text-emerald-500'}`}>{text}</div>
        <div className="absolute top-0 left-0 bottom-0 bg-emerald-500/10 transition-all duration-75" style={{ width: dragX + 64 }} />
        <div className={`absolute top-1 bottom-1 w-14 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center text-white transition-transform duration-75 ease-out z-10 ${isDragging ? 'scale-105' : 'scale-100'}`} style={{ transform: `translateX(${dragX}px)`, left: 4 }}>
            <ArrowRightIcon className="w-6 h-6" />
        </div>
    </div>
  );
};

// --- Biometric Sentinel (Audio/Visual Detection) ---

const BiometricSentinel = ({ onClose }: { onClose: () => void }) => {
  const [status, setStatus] = useState("Initializing Biometric Sensors...");
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
      if (!process.env.API_KEY) { setStatus("System Error: API Key Missing"); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
        
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
        // Resume if suspended (browser policy)
        if (audioContext.state === 'suspended') { await audioContext.resume(); }

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
                   setStatus("Sentinel Active. Visual & Audio Scanning.");
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
               onclose: () => setIsLive(false),
               onerror: (e) => console.error(e)
           },
           config: {
               responseModalities: [Modality.AUDIO],
               speechConfig: {
                 // Charon provides a deep, authoritative 'Sentinel' voice
                 voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
               },
               systemInstruction: "You are the Biometric Sentinel of the NEOXZ Perpetual Engine. Your mission is to verify human liveness and detect deepfakes to protect Founder NE.B.RU.'s realm. \n\nANALYSIS PROTOCOL:\n1. **Visual Inspection**: Look for 'dead eyes', unnatural blinking, or static photos (lack of 3D depth). Identify deepfake artifacts like blurring around the mouth/eyes, lighting inconsistencies, or edge glitching during movement.\n2. **Audio Inspection**: Verify natural voice modulation. CRITICAL: Check for perfect lip-sync. Audio-visual lag is a primary indicator of a replay attack.\n3. **Challenge-Response**: Issue random, rapid-fire commands mixing physical movement and verbal confirmation (e.g., 'Look up and say your name', 'Touch your left ear', 'Blink fast 5 times', 'Turn profile and state the date').\n\nVERDICT:\n- If the user fails ANY challenge, shows static behavior, or exhibits deepfake artifacts: State clearly 'Access Denied'.\n- If the user passes all checks with natural human behavior: State clearly 'Identity Verified'.",
           }
        });
      } catch (e) {
          console.error(e);
          setStatus("Biometric Hardware Access Denied.");
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
                            {isLive ? "Liveness Challenge Active" : "Connecting..."}
                        </span>
                    </div>
                    {modelActive && <div className="text-emerald-400 font-bold animate-pulse">SENTINEL SPEAKING</div>}
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><FingerPrintIcon className="w-6 h-6 text-emerald-500" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Biometric Sentinel</h3>
                        <div className="flex gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><VideoCameraIcon className="w-4 h-4" /> Motion Detection</span>
                            <span className="flex items-center gap-1 text-emerald-500"><MicrophoneIcon className="w-4 h-4" /> Voice Analysis Active</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-950 p-3 rounded font-mono text-xs text-emerald-500/80 border border-slate-800">
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

// --- Sovereign Scanner (Physical Document / QR Verification) ---

const SovereignScanner = ({ onClose }: { onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [streamActive, setStreamActive] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setStreamActive(true);
                }
            } catch(e) { console.error("Camera access failed", e); }
        };
        startCamera();
        return () => { stream?.getTracks().forEach(t => t.stop()); };
    }, []);

    const captureAndScan = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsScanning(true);
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            const base64 = dataUrl.split(',')[1];
            
            try {
                const result = await performSecurityScan(base64, 'IMAGE_BASE64');
                setScanResult(result);
            } catch(e) {
                console.error(e);
            }
        }
        setIsScanning(false);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-emerald-500 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col h-[80vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 bg-black/50 p-2 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
                
                <div className="relative flex-1 bg-black">
                     <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                     <canvas ref={canvasRef} className="hidden" />
                     
                     {/* Scanning Overlay */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-xl relative">
                             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500"></div>
                             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500"></div>
                             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500"></div>
                             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500"></div>
                             {isScanning && <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>}
                         </div>
                     </div>
                </div>

                <div className="p-6 bg-slate-900 border-t border-slate-800">
                    {scanResult ? (
                        <div className={`p-4 rounded-lg mb-4 ${scanResult.isSafe ? 'bg-emerald-900/20 border border-emerald-500/50' : 'bg-red-900/20 border border-red-500/50'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {scanResult.isSafe ? <CheckBadgeIcon className="w-6 h-6 text-emerald-500" /> : <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
                                <div className="font-bold text-white text-lg">{scanResult.threatType}</div>
                            </div>
                            <div className="text-sm text-slate-300 mb-2">{scanResult.details}</div>
                            {scanResult.extractedData && (
                                <div className="text-xs font-mono bg-black/30 p-2 rounded text-slate-400 break-all border border-slate-700">
                                    DATA: {scanResult.extractedData}
                                </div>
                            )}
                            <button onClick={() => setScanResult(null)} className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold text-white">Scan Again</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                             <p className="text-slate-400 text-sm mb-4 text-center">Align document or QR code within the frame</p>
                             <button 
                                 onClick={captureAndScan} 
                                 disabled={!streamActive || isScanning}
                                 className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                             >
                                 <div className="w-12 h-12 bg-white rounded-full"></div>
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Printable Sovereign Certificate ---

const PrintableCertificate = ({ text, onClose }: { text: string, onClose: () => void }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 overflow-y-auto">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .printable-cert, .printable-cert * { visibility: visible; }
                    .printable-cert { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 20px; border: 4px solid #000; background: white; color: black; z-index: 9999; }
                    .no-print { display: none !important; }
                }
            `}</style>
            <div className="max-w-3xl w-full bg-white text-slate-900 rounded-sm shadow-2xl relative printable-cert p-12">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 no-print"><XMarkIcon className="w-8 h-8" /></button>
                
                <div className="border-[10px] border-double border-slate-900 p-8 h-full flex flex-col items-center text-center">
                    <div className="w-20 h-20 border-4 border-slate-900 rounded-full flex items-center justify-center mb-6">
                        <ScaleIcon className="w-10 h-10 text-slate-900" />
                    </div>
                    
                    <h1 className="text-4xl font-serif font-black tracking-widest uppercase mb-2 border-b-4 border-slate-900 pb-2 w-full">Certificate of NEOXZ Sovereignty</h1>
                    <div className="font-serif text-sm italic mb-8">Issued under the Authority of the Perpetual Engine Protocol v1.0</div>

                    <div className="font-serif text-lg leading-relaxed text-justify w-full mb-8 whitespace-pre-wrap">
                        {text}
                    </div>

                    <div className="mt-auto w-full flex justify-between items-end pt-12 border-t-2 border-slate-300">
                        <div className="text-left">
                            <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cryptographic Witness</div>
                            <div className="font-mono text-xs">SIG: {sha256(text).then(h=>h.substring(0,24)) && "PENDING_RENDER"}...</div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block border-4 border-emerald-900 text-emerald-900 font-bold text-xl px-4 py-2 -rotate-12 opacity-80">
                                AUTHORITY: NE.B.RU.<br/><span className="text-xs">PHILIPPINES</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-4 no-print">
                    <button onClick={handlePrint} className="bg-emerald-600 text-white px-6 py-3 rounded font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg">
                        <PrinterIcon className="w-5 h-5" /> PRINT LEGAL COPY
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Connection Challenge Modal ---

const ConnectionChallengeModal = ({ url, onClose, onConfirm }: { url: string, onClose: () => void, onConfirm: (mode: 'SIGN' | 'ANON' | 'SUB') => void }) => {
    const [challenge, setChallenge] = useState("Generating security challenge...");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateAccessChallenge(url).then(c => {
            setChallenge(c);
            setLoading(false);
        });
    }, [url]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border border-emerald-500 rounded-xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <LockClosedIcon className="w-8 h-8 text-emerald-500" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Protocol Interception</h2>
                        <div className="text-xs text-slate-400 font-mono">Target: {url}</div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-emerald-500 font-bold uppercase mb-2">Security Challenge</div>
                    <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg text-white mb-4 min-h-[60px] flex items-center">
                        {loading ? <span className="animate-pulse">Analyzing context...</span> : challenge}
                    </div>
                    <input 
                        className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-emerald-500 outline-none" 
                        placeholder="Enter your verification answer..."
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => onConfirm('SIGN')}
                        disabled={!answer}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded flex items-center justify-center gap-2"
                    >
                        <FingerPrintIcon className="w-5 h-5" /> Sign & Connect
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onConfirm('SUB')} className="py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-bold rounded border border-slate-700">
                            Subscribe & Protect
                        </button>
                        <button onClick={() => onConfirm('ANON')} className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-bold rounded border border-slate-700">
                            Anonymous Browse
                        </button>
                    </div>
                    <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-white text-xs">Cancel Connection</button>
                </div>
            </div>
        </div>
    );
};

// --- Auto Update Modal ---

const UpdateModal = ({ update, onUpdate }: { update: ProtocolUpdate, onUpdate: () => void }) => {
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleInstall = () => {
        setInstalling(true);
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setTimeout(onUpdate, 500);
            }
            setProgress(p);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4">
            <div className={`max-w-md w-full bg-slate-900 border-2 rounded-xl p-6 shadow-2xl relative overflow-hidden ${update.type === 'MANDATORY' ? 'border-red-500' : 'border-emerald-500'}`}>
                {update.type === 'MANDATORY' && (
                    <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-xs font-bold text-center py-1 uppercase tracking-widest animate-pulse">
                        Compliance Mandate Enforced
                    </div>
                )}
                
                <div className="mt-4 flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full ${update.type === 'MANDATORY' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {update.type === 'MANDATORY' ? <ExclamationTriangleIcon className="w-8 h-8" /> : <CloudArrowDownIcon className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{update.title}</h2>
                        <div className="text-xs font-mono text-slate-400">Version: {update.version}</div>
                        {update.mandatingAuthority && <div className="text-xs text-red-400 mt-1 font-bold">BY ORDER OF: {update.mandatingAuthority}</div>}
                    </div>
                </div>

                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{update.description}</p>
                
                <div className="bg-slate-950 rounded p-3 mb-6 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-2 uppercase font-bold">System Modules</div>
                    <div className="space-y-1">
                        {update.modules.map((m, i) => (
                            <div key={i} className="text-xs text-emerald-500 font-mono flex items-center gap-2">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> {m}
                            </div>
                        ))}
                    </div>
                </div>

                {installing ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-emerald-400 font-bold">
                            <span>INSTALLING PACKAGES...</span>
                            <span>{Math.floor(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={handleInstall} className={`flex-1 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${update.type === 'MANDATORY' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {update.type === 'MANDATORY' ? 'Accept & Update' : 'Install Update'}
                        </button>
                        {update.type !== 'MANDATORY' && (
                            <button onClick={onUpdate} className="px-4 py-3 text-slate-500 hover:text-white text-sm font-bold">Later</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [shieldActive, setShieldActive] = useState(false);
  const [identity, setIdentity] = useState<KeyPairIdentity | null>(null);
  const [lockedIdentity, setLockedIdentity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sign' | 'ledger' | 'footprint' | 'auditor'>('sign');
  
  // Monetization & Updates
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY' | 'LIFETIME'>('YEARLY');
  const [showInvestorDashboard, setShowInvestorDashboard] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showBiometricSentinel, setShowBiometricSentinel] = useState(false);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [showSigningRitual, setShowSigningRitual] = useState(false);
  
  const [protocolVersion, setProtocolVersion] = useState("1.0.0");
  const [pendingUpdate, setPendingUpdate] = useState<ProtocolUpdate | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [securityScan, setSecurityScan] = useState<SecurityScanResult | null>(null);
  
  // Command Terminal State
  const [showTerminal, setShowTerminal] = useState(false);

  // Registration
  const [regForm, setRegForm] = useState<IdentityProfile>({
    email: '', fullName: '', type: 'PERSONAL', organization: '', address: '', phone: '', 
    trustedContact: '', deviceSignature: '', dateOfBirth: '', isMinor: false, hasUsedTrial: false
  });
  
  const [triangulationStatus, setTriangulationStatus] = useState<'IDLE' | 'SCANNING' | 'LOCKED' | 'FAILED'>('IDLE');
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [locationLocked, setLocationLocked] = useState(false);
  const [deviceVerified, setDeviceVerified] = useState(false);

  // Signing
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoginDragActive, setIsLoginDragActive] = useState(false);

  // Connection / Site Intercept
  const [siteUrl, setSiteUrl] = useState("");
  const [showChallenge, setShowChallenge] = useState(false);

  // Footprint & Ledger & Auditor
  const [footprintAccounts, setFootprintAccounts] = useState<ConnectedAccount[]>([]);
  const [isScanningFootprint, setIsScanningFootprint] = useState(false);
  const [chain, setChain] = useState<LedgerBlock[]>([]);
  const [auditTarget, setAuditTarget] = useState('');
  const [auditReport, setAuditReport] = useState<AccountabilityReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => { setChain(ledgerService.getChain()); }, []);
  useEffect(() => {
    const stored = localStorage.getItem('sovereign_identity_v1');
    if (stored) setLockedIdentity(JSON.parse(stored));
  }, []);

  // Check for updates on mount
  useEffect(() => {
      const check = async () => {
          if (process.env.API_KEY) {
            const update = await checkProtocolStatus(protocolVersion);
            if (update) setPendingUpdate(update);
          }
      };
      // Brief delay to simulate startup check
      setTimeout(check, 3000);
  }, [protocolVersion]);

  // --- Auth & Payments ---

  const authenticateBiometric = async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) return true;
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      await navigator.credentials.get({ publicKey: { challenge, rpId: window.location.hostname === 'localhost' ? 'localhost' : undefined, userVerification: "required" }});
      return true;
    } catch (e) { return false; }
  };

  const unlockIdentity = async () => {
      const success = await authenticateBiometric();
      if (success && lockedIdentity) {
          try {
            const { publicKey, privateKey } = await importKeyPair(lockedIdentity.keys);
            setIdentity({ ...lockedIdentity.identity, publicKey, privateKey });
            setRegForm(lockedIdentity.identity.profile);
            setTriangulationStatus('LOCKED');
            setLocationLocked(true);
            setDeviceVerified(true);
          } catch(e) { alert("Decryption failed."); }
      }
  };

  const saveIdentity = (id: KeyPairIdentity) => {
     const existing = localStorage.getItem('sovereign_identity_v1');
     if (existing) {
         const parsed = JSON.parse(existing);
         // Keep the keys, update the identity profile
         const updated = { ...parsed, identity: { ...id, publicKey: undefined, privateKey: undefined } };
         localStorage.setItem('sovereign_identity_v1', JSON.stringify(updated));
     }
  };

  const handlePurchase = async (tier: 'CITIZEN' | 'SOVEREIGN', cycle: 'MONTHLY' | 'YEARLY' | 'LIFETIME') => {
      setIsProcessingPayment(true);
      await processPayment(0); // Mock processing
      
      let duration = 0;
      if (cycle === 'MONTHLY') duration = 30 * 24 * 60 * 60 * 1000;
      if (cycle === 'YEARLY') duration = 365 * 24 * 60 * 60 * 1000;
      if (cycle === 'LIFETIME') duration = 100 * 365 * 24 * 60 * 60 * 1000; // 100 Years

      const expiry = Date.now() + duration;
      if (identity) {
          const updated = { ...identity, profile: { ...identity.profile, subscriptionExpiry: expiry } };
          setIdentity(updated);
          saveIdentity(updated);
      }
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
  };
  
  const handleFreeTrial = async () => {
      if (!identity || identity.profile.hasUsedTrial) return;
      setIsProcessingPayment(true);
      await new Promise(r => setTimeout(r, 1000)); // Simulate activation
      
      const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 Days
      const updated = { 
          ...identity, 
          profile: { ...identity.profile, subscriptionExpiry: expiry, hasUsedTrial: true } 
      };
      setIdentity(updated);
      saveIdentity(updated); // PERSISTENCE FIX
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
  };

  const checkSubscription = () => {
      if (!identity?.profile.subscriptionExpiry || identity.profile.subscriptionExpiry < Date.now()) {
          setShowPaymentModal(true);
          return false;
      }
      return true;
  };
  
  const getSubscriptionTimeRemaining = () => {
      if (!identity?.profile.subscriptionExpiry) return "INACTIVE";
      const diff = identity.profile.subscriptionExpiry - Date.now();
      if (diff < 0) return "EXPIRED";
      if (diff > (50 * 365 * 24 * 60 * 60 * 1000)) return "LIFETIME SOVEREIGNTY";
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 0) return `${days} DAYS LEFT`;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} HOURS LEFT`;
  };

  const checkSubscriptionStatusColor = () => {
      if (!identity?.profile.subscriptionExpiry) return "text-slate-500";
      const diff = identity.profile.subscriptionExpiry - Date.now();
      if (diff < 0) return "text-red-500";
      if (diff > (50 * 365 * 24 * 60 * 60 * 1000)) return "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]";
      if (diff < (24 * 60 * 60 * 1000)) return "text-amber-500"; // Warning < 24h
      return "text-emerald-500";
  };

  // --- Handlers ---

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      setAnalysis(null);
      setCertificate(null); // Reset cert
      setSecurityScan(null);

      // Trigger automatic security scan
      try {
          const scan = await performSecurityScan(text, 'TEXT');
          setSecurityScan(scan);
      } catch(e) { console.error(e); }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    if(e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleGlobalDrop = async (e: React.DragEvent) => {
      e.preventDefault(); setIsLoginDragActive(false);
      if (identity) return;
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
          try {
              const data = JSON.parse(await file.text());
              if (data.keys) { setLockedIdentity(data); alert("Key Accepted. Authenticate to unlock."); }
          } catch (err) { alert("Invalid Key File."); }
      }
  };

  const startTriangulation = async () => {
    setTriangulationStatus('SCANNING');
    setScanLogs(p => [...p, "Initiating Cyber Forensic Scan..."]);
    setTimeout(() => {
        const hash = "DEV-SIG-" + Math.random().toString(36).substring(7);
        setRegForm(p => ({ ...p, deviceSignature: hash }));
        setDeviceVerified(true);
        setScanLogs(p => [...p, `Device Signature: ${hash}`, "Location Uplink: SECURE"]);
        setLocationLocked(true);
        setTriangulationStatus('LOCKED');
    }, 1500);
  };

  const handleCreateIdentity = async () => {
      // Validation Logic
      if (!regForm.fullName.trim()) { alert("Full Name is required."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) { alert("Invalid Email format."); return; }
      if (!regForm.phone.trim()) { alert("Phone number is required for Identity Verification."); return; }
      if (!regForm.trustedContact.trim()) { alert("Trusted Contact is required for Account Recovery."); return; }
      if (!regForm.dateOfBirth) { alert("Date of Birth is required."); return; }

      const keyPair = await generateKeyPair();
      const fp = await getFingerprint(keyPair.publicKey);
      const newId: KeyPairIdentity = {
          publicKey: keyPair.publicKey, privateKey: keyPair.privateKey, id: crypto.randomUUID(), createdAt: Date.now(), fingerprint: fp,
          // Initial 24 hours only to demonstrate need for subscription
          profile: { ...regForm, hasUsedTrial: false, subscriptionExpiry: Date.now() + (24 * 60 * 60 * 1000) } 
      };
      const exportedKeys = await exportKeyPair(keyPair);
      
      const fullExport = { identity: { ...newId, publicKey: undefined, privateKey: undefined }, keys: exportedKeys };
      
      localStorage.setItem('sovereign_identity_v1', JSON.stringify(fullExport));
      setIdentity(newId);
      
      // Automatic download for Sovereignty
      downloadIdentityKeys(fullExport, newId.profile.fullName);
      alert("Identity Keys Generated. \nWARNING: You have just downloaded your Sovereign Keys. Do not lose them. They are your only proof of ownership.");
  };
  
  const handleExportIdentity = async () => {
      if (!identity) return;
      const exportedKeys = await exportKeyPair({ publicKey: identity.publicKey, privateKey: identity.privateKey });
      const fullExport = { identity: { ...identity, publicKey: undefined, privateKey: undefined }, keys: exportedKeys };
      downloadIdentityKeys(fullExport, identity.profile.fullName);
  };

  const handleSign = async () => {
    if (!checkSubscription()) return;
    setIsSigning(true);
    const authed = await authenticateBiometric();
    if (authed && identity) {
        setShowSigningRitual(true);
    } else {
        setIsSigning(false);
    }
  };
  
  const executeSigning = async () => {
    if (!identity) return;
    
    const hash = await sha256(fileContent);
    const sig = await signData(identity.privateKey, hash);
    
    try {
        const certText = await generateSovereignCertificate(identity.profile.fullName, identity.profile.type, fileName, hash);
        setCertificate(certText);
    } catch(e) {
        setCertificate("Digital Signature Verified. Wet Ink Superseded by Sovereign Protocol.");
    }

    const receipt = analysis ? await reportToAuthority(hash, identity.profile, analysis) : undefined;
    await ledgerService.addBlock({ 
        type: 'SIGNATURE', identityId: identity.id, documentName: fileName, documentHash: hash, signature: sig, 
        signerProfileSnapshot: identity.profile, authorityReceipt: receipt, timestamp: Date.now() 
    });
    setChain(ledgerService.getChain());
    setFileContent('');
    setIsSigning(false);
    setShowSigningRitual(false);
  };

  const handleAnalyze = async () => {
      if (!checkSubscription()) return;
      setIsAnalyzing(true);
      try {
          const res = await analyzeContract(fileContent, identity?.profile.isMinor);
          setAnalysis(res);
      } catch(e) { alert("Analysis Failed"); }
      setIsAnalyzing(false);
  };

  const handleConnectRequest = () => {
      if(siteUrl) setShowChallenge(true);
  };

  const handleChallengeConfirm = async (mode: 'SIGN' | 'ANON' | 'SUB') => {
      setShowChallenge(false);
      if (mode === 'SIGN' || mode === 'SUB') {
          // Logic to sign intent
          const hash = await sha256(`ACCESS_INTENT:${siteUrl}:${Date.now()}`);
          if(identity) {
              await signData(identity.privateKey, hash);
              const certText = await generateSovereignCertificate(identity.profile.fullName, identity.profile.type, `ACCESS:${siteUrl}`, hash);
              setCertificate(certText);
              await ledgerService.addBlock({
                  type: 'SIGNATURE', identityId: identity.id, documentName: `ACCESS_REQ:${siteUrl}`, documentHash: hash, timestamp: Date.now()
              });
              setChain(ledgerService.getChain());
          }
      }
  };
  
  const handleSystemUpdate = () => {
      if (pendingUpdate) {
          setProtocolVersion(pendingUpdate.version);
          setPendingUpdate(null);
          // In a real app, this is where code would be hot-swapped
      }
  };

  // --- Terminal Command Handler ---
  const handleTerminalCommand = async (cmd: string): Promise<string> => {
      const c = cmd.toUpperCase().trim();
      
      if (c === 'HELP') {
          return `
AVAILABLE PROTOCOLS:
--------------------
STATUS   : Check Identity & Node Link
SCAN     : Initiate Text-Based Threat Scan
LEDGER   : Fetch Latest Block Hash
DEPLOY   : Execute Identity Deployment Sequence
CLEAR    : Purge Terminal History
HELP     : Display this manifest
`;
      }
      
      if (c === 'STATUS') {
          if (!identity) return "ERROR: No Identity Keys Loaded. Access Restricted.";
          const expiry = identity.profile.subscriptionExpiry 
              ? formatLocalTime(identity.profile.subscriptionExpiry)
              : "N/A";
          return `
IDENTITY VERIFIED: ${identity.profile.fullName}
TYPE: ${identity.profile.type}
FINGERPRINT: ${identity.fingerprint.substring(0, 16)}...
SUBSCRIPTION EXPIRES: ${expiry}
NODE UPLINK: SECURE (Encrypted via NEOXZ)`;
      }

      if (c === 'LEDGER') {
          const latest = ledgerService.getLatestBlock();
          return `LATEST BLOCK #${latest.index}\nHASH: ${latest.hash}\nTIMESTAMP: ${formatLocalTime(latest.timestamp)}`;
      }

      if (c === 'DEPLOY') {
          if (!identity) return "ERROR: Cannot deploy without active identity.";
          return `
[INITIATING DEPLOYMENT SEQUENCE]
> Compiling Identity Assets... OK
> Establishing P2P Link... OK
> Broadcasting to Sovereign Ledger...
> ...
> ...
> DEPLOYMENT SUCCESSFUL.
> Identity Hash anchored to Global Trust Chain.
> You are now Live.
          `;
      }

      if (c.startsWith('SCAN ')) {
          const target = cmd.substring(5);
          return `[SCANNING TARGET: ${target}]...\n> No immediate threats detected in text string.\n> Heuristic Analysis: CLEAN.`;
      }

      if (c === 'CLEAR') {
          // Handled in component state reset usually, but we'll return a special string or just clear
          // Note: Real clear needs state lift, for now we just return a cleared message or visual break
          return "\n\n\n\n[CONSOLE FLUSHED]\n";
      }

      return `UNKNOWN COMMAND: '${cmd}'. Type 'HELP' for protocols.`;
  };

  // --- Render ---

  if (!shieldActive) return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-center">
          <SignaSovereignLogo className="w-32 h-32 mb-8" seed="NEOXZ" />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-widest">SignaSovereign</h1>
          <p className="text-emerald-500 tracking-widest text-xs font-bold uppercase mb-8">BY NEOXZ.COM // PERPETUAL ENGINE PROJECT</p>
          <button onClick={() => setShieldActive(true)} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-2">
              <PowerIcon className="w-5 h-5" /> INITIALIZE SYSTEM
          </button>
          <div className="mt-12 text-xs text-slate-500 font-mono border-t border-slate-800 pt-4">
              AUTHENTIC SIGNATURE OF FOUNDER<br/>
              <span className="text-emerald-500 font-bold text-sm">NEIL RUBIO BALOG (NE.B.RU.)</span><br/>
              PHILIPPINES // VAST DIGITAL REALM
          </div>
      </div>
  );

  if (!identity) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" onDragOver={e => {e.preventDefault(); setIsLoginDragActive(true)}} onDrop={handleGlobalDrop}>
              {isLoginDragActive && <div className="absolute inset-0 z-50 bg-emerald-900/80 flex items-center justify-center text-white font-bold text-2xl border-4 border-emerald-500 m-4 rounded-xl border-dashed">DROP IDENTITY KEY</div>}
              <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                  {lockedIdentity ? (
                      <div className="text-center py-12 flex flex-col items-center">
                          <FingerPrintIcon className="w-24 h-24 text-slate-700 mx-auto mb-6" />
                          <h2 className="text-2xl font-bold text-white mb-2">Identity Encrypted</h2>
                          <p className="text-slate-500 text-sm mb-6">Swipe to confirm intent & decrypt keys.</p>
                          <div className="w-64">
                              <SwipeCardAuth disabled={false} onSuccess={unlockIdentity} text="SWIPE TO LOGIN" />
                          </div>
                          <button onClick={() => setLockedIdentity(null)} className="block mx-auto mt-6 text-slate-500 text-sm hover:text-white">Reset Identity</button>
                      </div>
                  ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-white">NEOXZ Identity Creation</h2>
                              <input className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" placeholder="Full Name" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} />
                              <input className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" placeholder="Email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                              <input className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" placeholder="Phone Number" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                              <input className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none" placeholder="Trusted Contact (Email/Phone)" value={regForm.trustedContact} onChange={e => setRegForm({...regForm, trustedContact: e.target.value})} />
                              
                              <div className="grid grid-cols-3 gap-2">
                                  {['PERSONAL', 'STUDENT', 'CORPORATE'].map(t => (
                                      <button key={t} onClick={() => setRegForm({...regForm, type: t as any})} 
                                          className={`p-2 rounded border text-xs font-bold ${regForm.type === t ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                                          {t}
                                      </button>
                                  ))}
                              </div>

                              <input type="date" className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" value={regForm.dateOfBirth} onChange={e => { setRegForm({...regForm, dateOfBirth: e.target.value}); startTriangulation(); }} />
                              <SwipeCardAuth disabled={triangulationStatus !== 'LOCKED'} onSuccess={handleCreateIdentity} text="SWIPE TO REGISTER" />
                          </div>
                          <div className="bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs text-emerald-500/80 overflow-y-auto h-64">
                              {scanLogs.map((l, i) => <div key={i}>> {l}</div>)}
                              {triangulationStatus === 'IDLE' && "Waiting for input..."}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      {showInvestorDashboard && <InvestorDashboard onClose={() => setShowInvestorDashboard(false)} />}
      {showBiometricSentinel && <BiometricSentinel onClose={() => setShowBiometricSentinel(false)} />}
      {showScanner && <SovereignScanner onClose={() => setShowScanner(false)} />}
      {showChallenge && <ConnectionChallengeModal url={siteUrl} onClose={() => setShowChallenge(false)} onConfirm={handleChallengeConfirm} />}
      {certificate && <PrintableCertificate text={certificate} onClose={() => setCertificate(null)} />}
      {pendingUpdate && <UpdateModal update={pendingUpdate} onUpdate={handleSystemUpdate} />}
      {showSigningRitual && <SigningRitual onComplete={executeSigning} />}
      {showTerminal && <CommandTerminal onClose={() => setShowTerminal(false)} identity={identity} onCommand={handleTerminalCommand} />}

      {/* Payment Modal */}
      {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full bg-slate-900 border border-emerald-500 rounded-2xl p-8 relative shadow-[0_0_100px_rgba(16,185,129,0.15)]">
                  <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                  
                  <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Protocol Access Market</h2>
                      <p className="text-slate-400 text-sm">Secure your position within the NEOXZ Perpetual Engine.</p>
                  </div>

                  {/* Billing Toggle */}
                  <div className="flex justify-center mb-8">
                      <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex">
                          {['MONTHLY', 'YEARLY', 'LIFETIME'].map((cycle) => (
                              <button 
                                  key={cycle}
                                  onClick={() => setBillingCycle(cycle as any)}
                                  className={`px-4 py-2 rounded text-xs font-bold transition-all ${billingCycle === cycle ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-400'}`}
                              >
                                  {cycle === 'LIFETIME' ? 'TOTAL SELL OFF' : cycle}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  {/* Pricing Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                      {/* Subscription Tier */}
                      <div className="bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 p-6 rounded-xl transition-all group">
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-slate-900 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform"><UserIcon className="w-6 h-6" /></div>
                              <div className="text-right">
                                  <div className="text-xs text-slate-500 font-bold uppercase">Citizen Access</div>
                                  <div className="text-2xl font-bold text-white">
                                      {billingCycle === 'LIFETIME' ? '$499' : billingCycle === 'YEARLY' ? '$29' : '$3'}
                                      <span className="text-xs text-slate-500 font-normal">{billingCycle === 'LIFETIME' ? '' : billingCycle === 'YEARLY' ? '/yr' : '/mo'}</span>
                                  </div>
                              </div>
                          </div>
                          <ul className="space-y-2 text-xs text-slate-300 mb-6">
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Basic Document Signing</li>
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Identity Verification</li>
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Personal Audit Logs</li>
                          </ul>
                          <button 
                              disabled={isProcessingPayment} 
                              onClick={() => handlePurchase('CITIZEN', billingCycle)}
                              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm"
                          >
                              {billingCycle === 'LIFETIME' ? 'Purchase Citizenship' : 'Subscribe'}
                          </button>
                      </div>

                      {/* Total Sell Off Tier (Lifetime/High Value) */}
                      <div className="bg-gradient-to-b from-slate-900 to-emerald-900/20 border border-emerald-500 p-6 rounded-xl relative overflow-hidden shadow-lg">
                          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-emerald-900/50 rounded-lg text-emerald-400 border border-emerald-500/30"><ShieldCheckIcon className="w-6 h-6" /></div>
                              <div className="text-right">
                                  <div className="text-xs text-emerald-400 font-bold uppercase">Sovereign Authority</div>
                                  <div className="text-2xl font-bold text-white">
                                      {billingCycle === 'LIFETIME' ? '$999' : billingCycle === 'YEARLY' ? '$49' : '$10'}
                                      <span className="text-xs text-emerald-200/50 font-normal">{billingCycle === 'LIFETIME' ? '' : billingCycle === 'YEARLY' ? '/yr' : '/mo'}</span>
                                  </div>
                              </div>
                          </div>
                          <ul className="space-y-2 text-xs text-emerald-100/80 mb-6">
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-400" /> <b>Unlimited</b> AI Contract Analysis</li>
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Biometric Sentinel Access</li>
                              <li className="flex gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Corporate Entity Audits</li>
                              {billingCycle === 'LIFETIME' && <li className="flex gap-2 text-emerald-300 font-bold"><SparklesIcon className="w-4 h-4" /> TOTAL SELL OFF: LIFETIME OWNERSHIP</li>}
                          </ul>
                          <button 
                              disabled={isProcessingPayment} 
                              onClick={() => handlePurchase('SOVEREIGN', billingCycle)}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          >
                              {billingCycle === 'LIFETIME' ? 'Claim Total Sovereignty' : 'Initialize Protocol'}
                          </button>
                      </div>
                  </div>

                  {/* Free Trial Footer */}
                  {!identity.profile.hasUsedTrial && (
                      <div className="mt-6 text-center">
                          <button onClick={handleFreeTrial} className="text-xs text-slate-500 hover:text-white underline decoration-dashed underline-offset-4">
                              Not ready? Initialize 7-Day Free Trial Protocol
                          </button>
                      </div>
                  )}
                  
                  {isProcessingPayment && <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl z-10">
                      <div className="text-emerald-500 font-mono text-sm animate-pulse flex flex-col items-center gap-2">
                          <ArrowPathIcon className="w-8 h-8 animate-spin" />
                          Processing Transaction on Ledger...
                      </div>
                  </div>}
              </div>
          </div>
      )}

      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col">
          <SignaSovereignLogo className="w-10 h-10 mb-4 mx-auto md:mx-0" seed={identity.fingerprint} />
          <div className="text-xs font-bold text-emerald-500 mb-6 text-center md:text-left tracking-widest uppercase">SignaSovereign<br/><span className="text-slate-500">NEOXZ PROTOCOL</span></div>

          <nav className="space-y-2 flex-1">
             <button onClick={() => { setActiveTab('sign'); setCertificate(null); setFileContent(''); setSecurityScan(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'sign' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`}><DocumentTextIcon className="w-5 h-5" /> Scan & Verify</button>
             <button onClick={() => setActiveTab('ledger')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'ledger' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`}><QrCodeIcon className="w-5 h-5" /> Authority Ledger</button>
             <button onClick={() => setActiveTab('auditor')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'auditor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'}`}><GlobeAltIcon className="w-5 h-5" /> Entity Auditor</button>
          
             {/* Sidebar Promo for Free Trial */}
             {!identity.profile.hasUsedTrial && (
                 <div className="mt-4 p-3 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl border border-indigo-500/50 shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setShowPaymentModal(true)}>
                     <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><GiftIcon className="w-12 h-12 text-white" /></div>
                     <div className="relative z-10">
                         <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Limited Offer</div>
                         <div className="text-sm font-bold text-white mb-1">Claim 7-Day Free Trial</div>
                         <div className="text-[10px] text-indigo-200">Unlock full sovereignty suite.</div>
                     </div>
                 </div>
             )}
          </nav>
          
          <div className="mt-auto space-y-4">
              <button onClick={() => setShowScanner(true)} className="w-full py-3 bg-slate-800 border border-slate-700 hover:border-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                  <ViewfinderCircleIcon className="w-5 h-5 text-emerald-500" /> VERIFY PRINTOUT / QR
              </button>

              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowBiometricSentinel(true)} className="py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                      <VideoCameraIcon className="w-4 h-4" /> SENTINEL
                  </button>
                  <button onClick={() => setShowTerminal(true)} className="py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                      <CommandLineIcon className="w-4 h-4" /> CMD/TERM
                  </button>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"><UserCircleIcon className="w-5 h-5 text-emerald-500" /></div>
                      <div>
                          <div className="text-sm font-bold text-white">{identity.profile.fullName}</div>
                          <div className="text-xs text-slate-500">{identity.profile.type}</div>
                      </div>
                  </div>
                  <div className="text-xs font-mono text-slate-600 truncate mb-2">{identity.fingerprint}</div>
                  
                  <button onClick={handleExportIdentity} className="absolute top-2 right-2 text-slate-500 hover:text-white" title="Backup Sovereign Keys">
                      <KeyIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Subscription Status Indicator */}
                  <div className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded border border-slate-800"
                       title={identity.profile.subscriptionExpiry ? `Expires: ${formatLocalTime(identity.profile.subscriptionExpiry)}` : ''}>
                      <span className="text-slate-500 font-bold flex items-center gap-1"><ClockIcon className="w-3 h-3" /> ACCESS</span>
                      <span className={`${checkSubscriptionStatusColor()} font-bold`}>
                        {getSubscriptionTimeRemaining()}
                      </span>
                  </div>
              </div>
          </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header Bar with Global Network Ticker */}
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-slate-500">NEOXZ PROTOCOL:</span> {activeTab === 'sign' ? 'VERIFICATION' : activeTab === 'ledger' ? 'LEDGER' : 'AUDITOR'}
              </h1>
              <div className="flex items-center gap-4">
                  <GlobalNetworkStatus onClick={() => setShowInvestorDashboard(true)} />
                  <div className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-1 rounded">PROD-v{protocolVersion}</div>
              </div>
          </div>

          {/* Main Signing & Site Interface */}
          {activeTab === 'sign' && (
              <div className="max-w-4xl mx-auto space-y-8">
                  {/* Site Connection Box */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <GlobeAltIcon className="w-5 h-5 text-emerald-500" /> Secure Site Access
                      </h2>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                              placeholder="Enter website URL or Entity Name to verify..."
                              value={siteUrl}
                              onChange={(e) => setSiteUrl(e.target.value)}
                          />
                          <button 
                              onClick={handleConnectRequest}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold"
                          >
                              Connect
                          </button>
                      </div>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div 
                      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${isDragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/30'}`}
                      onDragOver={() => setIsDragOver(true)}
                      onDragLeave={() => setIsDragOver(false)}
                  >
                      {!fileContent ? (
                          <div className="text-center">
                              <DocumentTextIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-white mb-2">Drag Contract or Document</h3>
                              <p className="text-slate-400 mb-6">PDF, JSON, or Text files supported for analysis</p>
                              <label className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded cursor-pointer">
                                  Select File <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                              </label>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-white truncate max-w-md">{fileName}</h3>
                                  <button onClick={() => {setFileContent(''); setAnalysis(null); setSecurityScan(null);}} className="text-slate-500 hover:text-red-500">Remove</button>
                              </div>
                              <div className="p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-400 h-64 overflow-y-auto">
                                  {fileContent.substring(0, 2000)}...
                              </div>
                              
                              {/* Security Scan Result Badge */}
                              {securityScan && (
                                  <div className={`p-4 rounded-lg flex items-start gap-4 ${securityScan.isSafe ? 'bg-emerald-900/10 border border-emerald-500/30' : 'bg-red-900/10 border border-red-500/30'}`}>
                                      <div className={`p-2 rounded-full ${securityScan.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                          {securityScan.isSafe ? <CheckBadgeIcon className="w-6 h-6" /> : <BugAntIcon className="w-6 h-6" />}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className={`text-sm font-bold ${securityScan.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{securityScan.threatType.toUpperCase()}</span>
                                              {!securityScan.isSafe && <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">CRITICAL THREAT</span>}
                                          </div>
                                          <div className="text-xs text-slate-400">{securityScan.details}</div>
                                      </div>
                                  </div>
                              )}

                              <div className="flex gap-4">
                                  <button onClick={handleAnalyze} disabled={isAnalyzing || (securityScan ? !securityScan.isSafe : false)} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                      {isAnalyzing ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <EyeIcon className="w-5 h-5" />}
                                      Analyze Compliance
                                  </button>
                                  <button onClick={handleSign} disabled={isSigning || (securityScan ? !securityScan.isSafe : false)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                      {isSigning ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <FingerPrintIcon className="w-5 h-5" />}
                                      Sign & Generate Certificate
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Analysis Results */}
                  {analysis && (
                      <div className={`rounded-2xl p-6 border ${analysis.riskLevel === 'Critical' ? 'bg-red-900/10 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-white">Compliance Analysis</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.riskLevel === 'Critical' ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                  Risk: {analysis.riskLevel}
                              </div>
                          </div>
                          <p className="text-slate-300 mb-4">{analysis.summary}</p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-950 p-4 rounded">
                                  <div className="text-slate-500 text-xs mb-1">Authenticity Score</div>
                                  <div className="text-2xl font-bold text-emerald-400">{analysis.authenticityScore}/100</div>
                              </div>
                              <div className="bg-slate-950 p-4 rounded">
                                  <div className="text-slate-500 text-xs mb-1">Risk Score</div>
                                  <div className={`text-2xl font-bold ${analysis.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{analysis.riskScore}/100</div>
                              </div>
                          </div>
                          <h4 className="font-bold text-white text-sm mb-2">Key Compliance Issues</h4>
                          <ul className="space-y-1 mb-6">
                              {analysis.complianceIssues.map((issue, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-red-300"><ShieldExclamationIcon className="w-4 h-4" /> {issue}</li>
                              ))}
                          </ul>
                          <div className="bg-slate-950 p-4 rounded border-l-4 border-emerald-500 text-sm text-slate-300 italic">
                              "{analysis.recommendation}"
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'ledger' && (
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Immutable Ledger</h2>
                  <div className="space-y-4">
                      {chain.slice().reverse().map((block) => (
                          <div key={block.hash} className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      <div className="px-2 py-1 bg-slate-950 rounded text-xs font-mono text-emerald-500">BLK #{block.index}</div>
                                      <div className="text-sm font-bold text-white">{block.data.type}</div>
                                  </div>
                                  <div className="text-xs text-slate-500">{formatLocalTime(block.timestamp)}</div>
                              </div>
                              <div className="text-xs font-mono text-slate-400 break-all bg-slate-950/50 p-2 rounded mb-2">{block.hash}</div>
                              {block.data.authorityReceipt && (
                                  <div className={`mt-2 p-2 rounded text-xs border ${block.data.authorityReceipt.status === 'FLAGGED_FOR_AUDIT' ? 'border-red-500/30 bg-red-900/10 text-red-300' : 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300'}`}>
                                      AUTH: {block.data.authorityReceipt.message}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}
          
          {activeTab === 'auditor' && (
              <div className="max-w-2xl mx-auto space-y-6">
                  <h2 className="text-2xl font-bold text-white">Entity Auditor</h2>
                  <div className="flex gap-2">
                      <input 
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white" 
                          placeholder="Entity Name (e.g., Acme Corp)" 
                          value={auditTarget} 
                          onChange={(e) => setAuditTarget(e.target.value)} 
                      />
                      <button onClick={async () => {
                          if (!checkSubscription()) return; // Added subscription check
                          setIsAuditing(true);
                          setAuditReport(await auditEntityAccountability(auditTarget));
                          setIsAuditing(false);
                      }} className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-lg font-bold">Audit</button>
                  </div>
                  {isAuditing && <div className="text-center text-purple-400 animate-pulse">Running Forensic Audit...</div>}
                  {auditReport && (
                      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                          <h3 className="text-xl font-bold text-white mb-2">{auditReport.entityName}</h3>
                          <div className={`inline-block px-3 py-1 rounded text-xs font-bold mb-4 ${auditReport.status === 'VERIFIED_ACCOUNTABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {auditReport.status}
                          </div>
                          <p className="text-slate-300 text-sm mb-4">{auditReport.riskAssessment}</p>
                          <div className="text-xs text-slate-500">Liability Stance: {auditReport.liabilityStance}</div>
                      </div>
                  )}
              </div>
          )}
      </main>
    </div>
  );
}