import React from 'react';
import { Smartphone, Download, Share2, PlusSquare, Check, X, Sparkles, Laptop } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'badge' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = ''
}) => {
  const {
    isInstalled,
    isIOS,
    showIOSModal,
    setShowIOSModal,
    promptInstall
  } = usePWAInstall();

  // If already running in standalone PWA mode, show installed badge
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}>
        <Check className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Aplikasi Terpasang</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={() => promptInstall()}
          className={`relative flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition cursor-pointer ${className}`}
          title="Instal Aplikasi di iPhone / Android"
        >
          <Smartphone className="h-4.5 w-4.5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => promptInstall()}
          className={`flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:from-indigo-100 hover:to-purple-100 dark:border-indigo-800 dark:from-indigo-950/60 dark:to-purple-950/40 dark:text-indigo-300 shadow-2xs transition cursor-pointer ${className}`}
          title="Instal Aplikasi ASLI GROUP di Smartphone"
        >
          <Smartphone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Instal App Mobile</span>
        </button>
      )}

      {/* Guide Modal for iOS Safari / Add to Home Screen */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Instal di iPhone & Android
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akses ASLI GROUP Hub seperti aplikasi native
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Platform Instructions */}
            {isIOS ? (
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm pb-1 border-b border-slate-200 dark:border-slate-700">
                  <span>📱 Panduan Khusus iPhone (Safari):</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    1
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    Buka halaman ini di browser <strong>Safari</strong> iPhone Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    2
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    Ketuk tombol <strong>Share / Bagikan</strong>{' '}
                    <span className="inline-flex items-center rounded-md bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-700">
                      <Share2 className="h-3 w-3 inline mr-1" /> Bagikan
                    </span>{' '}
                    di bar bawah Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    3
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    Gulir ke bawah dan pilih{' '}
                    <strong>Tambahkan ke Layar Utama</strong> (
                    <em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    4
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    Ketuk <strong>Tambah</strong> di pojok kanan atas. Ikon ASLI GROUP akan muncul di layar utama iPhone!
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm pb-1 border-b border-slate-200 dark:border-slate-700">
                  <span>🤖 Panduan Android & Chrome:</span>
                </div>

                <p className="text-slate-600 dark:text-slate-300">
                  Aplikasi ini mendukung Progressive Web App (PWA) berkecepatan tinggi:
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                    <span>
                      Di browser Chrome / Edge, ketuk ikon menu <strong>titik tiga (⋮)</strong> di kanan atas.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                    <span>
                      Pilih <strong>&ldquo;Instal Aplikasi&rdquo;</strong> atau <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                    <span>
                      Aplikasi akan terpasang otomatis dan dapat dibuka fullscreen tanpa address bar.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-indigo-50/60 p-2.5 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300">
                <span className="font-bold block">⚡ Super Cepat & Offline</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">IndexedDB local caching aktif</span>
              </div>
              <div className="rounded-xl bg-emerald-50/60 p-2.5 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">🔔 Notif & Sound Chime</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">Audio Web API terintegrasi</span>
              </div>
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full rounded-2xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                Mengerti & Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
