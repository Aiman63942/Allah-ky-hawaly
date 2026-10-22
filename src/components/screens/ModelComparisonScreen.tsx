import React from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  Cpu,
  Clock,
  Zap,
  Layers
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ScreenId, User } from '../../types';
import { MOCK_MODEL_RESULTS, RADAR_COMPARISON_DATA } from '../../data/mockData';
import { BackButton } from '../common/BackButton';

interface ModelComparisonScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: User;
}

export const ModelComparisonScreen: React.FC<ModelComparisonScreenProps> = ({ setCurrentScreen, currentUser }) => {
  const accuracyBarData = [
    { name: 'CNN', accuracy: 94.2 },
    { name: 'BiLSTM', accuracy: 96.1 },
    { name: 'Transformer', accuracy: 97.4 },
    { name: 'Ensemble', accuracy: 98.7 }
  ];

  return (
    <div id="model-comparison-screen" className="p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="border-b border-emerald-900/10 pb-5">
        <div className="flex items-center space-x-3 mb-1">
          <BackButton onClick={() => setCurrentScreen('detection-results')} label="Back to Results" variant="pill" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-emerald-700" />
          <span>Model Performance Comparison</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          CNN vs BiLSTM vs Wav2Vec2 Transformer vs Ensemble — comprehensive benchmarks on ASVspoof LA dataset
        </p>
      </div>

      {/* Benchmark Table Card */}
      <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Architecture Benchmark Matrix
          </h2>
          <span className="text-[10px] font-mono text-emerald-900 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Dataset: ASVspoof 2024 In-the-Wild
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/80 text-emerald-950 uppercase text-[10px] tracking-wider border-b border-emerald-900/10 font-bold">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">Accuracy %</th>
                <th className="py-3 px-4">Precision %</th>
                <th className="py-3 px-4">Recall %</th>
                <th className="py-3 px-4">F1 Score %</th>
                <th className="py-3 px-4">Inference Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_MODEL_RESULTS.map((m, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-emerald-50/50 transition-colors ${
                    m.isRecommended ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <span>{m.modelName}</span>
                    {m.isRecommended && (
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full flex items-center space-x-1">
                        <Award className="w-3 h-3 text-emerald-700" />
                        <span>RECOMMENDED</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{m.accuracy}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{m.precision}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{m.recall}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{m.f1Score}%</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-900 font-bold">
                    {(m.inferenceTimeMs / 1000).toFixed(1)}s
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      DEPLOYED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar & Accuracy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Comparison Chart */}
        <div className="lg:col-span-6 bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Multi-Dimensional Radar Evaluation
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_COMPARISON_DATA}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="metric" stroke="#475569" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#94A3B8" />
                <Radar name="Ensemble Meta" dataKey="Ensemble" stroke="#047857" fill="#047857" fillOpacity={0.4} />
                <Radar name="Transformer" dataKey="Transformer" stroke="#0D9488" fill="#0D9488" fillOpacity={0.3} />
                <Radar name="BiLSTM" dataKey="BiLSTM" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#CBD5E1', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Comparison Bar */}
        <div className="lg:col-span-6 bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Accuracy Metric Bar Chart
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis domain={[90, 100]} stroke="#64748B" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#CBD5E1', borderRadius: '12px' }} />
                <Bar dataKey="accuracy" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
