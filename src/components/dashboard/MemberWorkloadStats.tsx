import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Filter,
  Flame,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { User, Task } from '../../types';

export const MemberWorkloadStats: React.FC = () => {
  const { users, tasks, startDirectMessage, setActiveTab, setSelectedTaskGroup } = useWorkspace();
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Extract unique departments from users
  const departments = ['all', ...Array.from(new Set(users.map(u => u.department)))];

  // Helper to calculate workload & pressure index
  const getMemberWorkload = (userId: string) => {
    const memberTasks = tasks.filter(t => t.assigneeId === userId);
    const activeTasks = memberTasks.filter(t => t.status !== 'done');
    const completedTasks = memberTasks.filter(t => t.status === 'done');

    const nowStr = new Date().toISOString().split('T')[0];
    const urgentOrOverdueTasks = activeTasks.filter(t => {
      const isUrgent = t.priority === 'urgent' || t.priority === 'high';
      const isOverdue = t.deadline && t.deadline <= nowStr;
      return isUrgent || isOverdue;
    });

    const activeCount = activeTasks.length;
    const urgentCount = urgentOrOverdueTasks.length;

    // Mood / Pressure calculation rules
    // 😰 Under Pressure: 5+ active tasks OR 2+ urgent/overdue
    // 😐 Stabil: 3-4 active tasks OR 1 urgent
    // 😄 Optimal: 0-2 active tasks with no urgent
    let status: 'optimal' | 'moderate' | 'pressure';
    let emoji: string;
    let label: string;
    let colorClass: string;
    let bgBarClass: string;

    if (activeCount >= 5 || urgentCount >= 2) {
      status = 'pressure';
      emoji = '😰';
      label = 'Under Pressure';
      colorClass = 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300';
      bgBarClass = 'bg-rose-500';
    } else if (activeCount >= 3 || urgentCount === 1) {
      status = 'moderate';
      emoji = '😐';
      label = 'Stabil';
      colorClass = 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-300';
      bgBarClass = 'bg-sky-500';
    } else {
      status = 'optimal';
      emoji = '😄';
      label = 'Optimal';
      colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300';
      bgBarClass = 'bg-emerald-500';
    }

    // Capacity percentage capped at 100%
    const capacityPct = Math.min(Math.round((activeCount / 6) * 100), 100);

    return {
      activeTasks,
      completedTasks,
      urgentOrOverdueTasks,
      activeCount,
      completedCount: completedTasks.length,
      urgentCount,
      status,
      emoji,
      label,
      colorClass,
      bgBarClass,
      capacityPct
    };
  };

  const filteredUsers = users.filter(u => {
    if (selectedDeptFilter === 'all') return true;
    return u.department === selectedDeptFilter;
  });

  // Calculate global breakdown for header stats
  const allWorkloads = users.map(u => getMemberWorkload(u.id));
  const optimalCount = allWorkloads.filter(w => w.status === 'optimal').length;
  const moderateCount = allWorkloads.filter(w => w.status === 'moderate').length;
  const pressureCount = allWorkloads.filter(w => w.status === 'pressure').length;

  return (
    <div className="bento-card p-6 space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Kapasitas & Beban Kerja Personel</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring distribusi tugas aktif dan indikator tekanan kerja tim secara proporsional.
          </p>
        </div>

        {/* Global Mood / Pressure Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <span>😄</span>
            <span>{optimalCount} Optimal</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-[11px] font-bold text-sky-800 dark:text-sky-300">
            <span>😐</span>
            <span>{moderateCount} Stabil</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] font-bold text-rose-800 dark:text-rose-300">
            <span>😰</span>
            <span>{pressureCount} Under Pressure</span>
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" />
          <span>Divisi:</span>
        </span>
        {departments.map(dept => {
          const isSelected = selectedDeptFilter === dept;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDeptFilter(dept)}
              className={`rounded-xl px-3 py-1.5 whitespace-nowrap transition cursor-pointer text-xs ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {dept === 'all' ? 'Semua Divisi' : dept}
            </button>
          );
        })}
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(member => {
          const workload = getMemberWorkload(member.id);

          return (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Member Profile & Emoji Pressure Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-800 ${
                          member.status === 'online'
                            ? 'bg-emerald-500'
                            : member.status === 'busy'
                            ? 'bg-red-500'
                            : member.status === 'in_meeting'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {member.position}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {member.department}
                      </p>
                    </div>
                  </div>

                  {/* Indicator Emoji Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold shrink-0 ${workload.colorClass}`}
                    title={`Indikator Beban Kerja: ${workload.label}`}
                  >
                    <span className="text-base leading-none">{workload.emoji}</span>
                    <span className="text-[10px]">{workload.label}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 my-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Beban Tugas Aktif</span>
                    <span>{workload.activeCount} tugas ({workload.capacityPct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${workload.bgBarClass}`}
                      style={{ width: `${workload.capacityPct}%` }}
                    />
                  </div>
                </div>

                {/* Active Tasks Chips Preview */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tugas Sedang Berjalan:
                  </div>
                  {workload.activeTasks.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic py-1">
                      Tidak ada tugas aktif saat ini.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {workload.activeTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-[11px]"
                        >
                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                            {task.title}
                          </span>
                          {task.priority === 'urgent' && (
                            <span className="rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 text-[9px] font-bold shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>
                      ))}
                      {workload.activeTasks.length > 3 && (
                        <div className="text-[10px] text-slate-400 text-center pt-0.5">
                          +{workload.activeTasks.length - 3} tugas lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => startDirectMessage(member.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Kirim Pesan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaskGroup('all');
                    setActiveTab('tasks');
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition cursor-pointer"
                >
                  <span>Lihat di Kanban</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
