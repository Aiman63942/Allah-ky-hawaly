import {
  Case,
  AudioEvidence,
  ModelResult,
  ManipulationIndicator,
  SHAPFeature,
  SuspiciousRegion,
  ChainOfCustodyEvent,
  ExpertReview,
  LegalReview,
  AuditLogEntry,
  NotificationItem,
  User,
  KpiMetric
} from '../types';

export const MOCK_KPIS: KpiMetric[] = [
  {
    title: 'Total Cases',
    value: '4,471',
    change: '+12.5%',
    isPositive: true,
    iconName: 'Folder',
    description: 'vs last month'
  },
  {
    title: 'Active Cases',
    value: '247',
    change: '+4.2%',
    isPositive: true,
    iconName: 'Activity',
    description: 'currently in progress'
  },
  {
    title: 'DeepFake Detected',
    value: '2,184',
    change: '+18.7%',
    isPositive: false,
    iconName: 'AlertTriangle',
    description: 'synthetic audio flagged'
  },
  {
    title: 'Authentic Audio',
    value: '2,109',
    change: '+2.4%',
    isPositive: true,
    iconName: 'CheckCircle2',
    description: 'verified authentic'
  },
  {
    title: 'Reports Generated',
    value: '3,891',
    change: '+15.2%',
    isPositive: true,
    iconName: 'FileText',
    description: 'court-admissible PDFs'
  },
  {
    title: 'Evidence Verified',
    value: '18,743',
    change: '+8.9%',
    isPositive: true,
    iconName: 'ShieldCheck',
    description: 'SHA-256 integrity intact'
  }
];

export const MOCK_CASES: Case[] = [
  {
    id: 'DS-2024-4471',
    title: 'Voice Manipulation — Senate Testimony',
    description: 'Alleged synthetic voice cloning of senator audio recording during committee hearing',
    status: 'Active',
    verdict: 'DEEPFAKE',
    priority: 'Critical',
    analyst: 'S. Anderson',
    agency: 'FBI',
    date: '2025-06-15',
    updatedDate: '2025-06-15 09:47 UTC',
    evidenceCount: 3,
    threatScore: 9.7
  },
  {
    id: 'DS-2024-4476',
    title: 'Extortion Call Recording Verification',
    description: 'Intercepted audio message in financial ransom investigation',
    status: 'Completed',
    verdict: 'AUTHENTIC',
    priority: 'High',
    analyst: 'M. Reyes',
    agency: 'DEA',
    date: '2025-06-14',
    updatedDate: '2025-06-14 15:22 UTC',
    evidenceCount: 2,
    threatScore: 2.1
  },
  {
    id: 'DS-2024-4468',
    title: 'Fraudulent Corporate Directive Audio',
    description: 'CEO voice synthesis clone ordering unauthorized wire transfer',
    status: 'Under Review',
    verdict: 'DEEPFAKE',
    priority: 'High',
    analyst: 'K. Okafor',
    agency: 'SEC',
    date: '2025-06-13',
    updatedDate: '2025-06-13 11:15 UTC',
    evidenceCount: 1,
    threatScore: 8.9
  },
  {
    id: 'DS-2024-4466',
    title: 'Diplomatic Communication Authenticity',
    description: 'Foreign ministry leak audio verification under national security directive',
    status: 'Pending Legal',
    verdict: 'AUTHENTIC',
    priority: 'Critical',
    analyst: 'J. Nakamura',
    agency: 'CIA',
    date: '2025-06-12',
    updatedDate: '2025-06-12 18:30 UTC',
    evidenceCount: 4,
    threatScore: 1.8
  },
  {
    id: 'DS-2024-4467',
    title: 'Election Interference Audio Evidence',
    description: 'Viral robocall spoofing political candidate voice prior to primary vote',
    status: 'Active',
    verdict: 'DEEPFAKE',
    priority: 'Critical',
    analyst: 'S. Anderson',
    agency: 'FBI',
    date: '2025-06-11',
    updatedDate: '2025-06-11 14:05 UTC',
    evidenceCount: 2,
    threatScore: 9.5
  },
  {
    id: 'DS-2024-4460',
    title: 'Witness Testimony Verification',
    description: 'Deposition audio file submitted by defense in criminal fraud trial',
    status: 'Completed',
    verdict: 'AUTHENTIC',
    priority: 'Medium',
    analyst: 'R. Perez',
    agency: 'DOJ',
    date: '2025-06-10',
    updatedDate: '2025-06-10 10:12 UTC',
    evidenceCount: 1,
    threatScore: 2.4
  }
];

