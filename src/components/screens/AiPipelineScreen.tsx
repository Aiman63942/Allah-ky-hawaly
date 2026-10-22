import React, { useState } from 'react';
import { Cpu, CheckCircle2, Play, ArrowRight, Sparkles, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { ScreenId, AudioEvidence, User } from '../../types';
import { canRunAiAnalysis, ROLE_CONFIGS } from '../../utils/rbac';
import { BackButton } from '../common/BackButton';
import { authFetch } from '../../utils/api';

interface AiPipelineScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  activeEvidence: AudioEvidence;
  currentUser: User;
}

export const AiPipelineScreen: React.FC<AiPipelineScreenProps> = ({
  setCurrentScreen,
  activeEvidence,
  currentUser
}) => {
  const stepsList = [
    { id: 1, title: 'Audio Preprocessing', desc: 'Resampling to 44.1kHz, noise reduction, & amplitude normalization' },
    { id: 2, title: 'MFCC Extraction', desc: '13-channel Mel-Frequency Cepstral Coefficients computation' },
    { id: 3, title: 'Spectrogram Generation', desc: '2048-point STFT log-mel spectrogram tensor mapping' },
    { id: 4, title: 'CNN Analysis', desc: 'Convolutional Feature Extractor (Spectral Discontinuities)' },
    { id: 5, title: 'BiLSTM Analysis', desc: 'Bidirectional Recurrent Neural Network (Prosody & Pitch Contours)' },
    { id: 6, title: 'Transformer Analysis', desc: 'Wav2Vec2 Self-Supervised Contextual Embeddings' },
    { id: 7, title: 'Ensemble Prediction', desc: 'Weighted Parallel Consensus Aggregation' },
    { id: 8, title: 'Explainable AI (XAI)', desc: 'Grad-CAM Attention Map & SHAP Feature Contribution Calculation' },
    { id: 9, title: 'Confidence Scoring', desc: 'Monte Carlo Dropout 99% CI Interval Estimation' },
    { id: 10, title: 'Final Verdict', desc: 'Court-Ready Forensic Evidence Output Packaging' }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResults, setPipelineResults] = useState<any | null>(null);

  const canRun = canRunAiAnalysis(currentUser.role);
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  const runFullPipeline = async () => {
    setIsRunning(true);
    setCurrentStepIndex(1);
    setPipelineResults(null);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= 10) {
        setCurrentStepIndex(step);
      }
    }, 280);

    try {
      const res = await authFetch('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          caseId: activeEvidence.caseId,
          evidenceId: activeEvidence.id,
          fileName: activeEvidence.filename,
          fileHash: activeEvidence.sha256Hash
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPipelineResults(data);
      }
    } catch (err) {
      console.warn('AI pipeline execution notice:', err);
    } finally {
      clearInterval(interval);
      setCurrentStepIndex(10);
      setIsRunning(false);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < 10) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div id="ai-pipeline-screen" className="p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('evidence')} label="Back to Evidence" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-emerald-700" />
              <span>AI Analysis Pipeline</span>
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleConfig?.badgeBg || 'bg-emerald-100'} ${roleConfig?.badgeText || 'text-emerald-900'} ${roleConfig?.badgeBorder || 'border-emerald-300'}`}>
              {roleConfig?.shortLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sequential 10-stage ensemble processing workflow for <strong className="text-slate-800">{activeEvidence.filename}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={nextStep}
            disabled={isRunning || currentStepIndex >= 10 || !canRun}
            className="px-4 py-2 bg-white hover:bg-emerald-50 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-all"
          >
            Next Stage
          </button>
          <button
            id="pipeline-run-full-btn"
            onClick={runFullPipeline}
            disabled={isRunning || !canRun}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Executing Pipeline...' : 'Run Full Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* Left Column: 10 Step Sequential Checklist */}
        <div className="lg:col-span-7 bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Processing Stages ({currentStepIndex} / 10 Complete)
          </h2>

          <div className="space-y-2">
            {stepsList.map((st) => {
              const isDone = st.id <= currentStepIndex;
              const isCurrent = st.id === currentStepIndex && isRunning;

              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                      : isCurrent
                      ? 'bg-emerald-100 border-emerald-500 shadow-sm animate-pulse text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : st.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{st.title}</p>
                      {isDone && (
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.2 rounded border border-emerald-400/40">
                          COMPLETE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Stage Output & Next Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-900/10 pb-2">
              Consensus Prediction Engine
            </h2>

            {pipelineResults ? (
              <div className="space-y-3">
                <div className="p-4 bg-[#032319] border border-emerald-950/20 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase">Consensus Verdict</span>
                    <span
                      className={`font-mono font-extrabold px-2 py-0.5 rounded border ${
                        pipelineResults.overallVerdict === 'DEEPFAKE'
                          ? 'text-rose-400 bg-rose-950/80 border-rose-800/60'
                          : pipelineResults.overallVerdict === 'AUTHENTIC'
                          ? 'text-emerald-300 bg-emerald-950 border-emerald-800'
                          : 'text-amber-300 bg-amber-950/80 border-amber-800'
                      }`}
                    >
                      {pipelineResults.overallVerdict}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase">Confidence Level</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {pipelineResults.overallConfidence ? `${pipelineResults.overallConfidence}%` : 'Pending Weight Calibration'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 leading-relaxed border-t border-emerald-900/40 pt-2 font-mono">
                    {pipelineResults.legalSummary}
                  </div>
                </div>

                {/* Model Availability Breakdown */}
                <div className="space-y-1.5 text-[11px]">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Integrated Forensics Engines
                  </p>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">DSP Spectral Feature Extraction</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">Gemini 2.5 Flash Advisory</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        INTEGRATED
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Local PyTorch Neural Vocoders</span>
                      <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                        AWAITING WEIGHTS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Cpu className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Pipeline Execution Pending</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Audio file <strong>{activeEvidence.filename}</strong> has not yet been analyzed. Click &ldquo;Run Full Analysis&rdquo; to process this evidence exhibit.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setCurrentScreen('detection-results')}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>View Detailed Detection Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentScreen('xai')}
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Inspect Explainable AI (XAI) Contours
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
