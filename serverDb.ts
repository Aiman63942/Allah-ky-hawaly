import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredCase {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Under Review" | "Pending Legal" | "Completed";
  verdict: "DEEPFAKE" | "AUTHENTIC" | "INCONCLUSIVE";
  priority: "Critical" | "High" | "Medium" | "Low";
  analyst: string;
  agency: string;
  date: string;
  updatedDate: string;
  evidenceCount: number;
  threatScore?: number;
  createdBy: string;
}

export interface StoredEvidence {
  id: string;
  caseId: string;
  filename: string;
  fileSize: string;
  duration: string;
  sampleRate: string;
  bitDepth: string;
  channels: string;
  sha256Hash: string;
  uploadTimestamp: string;
  status: "Uploaded" | "Preprocessing" | "Processed" | "Verified" | "Failed";
  audioUrl?: string;
  audioData?: string; // Base64 audio representation
  uploadedBy?: string;
  classification?: string;
  verifiedBy?: string;
  verificationDate?: string;
  isIntegrityVerified?: boolean;
}

export interface StoredReferenceSample {
  id: string;
  caseId: string;
  subjectName: string;
  filename: string;
  fileSize: string;
  duration: string;
  sha256Hash: string;
  conditionTag: "Normal" | "Illness/Cold" | "Whispering" | "Disguised" | "Other";
  lawfulConsentDeclared: boolean;
  consentNotes: string;
  uploadedBy: string;
  uploadedAt: string;
  audioData?: string;
}

export interface StoredSpeakerVerification {
  id: string;
  caseId: string;
  evidenceId: string;
  referenceId: string;
  subjectName: string;
  verdict:
    | "Analysis completed"
    | "Consistent with the same speaker"
    | "Not sufficiently consistent with the same speaker"
    | "Inconclusive"
    | "Insufficient audio quality"
    | "Reference recording missing"
    | "Model unavailable"
    | "Analysis failed";
  similarityScore: number;
  threshold: number;
  speechDurationSeconds: number;
  evidenceIsSynthetic: boolean;
  decisionNote: string;
  modelsUsed: string[];
  referenceProvenance?: string;
  limitations: string;
  analyzedAt: string;
  acousticComparison?: {
    f0DeltaHz: number;
    spectralDistance: number;
    jitterRatio: number;
    hnrDifferenceDb: number;
  };
}

export interface StoredVoiceDisguise {
  id: string;
  caseId: string;
  evidenceId: string;
  questionedFilename: string;
  referenceFilename?: string;
  audioQualityStatus: "Sufficient for analysis" | "Marginal" | "Insufficient for analysis";
  acousticMeasurements: any;
  referenceMeasurements?: any;
  hypotheses: Array<{
    hypothesis: string;
    likelihood: string;
    findings: string;
    supportingFeatures: string[];
  }>;
  overallSummary: string;
  scientificLimitations: string;
  expertNotes?: string;
  analyzedAt: string;
}

export interface StoredChainOfCustodyEvent {
  id: string;
  caseId: string;
  evidenceId?: string;
  eventNumber: number;
  title: string;
  actorRole: "System" | "Lead Analyst" | "Automated" | "Expert" | "Legal";
  status: "VERIFIED" | "PENDING";
  timestamp: string;
  userName: string;
  ipAddress: string;
  digitalSignature: string;
  blockHash: string;
  hashAtEvent?: string;
  details?: string;
}

export interface StoredExpertReview {
  id: string;
  caseId: string;
  expertName: string;
  email?: string;
  institution: string;
  certificationId: string;
  status: "Approved" | "Pending" | "Disputed";
  technicalAssessment: string;
  overrideReason?: string;
  checklist: {
    swgdeStandards: boolean;
    chainOfCustodyVerified: boolean;
    reproducibleOutputs: boolean;
    confidenceIntervalsValid: boolean;
    acousticSpectralInspected?: boolean;
  };
  digitalSignature: string;
  signedAt: string;
  biometricVerified?: boolean;
  biometricScore?: number;
}

export interface StoredNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "critical" | "success" | "info" | "warning";
  caseId?: string;
  targetRole?: string;
}

export interface StoredAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: "VIEW" | "WRITE" | "SIGN" | "UPLOAD" | "VERIFY" | "LOGIN" | "CONFIG" | "DELETE";
  resource: string;
  ipAddress: string;
  status: "SUCCESS" | "FAILED";
  details?: string;
  role?: string;
}

export interface StoredUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
  agency: string;
  avatar: string;
  status: "active" | "pending" | "suspended" | "inactive";
  casesCount: number;
  securityClearance?: string;
  certificationId?: string;
}

