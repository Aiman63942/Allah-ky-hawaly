import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Lock,
  Hash,
  Sparkles,
  UserCheck,
  User as UserIcon,
  Clock,
  Send,
  MessageSquare,
  FileCheck,
  Download,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ScreenId, User } from '../../types';
import { ROLE_CONFIGS } from '../../utils/rbac';
import { BackButton } from '../common/BackButton';

interface CourtReadinessItem {
  id: string;
  requirement: string;
  category: 'Chain of Custody' | 'Evidence Integrity' | 'AI & Technical' | 'Certification & Legal';
  status: 'Complete' | 'Pending' | 'Failed';
  evidenceReason: string;
  ruleReference: string;
}

interface LegalReviewScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  selectedCaseId: string;
  currentUser: User;
}

export const LegalReviewScreen: React.FC<LegalReviewScreenProps> = ({
  setCurrentScreen,
  selectedCaseId,
  currentUser
}) => {
  // Comprehensive Court Readiness Checklist items with requirement, status, and supporting reason/evidence (Requirement 4)
  const [checklistItems, setChecklistItems] = useState<CourtReadinessItem[]>([
    {
      id: 'CR-01',
      requirement: 'Evidence integrity verified',
      category: 'Evidence Integrity',
      status: 'Complete',
      evidenceReason: 'Cryptographic SHA-256 hash computed at laboratory ingestion matches current working copy with 0-byte deviation.',
      ruleReference: 'FRE 902(14)'
    },
    {
      id: 'CR-02',
      requirement: 'SHA-256 hash recorded',
      category: 'Evidence Integrity',
      status: 'Complete',
      evidenceReason: 'Baseline hash 3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8... recorded in tamper-evident database with ISO 8601 timestamp.',
      ruleReference: 'NIST SP 800-86'
    },
    {
      id: 'CR-03',
      requirement: 'Chain of custody complete',
      category: 'Chain of Custody',
      status: 'Complete',
      evidenceReason: '6 sequential custody handoffs logged with digital signatures, operator badges, and verified timestamps without gaps.',
      ruleReference: 'FRE 901'
    },
    {
      id: 'CR-04',
      requirement: 'Forensic analysis completed',
      category: 'AI & Technical',
      status: 'Complete',
      evidenceReason: 'Multi-model ensemble (CNN, BiLSTM, Wav2Vec2) reached 100% consensus determining 98.4% deepfake probability.',
      ruleReference: 'Daubert Standard'
    },
    {
      id: 'CR-05',
      requirement: 'XAI explanation available',
      category: 'AI & Technical',
      status: 'Complete',
      evidenceReason: 'Grad-CAM acoustic heatmaps & TreeSHAP feature importances (+0.312 Mel Spectrogram) fully rendered and documented.',
      ruleReference: 'FRE 702'
    },
    {
      id: 'CR-06',
      requirement: 'Examiner findings completed',
      category: 'Certification & Legal',
      status: 'Complete',
      evidenceReason: 'Lead Forensic Analyst Dr. S. Anderson completed spectral inspection and detailed neural vocoder artifact analysis.',
      ruleReference: 'SWGDE 2024'
    },
    {
      id: 'CR-07',
      requirement: 'Expert review completed',
      category: 'Certification & Legal',
      status: 'Complete',
      evidenceReason: 'Independent peer review conducted by Dr. K. Okafor (CFCE-2891) validating acoustic anomaly timestamps.',
      ruleReference: 'FRE 702'
    },
    {
      id: 'CR-08',
      requirement: 'Expert certification/signature completed',
      category: 'Certification & Legal',
      status: 'Complete',
      evidenceReason: 'RSA-4096 cryptographic signature generated with thumbprint biometric minutiae identity confirmation.',
      ruleReference: 'FRE 902(13)'
    },
    {
      id: 'CR-09',
      requirement: 'Audit trail complete',
      category: 'Chain of Custody',
      status: 'Complete',
      evidenceReason: 'Immutable append-only activity log records all 8 terminal sessions, IP addresses, and cryptographic operations.',
      ruleReference: 'ISO/IEC 27037'
    },
    {
      id: 'CR-10',
      requirement: 'Final forensic report generated',
      category: 'Certification & Legal',
      status: 'Complete',
      evidenceReason: 'Official court-ready 10-section forensic document compiled with embedded verification QR code and judicial seal.',
      ruleReference: 'Fed. R. Crim. P. 16'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reviewNote, setReviewNote] = useState('');
  const [legalApprovalStatus, setLegalApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'DISPUTED'>('APPROVED');
  const [prosecutorNotes, setProsecutorNotes] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: 'N-01',
      author: 'Marcus Vance, Esq. (Federal Prosecutor)',
      text: 'Chain of custody is unbroken from field seizure through laboratory ingestion. FRE 902(14) certification matches byte-for-byte SHA-256 baseline. Certified expert witness Dr. Okafor is qualified to testify under FRE 702.',
      time: '2026-08-09 14:15 UTC'
    }
  ]);

  const completedCount = checklistItems.filter((i) => i.status === 'Complete').length;
  const pendingCount = checklistItems.filter((i) => i.status === 'Pending').length;
  const failedCount = checklistItems.filter((i) => i.status === 'Failed').length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const toggleItemStatus = (id: string) => {
    setChecklistItems(
      checklistItems.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Complete' ? 'Pending' : item.status === 'Pending' ? 'Failed' : 'Complete';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNote.trim()) return;
    setProsecutorNotes([
      ...prosecutorNotes,
      {
        id: `N-${Date.now()}`,
        author: `${currentUser.name} (${currentUser.role})`,
        text: reviewNote,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
      }
    ]);
    setReviewNote('');
  };

  const filteredChecklist = checklistItems.filter((item) => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesStat = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesCat && matchesStat;
  });

  const getStatusBadge = (status: 'Complete' | 'Pending' | 'Failed') => {
    switch (status) {
      case 'Complete':
        return (
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>Complete</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-700 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 inline-flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-rose-700 shrink-0" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div id="legal-review-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('expert-validation')} label="Back to Expert Review" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center space-x-2">
              <Scale className="w-6 h-6 text-emerald-700" />
              <span>Legal Review & Court Admissibility</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              DOCKET: {selectedCaseId || 'DS-2024-4471'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Judicial evidentiary review under Federal Rules of Evidence 702 & 902(13)/(14) and Daubert/Frye standards
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="legal-generate-report-btn"
            onClick={() => setCurrentScreen('report-generation')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Open Court-Ready Forensic Report →</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Court Readiness Checklist, Right Column Case Synthesis & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* Left Column: Court Readiness Checklist with Requirement, Status, and Reason/Evidence (Requirement 4) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-5 shadow-sm">
            {/* Header and Summary Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Court Readiness Checklist & Proof Ledger</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Detailed judicial requirements, verification statuses, and supporting evidentiary reasons
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">{completedCount} Complete</span>
                {pendingCount > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">{pendingCount} Pending</span>}
                {failedCount > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold">{failedCount} Failed</span>}
              </div>
            </div>

            {/* Admissibility Score Progress Bar */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Admissibility & Compliance Score</span>
                <span className="text-emerald-800 font-mono">{progressPercent}% Ready</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Filter:</span>
              {['ALL', 'Evidence Integrity', 'Chain of Custody', 'AI & Technical', 'Certification & Legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Detailed Checklist Table / Cards (Requirement 4) */}
            <div className="space-y-3">
              {filteredChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    item.status === 'Complete'
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-900'
                      : item.status === 'Pending'
                      ? 'bg-amber-50/40 border-amber-200 text-slate-900'
                      : 'bg-rose-50/40 border-rose-200 text-slate-900'
                  }`}
                >
                  {/* Top Row: Requirement & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.requirement}</span>
                        <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200">
                          {item.ruleReference}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-medium block">
                        Category: {item.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleItemStatus(item.id)}
                      className="cursor-pointer shrink-0 transition-transform active:scale-95"
                      title="Click to toggle status"
                    >
                      {getStatusBadge(item.status)}
                    </button>
                  </div>

                  {/* Supporting Reason & Forensic Evidence */}
                  <div className="bg-white/80 border border-slate-200/70 p-2.5 rounded-lg text-xs leading-relaxed text-slate-700 shadow-2xs">
                    <div className="flex items-start space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Supporting Reason / Evidentiary Proof:</span>
                        <p className="text-[11px] text-slate-700 font-sans mt-0.5">{item.evidenceReason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Case Integrity, Legal Verdict & Notes */}
        <div className="lg:col-span-5 space-y-5">
          {/* Summary Card: Evidence Baseline & AI Consensus */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold uppercase text-slate-900 flex items-center space-x-1.5">
                <Hash className="w-4 h-4 text-emerald-700" />
                <span>Cryptographic & AI Consensus</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">File Ingestion:</span>
                <span className="font-bold text-slate-900">senate_testimony_original.wav</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">SHA-256:</span>
                <span className="text-emerald-800 font-bold">3a7b4fcd18e9...c5d8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Ensemble Verdict:</span>
                <span className="font-bold text-rose-700">98.4% Synthetic Deepfake</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expert Certification:</span>
                <span className="font-bold text-emerald-800">Dr. K. Okafor (Thumb Biometric)</span>
              </div>
            </div>
          </div>

          {/* Legal Admissibility Verdict Action */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm text-xs">
            <h3 className="font-bold uppercase text-slate-900 border-b border-slate-100 pb-2">
              Prosecutor Determination & Court Presentation
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setLegalApprovalStatus('APPROVED')}
                className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  legalApprovalStatus === 'APPROVED'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve for Court Admissibility</span>
              </button>

              <button
                type="button"
                onClick={() => setLegalApprovalStatus('DISPUTED')}
                className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  legalApprovalStatus === 'DISPUTED'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Flag for Supplemental Findings</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal pt-1">
              Federal Rules of Evidence 902(13)/(14) certification enables self-authenticating entry into court records.
            </p>
          </div>

          {/* Prosecutor Review Comments & Notes */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold uppercase text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Legal Review Notes & Pretrial Motions</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {prosecutorNotes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{note.author}</span>
                    <span className="text-[10px] font-mono text-slate-500">{note.time}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>

            {/* Add Review Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter judicial review note, pretrial motion notes, or admissibility remarks..."
                className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Attach Legal Review Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
