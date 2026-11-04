import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Bell, MessageSquare, PhoneCall, Sparkles, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const SoundControlPopover: React.FC = () => {
  const { isSoundMuted, toggleSound, playTestSound } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center rounded-xl p-2 transition cursor-pointer ${
          isSoundMuted
            ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800'
            : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60'
        }`}
        title={isSoundMuted ? 'Nada Dering Dimatikan (Klik untuk atur)' : 'Nada Dering Aktif (Klik untuk atur)'}
      >
        {isSoundMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isSoundMuted ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                {isSoundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Nada Dering & Audio
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isSoundMuted ? 'Suara dinonaktifkan' : 'Semua audio aktif'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                !isSoundMuted ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  !isSoundMuted ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Sound Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Tes Nada Dering (Web Audio):
            </span>

            <button
              type="button"
              onClick={() => playTestSound('notification')}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-red-500" />
                <span>🔔 Notifikasi Baru</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Putar</span>
            </button>

            <button
              type="button"
              onClick={() => playTestSound('chat')}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                <span>💬 Pesan Chat Masuk</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Putar</span>
            </button>

            <button
              type="button"
              onClick={() => playTestSound('phone')}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
                <span>📞 Panggilan Telepon / Huddle</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Putar</span>
            </button>

            <button
              type="button"
              onClick={() => playTestSound('task')}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>✨ Task Baru / Selesai</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Putar</span>
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 p-2 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            💡 Menggunakan Web Audio API sintetis zero-delay tanpa jeda unduhan file.
          </div>
        </div>
      )}
    </div>
  );
};
