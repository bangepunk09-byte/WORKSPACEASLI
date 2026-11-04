import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export const PerformanceStatsWidget: React.FC = () => {
  const { tasks, currentUser } = useWorkspace();

  const stats = useMemo(() => {
    const userTasks = tasks.filter(t => t.assigneeId === currentUser.id);
    const done = userTasks.filter(t => t.status === 'done').length;
    const total = userTasks.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, rate };
  }, [tasks, currentUser.id]);

  return (
    <div className="bento-card p-6 h-full flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Performa Pribadi</h4>
        <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
                <div className="text-2xl font-black text-emerald-600">{stats.rate}%</div>
                <div className="text-[10px] text-slate-500">Tingkat Penyelesaian</div>
            </div>
            <div className="text-right">
                <div className="text-base font-bold text-slate-900 dark:text-white">{stats.done} / {stats.total}</div>
                <div className="text-[10px] text-slate-500">Tugas Selesai</div>
            </div>
        </div>
    </div>
  );
};
