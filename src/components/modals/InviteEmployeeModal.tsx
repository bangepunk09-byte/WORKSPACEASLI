import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Building2,
  Briefcase,
  Shield,
  MapPin,
  Phone,
  Link2,
  Copy,
  Check,
  Sparkles,
  Camera
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole } from '../../types';

interface InviteEmployeeModalProps {
  onClose: () => void;
  defaultDepartment?: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80'
];

export const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({
  onClose,
  defaultDepartment
}) => {
  const { inviteUser, divisions, workspaceInfo } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'form' | 'link'>('form');
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(defaultDepartment || divisions[0]?.departmentMatch || 'Technology & Engineering');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [location, setLocation] = useState('Kantor Pusat - Jakarta (WFO)');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate invite link
  const orgDomain = workspaceInfo.orgDomain || 'company.com';
  const inviteToken = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const inviteUrl = `https://${orgDomain}/onboarding?token=${inviteToken}&dept=${encodeURIComponent(department)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama lengkap personel wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Email perusahaan tidak valid.');
      return;
    }
    if (!position.trim()) {
      setErrorMsg('Jabatan atau posisi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      inviteUser({
        name: name.trim(),
        email: email.trim(),
        department,
        position: position.trim(),
        role,
        location,
        phone: phone.trim() || undefined,
        avatar: customAvatarUrl.trim() || avatar
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menambahkan personel. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shrink-0">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Undang Personel Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registrasi anggota tim ke direktori kerja perusahaan.
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

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'form'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Formulir Data</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'link'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Tautan Undangan</span>
          </button>
        </div>

        {/* TAB 1: FORMULIR PERSONEL */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Perusahaan *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={`nama@${orgDomain}`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Departemen & Jabatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Departemen / Divisi
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Technology & Engineering">Technology & Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="People Operations & Culture">People Operations & Culture</option>
                  <option value="Marketing & Brand">Marketing & Brand</option>
                  <option value="Finance & Legal Governance">Finance & Legal Governance</option>
                  {divisions
                    .filter(d => !['Technology & Engineering', 'Product & Design', 'People Operations & Culture', 'Marketing & Brand', 'Finance & Legal Governance'].includes(d.departmentMatch))
                    .map(d => (
                      <option key={d.id} value={d.departmentMatch}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan / Posisi *
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="Contoh: Senior Frontend Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Peran Akses & Lokasi Kerja */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat Akses (Role)
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="employee">Karyawan / Staf</option>
                  <option value="manager">Manager Divisi</option>
                  <option value="admin">Administrator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi Kerja
                </label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Kantor Pusat - Jakarta (WFO)">Kantor Pusat - Jakarta (WFO)</option>
                  <option value="Hub Bandung (Hybrid)">Hub Bandung (Hybrid)</option>
                  <option value="Remote / WFH">Remote / WFH</option>
                </select>
              </div>
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Kontak / WhatsApp (Opsional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Pilihan Foto Profil */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Foto Profil Personel
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(p);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative h-10 w-10 rounded-full overflow-hidden transition ring-2 ${
                        avatar === p && !customAvatarUrl
                          ? 'ring-blue-600 scale-105'
                          : 'ring-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="Atau tautan foto kustom..."
                    value={customAvatarUrl}
                    onChange={e => setCustomAvatarUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-2 text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Daftarkan Personel'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TAUTAN UNDANGAN */}
        {activeTab === 'link' && (
          <div className="p-6 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-blue-600" />
                  <span>Tautan Onboarding Cepat</span>
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                  Aktif 7 Hari
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kirim tautan ini ke calon karyawan baru untuk melengkapi pendaftaran akun secara mandiri.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