export const MOCK_EVIDENCE: AudioEvidence = {
  id: 'EV-003',
  caseId: 'DS-2024-4471',
  filename: 'senate_testimony_original.wav',
  fileSize: '24.8 MB',
  duration: '4:12',
  sampleRate: '44,100 Hz',
  bitDepth: '24-bit',
  channels: 'Mono',
  sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
  uploadTimestamp: '2025-06-15 07:15 UTC',
  status: 'Processed'
};

export const MOCK_MODEL_RESULTS: ModelResult[] = [
  {
    modelName: 'CNN',
    classification: 'DEEPFAKE',
    accuracy: 94.2,
    confidence: 94.2,
    precision: 93.8,
    recall: 94.1,
    f1Score: 93.9,
    inferenceTimeMs: 420
  },
  {
    modelName: 'BiLSTM',
    classification: 'DEEPFAKE',
    accuracy: 96.1,
    confidence: 96.1,
    precision: 95.7,
    recall: 96.3,
    f1Score: 96.0,
    inferenceTimeMs: 910
  },
  {
    modelName: 'Wav2Vec2 Transformer',
    classification: 'DEEPFAKE',
    accuracy: 97.4,
    confidence: 97.4,
    precision: 97.2,
    recall: 97.6,
    f1Score: 97.4,
    inferenceTimeMs: 1810
  },
  {
    modelName: 'Ensemble',
    classification: 'DEEPFAKE',
    accuracy: 98.7,
    confidence: 97.3,
    precision: 98.5,
    recall: 98.8,
    f1Score: 98.6,
    inferenceTimeMs: 1840,
    isRecommended: true
  }
];

export const MOCK_MANIPULATION_INDICATORS: ManipulationIndicator[] = [
  { name: 'GAN Vocoder Artifacts', score: 94, level: 'Critical' },
  { name: 'Phase Discontinuity', score: 91, level: 'Critical' },
  { name: 'Pitch Inconsistency', score: 88, level: 'High' },
  { name: 'Spectral Leakage', score: 85, level: 'High' },
  { name: 'Formant Distortion', score: 82, level: 'High' },
  { name: 'Compression Artifacts', score: 76, level: 'Medium' }
];

export const MOCK_SHAP_FEATURES: SHAPFeature[] = [
  { name: 'MFCC Coefficients', score: 94, description: 'Abrupt spectral band energy transitions' },
  { name: 'Spectral Centroid', score: 87, description: 'Unnatural brightness in 2-8 kHz frequency band' },
  { name: 'Pitch Frequency', score: 82, description: 'Robotic pitch constancy in 340-880 Hz range' },
  { name: 'Zero Crossing Rate', score: 71, description: 'Deviation from natural acoustic background floor' },
  { name: 'Chroma Features', score: 65, description: 'Inconsistent harmonic pitch class distributions' }
];

