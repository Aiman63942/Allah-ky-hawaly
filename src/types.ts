export type ScreenId =
  | 'landing'
  | 'workflow'
  | 'signin'
  | 'request-access'
  | 'dashboard'
  | 'cases'
  | 'evidence'
  | 'chain-of-custody'
  | 'hash-integrity'
  | 'pipeline'
  | 'detection-results'
  | 'speaker-verification'
  | 'voice-disguise'
  | 'model-comparison'
  | 'xai'
  | 'expert-validation'
  | 'legal-review'
  | 'report-generation'
  | 'public-verify'
  | 'audit-log'
  | 'notifications'
  | 'admin-panel'
  | 'settings';

export type UserRole =
  | 'Lead Forensic Analyst'
  | 'Forensic Examiner / Expert Witness'
  | 'Prosecutor / Legal Reviewer'
  | 'System Security Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency: string;
  avatar: string;
  status: 'active' | 'inactive';
  casesCount: number;
  phone?: string;
  department?: string;
  securityClearance?: string;
}

export type CaseStatus = 'Active' | 'Under Review' | 'Pending Legal' | 'Completed';
export type VerdictType = 'DEEPFAKE' | 'AUTHENTIC' | 'INCONCLUSIVE';
export type PriorityType = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  verdict: VerdictType;
  priority: PriorityType;
  analyst: string;
  agency: string;
  date: string;
  updatedDate: string;
  evidenceCount: number;
  threatScore?: number;
  assignedToRole?: UserRole[];
}

export interface AudioEvidence {
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
  status: 'Uploaded' | 'Preprocessing' | 'Processed' | 'Verified' | 'Failed';
  audioUrl?: string;
  uploadedBy?: string;
  classification?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

export interface ModelResult {
  modelName: 'CNN' | 'BiLSTM' | 'Wav2Vec2 Transformer' | 'Ensemble';
  classification: VerdictType;
  accuracy: number;
  confidence: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTimeMs: number;
  isRecommended?: boolean;
}

export interface ManipulationIndicator {
  name?: string;
  score?: number;
  level?: 'Critical' | 'High' | 'Medium' | 'Low';
  indicator?: string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  description?: string;
  frequencyBand?: string;
  contributionScore?: number;
}

export interface SuspiciousRegion {
  id: string;
  label: string;
  timeRange: string;
  severity: 'Critical' | 'High' | 'Medium';
  frequencyRange?: string;
}

export interface SHAPFeature {
  name?: string;
  score?: number;
  description?: string;
  featureName?: string;
  value?: number;
}

export interface ChainOfCustodyEvent {
  eventNumber: number;
  title: string;
  actorRole: 'System' | 'Lead Analyst' | 'Automated' | 'Expert' | 'Legal';
  status: 'VERIFIED' | 'PENDING';
  timestamp: string;
  userName: string;
  ipAddress: string;
  digitalSignature: string;
  blockHash: string;
  hashAtEvent?: string;
}

export interface ThumbBiometricTemplate {
  minutiaeHash: string;
  enrolledAt: string;
  ridgeCount: number;
  patternType: 'Whorl' | 'Right Loop' | 'Left Loop' | 'Arch' | 'Tented Arch' | 'WebAuthn Security Key' | 'Facial-Optical Vector';
  enrolledByCamera: boolean;
  biometricVector?: number[];
  credentialId?: string;
  technology?: 'WebAuthn Platform Biometric' | 'High-Res Optical Minutiae Extraction' | 'Facial-Optical Liveness Vector';
}

export interface BiometricVerificationProof {
  verified: boolean;
  score: number;
  threshold: number;
  verifiedAt: string;
  expertId: string;
  expertName: string;
  technology: string;
  proofToken: string;
  signature: string;
}

export interface PublicReportVerificationRecord {
  token: string;
  reportId: string;
  caseId: string;
  evidenceId: string;
  evidenceFilename: string;
  evidenceSha256: string;
  verdict: VerdictType;
  confidenceScore: number;
  leadAnalyst: string;
  expertWitness: string;
  expertCertificationId: string;
  biometricVerified: boolean;
  biometricScore: number;
  biometricTechnology: string;
  signedAt: string;
  digitalSealHash: string;
  revoked: boolean;
  status: 'VALID' | 'REVOKED' | 'TAMPERED';
}

export interface DispatchedEmail {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  otpCode: string;
  htmlBody: string;
  status: 'DELIVERED';
}

export interface ExpertReview {
  id: string;
  caseId: string;
  expertName: string;
  email?: string;
  institution: string;
  certificationId: string;
  status: 'Approved' | 'Pending' | 'Disputed';
  technicalAssessment: string;
  checklist: {
    swgdeStandards: boolean;
    chainOfCustodyVerified: boolean;
    reproducibleOutputs: boolean;
    confidenceIntervalsValid: boolean;
    acousticSpectralInspected?: boolean;
  };
  digitalSignature: string;
  signedAt: string;
  thumbBiometricTemplate?: ThumbBiometricTemplate;
  biometricProof?: BiometricVerificationProof;
}

export interface LegalReviewItem {
  id: string;
  label: string;
  status: 'COMPLETE' | 'PENDING';
}

export interface LegalReview {
  caseId: string;
  legalCounsel: string;
  jurisdiction: string;
  status: 'UNDER REVIEW' | 'CERTIFIED' | 'REJECTED';
  readinessProgress: string; // e.g., "5/8 Complete"
  items: LegalReviewItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'VIEW' | 'WRITE' | 'SIGN' | 'UPLOAD' | 'VERIFY' | 'LOGIN' | 'CONFIG' | 'DELETE';
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  role?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'success' | 'info' | 'warning';
  caseId?: string;
}

export interface KpiMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  description: string;
}

