import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building2,
  Briefcase,
  GitFork,
  LayoutGrid,
  List,
  Sparkles,
  X,
  Trash2,
  AlertTriangle,
  UserPlus,
  Camera,
  Upload,
  RotateCcw
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { User, AvailabilityStatus } from '../../types';
import { InviteEmployeeModal } from '../modals/InviteEmployeeModal';

// Male & Female Silhouette SVG Fallbacks
export const MaleSilhouetteSVG: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 overflow-hidden ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/4 h-3/4 translate-y-1">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export const FemaleSilhouetteSVG: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 overflow-hidden ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/4 h-3/4 translate-y-1">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export const EmployeeAvatar: React.FC<{ emp: User; className?: string; onClick?: () => void }> = ({ emp, className = "h-16 w-16 rounded-2xl object-cover", onClick }) => {
  const [hasError, setHasError] = useState(false);
  const isFemale = emp.gender === 'Perempuan' || (emp.gender as any) === 'Female';
  const hasValidPhoto = emp.avatar && !hasError && !emp.avatar.includes('placeholder') && !emp.avatar.includes('silhouette');

  if (hasValidPhoto) {
    return (
      <img
        src={emp.avatar}
        alt={emp.name}
        onError={() => setHasError(true)}
        onClick={onClick}
        className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      />
    );
  }

  return (
    <div onClick={onClick} className={`${className} overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
      {isFemale ? <FemaleSilhouetteSVG className="w-full h-full" /> : <MaleSilhouetteSVG className="w-full h-full" />}
    </div>
  );
};

export const EmployeeDirectory: React.FC = () => {
  const {
    users,
    currentUser,
    startDirectMessage,
    setCurrentUser,
    deleteUser,
    updateUser,
    selectedDirectoryUserId,
    setSelectedDirectoryUserId
  } = useWorkspace();

  const [viewMode, setViewMode] = useState<'grid' | 'orgChart'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  React.useEffect(() => {
    if (selectedDirectoryUserId) {
      const target = users.find(u => u.id === selectedDirectoryUserId);
      if (target) {
        setSelectedEmployee(target);
      }
      setSelectedDirectoryUserId(null);
    }
  }, [selectedDirectoryUserId, users]);

  const departments = [
    { id: 'all', label: 'Semua Departemen' },
    { id: 'Technology & Engineering', label: 'Technology & Eng' },
    { id: 'Product & Design', label: 'Product & Design' },
    { id: 'People Operations & Culture', label: 'People Ops / HR' },
    { id: 'Marketing & Brand', label: 'Marketing' },
    { id: 'Finance & Legal Governance', label: 'Finance & Legal' }
  ];

  const filteredEmployees = users.filter(u => {
    if (selectedDept !== 'all' && u.department !== selectedDept) return false;
    if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchPos = u.position.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchLoc = u.location.toLowerCase().includes(q);
      return matchName || matchPos || matchEmail || matchLoc;
    }
    return true;
  });

  const getStatusBadge = (status: AvailabilityStatus) => {
    switch (status) {
      case 'online':
        return { label: 'Online', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
      case 'in_meeting':
        return { label: 'In Meeting', color: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' };
      case 'busy':
        return { label: 'Busy (Fokus)', color: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
      default:
        return { label: 'Away', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' };
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, targetUserId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateUser(targetUserId, { avatar: reader.result });
          if (selectedEmployee && selectedEmployee.id === targetUserId) {
            setSelectedEmployee(prev => prev ? { ...prev, avatar: reader.result as string } : null);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (targetUserId: string) => {
    updateUser(targetUserId, { avatar: '' });
    if (selectedEmployee && selectedEmployee.id === targetUserId) {
      setSelectedEmployee(prev => prev ? { ...prev, avatar: '' } : null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            Direktori Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data personel, profil kustom foto, dan struktur tim perusahaan.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Invite Employee Button */}
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-500" />
            <span>Undang Karyawan</span>
          </button>

          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid Profil</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('orgChart')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'orgChart'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <GitFork className="h-3.5 w-3.5" />
              <span>Bagan Organisasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, jabatan, email kantor, atau keahlian..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 w-full sm:w-auto"
        >
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* VIEW: GRID EMPLOYEES */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredEmployees.map(emp => {
            const st = getStatusBadge(emp.status);
            const isMe = emp.id === currentUser.id;

            return (
              <div
                key={emp.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-red-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Photo & Status */}
                  <div className="relative mb-3 flex items-start justify-between">
                    <div className="relative">
                      <EmployeeAvatar
                        emp={emp}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        onClick={() => setSelectedEmployee(emp)}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${st.color}`}
                        title={st.label}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">
                        {emp.role.replace('_', ' ')}
                      </span>
                      {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && !isMe && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setUserToDelete(emp);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title={`Hapus Karyawan ${emp.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name and Position */}
                  <h3
                    onClick={() => setSelectedEmployee(emp)}
                    className="cursor-pointer text-sm font-bold text-slate-900 hover:text-red-600 transition dark:text-white"
                  >
                    {emp.name}
                  </h3>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {emp.position}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {emp.department}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.location.split('(')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Chat & Profile Modal */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => startDirectMessage(emp.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-xs font-bold text-white transition hover:bg-red-700 cursor-pointer"
                    title={`Mulai Chat dengan ${emp.name}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Pesan Chat</span>
                  </button>

                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Profil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: ORG CHART HIERARCHY */}
      {viewMode === 'orgChart' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Struktur Kepemimpinan & Reporting Line Perusahaan
            </h3>
            <p className="text-xs text-slate-500">
              Hirarki tanggung jawab dan tim lintas divisi WORKSPACE
            </p>
          </div>

          {/* Org Tree: VP at top */}
          <div className="flex flex-col items-center space-y-6">
            {/* Top Node: Saeful Rohman (VP) */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => setSelectedEmployee(users[0])}
                className="cursor-pointer rounded-2xl border-2 border-red-500 bg-red-50/40 p-4 shadow-md text-center max-w-xs transition hover:scale-105 dark:bg-red-950/20"
              >
                <EmployeeAvatar
                  emp={users[0]}
                  className="mx-auto h-14 w-14 rounded-full object-cover ring-2 ring-red-500"
                />
                <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                  {users[0].name}
                </h4>
                <div className="text-[10px] font-bold text-red-600">
                  {users[0].position}
                </div>
                <div className="text-[9px] text-slate-500">Super Admin / Executive</div>
              </div>
              <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Level 2 Managers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-2 border-t-2 border-slate-300 dark:border-slate-700">
              {users.slice(1, 5).map(mgr => (
                <div
                  key={mgr.id}
                  onClick={() => setSelectedEmployee(mgr)}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center shadow-xs transition hover:border-red-400 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <EmployeeAvatar
                    emp={mgr}
                    className="mx-auto h-12 w-12 rounded-full object-cover"
                  />
                  <h5 className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">
                    {mgr.name}
                  </h5>
                  <div className="text-[10px] text-red-600 font-semibold truncate">
                    {mgr.position}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {mgr.department.split('&')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATCHY EMPLOYEE SHOWCASE MODAL WITH CUSTOM PHOTO UPLOAD & SILHOUETTE FALLBACK */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
          <div className="w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            {/* HEROIC SHOWCASE HEADER - Fixed Shrink 0 */}
            <div className="shrink-0 relative bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 p-5 sm:p-6 text-white overflow-hidden">
              {/* Background Accent Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.25),transparent_60%)] pointer-events-none" />
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Photo Avatar with Hover Upload Overlay */}
                  <div className="relative group shrink-0">
                    <EmployeeAvatar
                      emp={selectedEmployee}
                      className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
                    />
                    <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Ganti Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleAvatarUpload(e, selectedEmployee.id)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        {selectedEmployee.name}
                      </h3>
                      <span className="rounded-full bg-red-600/90 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                        {selectedEmployee.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-red-400">
                      {selectedEmployee.position}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {selectedEmployee.department}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Photo Upload & Reset Actions Row */}
              <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-[11px] font-bold text-white transition cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-red-400" />
                    <span>Upload Foto Kustom</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleAvatarUpload(e, selectedEmployee.id)}
                      className="hidden"
                    />
                  </label>

                  {selectedEmployee.avatar && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(selectedEmployee.id)}
                      className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-[11px] text-slate-300 transition cursor-pointer"
                      title="Ganti ke siluet abu-abu bawaan"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Pakai Siluet</span>
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-semibold">
                  {selectedEmployee.gender || 'Laki-laki'}
                </span>
              </div>
            </div>

            {/* SHOWCASE BODY DETAILS - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs min-h-0">
              <div>
                <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider mb-1">
                  Bio Ringkas & Peran Utama
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {selectedEmployee.bio || 'Karyawan berdedikasi tinggi di tim WORKSPACE.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ID Karyawan / NIK</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{selectedEmployee.employeeId || 'EMP-' + selectedEmployee.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Jabatan (Position)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.position}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Role Akses (RBAC)</span>
                  <span className="font-bold text-red-600 uppercase">{selectedEmployee.role.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Divisi / Departemen</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Email Kantor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Nomor Telepon</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Lokasi Kantor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Tanggal Bergabung</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedEmployee.joinedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Status Kepegawaian</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.employmentType || 'Full-time'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Gender / Tgl Lahir</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.gender || 'Laki-laki'} ({selectedEmployee.birthDate || '1990-01-01'})</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold block">Kontak Darurat (Emergency Contact)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedEmployee.emergencyContact ? `${selectedEmployee.emergencyContact.name} (${selectedEmployee.emergencyContact.relation} — ${selectedEmployee.emergencyContact.phone})` : 'Siti Rahma (Istri — +62 812-9845-7722)'}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold block">Informasi Rekening Gaji (Bank Account)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedEmployee.bankAccount ? `${selectedEmployee.bankAccount.bankName}: ${selectedEmployee.bankAccount.accountNumber} (a.n. ${selectedEmployee.bankAccount.accountHolder})` : 'Bank Central Asia (BCA): 5270189234'}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {selectedEmployee.skills && (
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider mb-1.5">
                    Keahlian & Kompetensi Utama
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmployee.skills.map(s => (
                      <span
                        key={s}
                        className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SHOWCASE FOOTER ACTIONS - Fixed Shrink 0 */}
            <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Ganti Persona (RBAC)
                </button>
                {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && selectedEmployee.id !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedEmployee;
                      setSelectedEmployee(null);
                      setUserToDelete(target);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Karyawan</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  startDirectMessage(selectedEmployee.id);
                  setSelectedEmployee(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-md active:scale-95 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Kirim Pesan Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL DELETE KARYAWAN */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Hapus Akun Karyawan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Akses akun akan dicabut secara permanen.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 flex items-center gap-3">
              <EmployeeAvatar emp={userToDelete} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                  {userToDelete.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {userToDelete.position} • {userToDelete.department}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  {userToDelete.email}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{userToDelete.name}</strong> dari direktori perusahaan?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer"
              >
                Hapus Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE EMPLOYEE MODAL */}
      {showInviteModal && (
        <InviteEmployeeModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