export const MOCK_SUSPICIOUS_REGIONS: SuspiciousRegion[] = [
  { id: '1', label: 'Pitch Distortion Zone', timeRange: '0:12 - 0:18', severity: 'Critical', frequencyRange: '340-880 Hz' },
  { id: '2', label: 'Synthetic Formants', timeRange: '0:28 - 0:35', severity: 'High', frequencyRange: '1.2-2.8 kHz' },
  { id: '3', label: 'GAN Fingerprint', timeRange: '0:41 - 0:50', severity: 'Critical', frequencyRange: '4.0-7.5 kHz' },
  { id: '4', label: 'Voice Cloning Artifacts', timeRange: '1:02 - 1:15', severity: 'High', frequencyRange: '2.0-5.0 kHz' }
];

export const MOCK_CHAIN_OF_CUSTODY: ChainOfCustodyEvent[] = [
  {
    eventNumber: 1,
    title: 'Case Created',
    actorRole: 'System',
    status: 'VERIFIED',
    timestamp: '2025-06-14 11:00:23 UTC',
    userName: 'Admin System',
    ipAddress: '10.0.1.1',
    digitalSignature: '0xA4B2...F9E1',
    blockHash: 'a3f8e2c1b5d6...7b4d8f2e5a9c1b3'
  },
  {
    eventNumber: 2,
    title: 'Evidence Uploaded',
    actorRole: 'Lead Analyst',
    status: 'VERIFIED',
    timestamp: '2025-06-14 15:22:41 UTC',
    userName: 'S. Anderson',
    ipAddress: '10.0.1.45',
    digitalSignature: '0xC70E...A2F3',
    blockHash: '3a7b4fcd18e9...e92c1d'
  },
  {
    eventNumber: 3,
    title: 'Analysis Started',
    actorRole: 'Automated',
    status: 'VERIFIED',
    timestamp: '2025-06-15 07:15:09 UTC',
    userName: 'AI System',
    ipAddress: '10.0.2.10',
    digitalSignature: '0xD5F1...83C4',
    blockHash: '6d2a8b9f0e1c...4d5e6f7a'
  },
  {
    eventNumber: 4,
    title: 'Analysis Completed',
    actorRole: 'Automated',
    status: 'VERIFIED',
    timestamp: '2025-06-15 09:42:18 UTC',
    userName: 'AI System',
    ipAddress: '10.0.2.10',
    digitalSignature: '0xCA2F...D4E5',
    blockHash: 'f4e3d2c1b0a9...9f8e7d6c'
  },
  {
    eventNumber: 5,
    title: 'Expert Review Started',
    actorRole: 'Expert',
    status: 'VERIFIED',
    timestamp: '2025-06-15 10:05:11 UTC',
    userName: 'Dr. K. Okafor',
    ipAddress: '10.0.1.88',
    digitalSignature: '0x8C4A...F012',
    blockHash: '1c2b3a4d5e6f...7a8b9c0d'
  },
  {
    eventNumber: 6,
    title: 'Expert Validation Signed',
    actorRole: 'Expert',
    status: 'VERIFIED',
    timestamp: '2025-06-15 11:30:47 UTC',
    userName: 'Dr. K. Okafor',
    ipAddress: '10.0.1.88',
    digitalSignature: '0xE5F1...23A9',
    blockHash: '9a8b7c6d5e4f...3a2b1c0d'
  }
];

