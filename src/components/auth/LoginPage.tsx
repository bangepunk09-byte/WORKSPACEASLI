import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  X,
  Check,
  ExternalLink,
  ShieldAlert,
  Building2,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Upload,
  User as UserIcon,
  UserPlus
} from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { User, UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { workspaceInfo, users, login, themeSettings, submitUserApprovalRequest } = useWorkspace();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mode inside Google Modal: 'signin' for existing users, 'signup' for new employee registration
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Registration Form Fields - ALL DEFAULT TO EMPTY STRINGS (BLANK)
  const [googleTargetDept, setGoogleTargetDept] = useState('');
  const [inputGoogleEmail, setInputGoogleEmail] = useState('');
  const [inputGoogleName, setInputGoogleName] = useState('');
  const [inputGoogleNickname, setInputGoogleNickname] = useState('');
  const [inputGoogleBirthDate, setInputGoogleBirthDate] = useState('');
  const [inputGoogleEmployeeId, setInputGoogleEmployeeId] = useState('');
  const [inputGooglePosition, setInputGooglePosition] = useState('');
  const [inputGoogleLocation, setInputGoogleLocation] = useState('');
  const [inputGoogleEmploymentType, setInputGoogleEmploymentType] = useState<'Full-time' | 'Contract' | 'Probation' | 'Intern' | 'Freelance'>('Full-time');
  const [inputGooglePhone, setInputGooglePhone] = useState('');
  const [inputGoogleGender, setInputGoogleGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [inputEmergencyNameRelation, setInputEmergencyNameRelation] = useState('');
  const [inputEmergencyPhone, setInputEmergencyPhone] = useState('');
  const [inputBankInfo, setInputBankInfo] = useState('');
  const [inputAvatarUrl, setInputAvatarUrl] = useState('');

  // Modals & States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dynamic Card Radius & Accent Color aligned with Dashboard Theme Settings
  const getRadiusClass = (radius?: string) => {
    switch (radius) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-xl';
      case 'smooth': return 'rounded-3xl';
      case 'pill': return 'rounded-[28px]';
      default: return 'rounded-2xl';
    }
  };

  const getOuterRadiusClass = (radius?: string) => {
    switch (radius) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-2xl';
      case 'smooth': return 'rounded-[36px]';
      case 'pill': return 'rounded-[40px]';
      default: return 'rounded-[32px]';
    }
  };

  const getAccentClass = (accent?: string) => {
    switch (accent) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'navy-crimson': return 'bg-rose-700 hover:bg-rose-800 text-white';
      case 'royal-blue':
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const cardRadiusClass = getRadiusClass(themeSettings?.cardRadius);
  const outerRadiusClass = getOuterRadiusClass(themeSettings?.cardRadius);
  const accentButtonClass = getAccentClass(themeSettings?.accentColor);

  // Email & Password Auth State
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Anti-Brute-Force Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (lockoutUntil) {
      const updateCountdown = () => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(null);
          setLockoutCountdown(0);
          setFailedAttempts(0);
          setErrorMsg('');
        } else {
          setLockoutCountdown(remaining);
        }
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Sangat Lemah', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Sedang', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Kuat', color: 'bg-emerald-500' };
      case 4:
        return { score: 4, label: 'Sangat Kuat (Aman)', color: 'bg-blue-600' };
      default:
        return { score: 0, label: 'Terlalu Pendek (Min 8 Karakter)', color: 'bg-slate-300' };
    }
  };

  const handleQuickLogin = (user: User) => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      login(user);
    }, 200);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran berkas foto terlalu besar. Gunakan foto di bawah 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct Sign In with Email & Password for existing users
  const handleDirectSignInSubmit = (emailToTest?: string, passToTest?: string) => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      setErrorMsg(`Keamanan: Terlalu banyak percobaan salah. Silakan coba lagi dalam ${lockoutCountdown} detik.`);
      setIsGoogleLoading(false);
      return;
    }

    const targetEmail = (emailToTest || inputGoogleEmail).trim().toLowerCase();
    const targetPassword = passToTest !== undefined ? passToTest : inputPassword;

    if (!targetEmail) {
      setErrorMsg('Masukkan email terdaftar Anda.');
      setIsGoogleLoading(false);
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === targetEmail);
    if (existing) {
      if (existing.password) {
        if (existing.password === targetPassword) {
          setFailedAttempts(0);
          login(existing);
          setIsGoogleLoading(false);
          setShowGoogleModal(false);
          return;
        } else {
          const newFailed = failedAttempts + 1;
          setFailedAttempts(newFailed);
          if (newFailed >= 5) {
            const until = Date.now() + 30000;
            setLockoutUntil(until);
            setLockoutCountdown(30);
            setErrorMsg('Keamanan: Akun dikunci sementara karena 5 kali salah password. Silakan tunggu 30 detik.');
          } else {
            setErrorMsg(`Password salah. Percobaan tersisa: ${5 - newFailed}`);
          }
          setIsGoogleLoading(false);
          return;
        }
      } else {
        if (targetPassword) {
          existing.password = targetPassword;
        }
        setFailedAttempts(0);
        login(existing);
        setIsGoogleLoading(false);
        setShowGoogleModal(false);
        return;
      }
    }

    // Not registered yet -> switch to registration form automatically
    setErrorMsg('Email belum terdaftar sebagai akun aktif. Silakan lengkapi Form Registrasi Karyawan Baru di bawah.');
    setAuthModalMode('signup');
    setInputGoogleEmail(targetEmail);
    setIsGoogleLoading(false);
  };

  // Registration submit for new employees
  const handleRegistrationSubmit = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emailToUse = inputGoogleEmail.trim();
      const nameToUse = inputGoogleName.trim();

      if (!emailToUse || !nameToUse) {
        setErrorMsg('Email dan Nama Lengkap wajib diisi.');
        setIsGoogleLoading(false);
        return;
      }

      if (signupPassword.length < 8) {
        setErrorMsg('Password wajib minimal 8 karakter dengan kombinasi huruf & angka.');
        setIsGoogleLoading(false);
        return;
      }

      if (signupPassword !== signupConfirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
        setIsGoogleLoading(false);
        return;
      }

      const emailLower = emailToUse.toLowerCase();
      const existing = users.find(u => u.email.toLowerCase() === emailLower);
      if (existing) {
        login({ ...existing, password: signupPassword });
        setIsGoogleLoading(false);
        setShowGoogleModal(false);
        return;
      }

      const orgDomain = (workspaceInfo.orgDomain || 'asliri.id').toLowerCase().replace('@', '');
      const isCorpDomain = emailLower.endsWith('@' + orgDomain) || emailLower.endsWith('.' + orgDomain);

      const emergencyObj = inputEmergencyNameRelation ? {
        name: inputEmergencyNameRelation.split('(')[0]?.trim() || inputEmergencyNameRelation,
        relation: inputEmergencyNameRelation.includes('(') ? inputEmergencyNameRelation.split('(')[1].replace(')', '').trim() : 'Keluarga',
        phone: inputEmergencyPhone || '-'
      } : undefined;

      const bankParts = inputBankInfo.split(' ');
      const bankObj = inputBankInfo ? {
        bankName: bankParts[0] || 'BCA',
        accountNumber: bankParts[1] || inputBankInfo,
        accountHolder: nameToUse || 'Pemegang Rekening'
      } : undefined;

      if (isCorpDomain) {
        const baseUser = users[0];
        const finalAvatar = inputAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=0D9488&color=fff&size=256`;
        const newUser: User = {
          ...baseUser,
          id: 'usr_g_' + Date.now(),
          email: emailToUse,
          password: signupPassword,
          name: nameToUse,
          nickname: inputGoogleNickname.trim() || undefined,
          avatar: finalAvatar,
          department: googleTargetDept || 'Technology & Engineering',
          position: inputGooglePosition || 'Staff Anggota',
          role: 'employee',
          joinedDate: new Date().toISOString().split('T')[0],
          employeeId: inputGoogleEmployeeId.trim() || 'EMP-' + Math.floor(2026000 + Math.random() * 9000),
          employmentType: inputGoogleEmploymentType || 'Full-time',
          location: inputGoogleLocation || 'Headquarters – Jakarta',
          phone: inputGooglePhone || '-',
          gender: inputGoogleGender || 'Laki-laki',
          birthDate: inputGoogleBirthDate || undefined,
          emergencyContact: emergencyObj,
          bankAccount: bankObj
        };
        login(newUser);
      } else {
        const finalAvatar = inputAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=0D9488&color=fff&size=256`;
        submitUserApprovalRequest({
          name: nameToUse,
          email: emailToUse,
          password: signupPassword,
          nickname: inputGoogleNickname,
          department: googleTargetDept || 'Technology & Engineering',
          position: inputGooglePosition || 'Staff Anggota',
          employeeId: inputGoogleEmployeeId,
          employmentType: inputGoogleEmploymentType,
          location: inputGoogleLocation,
          phone: inputGooglePhone,
          gender: inputGoogleGender,
          birthDate: inputGoogleBirthDate,
          emergencyContact: emergencyObj,
          bankAccount: bankObj,
          avatar: finalAvatar
        });
        alert('Akun Anda menggunakan domain eksternal. Permohonan registrasi karyawan baru telah dikirimkan ke Super Admin untuk persetujuan.');
      }
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    } catch (err: any) {
      console.error('Registration Error:', err);
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
      setIsGoogleLoading(false);
    }
  };

  // Account Picker Modal state
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [customPickerEmail, setCustomPickerEmail] = useState('');

  const handleFirebaseGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');

    try {
      if (!auth) {
        setShowAccountPicker(true);
        setIsGoogleLoading(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) throw new Error('Google account email not found.');

      const emailLower = user.email.toLowerCase();
      const existing = users.find(u => u.email.toLowerCase() === emailLower);

      if (existing) {
        login({
          ...existing,
          name: user.displayName || existing.name,
          avatar: user.photoURL || existing.avatar,
        });
        setShowGoogleModal(false);
      } else {
        setAuthModalMode('signup');
        setInputGoogleEmail(user.email);
        setInputGoogleName(user.displayName || '');
        if (user.photoURL) setInputAvatarUrl(user.photoURL);
        setErrorMsg('Email Google belum terdaftar. Silakan lengkapi Form Registrasi Karyawan Baru di bawah ini.');
      }
    } catch (err: any) {
      console.error('Google Popup Login Error / Iframe Block:', err);
      // Show clean in-app Google Account Selector if popup is suppressed inside iframe
      setShowAccountPicker(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const openGoogleModalWithMode = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    if (mode === 'signup') {
      // Ensure form starts blank when opening new registration
      setInputGoogleEmail('');
      setInputGoogleName('');
      setInputGoogleNickname('');
      setInputGoogleBirthDate('');
      setInputGoogleEmployeeId('');
      setGoogleTargetDept('Technology & Engineering');
      setInputGooglePosition('');
      setInputGoogleLocation('');
      setInputGoogleEmploymentType('Full-time');
      setInputGooglePhone('');
      setInputGoogleGender('Laki-laki');
      setInputEmergencyNameRelation('');
      setInputEmergencyPhone('');
      setInputBankInfo('');
      setInputAvatarUrl('');
    }
    setShowGoogleModal(true);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col justify-between p-0 m-0 bg-[#181a20] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-30 flex items-center gap-2">
        <ThemeToggle size="md" />
      </div>

      {/* MOBILE VIEW */}
      <div className={`block lg:hidden w-full max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 my-auto ${outerRadiusClass}`}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          {workspaceInfo.logoUrl ? (
            <img
              src={workspaceInfo.logoUrl}
              alt={workspaceInfo.name}
              className={`h-11 w-11 shrink-0 object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 ${cardRadiusClass}`}
            />
          ) : (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-white shadow-md ring-2 ring-slate-800 dark:bg-white dark:text-slate-950 ${cardRadiusClass}`}>
              <Building2 className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans dark:text-white uppercase truncate">
                {workspaceInfo.name || 'ASLI GROUP'}
              </span>
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60 shrink-0">
                HUB
              </span>
            </div>
            <p className="truncate text-xs text-slate-500 font-medium dark:text-slate-400">
              {workspaceInfo.tagline || 'Corporate Internal Platform'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className={`flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300 ${cardRadiusClass}`}>
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); handleDirectSignInSubmit(); }} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Akun *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={inputGoogleEmail}
                onChange={e => setInputGoogleEmail(e.target.value)}
                placeholder="nama@asliri.id / email terdaftar"
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={inputPassword}
                onChange={e => setInputPassword(e.target.value)}
                placeholder="Password Anda"
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-9 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGoogleLoading || !!lockoutUntil}
            className={`flex w-full items-center justify-center gap-2 py-3 px-4 text-xs font-extrabold shadow-md transition cursor-pointer ${accentButtonClass} ${cardRadiusClass} disabled:opacity-50`}
          >
            <span>{isGoogleLoading ? 'Memeriksa...' : lockoutUntil ? `Tunggu ${lockoutCountdown}d` : 'Masuk ke Workspace'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => openGoogleModalWithMode('signup')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
            >
              Belum punya akun? Sign Up Karyawan Baru →
            </button>
          </div>
        </form>

        {/* Explore Demo Mode box */}
        <div className={`border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2.5 ${cardRadiusClass}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">🧪</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Explore Demo Mode</h4>
              <p className="text-[10px] text-slate-500">Sample data — separate from real workspace.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {users.slice(0, 4).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className={`flex items-center gap-2 bg-white p-2 text-left border border-slate-200/80 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 transition cursor-pointer group text-xs ${cardRadiusClass}`}
              >
                <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                  {u.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP SPLIT VIEW */}
      <div className="hidden lg:grid relative z-25 w-full flex-1 grid-cols-12 min-h-screen bg-white dark:bg-slate-900 overflow-hidden shadow-none rounded-none border-0">
        {/* LEFT COLUMN: Modern Building Image Banner with Features */}
        <div className="col-span-7 relative p-10 flex flex-col justify-between overflow-hidden text-white min-h-full">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('${workspaceInfo.loginBgCustomUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85'}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/15 ${cardRadiusClass}`}>
              <Sparkles className="h-3 w-3 text-red-400" />
              <span>{workspaceInfo.loginBannerBadge || 'Your Team. One Circle.'}</span>
            </span>
          </div>

          {/* Middle/Top Content Area */}
          <div className="relative z-10 py-6 max-w-lg mt-auto">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              Connect people. Move work forward.
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              One workspace to connect your people, manage your work, and keep everything moving.
            </p>
          </div>

          {/* Bottom 3 Feature Cards */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-3">
            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">Chat & calls</span>
            </div>

            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">Tasks & projects</span>
            </div>

            <div className={`bg-white/90 backdrop-blur-md p-3.5 text-slate-900 shadow-lg flex flex-col justify-between ${cardRadiusClass}`}>
              <div className={`flex h-7 w-7 items-center justify-center bg-red-50 text-red-600 mb-2 ${cardRadiusClass}`}>
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-snug">People & org</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Google SSO & Demo Mode */}
        <div className="col-span-5 p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <div className="max-w-sm w-full mx-auto my-auto space-y-6">
            <div className="space-y-3">
              {/* Integrated Sidebar Brand Header Matching Dashboard */}
              <div className="flex items-center gap-3 overflow-hidden">
                {workspaceInfo.logoUrl ? (
                  <img
                    src={workspaceInfo.logoUrl}
                    alt={workspaceInfo.name}
                    className={`h-11 w-11 shrink-0 object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 ${cardRadiusClass}`}
                  />
                ) : (
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-white shadow-md ring-2 ring-slate-800 dark:bg-white dark:text-slate-950 ${cardRadiusClass}`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans dark:text-white uppercase truncate">
                      {workspaceInfo.name || 'ASLI GROUP'}
                    </span>
                    <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60 shrink-0">
                      HUB
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500 font-medium dark:text-slate-400">
                    {workspaceInfo.tagline || 'Corporate Internal Platform'}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Biometrics for a Smarter Future
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className={`flex items-center gap-2 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300 ${cardRadiusClass}`}>
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Direct Email & Password Sign In Form */}
            <form onSubmit={e => { e.preventDefault(); handleDirectSignInSubmit(); }} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inputGoogleEmail}
                    onChange={e => setInputGoogleEmail(e.target.value)}
                    placeholder="nama@asliri.id / email terdaftar"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={inputPassword}
                    onChange={e => setInputPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGoogleLoading || !!lockoutUntil}
                className={`w-full py-3 px-4 text-xs font-extrabold shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${accentButtonClass} ${cardRadiusClass} disabled:opacity-50`}
              >
                <span>{isGoogleLoading ? 'Memeriksa...' : lockoutUntil ? `Tunggu ${lockoutCountdown} detik` : 'Masuk ke Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs px-1 pt-1">
              <span className="text-slate-500 dark:text-slate-400">Belum punya akun?</span>
              <button
                type="button"
                onClick={() => openGoogleModalWithMode('signup')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Registrasi Karyawan Baru →
              </button>
            </div>

            <button
              type="button"
              onClick={() => openGoogleModalWithMode('signin')}
              className={`flex w-full items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer ${cardRadiusClass}`}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google Workspace Popup Authenticator</span>
            </button>

            {/* Explore Demo Mode box */}
            <div className={`border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3 ${cardRadiusClass}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">🧪</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Explore Demo Mode</h4>
                  <p className="text-[10px] text-slate-500">Sample data — separate from real workspace.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {users.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className={`flex items-center gap-2 bg-white p-2 text-left border border-slate-200/80 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 transition cursor-pointer group text-xs ${cardRadiusClass}`}
                  >
                    <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                      {u.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Apps ini di kembangkan oleh Team Marketing Asli Rancangan Indonesia
          </div>
        </div>
      </div>

      {/* FOOTER BAR FOR MOBILE */}
      <footer className="block lg:hidden w-full bg-slate-950 py-3 text-center text-[11px] text-slate-400 border-t border-slate-800 shrink-0 font-medium">
        Apps ini di kembangkan oleh Team Marketing Asli Rancangan Indonesia
      </footer>

      {/* Google Workspace Sign In / Registration Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-xl max-h-[90vh] flex flex-col bg-white border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 dark:text-white ${outerRadiusClass} overflow-hidden`}>
            {/* Modal Header */}
            <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {authModalMode === 'signin' ? 'Sign In Google Workspace' : 'Form Registrasi Karyawan Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {authModalMode === 'signin'
                        ? 'Masuk menggunakan email Google akun karyawan Anda'
                        : 'Lengkapi 13 data identitas karyawan baru (Semua kolom wajib diisi)'}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowGoogleModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Toggle Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => openGoogleModalWithMode('signin')}
                  className={`py-2 px-3 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    authModalMode === 'signin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>1. Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openGoogleModalWithMode('signup')}
                  className={`py-2 px-3 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    authModalMode === 'signup'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>2. Sign Up</span>
                </button>
              </div>
            </div>

            {/* Error / Success Banners */}
            {errorMsg && (
              <div className="shrink-0 mx-5 mt-3 flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300 rounded-xl">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Body */}
            {authModalMode === 'signin' ? (
              /* SIGN IN MODE (Direct Email check or Google Popup) */
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs min-h-0">
                <div className="text-center py-2 space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Masuk Langsung dengan Akun Google</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Jika Anda sudah pernah terdaftar, sistem akan langsung mengarahkan Anda ke Dashboard tanpa perlu mengisi form registrasi.
                  </p>
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Google Terdaftar *
                    </label>
                    <input
                      type="email"
                      value={inputGoogleEmail}
                      onChange={e => setInputGoogleEmail(e.target.value)}
                      placeholder="Masukkan email anda@asliri.id / gmail.com"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDirectSignInSubmit()}
                    disabled={isGoogleLoading || !inputGoogleEmail.trim()}
                    className={`w-full py-3 text-xs font-extrabold shadow-md transition cursor-pointer ${accentButtonClass} ${cardRadiusClass}`}
                  >
                    {isGoogleLoading ? 'Memeriksa Status Akun...' : 'Masuk ke Workspace'}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400">atau gunakan</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFirebaseGoogleLogin}
                    disabled={isGoogleLoading}
                    className={`flex w-full items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 py-3 px-4 text-xs font-bold text-slate-800 dark:text-white shadow-sm transition cursor-pointer ${cardRadiusClass}`}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google Workspace Popup Authenticator</span>
                  </button>
                </div>
              </div>
            ) : (
              /* SIGN UP MODE (Registration Fields + Profile Photo) */
              <form onSubmit={e => { e.preventDefault(); handleRegistrationSubmit(); }} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs min-h-0">
                {/* PHOTO UPLOADER SECTION WITH DEFAULT EMAIL AVATAR */}
                <div className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="relative group shrink-0">
                    <img
                      src={inputAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(inputGoogleName.trim() || inputGoogleEmail.trim() || 'User')}&background=0D9488&color=fff&size=256`}
                      alt="Preview Avatar"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Foto Profil Karyawan
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Default foto menggunakan avatar email Google Anda. Anda dapat mengunggah foto custom jika diinginkan.</p>
                  </div>
                </div>

                {/* 1. Email Google */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Google Kantor / Primary Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inputGoogleEmail}
                    onChange={e => setInputGoogleEmail(e.target.value)}
                    placeholder="namaanda@asliri.id atau gmail.com"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                  />
                </div>

                {/* 2 & 3: Nama Lengkap & Nama Panggilan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={inputGoogleName}
                      onChange={e => setInputGoogleName(e.target.value)}
                      placeholder="Contoh: Saeful Rohman"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      value={inputGoogleNickname}
                      onChange={e => setInputGoogleNickname(e.target.value)}
                      placeholder="Contoh: Saeful"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>
                </div>

                {/* 4 & 5: TTL & ID Employee / NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tempat & Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      value={inputGoogleBirthDate}
                      onChange={e => setInputGoogleBirthDate(e.target.value)}
                      placeholder="Contoh: Jakarta, 14 Mei 1995"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ID Employee / NIK
                    </label>
                    <input
                      type="text"
                      value={inputGoogleEmployeeId}
                      onChange={e => setInputGoogleEmployeeId(e.target.value)}
                      placeholder="Contoh: EMP-2026108"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>
                </div>

                {/* 6 & 7: Divisi & Jabatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Divisi Penugasan *
                    </label>
                    <select
                      value={googleTargetDept}
                      onChange={e => setGoogleTargetDept(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer ${cardRadiusClass}`}
                    >
                      <option value="">-- Pilih Divisi --</option>
                      <option value="Technology & Engineering">Technology & Engineering</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="People Operations & Culture">People Operations & Culture</option>
                      <option value="Marketing & Brand">Marketing & Brand</option>
                      <option value="Finance & Legal Governance">Finance & Legal Governance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={inputGooglePosition}
                      onChange={e => setInputGooglePosition(e.target.value)}
                      placeholder="Contoh: VP of Technology & Digital Innovation"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>
                </div>

                {/* 8 & 9: Lokasi Kantor & Status Kepegawaian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lokasi Kantor
                    </label>
                    <input
                      type="text"
                      value={inputGoogleLocation}
                      onChange={e => setInputGoogleLocation(e.target.value)}
                      placeholder="Headquarters – Jakarta Tower A, Lt. 18"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status Kepegawaian
                    </label>
                    <select
                      value={inputGoogleEmploymentType}
                      onChange={e => setInputGoogleEmploymentType(e.target.value as any)}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer ${cardRadiusClass}`}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Probation">Probation</option>
                      <option value="Intern">Intern</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                {/* 10 & 11: Nomor Telepon & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={inputGooglePhone}
                      onChange={e => setInputGooglePhone(e.target.value)}
                      placeholder="+62 812-9845-7721"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={inputGoogleGender}
                      onChange={e => setInputGoogleGender(e.target.value as any)}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer ${cardRadiusClass}`}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* 12: Kontak Darurat */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kontak Darurat
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={inputEmergencyNameRelation}
                      onChange={e => setInputEmergencyNameRelation(e.target.value)}
                      placeholder="Nama & Hubungan cth: Siti Rahma - Istri"
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium ${cardRadiusClass}`}
                    />
                    <input
                      type="text"
                      value={inputEmergencyPhone}
                      onChange={e => setInputEmergencyPhone(e.target.value)}
                      placeholder="Nomor Telepon Kontak Darurat"
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium ${cardRadiusClass}`}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-9 pr-9 py-2 text-xs font-medium ${cardRadiusClass}`}
                      />
                      <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Konfirmasi Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-9 pr-9 py-2 text-xs font-medium ${cardRadiusClass}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 13: Informasi Rekening Gaji */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Informasi Rekening Gaji
                  </label>
                  <input
                    type="text"
                    value={inputBankInfo}
                    onChange={e => setInputBankInfo(e.target.value)}
                    placeholder="Nama Bank, Nomor Rekening, Pemilik cth: BCA 5270189234"
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium ${cardRadiusClass}`}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 shrink-0">
                  <button
                    type="submit"
                    disabled={isGoogleLoading || !inputGoogleEmail.trim() || !inputGoogleName.trim() || !inputGooglePosition.trim()}
                    className={`w-full py-3.5 text-xs font-extrabold shadow-md transition cursor-pointer ${accentButtonClass} ${cardRadiusClass}`}
                  >
                    {isGoogleLoading ? 'Memproses Registrasi Karyawan...' : 'Daftar Karyawan Baru & Masuk'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* In-App Interactive Google Workspace Account Picker Modal */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ${outerRadiusClass} overflow-hidden`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pilih Akun Google Workspace</h3>
                  <p className="text-[11px] text-slate-500">Pilih akun terdaftar untuk melanjutkan ke {workspaceInfo.name || 'ASLI GROUP'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountPicker(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List of Registered Accounts */}
            <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-1">
                Akun Terdaftar di Workspace
              </span>

              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setShowAccountPicker(false);
                    handleDirectSignInSubmit(u.email);
                  }}
                  className={`w-full flex items-center justify-between p-3 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition cursor-pointer text-left ${cardRadiusClass}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                    {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : 'Staff'}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Email Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Gunakan Email Google Lain:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customPickerEmail}
                  onChange={(e) => setCustomPickerEmail(e.target.value)}
                  placeholder="masukkan@asliri.id / gmail.com"
                  className={`flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardRadiusClass}`}
                />
                <button
                  type="button"
                  disabled={!customPickerEmail.trim()}
                  onClick={() => {
                    if (customPickerEmail.trim()) {
                      const emailToUse = customPickerEmail.trim();
                      setShowAccountPicker(false);
                      setCustomPickerEmail('');
                      handleDirectSignInSubmit(emailToUse);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-sm ${cardRadiusClass}`}
                >
                  Masuk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
