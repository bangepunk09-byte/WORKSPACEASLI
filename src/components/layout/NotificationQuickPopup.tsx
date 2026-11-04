import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  KeyRound,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PendingUserApproval, NotificationItem } from '../../types';

interface NotificationQuickPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationQuickPopup: React.FC<NotificationQuickPopupProps> = ({
  isOpen,
  onClose
}) => {
  const {
    pendingApprovals,
    approveUserRegistration,
    rejectUserRegistration,
    notifications,
    markAsRead,
    setActiveTab,
    playTestSound
  } = useWorkspace();

  const [isHovered, setIsHovered] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(8000);
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  const TOTAL_DURATION_MS = 8000;

  // Find the first pending user approval request, or most recent unread notification
  const pendingReq = pendingApprovals.find(p => p.status === 'pending');
  const recentUnreadNotif = notifications.find(n => !n.read);

  const popupRef = useRef<HTMLDivElement>(null);

  // Reset countdown whenever popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeftMs(TOTAL_DURATION_MS);
      setActionDoneMsg(null);
    }
  }, [isOpen, pendingReq?.id, recentUnreadNotif?.id]);

  // Auto-dismiss countdown timer with hover pause
  useEffect(() => {
    if (!isOpen || actionDoneMsg) return;

    if (isHovered) {
      return; // Pause timer when hovered
    }

    const interval = 100;
    const timer = setInterval(() => {
      setTimeLeftMs(prev => {
        if (prev <= interval) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isHovered, actionDoneMsg, onClose]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Don't render if neither pending request nor unread notification exists
  if (!pendingReq && !recentUnreadNotif && !actionDoneMsg) {
    return null;
  }

  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / TOTAL_DURATION_MS) * 100));

  const handleAcceptApproval = (req: PendingUserApproval) => {
    playTestSound('notification');
    approveUserRegistration(req.id);
    setActionDoneMsg(`✓ Akses disetujui! Akun ${req.name} telah aktif.`);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  const handleRejectApproval = (req: PendingUserApproval) => {
    rejectUserRegistration(req.id);
    setActionDoneMsg(`Permintaan akses dari ${req.name} telah ditolak.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleOpenNotif = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
    onClose();
  };

  return (
    <div
      ref={popupRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute right-0 top-full mt-2.5 w-84 sm:w-96 z-50 rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-4.5 shadow-2xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in slide-in-from-top-3 zoom-in-95"
      style={{
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* Top Countdown Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-t-3xl">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 pt-0.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {pendingReq ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800/60">
              <KeyRound className="h-3.5 w-3.5 animate-pulse" />
              <span>Permintaan Akses Baru</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              <Bell className="h-3.5 w-3.5" />
              <span>Notifikasi Cepat</span>
            </span>
          )}

          {isHovered && (
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
              Dijeda
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!actionDoneMsg && (
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {secondsLeft}s
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feedback State */}
      {actionDoneMsg ? (
        <div className="py-5 text-center space-y-2 animate-in fade-in">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{actionDoneMsg}</p>
        </div>
      ) : pendingReq ? (
        /* Access Request Content & Quick Actions */
        <div className="py-3 space-y-3.5">
          <div className="flex items-start gap-3">
            <img
              src={pendingReq.avatar}
              alt={pendingReq.name}
              className="h-11 w-11 rounded-2xl object-cover ring-2 ring-red-200 dark:ring-red-900/60 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {pendingReq.name}
                </h4>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  External
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {pendingReq.position}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {pendingReq.department} • {pendingReq.email}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Menunggu persetujuan Super Admin untuk akses akun dan kanal komunikasi tim.
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleRejectApproval(pendingReq)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Tolak Akses</span>
            </button>

            <button
              type="button"
              onClick={() => handleAcceptApproval(pendingReq)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Terima Akses</span>
            </button>
          </div>
        </div>
      ) : recentUnreadNotif ? (
        /* Regular Unread Notification Quick View */
        <div className="py-3 space-y-3">
          <div className="flex items-start gap-3">
            {recentUnreadNotif.senderAvatar ? (
              <img
                src={recentUnreadNotif.senderAvatar}
                alt={recentUnreadNotif.senderName || 'Notifikasi'}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
                <Bell className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {recentUnreadNotif.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                {recentUnreadNotif.message}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                markAsRead(recentUnreadNotif.id);
                onClose();
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 transition cursor-pointer"
            >
              Tandai Dibaca
            </button>

            <button
              type="button"
              onClick={() => handleOpenNotif(recentUnreadNotif)}
              className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Buka Detail</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Auto-Dismiss Hint Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>Arahkan kursor untuk menjeda waktu</span>
        <span>Esc untuk tutup</span>
      </div>
    </div>
  );
};