export const MOCK_EXPERT_REVIEWS: ExpertReview[] = [
  {
    id: 'EXP-01',
    caseId: 'DS-2024-4471',
    expertName: 'Dr. Keisha Okafor',
    email: 'k.okafor@mit.edu',
    institution: 'MIT Lincoln Lab / Forensic Voice Institute',
    certificationId: 'CFCE-2891',
    status: 'Approved',
    technicalAssessment: 'AI detection findings are technically sound. The ensemble model\'s identification of GAN artifacts in the 340-880Hz range is consistent with current synthetic voice generation techniques. MFCC deviation patterns confirm synthetic origin.',
    checklist: {
      swgdeStandards: true,
      chainOfCustodyVerified: true,
      reproducibleOutputs: true,
      confidenceIntervalsValid: true,
      acousticSpectralInspected: true
    },
    digitalSignature: 'RSA-4096: 0xA7B2C901E5F2D83A4B5C6D7E8F9A0B1C [Cert: CFCE-2891]',
    signedAt: '2026-08-01 10:14:00 UTC',
    thumbBiometricTemplate: {
      minutiaeHash: 'THUMB-VEC-EXP01-4b9e28f10a7c3d5e8b6a9c1f0d2e4a8b',
      enrolledAt: '2026-08-01 10:14:00 UTC',
      ridgeCount: 64,
      patternType: 'Whorl',
      enrolledByCamera: true,
      technology: 'High-Res Optical Minutiae Extraction'
    }
  },
  {
    id: 'EXP-02',
    caseId: 'DS-2024-4471',
    expertName: 'Prof. A. Nakamura',
    email: 'a.nakamura@sail.stanford.edu',
    institution: 'Stanford SAIL Digital Forensics Lab',
    certificationId: 'CSFA-1447',
    status: 'Pending',
    technicalAssessment: 'Reviewing transformer attention weight distribution maps across secondary harmonic frequencies. Preliminary neural vocoder glitch signatures detected.',
    checklist: {
      swgdeStandards: true,
      chainOfCustodyVerified: true,
      reproducibleOutputs: true,
      confidenceIntervalsValid: true,
      acousticSpectralInspected: true
    },
    digitalSignature: 'Pending signature',
    signedAt: 'Pending',
    thumbBiometricTemplate: {
      minutiaeHash: 'THUMB-VEC-EXP02-7c2a9d81e4b50f3c1d6e8a7b9c0d2e1f',
      enrolledAt: '2026-08-03 14:22:15 UTC',
      ridgeCount: 72,
      patternType: 'Right Loop',
      enrolledByCamera: true,
      technology: 'High-Res Optical Minutiae Extraction'
    }
  },
  {
    id: 'EXP-03',
    caseId: 'DS-2024-4471',
    expertName: 'Dr. R. Gutierrez',
    email: 'r.gutierrez@law.georgetown.edu',
    institution: 'Georgetown Law Cyber Forensics Center',
    certificationId: 'CDSFE-0892',
    status: 'Pending',
    technicalAssessment: 'Assessing FRCP Rule 26 disclosure documentation and acoustic spectral anomaly plots for federal court submission.',
    checklist: {
      swgdeStandards: true,
      chainOfCustodyVerified: true,
      reproducibleOutputs: true,
      confidenceIntervalsValid: true,
      acousticSpectralInspected: true
    },
    digitalSignature: 'Pending signature',
    signedAt: 'Pending',
    thumbBiometricTemplate: {
      minutiaeHash: 'THUMB-VEC-EXP03-3f8b1c0e9d7a2b4c6e8f0a1d3b5c7e9a',
      enrolledAt: '2026-08-05 09:45:30 UTC',
      ridgeCount: 58,
      patternType: 'Left Loop',
      enrolledByCamera: true,
      technology: 'High-Res Optical Minutiae Extraction'
    }
  }
];

