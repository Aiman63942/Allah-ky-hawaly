import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Clock,
  Hash,
  Copy,
  Check,
  FileCheck,
  ArrowRight,
  Shield,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ScreenId, ChainOfCustodyEvent, User } from '../../types';
import { MOCK_CHAIN_OF_CUSTODY } from '../../data/mockData';
import { ROLE_CONFIGS } from '../../utils/rbac';
import { BackButton } from '../common/BackButton';

interface ChainOfCustodyScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  selectedCaseId: string;
  currentUser: User;
}

export const ChainOfCustodyScreen: React.FC<ChainOfCustodyScreenProps> = ({
  setCurrentScreen,
  selectedCaseId,
  currentUser
}) => {
  const [copiedHashIndex, setCopiedHashIndex] = useState<number | null>(null);

  const copyHash = (hash: string, idx: number) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashIndex(idx);
    setTimeout(() => setCopiedHashIndex(null), 2000);
  };

  // Comprehensive chain of custody records with previous & current custodians
  const chainEvents = [
    {
      eventNumber: 1,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance (Cyber Investigative Unit)',
      title: 'Evidence Ingestion & Cryptographic Registration',
      action: 'INGESTION & HASH SEAL',
      previousCustodian: 'Submitting Officer / Field Depository',
      currentCustodian: 'Det. Marcus Vance (Cyber Investigative Unit)',
      status: 'VERIFIED',
      timestamp: '2026-08-08 14:10:02 UTC',
      ipAddress: '10.0.1.22',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xA4F9...88C1 [Seal: CIU-SEC-01]',
      integrityStatus: 'Untampered & Match'
    },
    {
      eventNumber: 2,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance',
      title: 'Custodial Transfer to Federal Audio Forensics Unit',
      action: 'SECURE CUSTODIAL TRANSFER',
      previousCustodian: 'Det. Marcus Vance (Cyber Investigative Unit)',
      currentCustodian: 'Dr. Sarah Anderson (Lead Forensic Analyst)',
      status: 'VERIFIED',
      timestamp: '2026-08-08 15:22:41 UTC',
      ipAddress: '10.0.1.45',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xC70E...A2F3 [Seal: FED-LAB-94]',
      integrityStatus: 'Untampered & Match'
    },
    {
      eventNumber: 3,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance',
      title: 'Automated Multi-Model AI Pipeline Execution',
      action: 'AI FORENSIC DETECTION RUN',
      previousCustodian: 'Dr. Sarah Anderson (Lead Forensic Analyst)',
      currentCustodian: 'ALFADETECT Neural Inference Cluster',
      status: 'VERIFIED',
      timestamp: '2026-08-09 07:15:09 UTC',
      ipAddress: '10.0.2.10',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xD5F1...83C4 [Seal: AI-EXEC-02]',
      integrityStatus: 'Untampered & Match'
    },
    {
      eventNumber: 4,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance',
      title: 'SHAP & Grad-CAM Explainable AI Generation',
      action: 'XAI ATTRIBUTION COMPUTATION',
      previousCustodian: 'ALFADETECT Neural Inference Cluster',
      currentCustodian: 'Dr. Sarah Anderson (Lead Forensic Analyst)',
      status: 'VERIFIED',
      timestamp: '2026-08-09 09:42:18 UTC',
      ipAddress: '10.0.2.10',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xCA2F...D4E5 [Seal: XAI-AUDIT-01]',
      integrityStatus: 'Untampered & Match'
    },
    {
      eventNumber: 5,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance',
      title: 'Expert Witness Technical Peer Review & Biometric Sign-Off',
      action: 'EXPERT WITNESS CERTIFICATION',
      previousCustodian: 'Dr. Sarah Anderson (Lead Forensic Analyst)',
      currentCustodian: 'Dr. Keisha Okafor (Certified Forensic Examiner)',
      status: 'VERIFIED',
      timestamp: '2026-08-09 11:30:47 UTC',
      ipAddress: '10.0.1.88',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xE5F1...23A9 [Cert: CFCE-2891]',
      integrityStatus: 'Untampered & Match'
    },
    {
      eventNumber: 6,
      evidenceId: 'EV-2024-8842',
      filename: 'senate_testimony_original.wav',
      uploadedBy: 'Det. Marcus Vance',
      title: 'Court Evidentiary Package Compilation & Report Seal',
      action: 'JUDICIAL PREPARATION SEAL',
      previousCustodian: 'Dr. Keisha Okafor (Certified Forensic Examiner)',
      currentCustodian: 'Marcus Vance, Esq. (Prosecutor / Legal Reviewer)',
      status: 'VERIFIED',
      timestamp: '2026-08-09 14:00:00 UTC',
      ipAddress: '10.0.1.92',
      sha256Hash: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      digitalSignature: 'RSA-4096: 0xF8B1...99E2 [Bar ID: NY-481902]',
      integrityStatus: 'Untampered & Match'
    }
  ];

  return (
    <div id="chain-of-custody-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('evidence')} label="Back to Evidence" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <span>Immutable Chain of Custody Ledger</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              DOCKET: {selectedCaseId || 'DS-2024-4471'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ISO/IEC 27037 compliant immutable audit ledger with clearly displayed SHA-256 evidence checksums
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-mono font-bold">6 IMMUTABLE LOGS — 100% VERIFIED</span>
          </div>
          <button
            onClick={() => setCurrentScreen('pipeline')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all"
          >
            <span>Run AI Pipeline →</span>
          </button>
        </div>
      </div>

      {/* Sequential Immutable Events Stream */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {chainEvents.map((evt, idx) => (
          <div
            key={evt.eventNumber}
            className="bg-white border border-emerald-900/10 hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-sm transition-all"
          >
            {/* Top Event Title Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  #{evt.eventNumber}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">
                    ACTION: {evt.action}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>{evt.integrityStatus}</span>
                </span>
              </div>
            </div>

            {/* Evidence & Custodian Transfer Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Evidence ID & File</span>
                <span className="font-mono text-emerald-900 font-bold block mt-0.5">{evt.evidenceId}</span>
                <span className="text-[11px] text-slate-600 truncate block">{evt.filename}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Timestamp (UTC)</span>
                <span className="font-mono text-slate-700 flex items-center space-x-1 mt-0.5 font-medium">
                  <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>{evt.timestamp}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">IP: {evt.ipAddress}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous Custodian</span>
                <span className="text-slate-700 font-medium block mt-0.5">{evt.previousCustodian}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Custodian</span>
                <span className="font-bold text-emerald-950 flex items-center space-x-1 mt-0.5">
                  <UserIcon className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>{evt.currentCustodian}</span>
                </span>
              </div>
            </div>

            {/* Clearly Visible SHA-256 Hash Display */}
            <div className="p-3 bg-[#032319] border border-emerald-950/20 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-emerald-400 font-bold uppercase flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CRYPTOGRAPHIC SHA-256 INTEGRITY HASH (IMMUTABLE)</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyHash(evt.sha256Hash, idx)}
                  className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] flex items-center space-x-1 transition-colors"
                >
                  {copiedHashIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-300" />
                      <span>Copy Full Hash</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-emerald-300 text-xs break-all leading-relaxed pt-0.5 select-all">
                {evt.sha256Hash}
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-emerald-900/50">
                <span>DIGITAL SEAL: {evt.digitalSignature}</span>
                <span className="text-emerald-300 font-bold">STATE: 100% UNMODIFIED</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
