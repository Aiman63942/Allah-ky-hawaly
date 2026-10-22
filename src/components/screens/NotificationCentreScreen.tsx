import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, FileText, Info, Check } from 'lucide-react';
import { ScreenId, NotificationItem, User } from '../../types';
import { BackButton } from '../common/BackButton';

interface NotificationCentreScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  setSelectedCaseId: (id: string) => void;
  currentUser: User;
}

export const NotificationCentreScreen: React.FC<NotificationCentreScreenProps> = ({
  setCurrentScreen,
  notifications,
  setNotifications,
  setSelectedCaseId,
  currentUser
}) => {
  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNotifClick = (n: NotificationItem) => {
    markSingleRead(n.id);
    if (n.caseId) {
      setSelectedCaseId(n.caseId);
      setCurrentScreen('detection-results');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div id="notification-centre-screen" className="p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('dashboard')} label="Back to Dashboard" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <Bell className="w-6 h-6 text-emerald-700" />
              <span>Security Notification Centre</span>
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time security alerts, analysis completions, expert sign-offs, and case updates
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotifClick(n)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between space-x-4 shadow-xs ${
              !n.read
                ? 'bg-white border-l-4 border-l-emerald-600 border-emerald-900/10'
                : 'bg-white/80 border-slate-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                  n.severity === 'critical'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : n.severity === 'success'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : n.severity === 'warning'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-sky-100 text-sky-700 border border-sky-200'
                }`}
              >
                {n.severity === 'critical' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : n.severity === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                  {n.caseId && (
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {n.caseId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 font-mono block pt-1">{n.timestamp}</span>
              </div>
            </div>

            <div className="shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800">
                View →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
