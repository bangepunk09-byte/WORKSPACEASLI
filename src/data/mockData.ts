import { User, Post, Task, Channel, ChatMessage, Meeting, DocumentItem, NotificationItem, AuditLog, WorkspaceInfo, DivisionItem, DivisionTaskRequest, BrandDriveFolder, ManagedBrand } from '../types';

export const INITIAL_WORKSPACE_INFO: WorkspaceInfo = {
  name: 'ASLI GROUP',
  tagline: 'Corporate Collaboration Hub',
  orgDomain: 'asliri.id',
  logoUrl: '',
  timezone: 'Asia/Jakarta (WIB)',
  loginLayout: 'left-banner',
  loginBgStyle: 'radiant-journey',
  loginBgCustomUrl: '',
  loginBgBlur: 0,
  loginBgOverlayOpacity: 0,
  loginOuterBgColor: '#181a20',
  loginBannerBadge: 'Join Us to Build 🤩',
  loginBannerHeadline: 'Start your Journey',
  loginBannerSubtitle: 'Follow these simple steps to set up your account.',
  loginStep1Text: 'Register your account',
  loginStep2Text: 'Set up your profile information',
  loginStep3Text: 'Verify your identity through passport/ID',
  loginFormTitleSignUp: 'Join Us',
  loginFormTitleSignIn: 'Welcome Back',
  loginCtaSignUp: 'Continue',
  loginCtaSignIn: 'Continue',
  loginTermsText: 'By signing up I confirm that I carefully have read and agree to the ASLI GROUP Privacy Policy and Terms of Service.'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_saeful',
    name: 'Saeful Rohman',
    email: 'saeful.rohman@asliri.id',
    password: 'Admin123!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'super_admin',
    department: 'Technology & Engineering',
    position: 'VP of Technology & Digital Innovation',
    phone: '+62 812-9845-7721',
    location: 'Headquarters - Jakarta (Tower A, Lt. 18)',
    status: 'online',
    bio: 'Fokus pada arsitektur skala enterprise, integrasi identitas digital, keandalan sistem cloud, dan transformasi AI modern.',
    skills: ['System Architecture', 'Cloud Infrastructure', 'Cybersecurity', 'Executive Leadership', 'AI Systems'],
    directReports: ['usr_epunk'],
    joinedDate: '2021-03-15',
    employeeId: 'EMP-2021-001',
    employmentType: 'Full-time',
    birthDate: '1988-06-12',
    gender: 'Laki-laki',
    emergencyContact: { name: 'Siti Rahma', relation: 'Istri', phone: '+62 812-9845-7722' },
    bankAccount: { bankName: 'Bank Central Asia (BCA)', accountNumber: '5270189234', accountHolder: 'Saeful Rohman' }
  },
  {
    id: 'usr_epunk',
    name: 'Bang Epunk',
    email: 'epunk@asliri.id',
    password: 'Admin123!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'super_admin',
    department: 'Marketing & Brand',
    position: 'Lead Marketing & Creative Director',
    phone: '+62 812-3456-7890',
    location: 'Headquarters - Jakarta (Tower A, Lt. 15)',
    status: 'online',
    bio: 'Creative Lead & Strategis Pemasaran ASLI GROUP.',
    skills: ['Brand Strategy', 'Creative Direction', 'Marketing Campaign', 'Content Production'],
    managerId: 'usr_saeful',
    joinedDate: '2021-04-01',
    employeeId: 'EMP-2021-002',
    employmentType: 'Full-time',
    birthDate: '1990-05-15',
    gender: 'Laki-laki',
    emergencyContact: { name: 'Siti', relation: 'Keluarga', phone: '+62 812-3456-7899' },
    bankAccount: { bankName: 'Bank Central Asia (BCA)', accountNumber: '5270189999', accountHolder: 'Bang Epunk' }
  }
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'chn_general',
    name: 'general-announcements',
    type: 'channel',
    description: 'Pengumuman resmi perusahaan, kabar korporat, dan berita organisasi penting.',
    isPrivate: false,
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=256&h=256&q=80',
    memberIds: ['usr_saeful', 'usr_epunk'],
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: ''
  },
  {
    id: 'chn_tech',
    name: 'tech-engineering',
    type: 'channel',
    description: 'Diskusi arsitektur kode, sprint engineering, review PR, dan deployment.',
    isPrivate: false,
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=256&h=256&q=80',
    memberIds: ['usr_saeful', 'usr_epunk'],
    dept: 'Technology',
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: ''
  },
  {
    id: 'chn_product',
    name: 'product-design',
    type: 'channel',
    description: 'Kolaborasi desain UI/UX, user feedback, wireframe, dan roadmap produk.',
    isPrivate: false,
    avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=256&h=256&q=80',
    memberIds: ['usr_saeful', 'usr_epunk'],
    dept: 'Product',
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: ''
  },
  {
    id: 'chn_titan',
    name: 'project-titan-q4',
    type: 'channel',
    description: 'Taskforce peluncuran sistem enterprise dan koordinasi lintas departemen.',
    isPrivate: true,
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&h=256&q=80',
    memberIds: ['usr_saeful', 'usr_epunk'],
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: ''
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_MEETINGS: Meeting[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_BRAND_DRIVE_FOLDERS: BrandDriveFolder[] = [];

export const INITIAL_DIVISIONS: DivisionItem[] = [
  {
    id: 'hrga',
    name: 'HRGA',
    departmentMatch: 'People Operations & Culture',
    leadName: 'Rina Wijaya',
    leadRole: 'Head of People Operations & HRGA',
    leadAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'royal-blue',
    bannerGradient: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 30%, #1e1b4b 100%)',
    description: 'Pusat operasional dan koordinasi tim HRGA.'
  },
  {
    id: 'tech',
    name: 'Technology & Engineering',
    departmentMatch: 'Technology & Engineering',
    leadName: 'Saeful Rohman',
    leadRole: 'VP of Technology & Engineering',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'electric-indigo',
    bannerGradient: 'linear-gradient(90deg, #4f46e5 0%, #4338ca 40%, #0f172a 100%)',
    description: 'Arsitektur sistem, infrastruktur cloud multi-AZ, microservices, keamanan data ISO 27001, dan AI research.'
  },
  {
    id: 'product',
    name: 'Product & Design',
    departmentMatch: 'Product & Design',
    leadName: 'Nadia Putri',
    leadRole: 'Lead Product Manager',
    leadAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'vibrant-purple',
    bannerGradient: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 40%, #1e1b4b 100%)',
    description: 'Riset pengguna (UX research), desain antarmuka, design system, storyboard video kampanye, dan roadmap fitur.'
  },
  {
    id: 'marketing',
    name: 'Marketing & Brand',
    departmentMatch: 'Marketing & Brand',
    leadName: 'Dimas Aditya',
    leadRole: 'Brand Marketing Lead',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'amber-sunset',
    bannerGradient: 'linear-gradient(90deg, #ea580c 0%, #d97706 45%, #451a03 100%)',
    description: 'Kampanye B2B, peluncuran media, materi kreatif video promo, studi kasus klien, dan pertumbuhan brand.'
  },
  {
    id: 'finance',
    name: 'Finance & Legal',
    departmentMatch: 'Finance & Legal',
    leadName: 'Maya Anggraini',
    leadRole: 'Finance Director',
    leadAvatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'crimson-ruby',
    bannerGradient: 'linear-gradient(90deg, #e11d48 0%, #be123c 40%, #18181b 100%)',
    description: 'Audit finansial, rekonsiliasi arus kas, kepatuhan pajak korporat, dan pengesahan kontrak legal formal.'
  }
];

export const INITIAL_DIVISION_REQUESTS: DivisionTaskRequest[] = [];
 
export const INITIAL_MANAGED_BRANDS: ManagedBrand[] = [
  {
    id: 'brand_asliri',
    name: 'Asli RI',
    code: 'ASLI',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#dc2626',
    category: 'Digital Identity & Security',
    description: 'Solusi verifikasi biometrik, identitas digital e-KYC, dan sertifikasi enterprise.',
    website: 'https://asliri.id',
    isDefault: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'brand_movadex',
    name: 'Movadex',
    code: 'MVDX',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#2563eb',
    category: 'Creative & Digital Agency',
    description: 'Produksi konten kampanye digital, UI/UX premium & commercial media.',
    website: 'https://movadex.com',
    isDefault: false,
    createdAt: '2024-01-15'
  },
  {
    id: 'brand_finova',
    name: 'Finova',
    code: 'FNV',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#059669',
    category: 'Fintech & Enterprise Systems',
    description: 'Platform analitik finansial modern, automasi billing B2B & sistem kepatuhan.',
    website: 'https://finova.tech',
    isDefault: false,
    createdAt: '2024-02-01'
  },
  {
    id: 'brand_ninth',
    name: 'Ninth',
    code: 'NINTH',
    logo: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#7c3aed',
    category: 'Design & Brand Studio',
    description: 'Arsitektur brand visual, sistem tipografi, dan packaging inovatif.',
    website: 'https://ninthstudio.io',
    isDefault: false,
    createdAt: '2024-02-10'
  },
  {
    id: 'brand_creativelabs',
    name: 'Creative Labs',
    code: 'LABS',
    logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#ea580c',
    category: 'Innovation & Motion R&D',
    description: 'Eksperimen visual 3D CGI, riset konten interaktif, dan format media baru.',
    website: 'https://creativelabs.id',
    isDefault: false,
    createdAt: '2024-03-01'
  }
];

