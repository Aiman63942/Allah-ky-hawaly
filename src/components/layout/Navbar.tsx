import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Shield,
  Menu,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  FileText,
  LogOut,
  Lock,
  Clock,
  KeyRound,
  ExternalLink,
  Cpu,
  Sparkles,
  UserCheck,
  Scale,
  FolderKanban,
  FileCheck2,
  Hash,
  Music,
  Command
} from 'lucide-react';
import { ScreenId, UserRole, User, NotificationItem } from '../../types';
import { ROLE_CONFIGS } from '../../utils/rbac';

interface NavbarProps {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  users: User[];
  notifications: NotificationItem[];
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onLockSession?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setCurrentScreen,
  currentUser,
  setCurrentUserRole,
  users,
  notifications,
  toggleSidebar,
  searchQuery,
  setSearchQuery,
  onLockSession,
  onSignOut
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(899); // 14m 59s
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentRoleConfig = ROLE_CONFIGS[currentUser.role] || ROLE_CONFIGS['Lead Forensic Analyst'];

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Session timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Navigable screen options for quick command palette
  const searchableScreens = [
    { id: 'dashboard' as ScreenId, name: 'Investigation Dashboard', icon: FolderKanban, category: 'Core' },
    { id: 'cases' as ScreenId, name: 'Case Management (Docket Registry)', icon: FolderKanban, category: 'Cases' },
    { id: 'evidence' as ScreenId, name: 'Evidence Management & DSP Upload', icon: Music, category: 'Evidence' },
    { id: 'pipeline' as ScreenId, name: 'AI Multi-Model Pipeline', icon: Cpu, category: 'AI Engine' },
    { id: 'detection-results' as ScreenId, name: 'Detection Results & Confidence Scores', icon: Cpu, category: 'Analysis' },
    { id: 'xai' as ScreenId, name: 'Explainable AI (Grad-CAM & SHAP)', icon: Sparkles, category: 'Forensics' },
    { id: 'expert-validation' as ScreenId, name: 'Expert Validation & Biometrics', icon: UserCheck, category: 'Legal' },
    { id: 'legal-review' as ScreenId, name: 'Legal Review & Daubert Checklist', icon: Scale, category: 'Legal' },
    { id: 'report-generation' as ScreenId, name: 'Court-Ready Forensic PDF Reports', icon: FileCheck2, category: 'Reporting' },
    { id: 'hash-integrity' as ScreenId, name: 'SHA-256 Hash Integrity & Verification', icon: Hash, category: 'Security' }
  ];

  const filteredScreens = searchQuery.trim()
    ? searchableScreens.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchableScreens.slice(0, 5);