export const MOCK_LEGAL_REVIEW: LegalReview = {
  caseId: 'DS-2024-4471',
  legalCounsel: 'Legal Counsel M. Walsh',
  jurisdiction: 'Federal District Court DC',
  status: 'UNDER REVIEW',
  readinessProgress: '5/8 Complete',
  items: [
    { id: '1', label: 'Chain of custody documented and verified', status: 'COMPLETE' },
    { id: '2', label: 'Evidence collected per FRCP Rule 26 standards', status: 'COMPLETE' },
    { id: '3', label: 'AI analysis methodology disclosed', status: 'COMPLETE' },
    { id: '4', label: 'Expert witness credentials verified', status: 'COMPLETE' },
    { id: '5', label: 'Hash integrity certificates generated', status: 'COMPLETE' },
    { id: '6', label: 'Daubert standard compliance review', status: 'PENDING' },
    { id: '7', label: 'Opposing counsel notification', status: 'PENDING' },
    { id: '8', label: 'Judge pre-admission briefing', status: 'PENDING' }
  ]
};

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-1001',
    timestamp: '2025-06-15 09:47:11 UTC',
    user: 'S. Anderson',
    action: 'VIEW',
    resource: 'Case DS-2024-4471',
    ipAddress: '10.0.1.45',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1002',
    timestamp: '2025-06-15 09:42:18 UTC',
    user: 'AI System',
    action: 'WRITE',
    resource: 'Analysis Result #4471',
    ipAddress: '10.0.2.10',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1003',
    timestamp: '2025-06-15 08:15:30 UTC',
    user: 'K. Okafor',
    action: 'SIGN',
    resource: 'Expert Validation #4469',
    ipAddress: '10.0.1.88',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1004',
    timestamp: '2025-06-15 08:00:02 UTC',
    user: 'M. Walsh',
    action: 'VIEW',
    resource: 'Legal Review #4467',
    ipAddress: '10.0.1.52',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1005',
    timestamp: '2025-06-15 07:22:41 UTC',
    user: 'S. Anderson',
    action: 'UPLOAD',
    resource: 'Evidence EV-003 for #4470',
    ipAddress: '10.0.1.45',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1006',
    timestamp: '2025-06-15 07:19:12 UTC',
    user: 'System',
    action: 'VERIFY',
    resource: 'Hash Integrity check - all cases',
    ipAddress: '10.0.0.1',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-1007',
    timestamp: '2025-06-15 07:11:04 UTC',
    user: 'J. Unknown',
    action: 'LOGIN',
    resource: 'Authentication attempt',
    ipAddress: '203.44.122.17',
    status: 'FAILED',
    details: 'Invalid credentials - account locked'
  },
  {
    id: 'AUD-1008',
    timestamp: '2025-06-15 07:10:12 UTC',
    user: 'Admin',
    action: 'CONFIG',
    resource: 'Model threshold update',
    ipAddress: '10.0.0.5',
    status: 'SUCCESS'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOT-01',
    title: 'DeepFake Confirmed',
    description: 'Case DS-2024-4471 analysis complete — DEEPFAKE with 97.3% confidence',
    timestamp: '2 min ago',
    read: false,
    severity: 'critical',
    caseId: 'DS-2024-4471'
  },
  {
    id: 'NOT-02',
    title: 'Expert Signed Off',
    description: 'Dr. Okafor approved Expert Validation for Case DS-2024-4469',
    timestamp: '1h ago',
    read: false,
    severity: 'success',
    caseId: 'DS-2024-4469'
  },
  {
    id: 'NOT-03',
    title: 'Case Assigned',
    description: 'You have been assigned as lead analyst for Case DS-2024-4472',
    timestamp: '2h ago',
    read: false,
    severity: 'info',
    caseId: 'DS-2024-4472'
  },
  {
    id: 'NOT-04',
    title: 'Analysis Complete',
    description: 'AI pipeline finished processing evidence EV-004 for Case DS-2024-4470',
    timestamp: '3h ago',
    read: true,
    severity: 'info',
    caseId: 'DS-2024-4470'
  },
  {
    id: 'NOT-05',
    title: 'Legal Review Pending',
    description: 'Case DS-2024-4467 has been waiting for legal review for 24 hours',
    timestamp: '5h ago',
    read: true,
    severity: 'warning',
    caseId: 'DS-2024-4467'
  },
  {
    id: 'NOT-06',
    title: 'Security Alert',
    description: 'Failed login attempt from IP 203.44.122.17 — account temporarily locked',
    timestamp: '8h ago',
    read: true,
    severity: 'critical'
  },
  {
    id: 'NOT-07',
    title: 'Report Generated',
    description: 'Forensic report DSR-2025-4468 is ready for download',
    timestamp: '1d ago',
    read: true,
    severity: 'success',
    caseId: 'DS-2024-4468'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'USR-01',
    name: 'Sarah Anderson',
    email: 's.anderson@fbi.gov',
    role: 'Lead Forensic Analyst',
    agency: 'FBI Digital Forensics & Cyber Division',
    avatar: 'SA',
    status: 'active',
    casesCount: 47,
    phone: '+1 (202) 555-0147',
    securityClearance: 'TS/SCI'
  },
  {
    id: 'USR-02',
    name: 'Dr. Keisha Okafor',
    email: 'k.okafor@mit.edu',
    role: 'Forensic Examiner / Expert Witness',
    agency: 'MIT Lincoln Lab / Acoustic Forensics',
    avatar: 'KO',
    status: 'active',
    casesCount: 23,
    phone: '+1 (617) 555-0199',
    securityClearance: 'Secret / Expert Witness'
  },
  {
    id: 'USR-03',
    name: 'Judge M. Walsh, Esq.',
    email: 'm.walsh@doj.gov',
    role: 'Prosecutor / Legal Reviewer',
    agency: 'DOJ Special Prosecution Division',
    avatar: 'MW',
    status: 'active',
    casesCount: 34,
    phone: '+1 (202) 555-0100',
    securityClearance: 'Federal Legal Counsel'
  },
  {
    id: 'USR-04',
    name: 'Marcus Reyes',
    email: 'm.reyes@cyber.dhs.gov',
    role: 'System Security Administrator',
    agency: 'DHS Cybersecurity & Infrastructure Security',
    avatar: 'MR',
    status: 'active',
    casesCount: 12,
    phone: '+1 (202) 555-0182',
    securityClearance: 'CISO / SysAdmin Superuser'
  }
];

