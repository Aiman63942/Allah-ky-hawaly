import React from 'react';
import {
  Home,
  Layers,
  LayoutDashboard,
  FolderKanban,
  Music,
  Link as LinkIcon,
  Hash,
  Cpu,
  Target,
  BarChart3,
  Sparkles,
  UserCheck,
  Scale,
  FileCheck2,
  FileSpreadsheet,
  Bell,
  ShieldAlert,
  Settings,
  ChevronRight,
  Lock,
  ShieldCheck,
  Users,
  Activity
} from 'lucide-react';
import { ScreenId, User } from '../../types';
import { isScreenAllowed, ROLE_CONFIGS } from '../../utils/rbac';

interface SidebarProps {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  isOpen: boolean;
  currentUser: User;
  unreadNotificationsCount?: number;
}

interface NavGroup {
  groupName: string;
  items: {
    id: ScreenId;
    label: string;
    icon: React.ElementType;
    dynamicBadge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  setCurrentScreen,
  isOpen,
  currentUser,
  unreadNotificationsCount = 0
}) => {
  const roleConfig = ROLE_CONFIGS[currentUser.role] || ROLE_CONFIGS['Lead Forensic Analyst'];

  const navGroups: NavGroup[] = [
    {
      groupName: 'OVERVIEW & PUBLIC',
      items: [
        { id: 'landing', label: 'Home Page (Landing)', icon: Home },
        { id: 'workflow', label: 'Features & Workflow', icon: Layers }
      ]
    },
    {
      groupName: 'INVESTIGATION & EVIDENCE',
      items: [
        { id: 'dashboard', label: 'Investigation Dashboard', icon: LayoutDashboard },
        { id: 'cases', label: 'Case Management', icon: FolderKanban },
        { id: 'evidence', label: 'Evidence Management', icon: Music },
        { id: 'chain-of-custody', label: 'Chain of Custody', icon: LinkIcon },
        { id: 'hash-integrity', label: 'Hash Integrity', icon: Hash }
      ]
    },
    {
      groupName: 'VOICE & AI VERIFICATION',
      items: [
        { id: 'pipeline', label: 'AI Analysis Pipeline', icon: Cpu },
        { id: 'detection-results', label: 'Detection Results', icon: Target },
        { id: 'speaker-verification', label: 'Speaker Voice Matching', icon: Users },
        { id: 'voice-disguise', label: 'Voice Condition & Disguise', icon: Activity },
        { id: 'model-comparison', label: 'Model Comparison', icon: BarChart3 },
        { id: 'xai', label: 'Explainable AI (XAI)', icon: Sparkles }
      ]
    },
    {
      groupName: 'EXPERT & LEGAL REVIEW',
      items: [
        { id: 'expert-validation', label: 'Expert Validation', icon: UserCheck },
        { id: 'legal-review', label: 'Legal Review', icon: Scale },
        { id: 'report-generation', label: 'Forensic Report', icon: FileCheck2 }
      ]
    },
    {
      groupName: 'ADMINISTRATION & AUDIT',
      items: [
        { id: 'audit-log', label: 'Audit Log', icon: FileSpreadsheet },
        {
          id: 'notifications',
          label: 'Notification Centre',
          icon: Bell,
          dynamicBadge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined
        },
        { id: 'admin-panel', label: 'Administration Panel', icon: ShieldAlert },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-[#062817] border-r border-[#0A3D24] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 select-none transition-all duration-300 z-30 shadow-xl text-slate-100"
    >
      <div className="py-4 px-3 space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-[#C88A2C] uppercase tracking-widest flex items-center justify-between">
              <span>{group.groupName}</span>
            </h3>
            <div className="space-y-0.5 mt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                const isAllowed = isScreenAllowed(currentUser.role, item.id);

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0A3D24] text-white font-bold shadow-md border-l-2 border-[#C88A2C] ring-1 ring-[#135A37]'
                        : isAllowed
                        ? 'text-slate-200/90 hover:text-white hover:bg-[#135A37]/40'
                        : 'text-slate-400/50 hover:text-slate-300 hover:bg-[#135A37]/20 opacity-70'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C88A2C]' : isAllowed ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!isAllowed && (
                        <Lock className="w-3 h-3 text-slate-400/70" title="Restricted by Role Clearance" />
                      )}
                      {item.dynamicBadge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#C88A2C] text-[#062817]">
                          {item.dynamicBadge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile Card with Role Clearance */}
      <div className="p-3 border-t border-[#0A3D24] bg-[#062817] space-y-2">
        <div
          onClick={() => setCurrentScreen('settings')}
          className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-[#135A37]/40 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#0A3D24] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#135A37] shadow-sm">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-200/80 truncate">{currentUser.agency || 'Forensic Enclave'}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400/60" />
        </div>

        {/* Role Pill */}
        <div className="px-2.5 py-1.5 bg-[#0A3D24]/80 border border-[#135A37] rounded-xl flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C88A2C] shrink-0" />
            <span className="font-semibold text-emerald-100 truncate">{roleConfig.shortLabel}</span>
          </div>
          <span className="text-[9px] font-mono text-[#C88A2C] font-bold bg-[#062817] px-1.5 py-0.5 rounded border border-[#C88A2C]/30 shrink-0">
            FIPS-140-3
          </span>
        </div>
      </div>
    </aside>
  );
};
