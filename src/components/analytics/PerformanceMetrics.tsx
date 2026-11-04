import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, BarChart3 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const PerformanceMetrics: React.FC = () => {
  const { tasks, meetings } = useWorkspace();

  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'];
    const totalDone = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const taskPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
    const meetingCount = meetings.length;
    const attendancePct = meetingCount > 0 ? 100 : 0;

    return months.map(name => ({
      name,
      taskCompletion: taskPct,
      attendance: attendancePct
    }));
  }, [tasks, meetings]);

  const exportCSV = () => {
    const header = ['Bulan', 'Tingkat Penyelesaian Tugas (%)', 'Tingkat Kehadiran Meeting (%)'];
    const csvContent = [
      header.join(','),
      ...data.map(d => `${d.name},${d.taskCompletion},${d.attendance}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Laporan_Kinerja_Bulanan.csv';
    a.click();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Analitik Kinerja Operasional</span>
        </h3>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Ekspor Laporan CSV</span>
        </button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taskCompletion" name="Penyelesaian Tugas (%)" fill="#2563eb" />
            <Bar dataKey="attendance" name="Kehadiran Meeting (%)" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