export const MONTHLY_INVESTIGATIONS_DATA = [
  { month: 'Jan 2025', cases: 320, deepfakes: 140, authentic: 180 },
  { month: 'Feb 2025', cases: 410, deepfakes: 210, authentic: 200 },
  { month: 'Mar 2025', cases: 580, deepfakes: 320, authentic: 260 },
  { month: 'Apr 2025', cases: 740, deepfakes: 410, authentic: 330 },
  { month: 'May 2025', cases: 890, deepfakes: 490, authentic: 400 },
  { month: 'Jun 2025', cases: 1040, deepfakes: 614, authentic: 426 }
];

export const PITCH_CONTOUR_DATA = [
  { time: '0:00', expected: 150, detected: 151 },
  { time: '0:05', expected: 165, detected: 164 },
  { time: '0:10', expected: 180, detected: 182 },
  { time: '0:12', expected: 190, detected: 285 }, // Pitch spike
  { time: '0:15', expected: 185, detected: 290 },
  { time: '0:18', expected: 175, detected: 178 },
  { time: '0:25', expected: 160, detected: 161 },
  { time: '0:30', expected: 170, detected: 230 }, // Formant distortion
  { time: '0:40', expected: 155, detected: 156 },
  { time: '0:45', expected: 165, detected: 275 }, // GAN artifact
  { time: '0:50', expected: 160, detected: 162 }
];

export const RADAR_COMPARISON_DATA = [
  { metric: 'Accuracy', CNN: 94.2, BiLSTM: 96.1, Transformer: 97.4, Ensemble: 98.7 },
  { metric: 'Precision', CNN: 93.8, BiLSTM: 95.7, Transformer: 97.2, Ensemble: 98.5 },
  { metric: 'Recall', CNN: 94.1, BiLSTM: 96.3, Transformer: 97.6, Ensemble: 98.8 },
  { metric: 'F1 Score', CNN: 93.9, BiLSTM: 96.0, Transformer: 97.4, Ensemble: 98.6 },
  { metric: 'Speed Index', CNN: 98.0, BiLSTM: 91.0, Transformer: 82.0, Ensemble: 81.0 }
];
