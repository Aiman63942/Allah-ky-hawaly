import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Sliders,
  Cpu,
  Lock,
  Database,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ShieldCheck,
  Activity,
  Clock,
  Search,
  Filter,
  Download,
  Check,
  User as UserIcon,
  Laptop
} from 'lucide-react';
import { ScreenId, User, UserRole } from '../../types';
import { MOCK_USERS } from '../../data/mockData';
import { ROLE_CONFIGS } from '../../utils/rbac';
import { BackButton } from '../common/BackButton';

interface UserActivityRecord {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  loginDate: string;
  loginTime: string;
  logoutTime: string;
  sessionDuration: string;
  lastActivity: string;
  ipAddress: string;
  device: string;
  caseId: string;
  actionsPerformed: string;
  accountStatus: 'Active' | 'Logged Out' | 'Suspended';
}

interface AdminPanelScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: User;
  users?: User[];
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  setCurrentScreen,
  currentUser,
  users: parentUsers,
  setUsers: parentSetUsers
}) => {
  const [activeTab, setActiveTab] = useState<'Activity' | 'Users' | 'Roles' | 'Models' | 'Security'>('Activity');
  const [internalUsers, setInternalUsers] = useState<User[]>(MOCK_USERS);
  const users = parentUsers || internalUsers;
  const setUsers = parentSetUsers || setInternalUsers;
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // User Activity Records (Requirement 11)
  const [activities] = useState<UserActivityRecord[]>([
    {
      id: 'ACT-901',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      loginDate: '2026-08-09',
      loginTime: '08:00:12 UTC',
      logoutTime: 'Active (Current Session)',
      sessionDuration: '3h 45m',
      lastActivity: 'AI Pipeline Execution (EV-2024-8842)',
      ipAddress: '10.0.1.45',
      device: 'Secured Linux Workstation / Chrome 127',
      caseId: 'DS-2024-4471',
      actionsPerformed: 'Ingestion, Hash Seal, AI Detection, XAI Generation',
      accountStatus: 'Active'
    },
    {
      id: 'ACT-902',
      userId: 'USR-02',
      userName: 'Dr. Keisha Okafor',
      role: 'Forensic Examiner / Expert Witness',
      loginDate: '2026-08-09',
      loginTime: '10:02:18 UTC',
      logoutTime: '11:45:00 UTC',
      sessionDuration: '1h 42m',
      lastActivity: 'RSA-4096 Expert Witness Certification',
      ipAddress: '10.0.1.88',
      device: 'Windows 11 / Windows Hello Biometric',
      caseId: 'DS-2024-4471',
      actionsPerformed: 'XAI Inspection, Oral Statement Recording, Biometric Sign-Off',
      accountStatus: 'Logged Out'
    },
    {
      id: 'ACT-903',
      userId: 'USR-03',
      userName: 'Marcus Vance, Esq.',
      role: 'Prosecutor / Legal Reviewer',
      loginDate: '2026-08-09',
      loginTime: '14:00:00 UTC',
      logoutTime: 'Active (Current Session)',
      sessionDuration: '45m',
      lastActivity: 'Legal Review Pretrial Compliance Approval',
      ipAddress: '10.0.1.92',
      device: 'Judiciary Secure Terminal / macOS Sonoma',
      caseId: 'DS-2024-4471',
      actionsPerformed: 'Admissibility Review, FRE 702 Checklist, Note Attachment',
      accountStatus: 'Active'
    },
    {
      id: 'ACT-904',
      userId: 'USR-04',
      userName: 'Elena Rostova',
      role: 'System Security Administrator',
      loginDate: '2026-08-09',
      loginTime: '07:30:00 UTC',
      logoutTime: '09:15:30 UTC',
      sessionDuration: '1h 45m',
      lastActivity: 'Security Audit & Policy Retention Audit',
      ipAddress: '10.0.0.5',
      device: 'Admin Console (Hardware Token)',
      caseId: 'SYSTEM-WIDE',
      actionsPerformed: 'User RBAC Audit, Audit Trail Verification, Key Rotation',
      accountStatus: 'Logged Out'
    },
    {
      id: 'ACT-905',
      userId: 'USR-01',
      userName: 'Dr. Sarah Anderson',
      role: 'Lead Forensic Analyst',
      loginDate: '2026-08-08',
      loginTime: '13:10:00 UTC',
      logoutTime: '17:30:22 UTC',
      sessionDuration: '4h 20m',
      lastActivity: 'Case Creation & Evidence Upload (DS-2024-4471)',
      ipAddress: '10.0.1.45',
      device: 'Secured Linux Workstation / Chrome 127',
      caseId: 'DS-2024-4471',
      actionsPerformed: 'Case Initialization, File SHA-256 Digest Seal',
      accountStatus: 'Logged Out'
    }
  ]);

  // Activity Filters (by user, role, date, case, action)
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterCase, setFilterCase] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Forensic Examiner / Expert Witness');
  const [agency, setAgency] = useState('Federal Digital Forensics Unit');

  const filteredActivities = activities.filter((act) => {
    const matchesUser = filterUser === 'ALL' || act.userName === filterUser || act.userId === filterUser;
    const matchesRole = filterRole === 'ALL' || act.role === filterRole;
    const matchesDate = filterDate === 'ALL' || act.loginDate === filterDate;
    const matchesCase = filterCase === 'ALL' || act.caseId === filterCase;
    const matchesSearch =
      act.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.ipAddress.includes(searchTerm) ||
      act.actionsPerformed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.caseId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesUser && matchesRole && matchesDate && matchesCase && matchesSearch;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const newUser: User = {
      id: `USR-0${users.length + 1}`,
      name,
      email,
      role,
      agency,
      avatar: initials,
      status: 'active',
      casesCount: 0
    };

    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    setName('');
    setEmail('');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  return (
    <div id="admin-panel-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('dashboard')} label="Back to Dashboard" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2 font-sans">
              <ShieldAlert className="w-6 h-6 text-emerald-700" />
              <span>System Administration & User Activity</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              ADMIN PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System access logging, operator session duration, account status, and role access provisioning
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User Account</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1.5 bg-white border border-emerald-900/10 p-1.5 rounded-2xl overflow-x-auto max-w-2xl shadow-sm">
        {[
          { id: 'Activity', label: 'User Activity & Sessions', icon: Activity },
          { id: 'Users', label: 'User Accounts', icon: Users },
          { id: 'Roles', label: 'RBAC Permission Matrix', icon: ShieldCheck },
          { id: 'Models', label: 'AI Model Registry', icon: Cpu },
          { id: 'Security', label: 'Security & Enclave Seals', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: User Activity & Session History (Requirement 11) */}
      {activeTab === 'Activity' && (
        <div className="space-y-4">
          {/* Multi-Parameter Filters Toolbar */}
          <div className="bg-white border border-emerald-900/10 p-4 rounded-2xl space-y-3 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-emerald-700" />
                <span>Filter Activity Logs</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Showing {filteredActivities.length} of {activities.length} session records
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* User Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">User</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium"
                >
                  <option value="ALL">All Users</option>
                  <option value="Dr. Sarah Anderson">Dr. Sarah Anderson</option>
                  <option value="Dr. Keisha Okafor">Dr. Keisha Okafor</option>
                  <option value="Marcus Vance, Esq.">Marcus Vance, Esq.</option>
                  <option value="Elena Rostova">Elena Rostova</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Lead Forensic Analyst">Lead Forensic Analyst</option>
                  <option value="Forensic Examiner / Expert Witness">Forensic Examiner</option>
                  <option value="Prosecutor / Legal Reviewer">Prosecutor</option>
                  <option value="System Security Administrator">System Admin</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Date</label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium"
                >
                  <option value="ALL">All Dates</option>
                  <option value="2026-08-09">2026-08-09 (Today)</option>
                  <option value="2026-08-08">2026-08-08 (Yesterday)</option>
                </select>
              </div>

              {/* Case Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Case Docket</label>
                <select
                  value={filterCase}
                  onChange={(e) => setFilterCase(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium"
                >
                  <option value="ALL">All Cases</option>
                  <option value="DS-2024-4471">DS-2024-4471</option>
                  <option value="SYSTEM-WIDE">SYSTEM-WIDE</option>
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Search Keyword</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="IP, action, ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* User Activity Table */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-emerald-50/80 text-emerald-950 uppercase text-[10px] tracking-wider border-b border-emerald-900/10 font-bold">
                  <tr>
                    <th className="py-3 px-4">Operator (User ID)</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Login / Logout Time</th>
                    <th className="py-3 px-4">Session Duration</th>
                    <th className="py-3 px-4">Last Activity & Case</th>
                    <th className="py-3 px-4">Terminal IP & Device</th>
                    <th className="py-3 px-4 text-right">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{act.userName}</span>
                          <span className="font-mono text-[10px] text-emerald-800">{act.userId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {act.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="block text-slate-800">In: {act.loginTime}</span>
                        <span className="text-slate-500 text-[10px]">Out: {act.logoutTime}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 text-xs">
                        {act.sessionDuration}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{act.lastActivity}</span>
                        <span className="text-[10px] font-mono text-slate-500">Docket: {act.caseId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 block">{act.ipAddress}</span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{act.device}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 ${
                            act.accountStatus === 'Active'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {act.accountStatus === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
                          <span>{act.accountStatus}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management Tab */}
      {activeTab === 'Users' && (
        <div className="bg-white border border-emerald-900/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-emerald-50/80 text-emerald-950 uppercase text-[10px] tracking-wider border-b border-emerald-900/10 font-bold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization / Unit</th>
                  <th className="py-3 px-4">Active Cases</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const rConfig = ROLE_CONFIGS[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            {u.avatar}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rConfig?.badgeBg || 'bg-slate-100'} ${rConfig?.badgeText || 'text-slate-800'} ${rConfig?.badgeBorder || 'border-slate-200'}`}>
                          {rConfig?.shortLabel || u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{u.agency}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{u.casesCount}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 rounded-lg transition-all"
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Roles & Permissions Tab */}
      {activeTab === 'Roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              role: 'Lead Forensic Analyst',
              desc: 'Full case management, evidence upload & hash verification, multi-model AI inference pipeline, XAI inspection, final report seal.',
              permissions: ['CREATE_CASE', 'UPLOAD_EVIDENCE', 'RUN_AI_PIPELINE', 'MANAGE_CHAIN_OF_CUSTODY', 'GENERATE_REPORT']
            },
            {
              role: 'Forensic Examiner / Expert Witness',
              desc: 'Detailed acoustic & spectral analysis, XAI attention inspection, oral findings statement recording, RSA-4096 biometric sign-off.',
              permissions: ['VIEW_CASE', 'INSPECT_XAI', 'RECORD_ORAL_FINDING', 'BIOMETRIC_SIGN_OFF', 'VALIDATE_STANDARDS']
            },
            {
              role: 'Prosecutor / Legal Reviewer',
              desc: 'Read-only access to case evidence and technical findings, court admissibility checklist review, pretrial note attachments.',
              permissions: ['READ_CASE_EVIDENCE', 'READ_DETECTION_RESULTS', 'APPROVE_COURT_ADMISSIBILITY', 'ATTACH_LEGAL_NOTES']
            },
            {
              role: 'System Security Administrator',
              desc: 'User account provisioning, hardware 2FA enforcement, ISO/IEC 27037 data retention schedules, immutable audit trail export.',
              permissions: ['USER_MANAGEMENT', 'SECURITY_POLICY_CONFIG', 'AUDIT_LOG_EXPORT', 'DATA_RETENTION_CONTROL']
            }
          ].map((r, idx) => (
            <div key={idx} className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 shadow-sm text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">{r.role}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{r.desc}</p>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Granted Permissions</span>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.map((p, pIdx) => (
                    <span key={pIdx} className="font-mono text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AI Model Registry */}
      {activeTab === 'Models' && (
        <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-slate-900">Accredited Deepfake Audio Neural Architectures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { name: 'CNN (ResNet-50)', type: '2D Spectrogram Convolutions', accuracy: '96.8%', status: 'PRODUCTION' },
              { name: 'BiLSTM Temporal', type: 'Prosody & Pitch Contour', accuracy: '95.4%', status: 'PRODUCTION' },
              { name: 'Wav2Vec2.0', type: 'Self-Supervised Raw Audio', accuracy: '98.2%', status: 'PRODUCTION' }
            ].map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block">{m.name}</span>
                <span className="text-[11px] text-slate-500 block">{m.type}</span>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-mono text-[11px]">
                  <span>Accuracy: <strong className="text-emerald-800">{m.accuracy}</strong></span>
                  <span className="text-emerald-900 font-bold px-2 py-0.5 bg-emerald-100 rounded text-[10px]">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Security & Cryptographic Seals */}
      {activeTab === 'Security' && (
        <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-slate-900">National Cryptographic Hardware & HSM Status</h3>
          <div className="p-4 bg-[#032319] text-emerald-300 rounded-2xl space-y-2 font-mono text-xs shadow-inner">
            <div className="flex justify-between items-center border-b border-emerald-900/60 pb-2">
              <span className="font-bold text-white uppercase">HARDWARE SECURITY MODULE (HSM)</span>
              <span className="text-emerald-400 font-bold">FIPS 140-3 LEVEL 4</span>
            </div>
            <p>ROOT CA KEY: RSA-4096 / SHA-256 [ID: FED-AUDIO-ROOT-CA-2026]</p>
            <p>SYSTEM INTEGRITY SEAL: 100% IMMUTABLE APPEND-ONLY LEDGER ACTIVE</p>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-emerald-900/20 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Provision New Forensic User</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Full Official Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Agent Robert Thorne"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Agency Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.thorne@forensics.gov"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="Lead Forensic Analyst">Lead Forensic Analyst</option>
                  <option value="Forensic Examiner / Expert Witness">Forensic Examiner / Expert Witness</option>
                  <option value="Prosecutor / Legal Reviewer">Prosecutor / Legal Reviewer</option>
                  <option value="System Security Administrator">System Security Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Organization / Agency</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-900/20"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
