import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import { ScreenId, UserRole } from '../../types';
import { ROLE_CONFIGS, getDenialReason } from '../../utils/rbac';

interface AccessDeniedViewProps {
  screenId: ScreenId;
  currentUserRole: UserRole;
  setCurrentScreen: (screen: ScreenId) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  screenId,
  currentUserRole,
  setCurrentScreen
}) => {
  const roleConfig = ROLE_CONFIGS[currentUserRole];
  const denialReason = getDenialReason(currentUserRole, screenId);

  return (
    <div className="min-h-[calc(100vh-8rem)] p-6 flex items-center justify-center bg-[#F6F9F7]">
      <div className="max-w-xl w-full bg-white border border-emerald-900/15 rounded-3xl p-8 shadow-xl space-y-6 text-center">
        {/* National Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8 text-emerald-700" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800">
            <Lock className="w-3.5 h-3.5" />
            <span>ROLE-BASED ACCESS CONTROL (RBAC) ENFORCED</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted by Policy</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {denialReason}
          </p>
        </div>

        {/* Current Role Details */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-800">Your Current Clearance:</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
              {currentUserRole}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {roleConfig.description}
          </p>

          <div className="pt-2 border-t border-emerald-200/60">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">Your Authorized Capabilities:</span>
            <ul className="text-xs text-slate-600 space-y-1">
              {roleConfig.permissionsSummary.slice(0, 3).map((perm, idx) => (
                <li key={idx} className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-full sm:flex-1 py-2.5 px-4 bg-[#0A3D24] hover:bg-[#062817] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentScreen('request-access')}
            className="w-full sm:flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#E1EBE4] text-[#112217] font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#C88A2C]" />
            <span>Request Role Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
