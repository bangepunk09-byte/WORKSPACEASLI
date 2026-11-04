import React from 'react';

export const NewDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard (Redesign)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Tugas Selesai</h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">73</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Lewat Tenggat</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">4</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Ketepatan Waktu</h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">95%</p>
        </div>
      </div>
    </div>
  );
};