export interface StoredBiometricRecord {
  expertId: string;
  expertName: string;
  minutiaeHash: string;
  enrolledAt: string;
  ridgeCount: number;
  patternType: "Whorl" | "Right Loop" | "Left Loop" | "Arch";
  technology: string;
  biometricVector: number[];
  credentialId?: string;
}

export interface DatabaseSchema {
  cases: StoredCase[];
  evidence: StoredEvidence[];
  referenceSamples: StoredReferenceSample[];
  speakerVerifications: StoredSpeakerVerification[];
  voiceDisguiseAnalyses: StoredVoiceDisguise[];
  chainOfCustody: StoredChainOfCustodyEvent[];
  expertReviews: StoredExpertReview[];
  notifications: StoredNotification[];
  auditLogs: StoredAuditLog[];
  users: StoredUserRecord[];
  biometricTemplates: StoredBiometricRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "alfadetect_store.json");

class ServerDatabase {
  private data: DatabaseSchema = {
    cases: [],
    evidence: [],
    referenceSamples: [],
    speakerVerifications: [],
    voiceDisguiseAnalyses: [],
    chainOfCustody: [],
    expertReviews: [],
    notifications: [],
    auditLogs: [],
    users: [],
    biometricTemplates: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        // Initialize with realistic initial forensic verification case if clean
        this.seedInitialCase();
        this.save();
      }
    } catch (err) {
      console.warn("Database initialization notice:", err);
      this.seedInitialCase();
    }
  }

  private seedInitialCase() {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

    this.data = {
      cases: [],
      evidence: [],
      referenceSamples: [],
      speakerVerifications: [],
      voiceDisguiseAnalyses: [],
      chainOfCustody: [],
      expertReviews: [],
      notifications: [],
      auditLogs: [
        {
          id: "AUD-INIT-001",
          timestamp: now,
          user: "System Security Engine",
          action: "CONFIG",
          resource: "ALFADetect Immutable Forensic Ledger Initialized (Clean State)",
          ipAddress: "127.0.0.1",
          status: "SUCCESS"
        }
      ],
      users: [],
      biometricTemplates: []
    };
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to database file:", err);
    }
  }

  // Cases
  public getCases(): StoredCase[] {
    return this.data.cases;
  }

  public getCaseById(id: string): StoredCase | undefined {
    return this.data.cases.find((c) => c.id === id);
  }

  public createCase(newCase: StoredCase): StoredCase {
    this.data.cases.unshift(newCase);
    this.save();
    return newCase;
  }

  public updateCase(id: string, updates: Partial<StoredCase>): StoredCase | null {
    const index = this.data.cases.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.cases[index] = {
      ...this.data.cases[index],
      ...updates,
      updatedDate: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"
    };
    this.save();
    return this.data.cases[index];
  }

  public deleteCase(id: string): boolean {
    const initialLen = this.data.cases.length;
    this.data.cases = this.data.cases.filter((c) => c.id !== id);
    this.data.evidence = this.data.evidence.filter((e) => e.caseId !== id);
    this.data.chainOfCustody = this.data.chainOfCustody.filter((coc) => coc.caseId !== id);
    this.data.expertReviews = this.data.expertReviews.filter((r) => r.caseId !== id);
    this.save();
    return this.data.cases.length < initialLen;
  }

  // Evidence
  public getEvidence(caseId?: string): StoredEvidence[] {
    if (caseId) {
      return this.data.evidence.filter((e) => e.caseId === caseId);
    }
    return this.data.evidence;
  }

  public getEvidenceById(id: string): StoredEvidence | undefined {
    return this.data.evidence.find((e) => e.id === id);
  }

  public createEvidence(ev: StoredEvidence): StoredEvidence {
    this.data.evidence.unshift(ev);
    // Increment case evidence count
    const c = this.getCaseById(ev.caseId);
    if (c) {
      c.evidenceCount = (c.evidenceCount || 0) + 1;
      c.updatedDate = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
    }
    this.save();
    return ev;
  }

  public updateEvidence(id: string, updates: Partial<StoredEvidence>): StoredEvidence | null {
    const index = this.data.evidence.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.data.evidence[index] = { ...this.data.evidence[index], ...updates };
    this.save();
    return this.data.evidence[index];
  }

  // Reference Voice Samples
  public getReferences(caseId: string): StoredReferenceSample[] {
    return this.data.referenceSamples.filter((r) => r.caseId === caseId);
  }

  public createReference(ref: StoredReferenceSample): StoredReferenceSample {
    this.data.referenceSamples.unshift(ref);
    this.save();
    return ref;
  }

  // Speaker Verifications
  public getSpeakerVerifications(caseId?: string): StoredSpeakerVerification[] {
    if (caseId) {
      return this.data.speakerVerifications.filter((v) => v.caseId === caseId);
    }
    return this.data.speakerVerifications;
  }

  public createSpeakerVerification(v: StoredSpeakerVerification): StoredSpeakerVerification {
    this.data.speakerVerifications.unshift(v);
    this.save();
    return v;
  }

  // Voice Disguise Analyses
  public getVoiceDisguises(caseId?: string): StoredVoiceDisguise[] {
    if (caseId) {
      return this.data.voiceDisguiseAnalyses.filter((d) => d.caseId === caseId);
    }
    return this.data.voiceDisguiseAnalyses;
  }

  public createVoiceDisguise(d: StoredVoiceDisguise): StoredVoiceDisguise {
    this.data.voiceDisguiseAnalyses.unshift(d);
    this.save();
    return d;
  }

  // Chain of Custody
  public getChainOfCustody(caseId: string): StoredChainOfCustodyEvent[] {
    return this.data.chainOfCustody
      .filter((c) => c.caseId === caseId)
      .sort((a, b) => a.eventNumber - b.eventNumber);
  }

  public addChainOfCustodyEvent(evt: StoredChainOfCustodyEvent): StoredChainOfCustodyEvent {
    this.data.chainOfCustody.push(evt);
    this.save();
    return evt;
  }

  // Expert Reviews
  public getExpertReviews(caseId: string): StoredExpertReview[] {
    return this.data.expertReviews.filter((r) => r.caseId === caseId);
  }

  public createExpertReview(rev: StoredExpertReview): StoredExpertReview {
    this.data.expertReviews.unshift(rev);
    this.save();
    return rev;
  }

  // Notifications
  public getNotifications(): StoredNotification[] {
    return this.data.notifications;
  }

  public addNotification(notif: StoredNotification): StoredNotification {
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 50) this.data.notifications.pop();
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.save();
      return true;
    }
    return false;
  }

  // Audit Logs
  public getAuditLogs(): StoredAuditLog[] {
    return this.data.auditLogs;
  }

  public addAuditLog(log: StoredAuditLog): StoredAuditLog {
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) this.data.auditLogs.pop();
    this.save();
    return log;
  }

  // Live Aggregate Statistics
  public getStats() {
    const totalCases = this.data.cases.length;
    const activeCases = this.data.cases.filter((c) => c.status === "Active" || c.status === "Under Review").length;
    const deepfakeDetected = this.data.cases.filter((c) => c.verdict === "DEEPFAKE").length;
    const authenticAudio = this.data.cases.filter((c) => c.verdict === "AUTHENTIC").length;
    const reportsGenerated = this.data.expertReviews.filter((r) => r.status === "Approved").length;
    const evidenceVerified = this.data.evidence.filter((e) => e.isIntegrityVerified).length;

    return {
      totalCases,
      activeCases,
      deepfakeDetected,
      authenticAudio,
      reportsGenerated,
      evidenceVerified
    };
  }

  // Persistent User Accounts
  public getUsers(): StoredUserRecord[] {
    if (!this.data.users) this.data.users = [];
    return this.data.users;
  }

  public getUserByEmail(email: string): StoredUserRecord | undefined {
    if (!this.data.users) this.data.users = [];
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public createUser(user: StoredUserRecord): StoredUserRecord {
    if (!this.data.users) this.data.users = [];
    const index = this.data.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      this.data.users[index] = user;
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  public updateUser(email: string, updates: Partial<StoredUserRecord>): StoredUserRecord | null {
    if (!this.data.users) this.data.users = [];
    const index = this.data.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  // Persistent Biometric Templates
  public getBiometricTemplate(expertId: string): StoredBiometricRecord | undefined {
    if (!this.data.biometricTemplates) this.data.biometricTemplates = [];
    return this.data.biometricTemplates.find((b) => b.expertId === expertId);
  }

  public saveBiometricTemplate(template: StoredBiometricRecord): StoredBiometricRecord {
    if (!this.data.biometricTemplates) this.data.biometricTemplates = [];
    const index = this.data.biometricTemplates.findIndex((b) => b.expertId === template.expertId);
    if (index >= 0) {
      this.data.biometricTemplates[index] = template;
    } else {
      this.data.biometricTemplates.push(template);
    }
    this.save();
    return template;
  }
}

export const serverDb = new ServerDatabase();