  const matchedDockets = ['DS-2024-4471', 'DS-2024-8812', 'DS-2024-9104', 'DS-2024-3329'].filter((d) =>
    !searchQuery.trim() || d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header id="main-navbar" className="h-16 bg-white border-b border-emerald-900/15 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center space-x-3">
        <button
          id="sidebar-toggle-btn"
          onClick={toggleSidebar}
          className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo & tagline */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={() => setCurrentScreen('dashboard')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-500 p-0.5 flex items-center justify-center shadow-md shadow-emerald-900/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">Deepfake Audio Detector</span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded">
                FORENSIC LAB
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Explainable Voice Clone Detection · Judicial Admissibility Enclave
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Global search with instant command palette */}
      <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
        <Search className="w-4 h-4 text-emerald-800/60 absolute left-3 pointer-events-none" />
        <input
          ref={searchInputRef}
          id="global-search-input"
          type="text"
          value={searchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dockets, evidence, or jump to screen... (⌘K)"
          className="w-full bg-[#F4F8F6] border border-emerald-900/15 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-2xs"
        />
        <div className="absolute right-2.5 flex items-center space-x-1">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="text-xs text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Live Search & Quick Jump Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-emerald-900/15 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {/* Quick Screen Destinations */}
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block font-mono">
                Quick Navigation Targets
              </span>
              {filteredScreens.length > 0 ? (
                filteredScreens.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentScreen(item.id);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 text-slate-800 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-700 font-medium">
                        Jump →
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 px-2 py-1 italic">No matching screen targets</p>
              )}
            </div>

            {/* Matched Case Dockets */}
            <div className="p-2 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block font-mono">
                Active Case Dockets
              </span>
              {matchedDockets.slice(0, 3).map((docket) => (
                <button
                  key={docket}
                  onClick={() => {
                    setCurrentScreen('cases');
                    setIsSearchFocused(false);
                    setSearchQuery(docket);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 text-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold text-emerald-950">{docket}</span>
                    <span className="text-[10px] text-slate-500">· Wiretap Forensics</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                    Open Case
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right section: Session Lock Timer, Notifications, Role Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Security Session Timer & Lock Button */}
        <div className="hidden lg:flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl text-xs font-mono shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-emerald-900 font-bold">{formatTimer(sessionSeconds)}</span>
          <button
            onClick={onLockSession}
            className="p-1 hover:bg-emerald-200/60 rounded-md text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer"
            title="Lock Forensic Terminal Instantly"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Online Indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600">Enclave Online</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notifications-dropdown-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl relative transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-emerald-900/15 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
              <div className="p-3.5 border-b border-emerald-900/10 flex items-center justify-between bg-emerald-50/70">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-emerald-950">
                    Security Audit Notifications ({notifications.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCurrentScreen('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setCurrentScreen('notifications');
                      setShowNotifMenu(false);
                    }}
                    className={`p-3.5 hover:bg-emerald-50/50 cursor-pointer transition-colors ${
                      !n.read ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {n.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : n.severity === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {n.description}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher - Zero-trust clearance matrix */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2.5 p-1.5 hover:bg-[#F0FDF4] rounded-xl transition-all border border-[#E1EBE4] bg-white shadow-2xs cursor-pointer"
            title="Operator Security Profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#0A3D24] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="text-left hidden sm:block max-w-[140px]">
              <p className="text-xs font-bold text-[#112217] leading-none truncate">{currentUser.name}</p>
              <span className="text-[10px] text-[#0A3D24] font-semibold truncate block mt-0.5">
                {currentRoleConfig.shortLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#54665C]" />
          </button>

          {/* Secure Operator Profile Panel (Strict RBAC - Locked Session Profile) */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-[#E1EBE4] rounded-2xl shadow-2xl z-50 overflow-hidden text-[#112217]">
              <div className="p-4 border-b border-[#E1EBE4] bg-[#F8FAF9]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider text-[#0A3D24] font-bold">
                    Active Security Identity
                  </p>
                  <span className="text-[9px] px-2 py-0.5 bg-[#FEF3C7] text-[#B2751E] font-bold rounded font-mono border border-[#C88A2C]/30">
                    FRE 902 Verified
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A3D24] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#112217] truncate">{currentUser.name}</p>
                    <p className="text-xs text-[#54665C] truncate font-mono">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs bg-white">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#54665C]">Assigned Role:</span>
                  <span className="font-semibold text-[#0A3D24] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#15803D]/20">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#54665C]">Agency Enclave:</span>
                  <span className="font-medium text-[#112217] truncate max-w-[180px]">
                    {currentUser.agency || 'National Forensics Institute'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#54665C]">Security Clearance:</span>
                  <span className="font-mono text-[11px] font-bold text-[#C88A2C]">
                    {currentUser.securityClearance || 'TS/SCI Forensic Certified'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E1EBE4] text-[11px] text-[#54665C] leading-relaxed">
                  <p className="font-semibold text-[#0A3D24] mb-0.5">Zero-Trust Role Enforcement:</p>
                  Roles are cryptographically tied to your authenticated session. To change permissions, contact an administrator.
                </div>
              </div>

              <div className="p-3 border-t border-[#E1EBE4] bg-[#F8FAF9] flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    if (onLockSession) onLockSession();
                    setShowRoleMenu(false);
                  }}
                  className="text-[#C88A2C] hover:text-[#B2751E] font-semibold flex items-center space-x-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#FEF3C7] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Terminal</span>
                </button>
                <button
                  onClick={() => {
                    if (onSignOut) onSignOut();
                    else setCurrentScreen('signin');
                    setShowRoleMenu(false);
                  }}
                  className="text-[#B91C1C] hover:text-red-800 font-semibold flex items-center space-x-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
