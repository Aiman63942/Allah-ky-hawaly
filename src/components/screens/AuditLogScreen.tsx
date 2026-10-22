import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Check,
  Clock,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { ScreenId, User } from '../../types';
import { BackButton } from '../common/BackButton';

interface DetailedAuditEntry {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  caseId: string;
  evidenceId: string;
  date: string;
  time: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  resource: string;
  status: string;
}

interface AuditLogScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: User;
}

export const AuditLogScreen: React.FC<AuditLogScreenProps> = ({ setCurrentScreen, currentUser }) => {
  const [logs] = useState<DetailedAuditEntry[]>([
    {
      id: 'AUD-8801',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      action: 'LOGIN',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-08',
      time: '08:00:12 UTC',
      timestamp: '2026-08-08 08:00:12 UTC',
      ipAddress: '10.0.1.45',
      device: 'Secured Forensic Workstation (Linux 6.8 / FIPS-140)',
      resource: 'AUTH_GATEWAY / 2FA-FIDO2',
      status: 'SUCCESS'
    },
    {
      id: 'AUD-8802',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      action: 'UPLOAD',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-08',
      time: '08:14:32 UTC',
      timestamp: '2026-08-08 08:14:32 UTC',
      ipAddress: '10.0.1.45',
      device: 'Secured Forensic Workstation (Linux 6.8 / FIPS-140)',
      resource: 'RAW_EVIDENCE_REPOSITORY',
      status: 'VERIFIED_SHA256'
    },
    {
      id: 'AUD-8803',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      action: 'VERIFY',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-08',
      time: '08:15:00 UTC',
      timestamp: '2026-08-08 08:15:00 UTC',
      ipAddress: '10.0.1.45',
      device: 'Secured Forensic Workstation (Linux 6.8 / FIPS-140)',
      resource: 'SHA256_INTEGRITY_ENGINE',
      status: 'MATCH_CONFIRMED'
    },
    {
      id: 'AUD-8804',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      action: 'WRITE',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-09',
      time: '07:15:09 UTC',
      timestamp: '2026-08-09 07:15:09 UTC',
      ipAddress: '10.0.2.10',
      device: 'Neural Compute Cluster (Node-04)',
      resource: 'AI_PIPELINE_ENSEMBLE',
      status: 'SUCCESS'
    },
    {
      id: 'AUD-8805',
      userId: 'USR-02',
      userName: 'Dr. Keisha Okafor',
      role: 'Forensic Examiner / Expert Witness',
      action: 'VIEW',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-09',
      time: '10:02:18 UTC',
      timestamp: '2026-08-09 10:02:18 UTC',
      ipAddress: '10.0.1.88',
      device: 'Forensic Audio Terminal (Windows 11 / Windows Hello)',
      resource: 'XAI_GRADCAM_INSPECTOR',
      status: 'SUCCESS'
    },
    {
      id: 'AUD-8806',
      userId: 'USR-02',
      userName: 'Dr. Keisha Okafor',
      role: 'Forensic Examiner / Expert Witness',
      action: 'SIGN',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-09',
      time: '11:30:47 UTC',
      timestamp: '2026-08-09 11:30:47 UTC',
      ipAddress: '10.0.1.88',
      device: 'Biometric Authenticator / FIPS 201 Sensor',
      resource: 'EXPERT_WITNESS_SEAL',
      status: 'RSA4096_SIGNED'
    },
    {
      id: 'AUD-8807',
      userId: 'USR-03',
      userName: 'Marcus Vance, Esq.',
      role: 'Prosecutor / Legal Reviewer',
      action: 'VIEW',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-09',
      time: '14:10:00 UTC',
      timestamp: '2026-08-09 14:10:00 UTC',
      ipAddress: '10.0.1.92',
      device: 'Judiciary Secure Terminal',
      resource: 'LEGAL_REVIEW_PORTAL',
      status: 'SUCCESS'
    },
    {
      id: 'AUD-8808',
      userId: 'USR-04',
      userName: 'Elena Rostova',
      role: 'System Security Administrator',
      action: 'CONFIG',
      caseId: 'DS-2024-4471',
      evidenceId: 'EV-2024-8842',
      date: '2026-08-09',
      time: '15:00:22 UTC',
      timestamp: '2026-08-09 15:00:22 UTC',
      ipAddress: '10.0.0.5',
      device: 'Admin Console (Hardware Token)',
      resource: 'RETENTION_POLICY_ENFORCER',
      status: 'POLICY_ENFORCED'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.evidenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.includes(searchTerm);
    const matchesAction = actionFilter === 'ALL' ? true : l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'VIEW': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'WRITE': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SIGN': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'UPLOAD': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'VERIFY': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'LOGIN': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CONFIG': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Real CSV Generation and Download (Requirement 9)
  const handleExportCSV = () => {
    setIsExporting(true);

    const headers = [
      'Log ID',
      'User ID',
      'User Name',
      'Role',
      'Action Performed',
      'Case ID',
      'Evidence ID',
      'Date',
      'Time (UTC)',
      'IP Address',
      'Device / Environment',
      'Resource Target',
      'Result / Status'
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.userId}"`,
      `"${log.userName}"`,
      `"${log.role}"`,
      `"${log.action}"`,
      `"${log.caseId}"`,
      `"${log.evidenceId}"`,
      `"${log.date}"`,
      `"${log.time}"`,
      `"${log.ipAddress}"`,
      `"${log.device}"`,
      `"${log.resource}"`,
      `"${log.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ALFADETECT_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div id="audit-log-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('dashboard')} label="Back to Dashboard" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2 font-sans">
              <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
              <span>Immutable Security Audit Log</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              ISO/IEC 27037 APPEND-ONLY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident activity trail capturing all user interactions, case events, IP addresses, and cryptographic actions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-900/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          {exportSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>CSV Exported Successfully!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Audit Log (CSV)</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-emerald-900/10 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
          {['ALL', 'VIEW', 'WRITE', 'SIGN', 'UPLOAD', 'VERIFY', 'LOGIN', 'CONFIG'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                actionFilter === act
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search user, role, case ID, IP, or resource..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* Audit Log Table with all 10 standard columns */}
      <div className="bg-white border border-emerald-900/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/80 text-emerald-950 uppercase text-[10px] tracking-wider border-b border-emerald-900/10 font-bold">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Case / Evidence</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Terminal IP & Device</th>
                <th className="py-3 px-4 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{log.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-500">{log.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span className="font-bold text-slate-900 block">{log.caseId}</span>
                    <span className="text-[10px] text-slate-500">{log.evidenceId}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 text-[11px]">{log.resource}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    <span className="block text-slate-800 font-bold">{log.ipAddress}</span>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">{log.device}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full inline-flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
