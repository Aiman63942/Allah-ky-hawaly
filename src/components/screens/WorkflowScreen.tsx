import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  FileText,
  Upload,
  Sliders,
  UserCheck,
  Scale,
  ArrowRight,
  ChevronRight,
  Hash,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScreenId } from '../../types';
import { BackButton } from '../common/BackButton';

interface WorkflowScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
}

export const WorkflowScreen: React.FC<WorkflowScreenProps> = ({ setCurrentScreen }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const features = [
    {
      icon: Cpu,
      title: 'Parallel Multi-Model Ensemble',
      description: 'Synchronous execution of RawNet3, ResNet Mel-Spectrogram, and Wav2Vec2 transformer networks delivering calibrated 98.7% classification confidence.',
      tag: 'Neural Ensemble'
    },
    {
      icon: ShieldCheck,
      title: 'ISO/IEC 27037 Cryptographic Custody',
      description: 'Immutable SHA-256 evidence sealing on ingest with automatic timestamped ledger tracking for strict court-admissible chain of custody.',
      tag: 'ISO/IEC 27037'
    },
    {
      icon: Sparkles,
      title: 'Grad-CAM & SHAP Explainability',
      description: 'Generates frequency-time heatmaps that explain exactly why a recording was flagged, exposing synthetic vocoder artifacts and pitch micro-tremors.',
      tag: 'Grad-CAM & SHAP'
    },
    {
      icon: FileText,
      title: 'Automated Judicial Reporting',
      description: 'Produces court-ready, self-authenticating reports conforming to FRE 902(13)/(14) with embedded QR cryptographic verification tokens.',
      tag: 'FRE 902 Verified'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Evidence Ingestion & Cryptographic Seal',
      targetScreen: 'evidence' as ScreenId,
      description: 'Ingest raw WAV, FLAC, MP3, or AAC recordings. Immediate SHA-256 hash calculation and digital evidence lock prior to DSP staging.',
      inputs: 'Raw Audio Waveform (16kHz-48kHz PCM), Chain-of-Custody Metadata',
      algorithms: 'SHA-256 HMAC Sealing, Bit-Level Checksum, Automated Docket Assignment',
      standard: 'ISO/IEC 27037 §6.3 / NIST SP 800-86',
      output: 'Immutable Evidence Ledger Entry & Cryptographic Digest'
    },
    {
      step: '02',
      title: 'DSP Feature Extraction',
      targetScreen: 'pipeline' as ScreenId,
      description: 'Deconstructs raw audio into 128-band Mel-Spectrograms, Linear Frequency Cepstral Coefficients (LFCC), and F0 fundamental pitch contour analysis.',
      inputs: 'Cryptographically Verified Audio Buffer',
      algorithms: 'STFT, Normalized Autocorrelation YIN, Mel-Scale Filterbank Deconvolution',
      standard: 'IEEE Signal Processing Forensic Protocol',
      output: 'Multidimensional Acoustic Feature Vectors & Mel Spectrogram'
    },
    {
      step: '03',
      title: 'Ensemble Neural Inference',
      targetScreen: 'detection-results' as ScreenId,
      description: 'Processes extracted features across 3 distinct deep architectures to isolate synthetic vocoder high-freq artifacts and temporal phase discrepancies.',
      inputs: 'Mel-Spectrogram Tensors & Raw Audio Frames',
      algorithms: 'RawNet3 Time Domain, ResNet-34 Spectral, Wav2Vec2 Self-Supervised',
      standard: 'ASVspoof 2021 / Interspeech Benchmark',
      output: 'Calibrated Probability Score (0-100%) & Confidence Interval'
    },
    {
      step: '04',
      title: 'Explainable AI (XAI) Attribution',
      targetScreen: 'xai' as ScreenId,
      description: 'Produces 2D Grad-CAM heatmaps highlighting anomalous vocal tract transitions and SHAP feature importance charts for non-technical judicial comprehension.',
      inputs: 'Model Activation Maps & Gradient Flow Vectors',
      algorithms: 'Grad-CAM Backpropagation, SHAP Kernel Feature Attribution',
      standard: 'DARPA XAI Explainability Standard / Daubert Factor 2',
      output: 'Visual Spectrogram Heatmap & Synthetic Anomaly Breakdown'
    },
    {
      step: '05',
      title: 'Biometric Expert Witness Signing',
      targetScreen: 'expert-validation' as ScreenId,
      description: 'Certified forensic examiners review findings and perform live camera thumb biometric verification before affixing RSA-4096 digital signatures.',
      inputs: 'Forensic Dossier + Live Camera Thumbprint Capture',
      algorithms: 'Minutiae Ridge Matching, Hardware Keystore Signing, RSA-4096 PSS',
      standard: 'FRE Rule 702 (Expert Testimony) / CJIS Security Policy',
      output: 'Cryptographically Signed Expert Validation Certificate'
    },
    {
      step: '06',
      title: 'Legal Review & Certified Docket Issue',
      targetScreen: 'report-generation' as ScreenId,
      description: 'Automated Daubert & FRE 902 checklist verification, generating tamper-evident PDF reports with public verification tokens and QR codes.',
      inputs: 'Signed Forensic Ledger + Chain-of-Custody Records',
      algorithms: 'Tamper-Evident PDF Generation, SHA-256 Embedded QR Sealing',
      standard: 'Federal Rules of Evidence 902(13) & 902(14)',
      output: 'Court-Ready Self-Authenticating Judicial Report'
    }
  ];

  const currentStep = workflowSteps[activeStepIndex];

  return (
    <div id="workflow-screen" className="min-h-full bg-[#F4F8F6] text-slate-800 p-6 md:p-12 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton onClick={() => setCurrentScreen('landing')} label="Back to Home" variant="pill" />
          <span className="text-[10px] font-mono text-[#54665C]">Platform Architecture & Forensic Flow</span>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="px-3.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold uppercase tracking-widest rounded-lg shadow-2xs">
              National Security & Digital Forensic Enclave
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
            Designed for Law Enforcement, Intelligence & Judicial Courts
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Deepfake Audio Detector bridges advanced neural acoustics research with strict federal rules of evidence and judicial admissibility standards.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-emerald-900/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all space-y-4 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Step-by-Step Process Explorer */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                End-to-End Forensic Workflow Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any stage to examine algorithmic processes, evidentiary standards, and audit checkpoints.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
              Stage {activeStepIndex + 1} of {workflowSteps.length}
            </span>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowSteps.map((ws, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  activeStepIndex === idx
                    ? 'bg-emerald-700 border-emerald-800 text-white shadow-md'
                    : 'bg-[#F9FBFA] border-slate-200 hover:border-emerald-300 text-slate-700'
                }`}
              >
                <span className={`text-[11px] font-mono font-bold block ${activeStepIndex === idx ? 'text-emerald-200' : 'text-slate-400'}`}>
                  STEP {ws.step}
                </span>
                <span className="text-xs font-bold line-clamp-1 mt-0.5">
                  {ws.title.split(' ')[0]} {ws.title.split(' ')[1] || ''}
                </span>
              </button>
            ))}
          </div>

          {/* Detailed Inspector for Active Step */}
          <div className="bg-[#032319] border border-emerald-950/20 rounded-2xl p-6 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs mb-1">
                  <span>PHASE {currentStep.step} SPECIFICATION</span>
                  <span>·</span>
                  <span className="text-emerald-300">{currentStep.standard}</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-emerald-100/80 mt-2 max-w-2xl leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen(currentStep.targetScreen)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer self-start"
              >
                <span>Launch {currentStep.title.split('&')[0].trim()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Technical Parameters Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-800/60 text-xs">
              <div className="p-3 bg-black/30 border border-emerald-800/40 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Input Artifacts</span>
                <p className="text-emerald-100 font-medium">{currentStep.inputs}</p>
              </div>
              <div className="p-3 bg-black/30 border border-emerald-800/40 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Algorithms & DSP</span>
                <p className="text-emerald-100 font-medium">{currentStep.algorithms}</p>
              </div>
              <div className="p-3 bg-black/30 border border-emerald-800/40 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Judicial Output</span>
                <p className="text-emerald-100 font-medium">{currentStep.output}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 bg-[#032319] border border-emerald-950/20 rounded-3xl text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-bold text-white font-sans">
            Ready to Verify Audio Evidence Integrity?
          </h3>
          <p className="text-xs text-emerald-200/80 max-w-xl mx-auto leading-relaxed">
            Access the secure forensic enclave with your institutional credentials or submit evidence for verification.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentScreen('signin')}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Access Operator Enclave</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>View Active Dockets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
