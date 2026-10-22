import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Shield,
  FolderKanban
} from 'lucide-react';
import { ScreenId, Case, CaseStatus, PriorityType, VerdictType, User } from '../../types';
import { canCreateCases, isReadOnlyForensics, ROLE_CONFIGS } from '../../utils/rbac';
import { BackButton } from '../common/BackButton';

import { authFetch } from '../../utils/api';

interface CaseManagementScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  setSelectedCaseId: (id: string) => void;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;
  currentUser: User;
}

export const CaseManagementScreen: React.FC<CaseManagementScreenProps> = ({
  setCurrentScreen,
  setSelectedCaseId,
  cases,
  setCases,
  isNewCaseModalOpen,
  setIsNewCaseModalOpen,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'All' | CaseStatus>('All');
  const [searchTerm, setSearchQuery] = useState('');
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);

  // Role permissions
  const userCanCreate = canCreateCases(currentUser.role);
  const isReadOnly = isReadOnlyForensics(currentUser.role);
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  // Form state for New Case Modal
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityType>('High');
  const [newAgency, setNewAgency] = useState('FBI Digital Forensics & Cyber Division');
  const [newAnalyst, setNewAnalyst] = useState(currentUser.name);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesTab = activeTab === 'All' ? true : c.status === activeTab;
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.analyst.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.agency.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmittingCase(true);
    try {
      const res = await authFetch('/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          priority: newPriority,
          agency: newAgency,
          analyst: newAnalyst,
          createdBy: currentUser.email
        })
      });

      if (res.ok) {
        const createdCase = await res.json();
        setCases([createdCase, ...cases]);
        setSelectedCaseId(createdCase.id);
        setIsNewCaseModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setCurrentScreen('evidence');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create case docket.');
      }
    } catch {
      alert('Network error creating case docket.');
    } finally {
      setIsSubmittingCase(false);
    }
  };

  return (
    <div id="cases-screen" className="p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('dashboard')} label="Back to Dashboard" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Forensic Case Management
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleConfig?.badgeBg || 'bg-emerald-100'} ${roleConfig?.badgeText || 'text-emerald-900'} ${roleConfig?.badgeBorder || 'border-emerald-300'}`}>
              {roleConfig?.shortLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Docket registry, chain of custody tracking, and forensic examiner assignments
          </p>
        </div>

        {userCanCreate ? (
          <button
            id="new-case-modal-trigger-btn"
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Case Docket</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center space-x-2 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Docket Creation: Lead Forensic Analyst Only</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0">
          {(['All', 'Active', 'Under Review', 'Pending Legal', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-emerald-800/60 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docket ID, title, analyst..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* Case Table Container */}
      <div className="bg-white border border-emerald-900/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/70 border-b border-emerald-900/10 text-emerald-950 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Docket ID</th>
                <th className="py-3 px-4">Case Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Lead Analyst / Agency</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No forensic cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setCurrentScreen('detection-results');
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.verdict === 'DEEPFAKE'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : c.verdict === 'AUTHENTIC'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {c.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span className="font-semibold text-slate-800">{c.analyst}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{c.agency}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {c.evidenceCount} files
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setCurrentScreen('detection-results');
                          }}
                          className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="View Detection Results"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setCurrentScreen('report-generation');
                          }}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Generate Forensic Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Case Modal (Lead Analyst Privilege) */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-900/10 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Initiate Forensic Docket</h3>
                  <p className="text-[11px] text-slate-500">ISO/IEC 27037 chain-of-custody registered case</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Case Docket Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Committee Hearing Voice Audio Clone Investigation"
                  className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Incident Synopsis / Allegation</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe context of the intercepted/submitted audio recording..."
                  className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityType)}
                    className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Critical">Critical (High Profile)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Lead Examiner</label>
                  <input
                    type="text"
                    value={newAnalyst}
                    onChange={(e) => setNewAnalyst(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Save & Open Evidence Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
