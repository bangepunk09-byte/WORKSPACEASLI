import React, { useState } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Users,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Heart,
  FileText,
  Info
} from 'lucide-react';

export type OverviewWidgetKey =
  | 'showHeroGreeting'
  | 'showMeetingSchedule'
  | 'showPriorityTasks'
  | 'showTeamDiscussion'
  | 'showProductivityTrends'
  | 'showWellnessSection'
  | 'showMemberWorkload'
  | 'showDocumentsSection'
  | 'showWeather'
  | 'showPerformanceStats';

export interface OverviewWidgetConfig {
  showHeroGreeting: boolean;
  showMemberWorkload: boolean;
  showMeetingSchedule: boolean;
  showPriorityTasks: boolean;
  showTeamDiscussion: boolean;
  showProductivityTrends: boolean;
  showWellnessSection: boolean;
  showDocumentsSection: boolean;
  showWeather: boolean;
  showPerformanceStats: boolean;
  widgetOrder: OverviewWidgetKey[];
  // Backwards compatibility
  sectionOrder?: any[];
}

export const DEFAULT_WIDGET_ORDER: OverviewWidgetKey[] = [
  'showHeroGreeting',
  'showWeather',
  'showPerformanceStats',
  'showMeetingSchedule',
  'showPriorityTasks',
  'showTeamDiscussion',
  'showProductivityTrends',
  'showWellnessSection',
  'showMemberWorkload', 
  'showDocumentsSection'
];

export const normalizeWidgetOrder = (order?: any): OverviewWidgetKey[] => {
  const allKeys: OverviewWidgetKey[] = [
    'showHeroGreeting',
    'showMeetingSchedule',
    'showPriorityTasks',
    'showTeamDiscussion',
    'showProductivityTrends',
    'showWellnessSection',
    'showMemberWorkload',
    'showDocumentsSection',
    'showWeather',
    'showPerformanceStats'
  ];

  if (!order || !Array.isArray(order)) return DEFAULT_WIDGET_ORDER;

  // Filter valid keys
  const valid = order.filter((k): k is OverviewWidgetKey => allKeys.includes(k));
  // Append missing
  for (const k of allKeys) {
    if (!valid.includes(k)) {
      valid.push(k);
    }
  }
  return valid;
};

export const DEFAULT_OVERVIEW_CONFIG: OverviewWidgetConfig = {
  showHeroGreeting: true,
  showMeetingSchedule: true,
  showPriorityTasks: true,
  showTeamDiscussion: true,
  showProductivityTrends: true,
  showWellnessSection: true,
  showMemberWorkload: true,
  showDocumentsSection: true,
  showWeather: true,
  showPerformanceStats: true,
  widgetOrder: DEFAULT_WIDGET_ORDER
};

interface WidgetDefinition {
  key: OverviewWidgetKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
  note?: string;
}

export const WIDGET_DEFINITIONS: Record<OverviewWidgetKey, WidgetDefinition> = {
  showHeroGreeting: {
    key: 'showHeroGreeting',
    label: 'Sapaan & Ringkasan Hari Ini',
    desc: 'Banner ucapan, avatar tim, total task bulan ini, dan tombol aksi cepat.',
    icon: <Sparkles className="h-4 w-4 text-amber-500" />
  },
  showMeetingSchedule: {
    key: 'showMeetingSchedule',
    label: 'Jadwal Rapat & Agenda',
    desc: 'Daftar pertemuan mendatang hari ini lengkap dengan tautan Google Meet.',
    icon: <CalendarDays className="h-4 w-4 text-purple-600" />
  },
  showPriorityTasks: {
    key: 'showPriorityTasks',
    label: 'Tugas Prioritas Hari Ini',
    desc: 'Kartu tugas prioritas tinggi beserta checklist dan tenggat waktu.',
    icon: <CheckSquare className="h-4 w-4 text-emerald-600" />
  },
  showTeamDiscussion: {
    key: 'showTeamDiscussion',
    label: 'Diskusi & Aktivitas Tim',
    desc: 'Umpan percakapan terbaru dan reaksi interaktif antar rekan kerja.',
    icon: <MessageSquare className="h-4 w-4 text-indigo-600" />
  },
  showProductivityTrends: {
    key: 'showProductivityTrends',
    label: 'Tren Beban Kerja & Performa',
    desc: 'Grafik output tugas selesai, rasio tepat waktu, dan perbandingan mingguan.',
    icon: <TrendingUp className="h-4 w-4 text-rose-600" />
  },
  showWellnessSection: {
    key: 'showWellnessSection',
    label: 'Inisiatif Kesejahteraan Staf',
    desc: 'Fokus kerja mendalam, hidrasi harian, dan kesehatan mental tim.',
    icon: <Heart className="h-4 w-4 text-pink-600" />
  },
  showMemberWorkload: {
    key: 'showMemberWorkload',
    label: 'Beban Kerja & Kapasitas Personel Tim',
    desc: 'Statistik tugas aktif tiap personel beserta indikator tekanan kerja emoji (😄, 😐, 😰).',
    icon: <Users className="h-4 w-4 text-blue-600" />,
    note: 'Posisi Default: Di bawah Performa & Beban Kerja Tim'
  },
  showDocumentsSection: {
    key: 'showDocumentsSection',
    label: 'Dokumen & SOP Perusahaan',
    desc: 'Akses cepat ke panduan kerja resmi dan repositori berkas penting.',
    icon: <FileText className="h-4 w-4 text-sky-600" />
  },
  showWeather: {
    key: 'showWeather',
    label: 'Cuaca Hari Ini',
    desc: 'Menampilkan kondisi cuaca terkini berdasarkan lokasi perusahaan.',
    icon: <Sparkles className="h-4 w-4 text-sky-500" /> // Use appropriate icon
  },
  showPerformanceStats: {
    key: 'showPerformanceStats',
    label: 'Statistik Performa Pribadi',
    desc: 'Ringkasan performa tugas dan pencapaian Anda.',
    icon: <TrendingUp className="h-4 w-4 text-emerald-500" />
  }
};

