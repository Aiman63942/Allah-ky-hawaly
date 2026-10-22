import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AccessDeniedView } from './components/common/AccessDeniedView';

import { LandingScreen } from './components/screens/LandingScreen';
import { WorkflowScreen } from './components/screens/WorkflowScreen';
import { SignInScreen } from './components/screens/SignInScreen';
import { RequestAccessScreen } from './components/screens/RequestAccessScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { CaseManagementScreen } from './components/screens/CaseManagementScreen';
import { EvidenceManagementScreen } from './components/screens/EvidenceManagementScreen';
import { ChainOfCustodyScreen } from './components/screens/ChainOfCustodyScreen';
import { HashIntegrityScreen } from './components/screens/HashIntegrityScreen';
import { AiPipelineScreen } from './components/screens/AiPipelineScreen';
import { DetectionResultsScreen } from './components/screens/DetectionResultsScreen';
import { SpeakerVerificationScreen } from './components/screens/SpeakerVerificationScreen';
import { VoiceDisguiseScreen } from './components/screens/VoiceDisguiseScreen';
import { ModelComparisonScreen } from './components/screens/ModelComparisonScreen';
import { ExplainableAiScreen } from './components/screens/ExplainableAiScreen';
import { ExpertValidationScreen } from './components/screens/ExpertValidationScreen';
import { LegalReviewScreen } from './components/screens/LegalReviewScreen';
import { ReportGenerationScreen } from './components/screens/ReportGenerationScreen';
import { AuditLogScreen } from './components/screens/AuditLogScreen';
import { NotificationCentreScreen } from './components/screens/NotificationCentreScreen';
import { AdminPanelScreen } from './components/screens/AdminPanelScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { PublicVerificationScreen } from './components/screens/PublicVerificationScreen';

