import { UserRole, ScreenId } from '../types';

export interface RoleConfig {
  role: UserRole;
  title: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  permissionsSummary: string[];
  allowedScreens: ScreenId[];
  deniedReason?: Record<string, string>;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  'Lead Forensic Analyst': {
    role: 'Lead Forensic Analyst',
    title: 'Lead Forensic Analyst',
    shortLabel: 'Lead Analyst',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-400',
    description: 'Full case access — Create/manage cases, upload and verify evidence, run deepfake detection, view AI/XAI results, manage chain of custody, add forensic findings, generate/sign final forensic reports, and review examiner work.',
    permissionsSummary: [
      'Create and manage full case dockets',
      'Upload, process, and verify audio evidence',
      'Execute multi-model AI deepfake pipelines',
      'Manage & sign immutable Chain of Custody blocks',
      'Generate, review & cryptographically sign final forensic reports',
      'Inspect detailed Explainable AI (XAI) features & heatmaps'
    ],
    allowedScreens: [
      'landing',
      'workflow',
      'signin',
      'request-access',
      'dashboard',
      'cases',
      'evidence',
      'chain-of-custody',
      'hash-integrity',
      'pipeline',
      'detection-results',
      'speaker-verification',
      'voice-disguise',
      'model-comparison',
      'xai',
      'expert-validation',
      'legal-review',
      'report-generation',
      'audit-log',
      'notifications',
      'settings'
    ]
  },
  'Forensic Examiner / Expert Witness': {
    role: 'Forensic Examiner / Expert Witness',
    title: 'Forensic Examiner / Expert Witness',
    shortLabel: 'Expert Witness',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    badgeBorder: 'border-teal-400',
    description: 'Forensic analysis access — View assigned cases, upload evidence, perform deepfake analysis, view confidence scores and XAI explanations, record findings, add notes, and prepare expert-witness reports. Cannot manage users or change system settings.',
    permissionsSummary: [
      'View assigned forensic cases',
      'Upload and preprocess audio evidence',
      'Perform deepfake multi-model analysis',
      'Perform speaker voice matching & comparison',
      'Conduct voice condition, illness & disguise analysis',
      'Examine confidence scores and XAI explainability plots',
      'Record technical findings and expert witness notes',
      'Prepare court-admissible expert witness reports',
      'Restricted: Cannot manage users, roles, or security settings'
    ],
    allowedScreens: [
      'landing',
      'workflow',
      'signin',
      'request-access',
      'dashboard',
      'cases',
      'evidence',
      'chain-of-custody',
      'hash-integrity',
      'pipeline',
      'detection-results',
      'speaker-verification',
      'voice-disguise',
      'model-comparison',
      'xai',
      'expert-validation',
      'report-generation',
      'notifications',
      'settings'
    ],
    deniedReason: {
      'admin-panel': 'Administrative privileges required. Forensic Examiners cannot manage user accounts, role assignments, or system policies.',
      'legal-review': 'Prosecutorial clearance required. Legal Review is reserved for legal counsel and lead analysts.'
    }
  },
  'Prosecutor / Legal Reviewer': {
    role: 'Prosecutor / Legal Reviewer',
    title: 'Prosecutor / Legal Reviewer',
    shortLabel: 'Legal Reviewer',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-900',
    badgeBorder: 'border-green-400',
    description: 'Read-only legal access — View assigned cases, verified evidence, chain-of-custody records, AI results, forensic findings, and finalized reports. Can add legal comments/review notes but cannot modify evidence or analysis results.',
    permissionsSummary: [
      'View assigned cases and legal dockets (Read-Only)',
      'Inspect verified evidence & SHA-256 integrity logs',
      'Audit immutable chain-of-custody provenance',
      'Review AI deepfake verdicts, confidence & XAI rationale',
      'Review speaker verification & voice condition findings',
      'Add legal comments and court-admissibility notes',
      'Inspect and certify finalized forensic reports',
      'Restricted: Cannot modify evidence, run pipelines, or alter models'
    ],
    allowedScreens: [
      'landing',
      'workflow',
      'signin',
      'request-access',
      'dashboard',
      'cases',
      'evidence',
      'chain-of-custody',
      'hash-integrity',
      'detection-results',
      'speaker-verification',
      'voice-disguise',
      'model-comparison',
      'xai',
      'legal-review',
      'report-generation',
      'audit-log',
      'notifications',
      'settings'
    ],
    deniedReason: {
      'pipeline': 'Read-Only Legal Clearance. Legal reviewers cannot execute or alter raw machine learning processing pipelines.',
      'admin-panel': 'Administrative privileges required. Legal reviewers cannot manage user accounts or modify system security configs.'
    }
  },
  'System Security Administrator': {
    role: 'System Security Administrator',
    title: 'System Security Administrator',
    shortLabel: 'Security Admin',
    badgeBg: 'bg-emerald-900',
    badgeText: 'text-emerald-100',
    badgeBorder: 'border-emerald-700',
    description: 'System administration access — Create/manage user accounts, assign roles, manage permissions, configure security settings, monitor audit logs, manage backups, and maintain system security. Cannot modify forensic evidence or analysis results.',
    permissionsSummary: [
      'Create and manage user accounts & role provisioning',
      'Assign permissions & enforce zero-trust security policies',
      'Configure cryptographic keys, PINs & session timeouts',
      'Monitor full forensic audit logs & export compliance reports',
      'Manage database backups and system health diagnostics',
      'Restricted: Cannot modify forensic evidence, alter hashes, or change AI verdicts'
    ],
    allowedScreens: [
      'landing',
      'workflow',
      'signin',
      'request-access',
      'dashboard',
      'cases',
      'evidence',
      'chain-of-custody',
      'hash-integrity',
      'detection-results',
      'speaker-verification',
      'voice-disguise',
      'audit-log',
      'notifications',
      'admin-panel',
      'settings'
    ],
    deniedReason: {
      'pipeline': 'Forensic evidence separation of duties. System administrators cannot run analytical model pipelines or generate forensic findings.',
      'expert-validation': 'Forensic examiner accreditation required. System administrators cannot sign expert witness affidavits.',
      'legal-review': 'Legal counsel credentials required. System administrators cannot certify legal court admissibility.'
    }
  }
};

