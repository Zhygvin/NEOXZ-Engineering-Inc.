
export interface IdentityProfile {
  email: string;
  fullName: string;
  type: 'PERSONAL' | 'CORPORATE' | 'STUDENT';
  organization?: string;
  address?: string;
  phone: string; // Mandatory for 2FA/Identity
  dateOfBirth?: string; // YYYY-MM-DD for age verification
  isMinor?: boolean; // Calculated flag for protocol enforcement
  
  // Entity Authentication Factors
  locationCoordinates?: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  };
  deviceSignature: string; // Hash of user agent/hardware
  trustedContact: string; // Email/Phone of a voucher
  biometricSignature?: string; // WebAuthn or simulated biometric hash
  subscriptionExpiry?: number; // Timestamp of subscription end
  hasUsedTrial?: boolean; // Track if the user has already claimed a free trial
}

export interface KeyPairIdentity {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  id: string;
  createdAt: number;
  fingerprint: string; // SHA-256 hash of public key
  profile: IdentityProfile;
}

export interface ContractAnalysis {
  summary: string;
  riskScore: number; // 0-100 (100 = High Risk/Non-Compliant)
  authenticityScore: number; // 0-100 (100 = Legally Sound/Standard)
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  identifiedEntity?: string; // The entity responsible for the contract
  complianceIssues: string[]; // e.g. ["Unfair Terms", "Hidden Fees", "Phishing Risk"] - renamed from detectedCrimes
  keyClauses: Array<{
    title: string;
    description: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  recommendation: string;
}

export interface SecurityScanResult {
  isSafe: boolean;
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  threatType: string; // e.g., "Phishing", "Malware Script", "Safe Document", "Malicious QR"
  details: string;
  extractedData?: string; // URL from QR or detected text content
}

export interface AccountabilityReport {
  entityName: string;
  score: number; // 0-100 (0 = Ghost/Unaccountable, 100 = Fully Accountable)
  status: 'VERIFIED_ACCOUNTABLE' | 'SUSPICIOUS_OPAQUE' | 'UNACCOUNTABLE_GHOST';
  missingMarkers: string[]; // e.g. "No Physical Address", "Anonymous Domain Proxy", "No Liability Clause"
  liabilityStance: string; // Description of how they handle liability
  riskAssessment: string;
}

export interface ConnectedAccount {
  id: string;
  platform: string;
  category: 'SOCIAL' | 'FINANCE' | 'UTILITY' | 'ENTERTAINMENT' | 'GOV';
  status: 'SECURE' | 'WARNING' | 'CRITICAL_ISSUE';
  issueDescription?: string; // e.g., "Password Breach Detected", "Login Loop"
  lastSync: number;
}

// --- Ledger Specific Types ---

export interface AuthorityReceipt {
  status: 'COMMENDED' | 'MONITORED' | 'FLAGGED_FOR_AUDIT';
  timestamp: number;
  caseId: string;
  authoritySignature: string; // Simulated cryptographic proof from authority
  message: string;
}

export interface BlockData {
  type: 'GENESIS' | 'SIGNATURE' | 'IDENTITY_CREATION' | 'ENFORCEMENT_ACTION' | 'ACCOUNTABILITY_FLAG' | 'SYSTEM_UPDATE' | 'VERIFICATION_ATTEMPT' | 'BREACH_REPORT';
  documentName?: string;
  documentHash?: string; // Hash of the file content
  signature?: string;
  identityId: string;
  signerProfileSnapshot?: IdentityProfile; // Traceability: Snapshot of details at signing time
  authorityReceipt?: AuthorityReceipt; // Accountability: Proof of authority reporting
  timestamp: number;
  metadata?: any;
}

export interface LedgerBlock {
  index: number;
  timestamp: number;
  data: BlockData;
  previousHash: string;
  hash: string; // The hash of this block (index + timestamp + data + previousHash)
}

export interface VerificationResult {
  isValid: boolean;
  errorBlockIndex?: number;
  message: string;
}

export interface ProtocolUpdate {
  version: string;
  type: 'MANDATORY' | 'VOLUNTARY';
  title: string;
  description: string;
  modules: string[];
  mandatingAuthority?: string; // e.g. "Global Cyber Alliance", "Ministry of Digital Affairs"
}
