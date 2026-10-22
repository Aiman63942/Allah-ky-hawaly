import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Share2,
  CheckCircle2,
  Shield,
  Printer,
  QrCode,
  FileText,
  Lock,
  ChevronDown,
  Award,
  Sparkles,
  KeyRound,
  UserCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  BadgeCheck,
  CheckSquare,
  Copy,
  Check,
  Search,
  Scan,
  X,
  ExternalLink,
  ShieldCheck,
  Upload,
  Fingerprint,
  FileCode,
  FileSpreadsheet,
  Activity,
  Layers,
  BarChart3,
  HelpCircle,
  Sliders,
  LockKeyhole
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { ScreenId, AudioEvidence } from '../../types';
import { speakAudioEvidence, stopAudioEvidence, playSuccessSound } from '../../utils/audioPlayer';
import { calculateFileSHA256, calculateStringSHA256, verifyHashMatch } from '../../utils/crypto';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { BackButton } from '../common/BackButton';

interface ReportGenerationScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  selectedCaseId: string;
  activeEvidence: AudioEvidence;
}

export const ReportGenerationScreen: React.FC<ReportGenerationScreenProps> = ({
  setCurrentScreen,
  selectedCaseId,
  activeEvidence
}) => {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'html'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'expert_validated' | 'preliminary'>('expert_validated');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('section-1');

  // SHA-256 Copy & Verification States
  const [copiedHash, setCopiedHash] = useState(false);
  const [showHashVerifierModal, setShowHashVerifierModal] = useState(false);
  const [inputHashToTest, setInputHashToTest] = useState('');
  const [testHashResult, setTestHashResult] = useState<{ matches: boolean; computedHash: string } | null>(null);
  const [isComputingHash, setIsComputingHash] = useState(false);

  // QR Code Verification Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [qrScanComplete, setQrScanComplete] = useState(false);

  // Camera Biometric Verification Status
  const [biometricVerified] = useState(true);

  const realEvidenceHash = activeEvidence.sha256 || '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e7f0123456789abcdef0123456789abc';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(realEvidenceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleTestHashMatch = async (textToHash: string) => {
    if (!textToHash) return;
    setIsComputingHash(true);
    try {
      let computed = '';
      if (textToHash.length === 64 && /^[0-9a-fA-F]+$/.test(textToHash)) {
        computed = textToHash.trim().toLowerCase();
      } else {
        computed = await calculateStringSHA256(textToHash);
      }
      const matches = verifyHashMatch(computed, realEvidenceHash);
      setTestHashResult({ matches, computedHash: computed });
    } catch {
      setTestHashResult({ matches: false, computedHash: 'Error calculating hash' });
    } finally {
      setIsComputingHash(false);
    }
  };

  const handleFileHashTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsComputingHash(true);
    try {
      const computed = await calculateFileSHA256(file);
      const matches = verifyHashMatch(computed, realEvidenceHash);
      setTestHashResult({ matches, computedHash: computed });
    } catch {
      setTestHashResult({ matches: false, computedHash: 'Failed to read file' });
    } finally {
      setIsComputingHash(false);
    }
  };

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setQrScanComplete(false);
    setTimeout(() => {
      setIsScanningQr(false);
      setQrScanComplete(true);
      playSuccessSound();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingVoice) {
      stopAudioEvidence();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      const isSynthetic = activeEvidence.classification !== 'Authentic';
      const speechText = `Official forensic evidence voice sample for file ${activeEvidence.filename}. Status: ${
        activeEvidence.classification || 'Deepfake Synthetic'
      }. Forensic summary: Spectral high frequency cutoff above 16 kilohertz detected with phase discontinuity and neural vocoder artifacts at time index 1 minute 42 seconds.`;

      speakAudioEvidence(speechText, {
        isSynthetic,
        audioUrl: activeEvidence.audioUrl,
        onEnd: () => setIsPlayingVoice(false)
      });
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      playSuccessSound();

      // Append new entry to audit log
      MOCK_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        user: 'S. Anderson',
        action: 'WRITE',
        resource: `Report Download (${format.toUpperCase()}) for Case ${selectedCaseId || 'DS-2024-4471'}`,
        ipAddress: '10.0.1.45',
        status: 'SUCCESS'
      });

      const reportContent = `========================================================================
DEEPFAKE AUDIO DETECTOR — OFFICIAL COURT-READY FORENSIC REPORT
THEME: NATIONAL WHITE & GREEN FORENSIC STANDARD
REPORT LEVEL: ${reportType === 'expert_validated' ? 'FINAL CERTIFIED JUDICIAL REPORT' : 'PRELIMINARY AI ASSESSMENT'}
FORMAT: ${format.toUpperCase()} | CLASSIFICATION: CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE
========================================================================

CASE ID: ${selectedCaseId || 'DS-2024-4471'}
EVIDENCE FILE: ${activeEvidence.filename}
FILE HASH (SHA-256): ${realEvidenceHash}
DATE GENERATED: 2026-08-10 08:20:00 UTC
ANALYST: Dr. Sarah Anderson (Lead Forensic Analyst)
EXPERT WITNESS: Dr. Keisha Okafor (CFCE-2891 / GCFE-4902)
BIOMETRIC VERIFICATION: Thumbprint Minutiae Biometric Match (98.7% - FIPS 201)

1. EXECUTIVE SUMMARY: DEEPFAKE DETECTED (98.4% Confidence)
2. DETECTION RESULTS: Deepfake 88% / Authentic 12%
3. WAVEFORM & SPECTROGRAM: Splice boundaries at T+1m42s and T+3m08s
4. FREQUENCY DOMAIN ANALYSIS: 12-16kHz neural vocoder over-synthesis
5. MODEL CONSENSUS: Ensemble (CNN + BiLSTM + Wav2Vec2) 98.4%
6. SHAP ATTRIBUTION: Mel Spectrogram (+0.312), MFCC (+0.285)
7. FILE INTEGRITY: SHA-256 MATCH VERIFIED (0-byte deviation)
8. DIGITAL SIGNATURE: RSA-4096 0xA7B2C901E5F2D83A4B5C6D7E8F9A0B1C

Digitally signed and sealed under FRE 902(13)/(14).
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Forensic_Report_${selectedCaseId || 'DS-2024-4471'}_${activeEvidence.filename.replace(/\.[^/.]+$/, '')}.${format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'html'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  // Chart Data Definitions
  const donutData = [
    { name: 'Deepfake Probability', value: 88, color: '#DC2626' },
    { name: 'Authentic Probability', value: 12, color: '#047857' }
  ];

  const radarData = [
    { metric: 'Accuracy', CNN: 92, BiLSTM: 94, Wav2Vec2: 96, Ensemble: 98 },
    { metric: 'Precision', CNN: 91, BiLSTM: 93, Wav2Vec2: 96, Ensemble: 98 },
    { metric: 'Recall', CNN: 93, BiLSTM: 94, Wav2Vec2: 97, Ensemble: 99 },
    { metric: 'F1 Score', CNN: 92, BiLSTM: 94, Wav2Vec2: 97, Ensemble: 98 },
    { metric: 'Speed', CNN: 95, BiLSTM: 88, Wav2Vec2: 82, Ensemble: 90 },
    { metric: 'Robustness', CNN: 89, BiLSTM: 91, Wav2Vec2: 95, Ensemble: 98 }
  ];

  const barAccuracyData = [
    { model: 'CNN (ResNet-50)', accuracy: 92.4, color: '#059669' },
    { model: 'BiLSTM Temporal', accuracy: 94.1, color: '#0D9488' },
    { model: 'Wav2Vec2.0', accuracy: 96.8, color: '#047857' },
    { model: 'Ensemble Consensus', accuracy: 98.4, color: '#032319' }
  ];

  const frequencyResponseData = [
    { freq: '0 kHz', natural: -12, suspect: -12 },
    { freq: '2 kHz', natural: -18, suspect: -17 },
    { freq: '4 kHz', natural: -24, suspect: -22 },
    { freq: '6 kHz', natural: -30, suspect: -28 },
    { freq: '8 kHz', natural: -38, suspect: -32 },
    { freq: '10 kHz', natural: -46, suspect: -35 },
    { freq: '12 kHz', natural: -58, suspect: -30 }, // Vocoder spike
    { freq: '14 kHz', natural: -68, suspect: -28 }, // Vocoder spike
    { freq: '16 kHz', natural: -78, suspect: -34 }
  ];

  const confidenceTimelineData = [
    { time: '0s', confidence: 98 },
    { time: '30s', confidence: 97 },
    { time: '60s', confidence: 99 },
    { time: '90s', confidence: 96 },
    { time: '102s (Splice)', confidence: 64 },
    { time: '120s', confidence: 98 },
    { time: '150s', confidence: 97 },
    { time: '188s (Splice)', confidence: 68 },
    { time: '210s', confidence: 99 }
  ];

  const shapData = [
    { name: 'Mel Spectrogram', value: 0.312, isPositive: true },
    { name: 'MFCC Coefficients', value: 0.285, isPositive: true },
    { name: 'Pitch Variance', value: 0.241, isPositive: true },
    { name: 'Formant F1/F2', value: 0.188, isPositive: true },
    { name: 'LFCC Features', value: 0.124, isPositive: true },
    { name: 'Spectral Flux', value: 0.095, isPositive: true },
    { name: 'RMS Energy', value: -0.082, isPositive: false },
    { name: 'Zero Crossing Rate', value: -0.143, isPositive: false }
  ];

  const sectionsList = [
    { id: 'section-1', num: '1', title: 'Executive Summary' },
    { id: 'section-2', num: '2', title: 'Detection Results' },
    { id: 'section-3', num: '3', title: 'Waveform & Spectrogram' },
    { id: 'section-4', num: '4', title: 'Frequency Analysis' },
    { id: 'section-5', num: '5', title: 'Model Comparison' },
    { id: 'section-6', num: '6', title: 'Explainable AI (SHAP)' },
    { id: 'section-7', num: '7', title: 'Confidence Timeline' },
    { id: 'section-8', num: '8', title: 'Chain of Custody' },
    { id: 'section-9', num: '9', title: 'File Integrity' },
    { id: 'section-10', num: '10', title: 'Digital Signature' }
  ];

  return (
    <div id="report-generation-screen" className="flex flex-col lg:flex-row min-h-screen bg-[#F4F8F6] text-slate-800">
      {/* LEFT SIDEBAR: National White and Green Sidebar (Requirement 1) */}
      <aside className="w-full lg:w-80 shrink-0 bg-white border-r border-emerald-900/10 p-5 flex flex-col justify-between space-y-6 shadow-sm z-20">
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="border-b border-emerald-900/10 pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <BackButton onClick={() => setCurrentScreen('legal-review')} label="Back to Legal Review" variant="pill" />
            </div>
            <div className="flex items-center space-x-2 text-emerald-700">
              <FileCheck2 className="w-6 h-6" />
              <h2 className="text-base font-bold text-slate-900 font-sans">Forensic Report Builder</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Court-Ready Judicial Document Generator</p>
          </div>

          {/* Section Navigation Jump-Nav */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              REPORT SECTIONS JUMP-NAV
            </label>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {sectionsList.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center space-x-2 truncate">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                      {sec.num}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              EXPORT FORMAT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pdf', label: 'PDF', note: 'Standard' },
                { id: 'docx', label: 'DOCX', note: 'Word' },
                { id: 'html', label: 'HTML', note: 'Web' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    format === f.id
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="block text-[8px] font-mono opacity-80">{f.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thumbprint Biometric Seal Indicator */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-700" />
                <span>Thumb Biometric Seal</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-900 font-bold px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded-full">
                ✓ VERIFIED
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Sealed with Dr. Keisha Okafor's thumbprint minutiae biometric identity (THUMB-CERT-2026-8891).
            </p>
          </div>
        </div>

        {/* Download & Print Buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all flex flex-col items-center justify-center space-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>{isGenerating ? 'Generating Signed Document...' : 'DOWNLOAD FORENSIC REPORT'}</span>
            </div>
            <span className="text-[9px] text-emerald-100 font-mono">Digitally signed & hash-sealed</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Document (PDF)</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: THE DOCUMENT PREVIEW (National White & Green Theme Paper Canvas) */}
      <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto bg-[#F4F8F6] min-w-0">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 border-2 border-emerald-800/40 rounded-2xl shadow-xl p-6 sm:p-12 space-y-12 font-sans print:p-0 print:border-none print:shadow-none">
          {/* Header Block with Judicial Seal */}
          <div className="border-b-2 border-slate-900 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-800 uppercase block">
                  OFFICIAL JUDICIAL EVIDENCE RECORD // FRE 902(13)/(14)
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Forensic Audio Analysis Report
                </h1>
                <p className="text-sm font-semibold text-emerald-900 mt-1">
                  Matter of State v. Case Evidence #{selectedCaseId || 'DS-2024-4471'}
                </p>
              </div>

              {/* Scannable Courtroom QR Code */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl flex items-center space-x-3 transition-all cursor-pointer shrink-0"
              >
                <QrCode className="w-10 h-10 text-emerald-900" />
                <div className="text-left font-mono text-[9px] text-emerald-900">
                  <p className="font-bold">VERIFICATION QR</p>
                  <p className="text-emerald-700 font-bold">CLICK TO SCAN</p>
                </div>
              </button>
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Case ID</span>
                <span className="font-bold text-slate-800">{selectedCaseId || 'DS-2024-4471'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Generated</span>
                <span className="font-bold text-slate-800">2026-08-10 08:20</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Classification</span>
                <span className="font-bold text-rose-700">CONFIDENTIAL</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Lead Analyst</span>
                <span className="font-bold text-slate-800">Dr. S. Anderson</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Expert Witness</span>
                <span className="font-bold text-slate-800">Dr. K. Okafor</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Status</span>
                <span className="font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">Court-Ready</span>
              </div>
            </div>
          </div>

          {/* ① Executive Summary */}
          <section id="section-1" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              <span>Executive Summary</span>
            </h2>

            {/* Red-Bordered Highlight Box */}
            <div className="border-l-4 border-rose-600 bg-rose-50 p-5 rounded-r-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-rose-900">DEEPFAKE DETECTED — High Confidence</h3>
                </div>
                <p className="text-xs text-rose-700 font-medium">
                  Synthetic neural vocoder audio manipulation identified with 98.4% certainty.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-3xl font-extrabold text-rose-600 block">98.4%</span>
                <span className="text-[10px] font-mono text-rose-800 uppercase font-bold">Deepfake Confidence</span>
              </div>
            </div>

            {/* Descriptive Analyst Summary Paragraph */}
            <p className="text-xs text-slate-700 leading-relaxed font-sans border-l-2 border-emerald-600 pl-4 py-1">
              Forensic examination of evidence audio file <code className="font-mono text-emerald-900 font-bold">{activeEvidence.filename}</code> (duration: 03:42, 44.1 kHz 16-bit PCM) was conducted using our multi-model ensemble neural analysis pipeline. The ensemble consensus established a 98.4% probability of synthetic voice manipulation. Spectral and phase analysis revealed neural vocoder acoustic artifacts (HiFi-GAN architectural signature) combined with unnatural high-frequency phase discontinuities. Abrupt splice boundaries were isolated at timestamps T+1m42s and T+3m08s where synthesized acoustic segments were spliced into genuine room ambient noise.
            </p>
          </section>

          {/* ② Detection Results */}
          <section id="section-2" className="space-y-6 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              <span>Detection Results</span>
            </h2>

            {/* Side-by-Side Donut / Ring Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-36 h-36 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={58}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#DC2626" />
                        <Cell key="cell-1" fill="#E2E8F0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-rose-600">88%</span>
                    <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">Deepfake</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">Synthetic Voice Probability</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-36 h-36 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Authentic Probability', value: 12, color: '#047857' },
                          { name: 'Residual', value: 88, color: '#E2E8F0' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={58}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#047857" />
                        <Cell key="cell-1" fill="#E2E8F0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-emerald-800">12%</span>
                    <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">Authentic</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">Natural Phonation Probability</span>
              </div>
            </div>
          </section>

          {/* ③ Waveform & Spectrogram Analysis */}
          <section id="section-3" className="space-y-4 scroll-mt-6">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <span>Waveform & Spectrogram Evidence</span>
              </h2>

              <button
                type="button"
                onClick={handleToggleVoicePlayback}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isPlayingVoice ? <Pause className="w-3.5 h-3.5 text-emerald-700" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{isPlayingVoice ? 'Pause Audio' : 'Play Evidence Sample'}</span>
              </button>
            </div>

            {/* Spectrogram Graphic Block */}
            <div className="bg-[#032319] p-4 rounded-2xl border border-emerald-950/40 space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
                <span>0.0s</span>
                <span className="text-amber-400 font-bold">T+1m42s: VOC_SPLICE_1</span>
                <span className="text-amber-400 font-bold">T+3m08s: PHASE_MISMATCH_2</span>
                <span>3m42s</span>
              </div>

              {/* Simulated Spectrogram Heat Bars */}
              <div className="h-28 w-full bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 rounded-xl flex items-end p-2 gap-1 overflow-hidden relative">
                {Array.from({ length: 48 }).map((_, i) => {
                  const isSplice1 = i >= 18 && i <= 22;
                  const isSplice2 = i >= 36 && i <= 40;
                  const height = isSplice1 || isSplice2 ? 85 : 30 + Math.sin(i * 0.4) * 25 + Math.random() * 20;
                  return (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className={`flex-1 rounded-xs transition-all ${
                        isSplice1 || isSplice2
                          ? 'bg-gradient-to-t from-amber-500 to-rose-500 animate-pulse'
                          : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                      }`}
                    ></div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[9px] font-mono text-emerald-400/80">
                <span>0 Hz (Fundamental)</span>
                <span>8000 Hz (Formants)</span>
                <span>16000 Hz (Nyquist Boundary)</span>
              </div>
            </div>
          </section>

          {/* ④ Frequency Domain Analysis */}
          <section id="section-4" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                4
              </span>
              <span>Frequency Domain & Neural Vocoder Artifacts</span>
            </h2>

            <div className="h-64 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={frequencyResponseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis dataKey="freq" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} unit=" dB" domain={[-90, 0]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="natural" name="Natural Human Baseline" stroke="#047857" fill="#10B981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="suspect" name="Suspect Evidence Sample" stroke="#DC2626" fill="#EF4444" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ⑤ Multi-Model Ensemble Consensus */}
          <section id="section-5" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                5
              </span>
              <span>Multi-Model Architecture Consensus</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-60 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                    <XAxis dataKey="model" stroke="#64748B" fontSize={9} />
                    <YAxis stroke="#64748B" fontSize={9} domain={[85, 100]} unit="%" />
                    <Tooltip />
                    <Bar dataKey="accuracy" name="Detection Accuracy %" fill="#047857" radius={[4, 4, 0, 0]}>
                      {barAccuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-60 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="#CBD5E1" />
                    <PolarAngleAxis dataKey="metric" stroke="#64748B" fontSize={9} />
                    <PolarRadiusAxis stroke="#64748B" fontSize={8} domain={[70, 100]} />
                    <Radar name="CNN" dataKey="CNN" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                    <Radar name="BiLSTM" dataKey="BiLSTM" stroke="#0D9488" fill="#0D9488" fillOpacity={0.2} />
                    <Radar name="Ensemble" dataKey="Ensemble" stroke="#032319" fill="#032319" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ⑥ Explainable AI (SHAP) */}
          <section id="section-6" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                6
              </span>
              <span>Explainable AI (TreeSHAP & Grad-CAM)</span>
            </h2>

            <div className="space-y-2">
              {shapData.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  <span className="w-36 text-slate-700 font-medium truncate">{feature.name}</span>
                  <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden flex items-center">
                    <div
                      style={{ width: `${Math.abs(feature.value) * 220}%` }}
                      className={`h-full rounded-full ${
                        feature.isPositive ? 'bg-emerald-700' : 'bg-slate-400'
                      }`}
                    ></div>
                  </div>
                  <span className="w-16 font-mono text-right font-bold text-slate-800">
                    {feature.value > 0 ? `+${feature.value.toFixed(3)}` : feature.value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ⑦ Confidence Timeline */}
          <section id="section-7" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                7
              </span>
              <span>Confidence Timeline</span>
            </h2>

            <div className="h-48 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidenceTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[50, 100]} unit="%" />
                  <Tooltip />
                  <ReferenceLine y={90} label="Court Threshold (90%)" stroke="#DC2626" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="confidence" name="Ensemble Confidence" stroke="#047857" fill="#10B981" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ⑧ Chain of Custody */}
          <section id="section-8" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                8
              </span>
              <span>Chain of Custody Ledger</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                  <tr>
                    <th className="p-2.5">Date / Time (UTC)</th>
                    <th className="p-2.5">Transferred From</th>
                    <th className="p-2.5">Transferred To</th>
                    <th className="p-2.5">Purpose / Operation</th>
                    <th className="p-2.5 text-right">Integrity Seal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 text-slate-600">2026-08-08 08:14</td>
                    <td className="p-2.5 font-bold text-slate-800">Detective J. Miller (Shield #4102)</td>
                    <td className="p-2.5 font-bold text-emerald-800">Dr. Sarah Anderson (Lab Ingestion)</td>
                    <td className="p-2.5 font-sans text-slate-700">Physical USB Drive Evidence Intake</td>
                    <td className="p-2.5 text-right text-emerald-800 font-bold">✓ SHA-256 MATCH</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">2026-08-09 07:15</td>
                    <td className="p-2.5 font-bold text-slate-800">Dr. Sarah Anderson</td>
                    <td className="p-2.5 font-bold text-emerald-800">AI Compute Enclave (Node-04)</td>
                    <td className="p-2.5 font-sans text-slate-700">Multi-Model Inference Pipeline</td>
                    <td className="p-2.5 text-right text-emerald-800 font-bold">✓ SECURE ENCLAVE</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">2026-08-09 11:30</td>
                    <td className="p-2.5 font-bold text-slate-800">Dr. Sarah Anderson</td>
                    <td className="p-2.5 font-bold text-emerald-800">Dr. Keisha Okafor (Expert Witness)</td>
                    <td className="p-2.5 font-sans text-slate-700">Peer Validation & Thumbprint Biometric Sign-Off</td>
                    <td className="p-2.5 text-right text-emerald-800 font-bold">✓ RSA-4096 SEALED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ⑨ Cryptographic File Integrity */}
          <section id="section-9" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                9
              </span>
              <span>Cryptographic File Integrity & SHA-256 Digest</span>
            </h2>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-900 uppercase">SHA-256 EVIDENTIARY HASH</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg font-mono text-[10px] text-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHashVerifierModal(true)}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Verify Hash Match
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-emerald-900 break-all font-bold">
                {realEvidenceHash}
              </div>
            </div>
          </section>

          {/* ⑩ Digital Signature & Expert Witness Biometric Seal */}
          <section id="section-10" className="space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                10
              </span>
              <span>Digital Signature & Biometric Certification</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">LEAD FORENSIC EXAMINER</span>
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="font-semibold text-slate-800">Dr. Sarah Anderson, Ph.D.</p>
                <p className="text-[11px] text-slate-600">Lead Digital Forensics Analyst (EnCE, GCFE)</p>
                <p className="text-[10px] font-mono text-emerald-800">Date: 2026-08-09 08:30:00 UTC</p>
                <p className="font-mono text-[9px] text-slate-500 break-all">SIG: RSA-4096:0x39B8F12C098A...</p>
              </div>

              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">EXPERT WITNESS CERTIFICATION</span>
                  <Fingerprint className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="font-semibold text-slate-800">Dr. Keisha Okafor, D.Sc.</p>
                <p className="text-[11px] text-slate-600">Certified Forensic Audio Examiner (CFCE-2891)</p>
                <p className="text-[10px] font-mono text-emerald-800">Thumb Biometric Match: 98.7%</p>
                <p className="font-mono text-[9px] text-slate-500 break-all">SIG: RSA-4096:0xA7B2C901E5F2...</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* QR Code Courtroom Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-emerald-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Courtroom QR Authenticator</span>
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-emerald-300">
                <QrCode className="w-32 h-32 text-emerald-900" />
              </div>
              <span className="text-[10px] font-mono text-emerald-900 font-bold">
                DOCKET: {selectedCaseId || 'DS-2024-4471'}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  setCurrentScreen('public-verify');
                }}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public Verification Portal →</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateQrScan}
                disabled={isScanningQr}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isScanningQr ? (
                  <span>Validating Cryptographic Ledger...</span>
                ) : qrScanComplete ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>✓ Court Record Authenticated!</span>
                  </>
                ) : (
                  <span>Simulate Inline Courtroom QR Scan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHA-256 Verification Modal */}
      {showHashVerifierModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-emerald-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>SHA-256 Hash Verification Engine</span>
              </h3>
              <button onClick={() => setShowHashVerifierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Target Evidence Hash</label>
                <input
                  type="text"
                  readOnly
                  value={realEvidenceHash}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-[10px] text-emerald-900 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Compare Against Hash or Text</label>
                <input
                  type="text"
                  value={inputHashToTest}
                  onChange={(e) => {
                    setInputHashToTest(e.target.value);
                    handleTestHashMatch(e.target.value);
                  }}
                  placeholder="Paste SHA-256 hash or text to calculate..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-[10px] text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Or Upload File to Calculate</label>
                <input
                  type="file"
                  onChange={handleFileHashTest}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-900 cursor-pointer"
                />
              </div>

              {testHashResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  testHashResult.matches
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold">
                    {testHashResult.matches ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
                    <span>{testHashResult.matches ? '✓ Exact Hash Match Confirmed (0-Byte Deviation)' : '⚠ Hash Mismatch Detected!'}</span>
                  </div>
                  <p className="font-mono text-[10px] truncate">Computed: {testHashResult.computedHash}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
