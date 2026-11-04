import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  MessageSquare,
  CheckSquare,
  Calendar,
  Megaphone,
  ExternalLink,
  Trash2,
  Settings,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NotificationType, NotificationItem } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    isRightNotificationOpen,
    setIsRightNotificationOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadNotificationsCount,
    setActiveTab,
    setActiveChannelId
  } = useWorkspace();

  const [filterType, setFilterType] = useState<string>('all');

  // Mark all as read when drawer is opened so badge clears immediately
  useEffect(() => {
    if (isRightNotificationOpen) {
      markAllAsRead();
    }
  }, [isRightNotificationOpen]);

  if (!isRightNotificationOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
    if (item.type === 'chat') {
      setActiveTab('chat');
    }
    // Optionally close drawer on mobile
    if (window.innerWidth < 768) {
      setIsRightNotificationOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity md:hidden"
        onClick={() => setIsRightNotificationOpen(false)}
      />

      {/* Persistent / Slide-over Right Panel */}
      <aside
        aria-label="Pusat Notifikasi"
        className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-sm sm:max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Drawer Header (Navy themed with red accents) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-800">
              <Bell className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifikasi
                </h3>
                {unreadNotificationsCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationsCount} Baru
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Pemberitahuan real-time workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline text-[11px]">Baca Semua</span>
              </button>
            )}

            <button
              onClick={() => setIsRightNotificationOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Tutup panel notifikasi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="border-b border-slate-100 p-3 pb-2 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto tab-slider-scroll pt-0.5 pb-2.5 px-0.5 text-xs">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'unread', label: 'Belum Dibaca' },
              { id: 'task', label: 'Task' },
              { id: 'chat', label: 'Pesan' },
              { id: 'meeting', label: 'Rapat' },
              { id: 'announcement', label: 'Pengumuman' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-xl px-3 py-1.5 font-semibold whitespace-nowrap text-xs transition ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                <Bell className="h-6 w-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tidak ada notifikasi
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua pembaruan task, rapat, dan pesan telah terbaca.
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group relative flex gap-3 rounded-2xl p-3.5 transition cursor-pointer border ${
                  !n.read
                    ? 'border-red-200/80 bg-red-50/40 hover:bg-red-50/80 dark:border-red-950/70 dark:bg-red-950/20 dark:hover:bg-red-950/40'
                    : 'border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Type Icon Badge */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs dark:bg-slate-800 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 mt-1 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(n.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                      Lihat detail <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear All */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              Total {notifications.length} notifikasi
            </span>
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bersihkan Semua</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