/**
 * Checks if a specific screen is allowed for a user role
 */
export function isScreenAllowed(role: UserRole, screenId: ScreenId): boolean {
  if (screenId === 'public-verify' || screenId === 'landing' || screenId === 'workflow' || screenId === 'signin' || screenId === 'request-access') {
    return true;
  }
  const config = ROLE_CONFIGS[role];
  if (!config) return true;
  return config.allowedScreens.includes(screenId);
}

/**
 * Gets denial reason message for a screen
 */
export function getDenialReason(role: UserRole, screenId: ScreenId): string {
  const config = ROLE_CONFIGS[role];
  if (config?.deniedReason && config.deniedReason[screenId]) {
    return config.deniedReason[screenId];
  }
  return `Your current role (${role}) does not have permission to access the ${screenId.replace('-', ' ')} module under System Security Policy.`;
}

/**
 * Granular action permissions based on the role matrix
 */
export function canCreateCases(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst';
}

export function canUploadEvidence(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst' || role === 'Forensic Examiner / Expert Witness';
}

export function canRunDetection(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst' || role === 'Forensic Examiner / Expert Witness';
}

export function canRunAiAnalysis(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst' || role === 'Forensic Examiner / Expert Witness';
}

export function canVerifyEvidence(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst';
}

export function canManageChainOfCustody(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst';
}

export function canSignExpertValidation(role: UserRole): boolean {
  return role === 'Forensic Examiner / Expert Witness' || role === 'Lead Forensic Analyst';
}

export function canSubmitLegalReview(role: UserRole): boolean {
  return role === 'Prosecutor / Legal Reviewer' || role === 'Lead Forensic Analyst';
}

export function canSignFinalForensicReport(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst';
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'System Security Administrator';
}

export function canConfigureSecurity(role: UserRole): boolean {
  return role === 'System Security Administrator';
}

export function canRunSpeakerVerification(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst' || role === 'Forensic Examiner / Expert Witness';
}

export function canRunVoiceConditionAnalysis(role: UserRole): boolean {
  return role === 'Lead Forensic Analyst' || role === 'Forensic Examiner / Expert Witness';
}

export function isReadOnlyForensics(role: UserRole): boolean {
  return role === 'Prosecutor / Legal Reviewer' || role === 'System Security Administrator';
}
