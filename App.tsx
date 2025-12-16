import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { 
    XMarkIcon, ExclamationTriangleIcon, FingerPrintIcon, VideoCameraIcon, 
    MicrophoneIcon, ShieldCheckIcon, ArrowPathIcon, CubeTransparentIcon, 
    DocumentCheckIcon, LockClosedIcon, GlobeAltIcon, SparklesIcon,
    CreditCardIcon, WifiIcon, CommandLineIcon, PowerIcon,
    BuildingOfficeIcon, UserGroupIcon, KeyIcon, StopCircleIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { arrayBufferToBase64 } from './services/cryptoUtils';
import { ledgerService } from './services/ledgerService';
import { detectSynthIDWatermark, WatermarkDetectionResult, analyzeContract } from './services/aiService';
import { LedgerBlock, ContractAnalysis } from './types';

// --- BOOT SEQUENCE COMPONENT ---

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
    const [lines, setLines] = useState<string[]>([]);
    const bootLogs = [
        "NEOXZ BIOS v4.2.1 - SECURE BOOT INITIALIZED",
        "VERIFYING INTEGRITY... 100%",
        "LOADING KERNEL MODULES... OK",
        "MOUNTING SECURE ENCLAVE... MOUNTED",
        "CHECKING LIABILITY PROTOCOLS... ENFORCED",
        "STARTING SIGNASOVEREIGN DAEMON...",
        "ESTABLISHING UPLINK TO PERPETUAL ENGINE...",
        "AUTHENTICATING HARDWARE SIGNATURES...",
        "SYSTEM ONLINE."
    ];

    useEffect(() => {
        let delay = 0;
        bootLogs.forEach((log, index) => {
            delay += Math.random() * 300 + 100;
            setTimeout(() => {
                setLines(prev => [...prev, log]);
                if (index === bootLogs.length - 1) {
                    setTimeout(onComplete, 600);
                }
            }, delay);
        });
    }, []);

    return (
        <div className="fixed inset-0 bg-black text-emerald-500 font-mono text-xs p-8 z-[100] flex flex-col justify-end">
            {lines.map((line, i) => (
                <div key={i} className="mb-1">{`> ${line}`}</div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    );
};

// --- RESPONSIBILITY DISCLAIMER MODAL ---

const ResponsibilityModal = ({ onAccept }: { onAccept: () => void }) => {
    return (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] animate-fadeIn relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <ShieldCheckIcon className="w-48 h-48 text-red-500" />
                </div>

                <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wider">
                            Sovereign Responsibility
                        </h2>
                        <p className="text-[10px] font-mono text-red-400 mt-1">PROTOCOL ENFORCEMENT REQUIRED</p>
                    </div>
                    
                    <div className="text-sm text-slate-300 space-y-3 text-left bg-slate-950/80 p-5 rounded-lg border border-red-900/50">
                        <p className="font-bold text-red-400 text-xs uppercase tracking-wide mb-2 border-b border-red-900/50 pb-2">
                            User Accountability Statement:
                        </p>
                        <ul className="list-disc pl-4 space-y-2 text-xs font-medium text-slate-400">
                            <li>
                                <span className="text-slate-200">Strict Prohibition:</span> Usage for <span className="text-red-400">illegal activities or scamming</span> is strictly forbidden.
                            </li>
                            <li>
                                <span className="text-slate-200">Non-Transferability:</span> Making other entities use your badge is prohibited. You are the sole custodian.
                            </li>
                            <li>
                                <span className="text-slate-200">Ultimate Accountability:</span> All actions performed under this signature <span className="text-emerald-500 font-mono">ALWAYS TRACE BACK</span> to your identity as accountable.
                            </li>
                        </ul>
                    </div>

                    <p className="text-[10px] text-slate-500 italic max-w-xs">
                        "Ownership of a digital signature implies absolute liability for its application in the Digital Realm."
                    </p>

                    <button 
                        onClick={onAccept}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/30 hover:shadow-red-500/40 flex items-center justify-center gap-2 group"
                    >
                        <ShieldCheckIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        I ACCEPT FULL ACCOUNTABILITY
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTS (Retained & Adapted) ---

const ThumbPrintScanner = ({ onClose, onVerified, mode = 'LOGIN' }: { onClose: () => void, onVerified: () => void, mode?: 'LOGIN' | 'ENROLL' }) => {
    const [scanState, setScanState] = useState<'CONNECTING' | 'WAITING' | 'SCANNING' | 'ANALYZING' | 'SUCCESS'>('CONNECTING');
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState("Initializing Hardware Interface...");

    useEffect(() => {
        // Simulate Hardware Connection (Plug & Play) to demonstrate ease of installation
        setTimeout(() => {
            setLog("Hardware Detected: Synaptics BioTouch v4.0");
            setTimeout(() => {
                setScanState('WAITING');
                setLog(mode === 'ENROLL' ? "Ready. Place thumb to record unique signature." : "Ready. Verify Identity.");
            }, 800);
        }, 1000);
    }, [mode]);

    const handleTouch = () => {
        if (scanState !== 'WAITING') return;
        setScanState('SCANNING');
        setLog(mode === 'ENROLL' ? "Capturing High-Res Ridge Map..." : "Acquiring Ridge Data...");
        
        // Animate progress
        let p = 0;
        const speed = mode === 'ENROLL' ? 30 : 20; // Enrollment takes slightly longer
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setScanState('ANALYZING');
                setLog(mode === 'ENROLL' ? "Encrypting Biometric Template..." : "Comparing Biometric Hash...");
                setTimeout(() => {
                    setScanState('SUCCESS');
                    setLog(mode === 'ENROLL' ? "Template Saved. Future Access: SEAMLESS." : "Identity Confirmed: NE.B.RU");
                    setTimeout(onVerified, 1500);
                }, 1000);
            }
        }, speed);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden relative shadow-[0_0_80px_rgba(6,182,212,0.15)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"><XMarkIcon className="w-6 h-6" /></button>
                
                <div className="p-8 pb-4 text-center">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                        {mode === 'ENROLL' ? 'One-Time Setup' : 'Touch ID'}
                    </h2>
                    <p className="text-xs text-cyan-500 font-mono mt-1">
                        {mode === 'ENROLL' ? 'BIOMETRIC REGISTRATION' : 'HARDWARE BIOMETRIC MODULE'}
                    </p>
                </div>

                <div className="h-64 flex flex-col items-center justify-center relative">
                    {/* Scanner Graphic */}
                    <div 
                        className={`w-32 h-32 rounded-full border-4 flex items-center justify-center relative transition-all duration-500 cursor-pointer ${
                            scanState === 'WAITING' ? 'border-slate-700 bg-slate-800 hover:border-cyan-500/50' :
                            scanState === 'SCANNING' || scanState === 'ANALYZING' ? 'border-cyan-500 shadow-[0_0_30px_#06b6d4]' :
                            scanState === 'SUCCESS' ? 'border-emerald-500 shadow-[0_0_30px_#10b981] bg-emerald-900/20' : 
                            'border-slate-800'
                        }`}
                        onClick={handleTouch}
                    >
                        <FingerPrintIcon className={`w-20 h-20 transition-all duration-500 ${
                            scanState === 'SUCCESS' ? 'text-emerald-400' : 
                            scanState === 'WAITING' ? 'text-slate-600' : 'text-cyan-400 animate-pulse'
                        }`} />
                        
                        {/* Scan Line Animation */}
                        {scanState === 'SCANNING' && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent w-full h-full animate-[scan_1.5s_infinite]"></div>
                        )}
                    </div>

                    {/* Connection Status Indicator */}
                    <div className="mt-8 flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${scanState === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                         <span className="text-[10px] uppercase font-bold text-slate-500">
                             {scanState === 'CONNECTING' ? 'Installing Driver...' : 'Device Online'}
                         </span>
                    </div>
                </div>

                <div className="p-6 bg-slate-950 border-t border-slate-800">
                     <div className="h-2 w-full bg-slate-900 rounded-full mb-4 overflow-hidden">
                         <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${progress}%` }}></div>
                     </div>
                     <div className="text-center font-mono text-xs text-cyan-200/80 min-h-[1.5rem] animate-fadeIn">
                         {`> ${log}`}
                     </div>
                     {scanState === 'WAITING' && (
                         <div className="text-center text-[10px] text-slate-600 mt-2 animate-pulse">
                             {mode === 'ENROLL' ? 'Place thumb to record signature' : 'Click sensor to simulate touch'}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

// --- FACILITY COMMANDER (ADMIN) COMPONENT ---

const FacilityCommander = ({ onLogout }: { onLogout: () => void }) => {
    // Mock Data for Employees
    const [employees, setEmployees] = useState([
        { id: 'EMP-089', name: 'Sarah Connor', role: 'Senior Agent', badgeId: 'NEO-8821', status: 'ACTIVE', location: 'Workstation 4', hasBiometrics: true },
        { id: 'EMP-092', name: 'John Anderson', role: 'Support Lead', badgeId: 'NEO-3391', status: 'ACTIVE', location: 'Cafeteria Gate', hasBiometrics: true },
        { id: 'EMP-104', name: 'David Bowman', role: 'Network Ops', badgeId: 'NEO-0012', status: 'SUSPENDED', location: 'Off-Site', hasBiometrics: false },
        { id: 'EMP-110', name: 'Ellen Ripley', role: 'Compliance', badgeId: 'NEO-4420', status: 'ACTIVE', location: 'Archives', hasBiometrics: false },
    ]);

    const [accessLogs, setAccessLogs] = useState<string[]>([]);
    const [enrollTarget, setEnrollTarget] = useState<string | null>(null);

    // Simulate Real-time Facility Activity
    useEffect(() => {
        const locations = ['Main Gate', 'Server Room', 'Workstation 12', 'Elevator B', 'Lobby Turnstile'];
        const actions = ['ACCESS GRANTED', 'ACCESS GRANTED', 'ACCESS GRANTED', 'AUTO-LOGIN SUCCESS', 'DOOR UNLOCKED'];
        
        const interval = setInterval(() => {
            const randomEmp = employees[Math.floor(Math.random() * employees.length)];
            if (randomEmp.status === 'ACTIVE') {
                const loc = locations[Math.floor(Math.random() * locations.length)];
                const act = actions[Math.floor(Math.random() * actions.length)];
                const log = `[${new Date().toLocaleTimeString()}] ${randomEmp.badgeId} @ ${loc}: ${act}`;
                setAccessLogs(prev => [log, ...prev].slice(0, 8));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [employees]);

    const toggleStatus = (id: string) => {
        setEmployees(prev => prev.map(emp => 
            emp.id === id ? { ...emp, status: emp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : emp
        ));
    };

    const handleProvision = () => {
        const newId = Math.floor(Math.random() * 1000);
        const newEmp = { 
            id: `EMP-${newId}`, 
            name: 'New Recruit', 
            role: 'Agent Trainee', 
            badgeId: `NEO-${Math.floor(Math.random() * 9000) + 1000}`, 
            status: 'ACTIVE', 
            location: 'Provisioning Bay',
            hasBiometrics: false
        };
        setEmployees(prev => [...prev, newEmp]);
    };

    const markAsEnrolled = (id: string) => {
        setEmployees(prev => prev.map(emp =>
            emp.id === id ? { ...emp, hasBiometrics: true } : emp
        ));
        setEnrollTarget(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
            {/* Admin Header */}
            <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-6 h-6 text-amber-500" />
                    <div>
                        <h1 className="font-bold text-white tracking-wide">FACILITY COMMANDER</h1>
                        <div className="text-[10px] text-slate-500 font-mono">SignaSovereign Admin Protocol v1.0</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-500 font-mono">
                        <KeyIcon className="w-3 h-3" /> MASTER CONTROL
                    </div>
                    <button onClick={onLogout} className="hover:text-white"><PowerIcon className="w-5 h-5" /></button>
                </div>
            </header>

            <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
                
                {/* Main Roster Panel */}
                <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <h2 className="font-bold flex items-center gap-2">
                            <UserGroupIcon className="w-5 h-5 text-blue-500" /> 
                            Badge Inventory & Status
                        </h2>
                        <button 
                            onClick={handleProvision}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
                        >
                            <CreditCardIcon className="w-4 h-4" /> Provision New Batch
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-950 text-slate-400 font-mono text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Badge ID</th>
                                    <th className="px-6 py-4">Biometric Status</th>
                                    <th className="px-6 py-4">Account Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">
                                            {emp.name}
                                            <div className="text-xs text-slate-500 font-normal">{emp.role}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-amber-500">{emp.badgeId}</td>
                                        <td className="px-6 py-4">
                                            {emp.hasBiometrics ? (
                                                <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                                    <FingerPrintIcon className="w-4 h-4" /> SECURE
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => setEnrollTarget(emp.id)}
                                                    className="flex items-center gap-2 text-cyan-400 text-xs font-bold hover:text-cyan-300 hover:underline"
                                                >
                                                    <FingerPrintIcon className="w-4 h-4" /> ENROLL PRINT
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${emp.status === 'ACTIVE' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => toggleStatus(emp.id)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${emp.status === 'ACTIVE' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-500/30' : 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/30'}`}
                                            >
                                                {emp.status === 'ACTIVE' ? 'TERMINATE' : 'ACTIVATE'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Feed Sidebar */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <h2 className="font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Live Access Feed
                        </h2>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3 font-mono text-xs">
                        {accessLogs.map((log, i) => (
                            <div key={i} className="border-l-2 border-emerald-500 pl-3 py-1 text-slate-300">
                                {log}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                        <div className="text-[10px] text-slate-500 mb-2 uppercase font-bold">System Health</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Gate Controllers</span>
                                <span className="text-emerald-500">ONLINE</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Desktop Auth</span>
                                <span className="text-emerald-500">ONLINE</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Biometric DB</span>
                                <span className="text-emerald-500">ENCRYPTED</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {enrollTarget && (
                <ThumbPrintScanner 
                    mode="ENROLL"
                    onClose={() => setEnrollTarget(null)} 
                    onVerified={() => markAsEnrolled(enrollTarget)}
                />
            )}
        </div>
    );
};


const SignaSovereignBadge = ({ onClose, onVerified }: { onClose: () => void, onVerified: () => void }) => {
    const [isSwiping, setIsSwiping] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [accessGranted, setAccessGranted] = useState(false);

    const handleSwipe = () => {
        if (isSwiping || accessGranted) return;
        setIsSwiping(true);

        const sequence = [
            { t: 500, msg: "> SENSOR: Magnetic/NFC Hybrid Signal Acquired" },
            { t: 1200, msg: "> PROTOCOL: SignaSovereign Facility Handshake" },
            { t: 1800, msg: "> AUTH: Validating Employee ID against Central Command..." },
            { t: 2400, msg: "> STATUS: ACTIVE. Security Clearance: LEVEL 3." },
            { t: 3200, msg: "> ACTION: Unlocking Workstation..." },
            { t: 4000, msg: ">> ACCESS GRANTED: SESSION INITIATED" }
        ];

        sequence.forEach(({ t, msg }) => {
            setTimeout(() => {
                setLogs(prev => [...prev, msg]);
                if (msg.includes("ACCESS GRANTED")) {
                    setAccessGranted(true);
                    setTimeout(onVerified, 1500);
                }
            }, t);
        });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden relative shadow-[0_0_100px_rgba(245,158,11,0.2)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"><XMarkIcon className="w-6 h-6" /></button>
                <div className="p-8 text-center border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 uppercase tracking-widest mb-2">SignaSovereign</h2>
                    <p className="text-xs text-amber-500/60 font-mono">AUTOMATED ACCESS PROTOCOL</p>
                </div>
                <div className="relative h-64 bg-slate-950 flex flex-col items-center justify-center overflow-hidden perspective-1000">
                    <div className={`absolute z-10 w-64 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-amber-500/50 shadow-2xl flex flex-col p-4 justify-between transition-all duration-[1000ms] ease-in-out transform ${isSwiping ? 'translate-x-[400px] opacity-0 rotate-y-12' : 'translate-x-0 opacity-100'}`} style={{ boxShadow: "0 0 30px rgba(245, 158, 11, 0.15)" }}>
                        <div className="flex justify-between items-start"><CubeTransparentIcon className="w-8 h-8 text-amber-500" /><WifiIcon className="w-6 h-6 text-slate-600 rotate-90" /></div>
                        <div className="font-mono text-amber-100/80 text-sm tracking-widest mt-4">NEOXZ.ID<div className="text-xs text-slate-500 mt-1">****-****-8821</div></div>
                        <div className="flex justify-between items-end"><div className="text-[10px] text-slate-600 font-mono">NE.B.RU</div><div className="text-[10px] text-amber-500 font-bold uppercase">Sovereign Badge</div></div>
                        <div className="absolute bottom-2 right-2 w-12 h-8 bg-slate-700/50 rounded flex items-center justify-center border border-slate-600"><div className="w-8 h-4 bg-black/50"></div></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center"><div className={`w-full h-1 bg-amber-500/20 relative transition-opacity duration-300 ${isSwiping ? 'opacity-100' : 'opacity-30'}`}>{isSwiping && <div className="absolute top-0 left-0 h-full w-1/3 bg-amber-500 shadow-[0_0_20px_#f59e0b] animate-[shimmer_2s_infinite]"></div>}</div><div className={`absolute text-slate-800 font-black text-6xl select-none transition-all duration-500 ${isSwiping ? 'scale-110 text-amber-900/50' : ''}`}>SWIPE</div></div>
                </div>
                <div className="p-6 bg-slate-900 border-t border-slate-800 min-h-[220px] flex flex-col justify-end">
                    {!isSwiping ? (
                        <div className="space-y-4 animate-fadeIn">
                            <p className="text-center text-sm text-slate-400">Swipe magnetic card or tap badge.</p>
                            <button onClick={handleSwipe} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-all flex items-center justify-center gap-3 group"><CreditCardIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /> SIMULATE SWIPE</button>
                            <div className="flex justify-center gap-4 text-[10px] text-slate-600 uppercase font-bold tracking-wider"><span>One-Swipe Entry</span><span>•</span><span>Gate Access</span><span>•</span><span>Workstation Login</span></div>
                        </div>
                    ) : (
                        <div className="font-mono text-xs space-y-2.5 h-full flex flex-col justify-end">
                            {logs.map((log, i) => (<div key={i} className={`border-l-2 pl-3 py-0.5 animate-fadeIn ${log.includes("GRANTED") ? "border-emerald-500 text-emerald-400 font-bold bg-emerald-950/20" : "border-amber-500/30 text-amber-200/80"}`}>{log}</div>))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SynthIDScanner = ({ onClose }: { onClose: () => void }) => {
    const [text, setText] = useState("");
    const [result, setResult] = useState<WatermarkDetectionResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = async () => {
        if(!text.trim()) return;
        setIsScanning(true);
        try {
            const res = await detectSynthIDWatermark(text);
            setResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white font-bold"><SparklesIcon className="w-5 h-5 text-blue-400" /> SynthID™ Detector</div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/80">
                {!result ? (
                    <div className="space-y-4">
                        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-48 bg-slate-800 border border-slate-700 rounded p-3 text-sm text-white font-mono" placeholder="Paste content to scan..." />
                        <button onClick={handleScan} disabled={isScanning || !text} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center justify-center gap-2">{isScanning ? 'Analyzing...' : 'Scan Now'}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div className={`p-4 rounded border ${result.isWatermarked ? 'border-red-500 bg-red-900/20' : 'border-emerald-500 bg-emerald-900/20'}`}>
                             <div className={`text-xl font-bold ${result.isWatermarked ? 'text-red-400' : 'text-emerald-400'}`}>{result.isWatermarked ? 'AI ARTIFACTS FOUND' : 'HUMAN ORGANIC'}</div>
                             <div className="text-sm text-slate-300 mt-1">{result.analysis}</div>
                         </div>
                         <button onClick={() => {setResult(null); setText("");}} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded">New Scan</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContractAnalyzerApp = ({ onClose }: { onClose: () => void }) => {
    const [text, setText] = useState("");
    const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const runAnalysis = async () => {
        setAnalyzing(true);
        try { const res = await analyzeContract(text); setAnalysis(res); } catch(e) {} finally { setAnalyzing(false); }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white font-bold"><DocumentCheckIcon className="w-5 h-5 text-purple-400" /> Contract Analysis</div>
                <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/80">
                {!analysis ? (
                    <div className="space-y-4">
                        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-48 bg-slate-800 border border-slate-700 rounded p-3 text-sm text-white font-mono" placeholder="Paste legal text..." />
                        <button onClick={runAnalysis} disabled={analyzing} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded">{analyzing ? 'Processing...' : 'Analyze Compliance'}</button>
                    </div>
                ) : (
                     <div className="space-y-4 text-sm text-slate-300">
                         <div className="font-bold text-white text-lg">Risk Level: <span className={analysis.riskLevel === 'Low' ? 'text-emerald-400' : 'text-red-400'}>{analysis.riskLevel}</span></div>
                         <p>{analysis.recommendation}</p>
                         <button onClick={() => setAnalysis(null)} className="w-full py-2 bg-slate-700 text-white rounded">Close Report</button>
                     </div>
                )}
            </div>
        </div>
    );
};

const BiometricSentinel = ({ onClose, onVerified }: { onClose: () => void, onVerified: () => void }) => {
  const [status, setStatus] = useState("Initializing Biometric Sensors...");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [transcription, setTranscription] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let accumulatedTranscription = "";

    const start = async () => {
      setError(null);
      if (!process.env.API_KEY) { setError("API Key Missing"); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sessionPromise = ai.live.connect({
           model: 'gemini-2.5-flash-native-audio-preview-09-2025',
           callbacks: {
               onopen: () => { setStatus("Sentinel Active. Scanning."); setIsLive(true); },
               onmessage: (msg: LiveServerMessage) => {
                   if (msg.serverContent?.outputTranscription?.text) {
                       const text = msg.serverContent.outputTranscription.text;
                       accumulatedTranscription += text;
                       setTranscription(prev => (prev + text).slice(-100));
                       if (accumulatedTranscription.toUpperCase().includes("IDENTITY VERIFIED")) {
                           setStatus("AUTHENTICATION SUCCESSFUL.");
                           setTimeout(onVerified, 2000);
                       }
                   }
               },
               onclose: () => setIsLive(false),
               onerror: () => setError("Connection Failed")
           },
           config: {
               responseModalities: [Modality.AUDIO],
               outputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-09-2025' },
               systemInstruction: `You are the Biometric Sentinel. Your goal is to verify liveness. Ask the user to move. If satisfied, say "IDENTITY VERIFIED".`,
           }
        });
        
        cleanup = () => {
            stream.getTracks().forEach(t => t.stop());
            sessionPromise.then(s => s.close());
        };
      } catch (e: any) { setError(e.message); }
    };
    start();
    return () => cleanup?.();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 z-20"><XMarkIcon className="w-6 h-6" /></button>
            <div className="aspect-video bg-black relative">
                <video ref={videoRef} className="w-full h-full object-cover opacity-80" muted playsInline />
                <div className="absolute bottom-4 left-4 text-emerald-500 font-mono text-xs">{status}</div>
                {transcription && <div className="absolute top-4 left-4 right-12 bg-black/50 text-white text-xs p-2 rounded">{transcription}</div>}
            </div>
        </div>
    </div>
  );
};

// --- WORKSTATION DESKTOP ---

const WorkstationDesktop = ({ onLogout, authMethod }: { onLogout: () => void, authMethod: 'SENTINEL' | 'BADGE' | 'THUMB' }) => {
    const [ledgerChain, setLedgerChain] = useState<LedgerBlock[]>([]);
    const [openApp, setOpenApp] = useState<string | null>(null);
    const [showAuthToast, setShowAuthToast] = useState(false);

    useEffect(() => {
        setLedgerChain(ledgerService.getChain());
    }, []);

    const launchApp = (appId: string) => {
        // Simulate "Seamless Login"
        setShowAuthToast(true);
        setTimeout(() => {
            setShowAuthToast(false);
            setOpenApp(appId);
        }, 800);
    };

    const renderWindow = () => {
        if (!openApp) return null;
        return (
            <div className="fixed inset-4 md:inset-10 z-40 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col animate-fadeIn">
                {openApp === 'synthid' && <SynthIDScanner onClose={() => setOpenApp(null)} />}
                {openApp === 'contracts' && <ContractAnalyzerApp onClose={() => setOpenApp(null)} />}
                {/* Add other app placeholders */}
                {openApp === 'ledger' && (
                     <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-800 flex justify-between bg-slate-950">
                            <span className="text-emerald-500 font-bold">Sovereign Ledger Explorer</span>
                            <button onClick={() => setOpenApp(null)}><XMarkIcon className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="p-4 overflow-auto flex-1 bg-slate-900">
                             <table className="w-full text-xs text-left text-slate-400">
                                <thead><tr className="border-b border-slate-800"><th className="p-2">Block</th><th className="p-2">Hash</th><th className="p-2">Type</th></tr></thead>
                                <tbody>
                                    {ledgerChain.map(b => (
                                        <tr key={b.hash} className="border-b border-slate-800/50">
                                            <td className="p-2 text-emerald-500">#{b.index}</td>
                                            <td className="p-2 font-mono truncate max-w-[100px]">{b.hash}</td>
                                            <td className="p-2">{b.data.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                     </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center text-slate-200 font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

            {/* Top Bar / Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-4 z-30 text-xs font-mono">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-white">NEOXZ Workstation OS v4.2.1</span>
                    <span className="text-slate-500">|</span>
                    {authMethod === 'SENTINEL' ? (
                        <span className="flex items-center gap-2 text-emerald-400 animate-pulse">
                            <VideoCameraIcon className="w-3 h-3" /> SENTINEL ACTIVE
                        </span>
                    ) : authMethod === 'BADGE' ? (
                        <span className="flex items-center gap-2 text-amber-400">
                            <WifiIcon className="w-3 h-3" /> BADGE LINKED (-24dBm)
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-cyan-400">
                            <FingerPrintIcon className="w-3 h-3" /> TOUCH ID SECURE
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400">{new Date().toLocaleTimeString()}</span>
                    <button onClick={onLogout} className="hover:text-white"><PowerIcon className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Desktop Icons */}
            <div className="absolute top-12 left-4 bottom-4 flex flex-col gap-6 z-20 w-24">
                <button onClick={() => launchApp('ledger')} className="group flex flex-col items-center gap-1 text-center">
                    <div className="w-14 h-14 bg-slate-800/80 border border-slate-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500 transition-all">
                        <LockClosedIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-black/50 px-2 rounded">Ledger</span>
                </button>

                <button onClick={() => launchApp('contracts')} className="group flex flex-col items-center gap-1 text-center">
                    <div className="w-14 h-14 bg-slate-800/80 border border-slate-600 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500 transition-all">
                        <DocumentCheckIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-black/50 px-2 rounded">Contracts</span>
                </button>

                <button onClick={() => launchApp('synthid')} className="group flex flex-col items-center gap-1 text-center">
                    <div className="w-14 h-14 bg-slate-800/80 border border-slate-600 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500 transition-all">
                        <SparklesIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-black/50 px-2 rounded">SynthID</span>
                </button>
            </div>

            {/* Main Area / Wallpaper Branding */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-20">
                <CubeTransparentIcon className="w-64 h-64 text-slate-700" />
            </div>

            {/* Seamless Login Toast */}
            {showAuthToast && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-800 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 animate-bounce">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Identity Pre-Verified. Access Granted.</span>
                </div>
            )}

            {/* App Window Layer */}
            {renderWindow()}
        </div>
    );
};

// --- MAIN APP (OS CONTROLLER) ---

const App = () => {
    const [systemState, setSystemState] = useState<'BOOT' | 'LOCKED' | 'DESKTOP' | 'ADMIN'>('BOOT');
    const [authMethod, setAuthMethod] = useState<'SENTINEL' | 'BADGE' | 'THUMB' | null>(null);
    const [showLoginModal, setShowLoginModal] = useState<'SENTINEL' | 'BADGE' | 'THUMB' | null>(null);
    const [showLiabilityModal, setShowLiabilityModal] = useState(false);
    const [pendingAuthMethod, setPendingAuthMethod] = useState<'SENTINEL' | 'BADGE' | 'THUMB' | null>(null);

    const handleLoginSuccess = (method: 'SENTINEL' | 'BADGE' | 'THUMB') => {
        setShowLoginModal(null);
        setPendingAuthMethod(method);
        setShowLiabilityModal(true);
    };

    const handleLiabilityAccepted = () => {
        if (pendingAuthMethod) {
            setAuthMethod(pendingAuthMethod);
            setSystemState('DESKTOP');
            setShowLiabilityModal(false);
        }
    };

    if (systemState === 'BOOT') {
        return <BootSequence onComplete={() => setSystemState('LOCKED')} />;
    }

    if (systemState === 'DESKTOP' && authMethod) {
        return <WorkstationDesktop authMethod={authMethod} onLogout={() => setSystemState('LOCKED')} />;
    }

    if (systemState === 'ADMIN') {
        return <FacilityCommander onLogout={() => setSystemState('LOCKED')} />;
    }

    // LOCK SCREEN
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-20">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
            </div>

            <div className="z-10 text-center max-w-md w-full">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <LockClosedIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">WORKSTATION LOCKED</h1>
                    <p className="text-slate-500 text-sm mt-2">Perpetual Engine Protocol v4.2.1 (SECURE)</p>
                </div>

                <div className="space-y-4 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
                    <button 
                        onClick={() => setShowLoginModal('SENTINEL')}
                        className="w-full py-4 bg-emerald-900/20 border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl transition-all flex items-center justify-center gap-3 group"
                    >
                        <VideoCameraIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        BIOMETRIC SCAN
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setShowLoginModal('BADGE')}
                            className="w-full py-4 bg-amber-900/20 border border-amber-500/50 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <CreditCardIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">SWIPE BADGE</span>
                        </button>
                        <button 
                            onClick={() => setShowLoginModal('THUMB')}
                            className="w-full py-4 bg-cyan-900/20 border border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <FingerPrintIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">THUMB PRINT</span>
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setSystemState('ADMIN')}
                        className="w-full py-2 mt-4 text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 border-t border-slate-800 pt-4"
                    >
                        <BuildingOfficeIcon className="w-3 h-3" /> FACILITY COMMAND ADMIN
                    </button>
                    
                    <div className="text-[10px] text-slate-600 font-mono pt-4 border-t border-slate-800">
                        UNAUTHORIZED ACCESS IS A FEDERAL CRIME IN THE DIGITAL REALM
                    </div>
                </div>
            </div>

            {showLoginModal === 'SENTINEL' && (
                <BiometricSentinel 
                    onClose={() => setShowLoginModal(null)} 
                    onVerified={() => handleLoginSuccess('SENTINEL')}
                />
            )}

            {showLoginModal === 'BADGE' && (
                <SignaSovereignBadge 
                    onClose={() => setShowLoginModal(null)} 
                    onVerified={() => handleLoginSuccess('BADGE')}
                />
            )}

            {showLoginModal === 'THUMB' && (
                <ThumbPrintScanner 
                    onClose={() => setShowLoginModal(null)} 
                    onVerified={() => handleLoginSuccess('THUMB')}
                />
            )}

            {showLiabilityModal && (
                <ResponsibilityModal 
                    onAccept={handleLiabilityAccepted}
                />
            )}
        </div>
    );
};

export default App;