export interface F0AnalysisResult {
  isAvailable: boolean;
  unavailableReason?: string;
  points: Array<{
    timeSec: number;
    timeLabel: string;
    f0Hz: number;
    expectedNaturalHz: number;
    isVoiced: boolean;
    isAnomaly: boolean;
    energy: number;
  }>;
  avgF0: number;
  minF0: number;
  maxF0: number;
  medianF0: number;
  irregularRegions: Array<{
    startSec: number;
    endSec: number;
    timeRange: string;
    type: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium';
  }>;
  jitterPercent: number;
  voicedFraction: number;
}

export interface ReferenceVoiceSample {
  id: string;
  caseId: string;
  subjectName: string;
  filename: string;
  fileSize: string;
  duration: string;
  sha256Hash: string;
  conditionTag: 'Normal' | 'Illness/Cold' | 'Whispering' | 'Disguised' | 'Other';
  lawfulConsentDeclared: boolean;
  consentNotes: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AcousticMeasurements {
  f0MeanHz: number;
  f0MinHz: number;
  f0MaxHz: number;
  f0StdDevHz: number;
  pitchRangeSemitones: number;
  jitterPercent: number; // cycle-to-cycle pitch perturbation
  shimmerPercent: number; // cycle-to-cycle amplitude perturbation
  hnrDb: number; // harmonics-to-noise ratio
  spectralCentroidHz: number;
  spectralRollOffHz: number;
  spectralFlatness: number;
  voicedFractionPercent: number;
  pauseCount: number;
  speechDurationSec: number;
  rmsEnergy: number;
  estimatedSnrDb: number;
  clippingPercent: number;
}

export interface VoiceConditionHypothesis {
  hypothesis:
    | 'Illness or temporary vocal condition'
    | 'Vocal strain / fatigue'
    | 'Intentional vocal disguise'
    | 'AI-based voice conversion / cloning'
    | 'Acoustic / equipment / noise confounding';
  likelihood: 'Supported by acoustic data' | 'Unconfirmed' | 'Inconclusive' | 'Contraindicated';
  findings: string;
  supportingFeatures: string[];
}

export interface SpeakerVerificationResult {
  id: string;
  caseId: string;
  evidenceId: string;
  referenceId: string;
  subjectName: string;
  verdict:
    | 'Analysis completed'
    | 'Consistent with the same speaker'
    | 'Not sufficiently consistent with the same speaker'
    | 'Inconclusive'
    | 'Insufficient audio quality'
    | 'Reference recording missing'
    | 'Model unavailable'
    | 'Analysis failed';
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

export interface VoiceDisguiseAnalysisResult {
  id: string;
  caseId: string;
  evidenceId: string;
  questionedFilename: string;
  referenceFilename?: string;
  audioQualityStatus: 'Sufficient for analysis' | 'Marginal' | 'Insufficient for analysis';
  acousticMeasurements: AcousticMeasurements;
  referenceMeasurements?: AcousticMeasurements;
  hypotheses: VoiceConditionHypothesis[];
  overallSummary: string;
  scientificLimitations: string;
  expertNotes?: string;
  analyzedAt: string;
}