import { Shield, Lock, KeyRound, AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

import {
  ScreenId,
  UserRole,
  User,
  Case,
  AudioEvidence,
  NotificationItem,
  ExpertReview
} from './types';

import { authFetch } from './utils/api';
import { BackButton } from './components/common/BackButton';
import { isScreenAllowed, ROLE_CONFIGS } from './utils/rbac';

const INITIAL_GUEST_USER: User = {
  id: '',
  name: 'Unauthenticated Operator',
  email: '',
  role: 'Lead Forensic Analyst',
  agency: 'National Forensics Institute',
  avatar: '?',
  status: 'inactive',
  casesCount: 0
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const scr = urlParams.get('screen') as ScreenId;
      if (token || scr === 'public-verify') return 'public-verify';
      if (scr) return scr;
    }
    return 'landing';
  });
  const [historyStack, setHistoryStack] = useState<ScreenId[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Security & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_session_token');
    }
    return false;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // App-wide state: Clean initial states (No unintended sample user or mock case pollution)
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepfake_detector_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return INITIAL_GUEST_USER;
  });

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [activeEvidence, setActiveEvidence] = useState<AudioEvidence>({
    id: 'EV-INIT',
    caseId: '',
    filename: 'No active evidence selected',
    fileSize: '0 MB',
    duration: '00:00',
    sampleRate: '44.1 kHz',
    bitDepth: '16-bit',
    channels: 'Stereo',
    sha256Hash: '',
    uploadTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    uploadedBy: 'None',
    status: 'Pending Analysis'
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [expertReviews, setExpertReviews] = useState<ExpertReview[]>([]);
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');

  // Synchronize Navigation with Browser History
  const navigateTo = (screen: ScreenId, replace = false) => {
    if (!replace && screen !== currentScreen) {
      setHistoryStack((prev) => [...prev, currentScreen]);
    }
    setCurrentScreen(screen);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', screen);
      window.history.pushState({ screen }, '', url.toString());
    }
  };

  const navigateBack = () => {
    if (historyStack.length > 0) {
      const nextStack = [...historyStack];
      const prev = nextStack.pop()!;
      setHistoryStack(nextStack);
      setCurrentScreen(prev);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('screen', prev);
        window.history.pushState({ screen: prev }, '', url.toString());
      }
    } else {
      const fallback: ScreenId = isAuthenticated ? 'dashboard' : 'landing';
      setCurrentScreen(fallback);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('screen', fallback);
        window.history.pushState({ screen: fallback }, '', url.toString());
      }
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const target = event.state?.screen || new URLSearchParams(window.location.search).get('screen');
      if (target && isScreenAllowed(currentUser.role, target as ScreenId)) {
        setCurrentScreen(target as ScreenId);
      } else {
        setCurrentScreen(isAuthenticated ? 'dashboard' : 'landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, currentUser.role]);

  // Automatic Session Idle Lock Security (5-Minute Inactivity)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isAuthenticated && !isLocked) {
        idleTimer = setTimeout(() => {
          setIsLocked(true);
        }, 5 * 60 * 1000); // 5 minutes auto-lock
      }
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [isAuthenticated, isLocked]);

  // Verify active session with backend on startup and load authentic records
  useEffect(() => {
    async function checkAuthSession() {
      const token = localStorage.getItem('auth_session_token');
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(INITIAL_GUEST_USER);
        return;
      }

      try {
        const res = await authFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('deepfake_detector_user', JSON.stringify(data.user));
            setIsAuthenticated(true);
            loadCases();
            loadEnrolledUsers();
            loadNotifications();
          } else {
            handleSignOut();
          }
        } else {
          handleSignOut();
        }
      } catch (err) {
        console.warn('Session verification fallback:', err);
      }
    }

    async function loadEnrolledUsers() {
      try {
        const res = await authFetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUsers(data);
          }
        }
      } catch (err) {
        console.warn('Users directory sync note:', err);
      }
    }

    async function loadCases() {
      try {
        const res = await authFetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCases(data);
            if (data.length > 0) {
              setSelectedCaseId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Cases sync note:', err);
      }
    }

    async function loadNotifications() {
      try {
        const res = await authFetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        }
      } catch (err) {
        console.warn('Notifications sync note:', err);
      }
    }

    if (isAuthenticated) {
      checkAuthSession();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('deepfake_detector_user', JSON.stringify(user));
    }
    setIsAuthenticated(true);
    navigateTo('dashboard', true);
  };

  const handleRegisteredUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('deepfake_detector_user', JSON.stringify(user));
    setUsers((prev) => [user, ...prev.filter((u) => u.email !== user.email)]);
    setIsAuthenticated(true);
    navigateTo('dashboard', true);
  };

  const handleRegisterExpert = (newExpert: ExpertReview) => {
    setExpertReviews((prev) => [newExpert, ...prev.filter((e) => e.id !== newExpert.id)]);
    setSelectedExpertId(newExpert.id);
  };

  const handleSignOut = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('auth_session_token');
    localStorage.removeItem('deepfake_detector_user');
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_GUEST_USER);
    setCases([]);
    setUsers([]);
    setNotifications([]);
    setHistoryStack([]);
    navigateTo('signin', true);
  };

  const handleLockSession = () => {
    setIsLocked(true);
  };

  const handleUnlockSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword) {
      setUnlockError('Please enter your account password to unlock.');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');

    try {
      const res = await authFetch('/api/auth/reauth', {
        method: 'POST',
        body: JSON.stringify({ password: unlockPassword })
      });
      const data = await res.json();
      if (res.ok && data.unlocked) {
        setIsLocked(false);
        setUnlockPassword('');
        setUnlockError('');
      } else {
        setUnlockError(data.error || 'Authentication failed: Incorrect password.');
      }
    } catch {
      setUnlockError('Connection error during re-authentication.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Full-screen pages without sidebar (landing, signin, request-access, workflow, public-verify)
  const isFullScreenPage =
    !isAuthenticated ||
    currentScreen === 'landing' ||
    currentScreen === 'workflow' ||
    currentScreen === 'signin' ||
    currentScreen === 'request-access' ||
    currentScreen === 'public-verify';

  // Check RBAC permission for currently targeted screen
  const isTargetScreenAllowed = isScreenAllowed(currentUser.role, currentScreen);

  return (
    <div className="min-h-screen bg-[#F4F8F6] text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white antialiased">
      
      {/* Top Security & Classification Bar - National Green & White */}
      <div className="bg-[#032319] border-b border-[#083D2D] px-4 py-1 flex justify-between items-center text-[10px] font-mono text-emerald-300 select-none z-50">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 font-bold uppercase tracking-wider">
            NATIONAL FORENSICS // FRE 902(13)/(14) SELF-AUTHENTICATING // CUI
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-emerald-400/90 font-medium">
          <span>ROLE: <strong className="text-white">{currentUser.role}</strong></span>
          <span>ISO/IEC 27037 FORENSIC CHAIN OF CUSTODY</span>
          <span className="text-emerald-300 font-bold">RSA-4096 / SHA-256 SIGNED</span>
        </div>
      </div>

      {/* Top Navigation Bar */}
      {!isFullScreenPage && (
        <Navbar
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          currentUser={currentUser}
          users={users}
          notifications={notifications}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLockSession={handleLockSession}
          onSignOut={handleSignOut}
        />
      )}

      {/* Session Lock Modal */}
      {isLocked && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#0A3D24]/20 rounded-3xl max-w-md w-full p-8 space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#F0FDF4] border border-[#15803D]/30 rounded-2xl flex items-center justify-center text-[#0A3D24] mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#112217] font-serif-title">Forensic Terminal Locked</h3>
              <p className="text-xs text-[#54665C] mt-1 leading-relaxed">
                Re-enter your account credentials to resume the active forensic session for <strong className="text-[#112217]">{currentUser.name}</strong> ({currentUser.role}).
              </p>
            </div>

            {unlockError && (
              <p className="text-xs text-[#B91C1C] font-mono bg-[#FEF2F2] p-2.5 rounded-xl border border-[#B91C1C]/30 text-left">
                {unlockError}
              </p>
            )}

            <form onSubmit={handleUnlockSession} className="space-y-4">
              <div className="text-left space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#54665C]">Account Password</label>
                <input
                  type="password"
                  required
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-2xl px-4 py-3 text-sm text-[#112217] focus:outline-hidden focus:border-[#0A3D24]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-[#E1EBE4] text-[#54665C] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="flex-1 py-2.5 bg-[#0A3D24] hover:bg-[#062817] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isUnlocking ? 'Verifying...' : 'Unlock Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent National Forest Green Sidebar */}
        {!isFullScreenPage && (
          <Sidebar
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            isOpen={isSidebarOpen}
            currentUser={currentUser}
          />
        )}

        {/* Main Content Router View */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#F4F8F6]">
          {/* Unauthenticated View -> Force SignIn or Landing / Public Verify */}
          {!isAuthenticated && currentScreen !== 'landing' && currentScreen !== 'workflow' && currentScreen !== 'request-access' && currentScreen !== 'public-verify' ? (
            <SignInScreen
              setCurrentScreen={setCurrentScreen}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : !isFullScreenPage && !isTargetScreenAllowed ? (
            /* RBAC Access Denied Route Guard */
            <AccessDeniedView
              screenId={currentScreen}
              currentUserRole={currentUser.role}
              setCurrentScreen={setCurrentScreen}
            />
          ) : (
            <>
              {currentScreen === 'landing' && (
                <LandingScreen setCurrentScreen={setCurrentScreen} />
              )}

              {currentScreen === 'workflow' && (
                <WorkflowScreen setCurrentScreen={setCurrentScreen} />
              )}

              {currentScreen === 'signin' && (
                <SignInScreen
                  setCurrentScreen={setCurrentScreen}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}

              {currentScreen === 'request-access' && (
                <RequestAccessScreen
                  setCurrentScreen={setCurrentScreen}
                  onRegisterExpert={handleRegisterExpert}
                  setSelectedExpertId={setSelectedExpertId}
                  onRegisteredUser={handleRegisteredUser}
                />
              )}

              {currentScreen === 'dashboard' && (
                <DashboardScreen
                  setCurrentScreen={setCurrentScreen}
                  setSelectedCaseId={setSelectedCaseId}
                  cases={cases}
                  currentUser={currentUser}
                  onOpenNewCaseModal={() => {
                    setCurrentScreen('cases');
                    setIsNewCaseModalOpen(true);
                  }}
                />
              )}

              {currentScreen === 'cases' && (
                <CaseManagementScreen
                  setCurrentScreen={setCurrentScreen}
                  setSelectedCaseId={setSelectedCaseId}
                  cases={cases}
                  setCases={setCases}
                  isNewCaseModalOpen={isNewCaseModalOpen}
                  setIsNewCaseModalOpen={setIsNewCaseModalOpen}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'evidence' && (
                <EvidenceManagementScreen
                  setCurrentScreen={setCurrentScreen}
                  activeEvidence={activeEvidence}
                  setActiveEvidence={setActiveEvidence}
                  currentUser={currentUser}
                  selectedCaseId={selectedCaseId}
                  cases={cases}
                />
              )}

              {currentScreen === 'chain-of-custody' && (
                <ChainOfCustodyScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'hash-integrity' && (
                <HashIntegrityScreen
                  setCurrentScreen={setCurrentScreen}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'pipeline' && (
                <AiPipelineScreen
                  setCurrentScreen={setCurrentScreen}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'detection-results' && (
                <DetectionResultsScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'speaker-verification' && (
                <SpeakerVerificationScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                  cases={cases}
                />
              )}

              {currentScreen === 'voice-disguise' && (
                <VoiceDisguiseScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                  cases={cases}
                />
              )}

              {currentScreen === 'model-comparison' && (
                <ModelComparisonScreen
                  setCurrentScreen={setCurrentScreen}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'xai' && (
                <ExplainableAiScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'expert-validation' && (
                <ExpertValidationScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  currentUser={currentUser}
                  expertReviews={expertReviews}
                  setExpertReviews={setExpertReviews}
                  onRegisterExpert={handleRegisterExpert}
                  initialSelectedExpertId={selectedExpertId}
                />
              )}

              {currentScreen === 'legal-review' && (
                <LegalReviewScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'report-generation' && (
                <ReportGenerationScreen
                  setCurrentScreen={setCurrentScreen}
                  selectedCaseId={selectedCaseId}
                  activeEvidence={activeEvidence}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'public-verify' && (
                <PublicVerificationScreen
                  setCurrentScreen={setCurrentScreen}
                />
              )}

              {currentScreen === 'audit-log' && (
                <AuditLogScreen
                  setCurrentScreen={setCurrentScreen}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'notifications' && (
                <NotificationCentreScreen
                  setCurrentScreen={setCurrentScreen}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  setSelectedCaseId={setSelectedCaseId}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'admin-panel' && (
                <AdminPanelScreen
                  setCurrentScreen={setCurrentScreen}
                  currentUser={currentUser}
                  users={users}
                  setUsers={setUsers}
                />
              )}

              {currentScreen === 'settings' && (
                <SettingsScreen
                  setCurrentScreen={setCurrentScreen}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
