import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Filter,
  MessageSquare,
  CheckSquare,
  Calendar,
  Sparkles,
  Sliders
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NotificationType } from '../../types';

export const NotificationView: React.FC = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    setActiveTab,
    unreadNotificationsCount
  } = useWorkspace();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [prefChat, setPrefChat] = useState(true);
  const [prefTask, setPrefTask] = useState(true);
  const [prefMeeting, setPrefMeeting] = useState(true);
  const [prefAnnouncement, setPrefAnnouncement] = useState(true);

  // Automatically mark all as read upon opening the notification view
  useEffect(() => {
    markAllAsRead();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter !== 'all' && n.type !== activeFilter) return false;
    return true;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-in fade-in duration-200">
      {/* Left 2 Cols: Notifications Stream */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Pusat Notifikasi & Pemberitahuan Real-Time
            </h2>
            <p className="text-xs text-slate-500">
              {unreadNotificationsCount} pemberitahuan baru yang belum dibaca
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Tandai Semua Dibaca
              </button>
            )}
            <button
              onClick={clearNotifications}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
              title="Bersihkan Semua Notifikasi"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto tab-slider-scroll pt-1 pb-3 px-1">
          {['all', 'unread', 'chat', 'task', 'meeting', 'announcement'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-2xl px-3.5 py-2 text-xs font-semibold capitalize whitespace-nowrap transition ${
                activeFilter === f
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum Dibaca' : f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Tidak ada notifikasi dalam kategori ini.
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.targetTab) setActiveTab(n.targetTab);
                }}
                className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 shadow-xs transition hover:shadow-md ${
                  !n.read
                    ? 'border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getIconForType(n.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {n.message}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-slate-400">
                      {n.createdAt}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Col: Notification Preferences */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Sliders className="h-4 w-4 text-red-600" />
            Preferensi Pemberitahuan
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Atur jenis pemberitahuan yang ingin Anda terima secara langsung di aplikasi WORKSPACE.
          </p>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-700 dark:text-slate-300">Pesan Chat & Mentions</span>
              <input
                type="checkbox"
                checked={prefChat}
                onChange={e => setPrefChat(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-700 dark:text-slate-300">Tugas Baru & Deadline</span>
              <input
                type="checkbox"
                checked={prefTask}
                onChange={e => setPrefTask(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-700 dark:text-slate-300">Jadwal & Reminder Rapat</span>
              <input
                type="checkbox"
                checked={prefMeeting}
                onChange={e => setPrefMeeting(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-700 dark:text-slate-300">Pengumuman Resmi BoD</span>
              <input
                type="checkbox"
                checked={prefAnnouncement}
                onChange={e => setPrefAnnouncement(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