interface CustomizeOverviewModalProps {
  currentConfig: OverviewWidgetConfig;
  onSave: (config: OverviewWidgetConfig) => void;
  onClose: () => void;
}

export const CustomizeOverviewModal: React.FC<CustomizeOverviewModalProps> = ({
  currentConfig,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState<OverviewWidgetConfig>(() => ({
    ...DEFAULT_OVERVIEW_CONFIG,
    ...currentConfig,
    widgetOrder: normalizeWidgetOrder(currentConfig.widgetOrder)
  }));

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toggleWidget = (key: OverviewWidgetKey) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAll = () => {
    setConfig(prev => ({
      ...prev,
      showHeroGreeting: true,
      showMeetingSchedule: true,
      showPriorityTasks: true,
      showTeamDiscussion: true,
      showProductivityTrends: true,
      showWellnessSection: true,
      showMemberWorkload: true,
      showDocumentsSection: true
    }));
  };

  const handleResetDefault = () => {
    setConfig({
      ...DEFAULT_OVERVIEW_CONFIG,
      widgetOrder: [...DEFAULT_WIDGET_ORDER]
    });
  };

  const handleApply = () => {
    onSave(config);
    onClose();
  };

  // Drag & Drop event handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image or fallback
    try {
      e.dataTransfer.setData('text/plain', index.toString());
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...config.widgetOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    setConfig(prev => ({
      ...prev,
      widgetOrder: newOrder
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Button move helpers (keyboard/touch accessibility)
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.widgetOrder.length) return;

    const newOrder = [...config.widgetOrder];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, removed);

    setConfig(prev => ({
      ...prev,
      widgetOrder: newOrder
    }));
  };

  const activeCount = config.widgetOrder.filter(key => Boolean(config[key])).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Matching image) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kustomisasi Tampilan Beranda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih modul widget dan atur urutan tampilan dengan drag & drop.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Toolbar (Matching image) */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {activeCount} dari {config.widgetOrder.length} modul aktif
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Aktifkan Semua
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
              title="Reset ke posisi default (Beban Kerja Personel di bawah Performa Tim)"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Standar</span>
            </button>
          </div>
        </div>

        {/* Drag Hint Banner */}
        <div className="px-6 py-2 bg-blue-50/70 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5 text-blue-600" />
            <span>Tahan & geser (drag & drop) ikon untuk menyusun tata letak modul.</span>
          </div>
          <span className="hidden sm:inline font-bold opacity-80">Default: Personel di bawah Tim</span>
        </div>

        {/* Interactive Drag & Drop Reorderable List */}
        <div className="p-6 space-y-2.5 overflow-y-auto flex-1">
          {config.widgetOrder.map((widgetKey, index) => {
            const widget = WIDGET_DEFINITIONS[widgetKey];
            if (!widget) return null;
            const isChecked = Boolean(config[widgetKey]);
            const isBeingDragged = draggedIndex === index;
            const isDragTarget = dragOverIndex === index && draggedIndex !== index;
            const isFirst = index === 0;
            const isLast = index === config.widgetOrder.length - 1;

            return (
              <div
                key={widgetKey}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-150 select-none ${
                  isBeingDragged
                    ? 'opacity-35 scale-[0.98] border-dashed border-blue-500 bg-blue-50/30 dark:bg-blue-950/30'
                    : isDragTarget
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-950/40 -translate-y-0.5'
                    : isChecked
                    ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/60 dark:bg-blue-950/15 hover:border-blue-300'
                    : 'border-slate-200 bg-white opacity-60 hover:opacity-100 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {/* Drag Handle & Quick Reorder */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Tahan & geser untuk memindahkan urutan"
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400">
                    {index + 1}
                  </span>

                  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={e => {
                        e.stopPropagation();
                        moveWidget(index, 'up');
                      }}
                      className={`p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer ${
                        isFirst ? 'invisible' : ''
                      }`}
                      title="Pindahkan ke atas"
                    >
                      <ArrowUp className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={e => {
                        e.stopPropagation();
                        moveWidget(index, 'down');
                      }}
                      className={`p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer ${
                        isLast ? 'invisible' : ''
                      }`}
                      title="Pindahkan ke bawah"
                    >
                      <ArrowDown className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>

                {/* Widget Icon & Text */}
                <div
                  onClick={() => toggleWidget(widgetKey)}
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {widget.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {widget.label}
                      </h4>
                      {widget.note && (
                        <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold">
                          Default: Di bawah Tim
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {widget.desc}
                    </p>
                  </div>
                </div>

                {/* Toggle switch (Matching image) */}
                <div
                  onClick={() => toggleWidget(widgetKey)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={isChecked ? 'Nonaktifkan modul' : 'Aktifkan modul'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900">
          <div className="text-[11px] text-slate-400">
            Urutan disesuaikan secara real-time
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-2 text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Terapkan Tampilan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
