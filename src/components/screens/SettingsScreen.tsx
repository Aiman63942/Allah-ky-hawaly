import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Lock,
  Shield,
  Bell,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  QrCode,
  Save,
  AlertTriangle,
  Info,
  Clock,
  FileCheck
} from 'lucide-react';
import { ScreenId, User } from '../../types';
import { ROLE_CONFIGS } from '../../utils/rbac';
import { playSuccessSound } from '../../utils/audioPlayer';
import { BackButton } from '../common/BackButton';

interface SettingsScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  setCurrentScreen,
  currentUser,
  setCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<'Account' | '2FA' | 'Notifications' | 'Appearance' | 'Retention'>('Account');

  // Account State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [agency, setAgency] = useState(currentUser.agency);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (202) 555-0147');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [authMethod, setAuthMethod] = useState<'FIDO2' | 'AUTHENTICATOR_APP' | 'SMS_SECURE'>('FIDO2');
  const [fidoKeyName, setFidoKeyName] = useState('YubiKey 5 FIPS (Hardware CAC)');

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    securityCritical: true,
    caseUpdates: true,
    reportCertifications: true,
    tamperAlerts: true
  });

  // Appearance State
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('light');

  // Retention Policy State (ISO/IEC 27037 & CJIS)
  const [evidenceRetentionYears, setEvidenceRetentionYears] = useState('7');
  const [caseRetentionYears, setCaseRetentionYears] = useState('10');
  const [auditLogRetentionYears, setAuditLogRetentionYears] = useState('Permanent (WORM)');
  const [autoPurgeUnverified, setAutoPurgeUnverified] = useState(false);

  const [savedBanner, setSavedBanner] = useState('');

  const roleConfig = ROLE_CONFIGS[currentUser.role];

  const triggerSaveNotification = (msg: string) => {
    playSuccessSound();
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(''), 3500);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      alert('New password and confirm password do not match.');
      return;
    }
    setCurrentUser({
      ...currentUser,
      name,
      email,
      agency,
      phone
    });
    triggerSaveNotification('Account profile information updated successfully.');
  };

  const handleSave2FA = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification('Two-Factor Authentication security policies committed.');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification('System alert & notification preferences saved.');
  };

  const handleSaveRetention = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification('Data retention and compliance archiving rules applied.');
  };

  return (
    <div id="settings-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="border-b border-emerald-900/10 pb-5">
        <div className="flex items-center space-x-3 mb-1">
          <BackButton onClick={() => setCurrentScreen('dashboard')} label="Back to Dashboard" variant="pill" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2 font-sans">
          <Settings className="w-6 h-6 text-emerald-700" />
          <span>Account & Platform Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage personal credentials, hardware two-factor authentication, alerts, theme preferences, and data retention policies
        </p>
      </div>

      {savedBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-bold">{savedBanner}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1.5 bg-white border border-emerald-900/10 p-1.5 rounded-2xl overflow-x-auto max-w-4xl shadow-sm">
        {[
          { id: 'Account', label: 'Account Profile', icon: UserIcon },
          { id: '2FA', label: 'Two-Factor Authentication', icon: Shield },
          { id: 'Notifications', label: 'Notifications & Alerts', icon: Bell },
          { id: 'Appearance', label: 'Appearance & Theme', icon: Sun },
          { id: 'Retention', label: 'Data Retention & Archival', icon: HardDrive }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
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

      <div className="max-w-4xl">
        {/* TAB 1: Account Profile */}
        {activeTab === 'Account' && (
          <form onSubmit={handleSaveAccount} className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-700 text-white font-extrabold text-xl flex items-center justify-center border-2 border-emerald-300 shadow-md">
                {currentUser.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-block mt-1 ${roleConfig?.badgeBg} ${roleConfig?.badgeText} ${roleConfig?.badgeBorder}`}>
                  {currentUser.role}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">{currentUser.agency}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Institutional Agency Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Assigned Organization / Unit</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Secure Line / Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Change Password / Security PIN</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="password"
                  placeholder="New Password (12+ chars)"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Account Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Two-Factor Authentication */}
        {activeTab === '2FA' && (
          <form onSubmit={handleSave2FA} className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Hardware & Software Two-Factor Authentication (2FA)</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                NIST SP 800-63B Authenticator Assurance Level 3 (AAL3) Compliance
              </p>
            </div>

            {/* Toggle 2FA */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 text-sm block">Two-Factor Authentication Status</span>
                <span className="text-slate-600 text-xs">
                  {twoFactorEnabled ? 'Currently enforced for all sign-in attempts.' : 'Warning: 2FA is disabled.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
              </label>
            </div>

            {/* Primary Authentication Method */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-slate-500">Select Primary 2FA Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'FIDO2', label: 'Hardware Security Key (FIDO2 / CAC)', desc: 'YubiKey, CAC SmartCard, Windows Hello' },
                  { id: 'AUTHENTICATOR_APP', label: 'TOTP Authenticator App', desc: 'Google Authenticator, Microsoft Auth' },
                  { id: 'SMS_SECURE', label: 'Direct Secure SMS / Voice Token', desc: 'Encrypted SMS verification code' }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setAuthMethod(m.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      authMethod === m.id
                        ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="authMethod"
                        checked={authMethod === m.id}
                        onChange={() => setAuthMethod(m.id as any)}
                        className="text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-xs">{m.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Key Info */}
            {authMethod === 'FIDO2' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Registered Hardware Security Keys</span>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700">✓ {fidoKeyName}</span>
                  <span className="text-emerald-800 font-bold">ACTIVE & CERTIFIED</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save 2FA Security Configuration</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === 'Notifications' && (
          <form onSubmit={handleSaveNotifications} className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Notification & Security Alert Routing</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Configure when and where system audit alerts and forensic case updates are dispatched
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'emailAlerts', title: 'Institutional Email Notifications', desc: 'Receive case assignment and docket updates via official email.' },
                { key: 'securityCritical', title: 'Critical Security & Login Alerts', desc: 'Immediate notification when logins occur from unrecognized IP addresses.' },
                { key: 'caseUpdates', title: 'Evidence Ingestion & AI Pipeline Alerts', desc: 'Alert when neural ensemble deepfake detection pipeline completes.' },
                { key: 'reportCertifications', title: 'Expert Witness Certification Seals', desc: 'Notify when peer forensic examiner signs off on evidentiary reports.' },
                { key: 'tamperAlerts', title: 'Tamper & Hash Inconsistency Warning', desc: 'High-priority instant alert if any SHA-256 evidence checksum fails.' }
              ].map((item) => (
                <div key={item.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{item.title}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: Appearance & Theme */}
        {activeTab === 'Appearance' && (
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">National White & Green Theme Appearance</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Complies with national forensic laboratory high-contrast display standards for judicial clarity
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'light', title: 'National White & Green (Default)', desc: 'High-contrast emerald & white canvas optimized for court presentation.', icon: Sun },
                { id: 'dark', title: 'Forensic Lab Dark Mode', desc: 'Dark emerald background for low-light audio laboratory environments.', icon: Moon },
                { id: 'system', title: 'Follow System Settings', desc: 'Automatically adapt to operating system preference.', icon: Monitor }
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setThemeMode(t.id as any);
                    triggerSaveNotification(`Appearance theme set to ${t.title}`);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    themeMode === t.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <t.icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs block">{t.title}</span>
                  <p className="text-[10px] text-slate-500 leading-normal">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Data Retention & Archival Policy */}
        {activeTab === 'Retention' && (
          <form onSubmit={handleSaveRetention} className="bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Evidence & Audit-Log Retention Policies</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                ISO/IEC 27037 Digital Evidence Handling and CJIS Security Policy 5.9 Retention Schedules
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Statutory Retention Compliance Notice</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Under Federal Criminal Procedure Rule 16 and SWGDE recommendations, audio deepfake evidentiary recordings and cryptographic hash ledgers must be retained until final disposition of judicial proceedings plus appellate period.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Evidence Retention Period</label>
                  <select
                    value={evidenceRetentionYears}
                    onChange={(e) => setEvidenceRetentionYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="5">5 Years (Standard Misdemeanor)</option>
                    <option value="7">7 Years (Federal Felony Standard)</option>
                    <option value="10">10 Years (Major National Security)</option>
                    <option value="Permanent">Permanent Archival Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Case Metadata Retention</label>
                  <select
                    value={caseRetentionYears}
                    onChange={(e) => setCaseRetentionYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="7">7 Years</option>
                    <option value="10">10 Years (Standard Federal)</option>
                    <option value="Permanent">Permanent Archival</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Audit-Log Retention Policy</label>
                  <select
                    value={auditLogRetentionYears}
                    onChange={(e) => setAuditLogRetentionYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Permanent (WORM)">Permanent (Write-Once-Read-Many)</option>
                    <option value="10">10 Years Immutable</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Retention Policies</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
