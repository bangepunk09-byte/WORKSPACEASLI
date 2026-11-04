import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Hash,
  Lock,
  Plus,
  Search,
  Phone,
  Video,
  ChevronLeft,
  CheckCheck,
  Play,
  Pause,
  X,
  Users,
  Sparkles,
  SmilePlus,
  Check,
  UserPlus,
  Image as ImageIcon,
  Pin,
  Star,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  Settings,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  FolderOpen,
  Camera,
  Upload,
  CalendarCheck,
  Calendar,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Channel, ChatMessage, StickerData, Task, Attachment, LeaveRequest } from '../../types';

// Pre-made corporate sticker templates
const DEFAULT_PRESET_STICKERS: StickerData[] = [
  { id: 'stk_1', emoji: '🚀', text: 'Siap Laksanakan!', style: 'neon' },
  { id: 'stk_2', emoji: '✅', text: 'Approved & Done!', style: 'emerald' },
  { id: 'stk_3', emoji: '🔥', text: 'Mantap Jiwa!', style: 'gold' },
  { id: 'stk_4', emoji: '⚠️', text: 'Perlu Review Segera', style: 'stamp' },
  { id: 'stk_5', emoji: '🛵', text: 'OTW Lapangan', style: 'cyan' },
  { id: 'stk_6', emoji: '⚡', text: 'Gaskeun Bro!', style: 'neon' },
  { id: 'stk_7', emoji: '💰', text: 'Closing Deal!', style: 'gold' },
  { id: 'stk_8', emoji: '☕', text: 'Ngopi Dulu Bentar', style: 'bubble' },
  { id: 'stk_9', emoji: '🎯', text: 'Target Tercapai!', style: 'emerald' },
  { id: 'stk_10', emoji: '💪', text: 'Kerja Keras Mantap', style: 'stamp' },
  { id: 'stk_11', emoji: '🏆', text: 'Top Performer!', style: 'gold' },
  { id: 'stk_12', emoji: '🤝', text: 'Sepakat & Deal', style: 'cyan' },
];

export const ChatMessaging: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    channels,
    activeChannelId,
    setActiveChannelId,
    markChannelAsRead,
    messages,
    sendMessage,
    toggleReaction,
    deleteMessage,
    createChannel,
    updateChannelSettings,
    toggleStarChannel,
    togglePinMessage,
    toggleStarMessage,
    processTaskApproval,
    processLeaveApproval,
    startDirectMessage,
    startHuddle,
    activeHuddle,
    endHuddle,
    toggleHuddleMinimize,
    setQuickActionModal
  } = useWorkspace();

  const [messageText, setMessageText] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'channels' | 'direct'>('all');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{ channelId: string; messageId: string; previewText: string } | null>(null);

  // Sticker modal & maker state
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerTab, setStickerTab] = useState<'presets' | 'create' | 'photo'>('presets');
  
  // Custom sticker studio state
  const [customStickerText, setCustomStickerText] = useState('KERJA KERAS 🚀');
  const [customStickerEmoji, setCustomStickerEmoji] = useState('🔥');
  const [customStickerStyle, setCustomStickerStyle] = useState<StickerData['style']>('neon');
  const [photoStickerFile, setPhotoStickerFile] = useState<string | null>(null);
  const [photoStickerCaption, setPhotoStickerCaption] = useState('');
  const photoStickerInputRef = useRef<HTMLInputElement>(null);

  const [userCreatedStickers, setUserCreatedStickers] = useState<StickerData[]>(() => {
    try {
      const saved = localStorage.getItem('WORKSPACE_CUSTOM_STICKERS');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New channel form state
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanPrivate, setNewChanPrivate] = useState(false);
  const [newChanMembers, setNewChanMembers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Group settings and Media drawer state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMediaDrawer, setShowMediaDrawer] = useState(false);
  const [showAttachTaskModal, setShowAttachTaskModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mediaTab, setMediaTab] = useState<'images' | 'docs' | 'tasks'>('images');
  const [memberSearch, setMemberSearch] = useState('');

  // Edit channel form state inside settings modal
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [attachTaskCustomNote, setAttachTaskCustomNote] = useState('');

  // Current active channel
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || {
    id: 'general',
    name: 'general-announcements',
    type: 'channel',
    memberIds: []
  };
  const currentMessages = (activeChannel && messages[activeChannel.id]) || [];

  // Pinned messages & Media collections for active channel
  const pinnedMessages = currentMessages.filter(
    m => m.isPinned || (activeChannel.pinnedMessageIds && activeChannel.pinnedMessageIds.includes(m.id))
  );
  const allImages = currentMessages.filter(m => !!m.imageUrl);
  const allDocs = currentMessages.filter(m => m.attachments && m.attachments.length > 0);
  const allAttachedTasks = currentMessages.filter(m => !!m.attachedTask);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeChannelId]);

  // Mark channel as read as soon as activeChannelId changes
  useEffect(() => {
    if (activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  }, [activeChannelId]);

  // Sync edit form with active channel
  useEffect(() => {
    if (activeChannel) {
      setEditName(activeChannel.name);
      setEditDesc(activeChannel.description || '');
      setEditAvatar(activeChannel.avatar || '');
    }
  }, [activeChannel.id]);

  // Persist custom stickers
  useEffect(() => {
    try {
      localStorage.setItem('WORKSPACE_CUSTOM_STICKERS', JSON.stringify(userCreatedStickers));
    } catch (e) {
      console.error('Error saving custom stickers:', e);
    }
  }, [userCreatedStickers]);

  // Support ESC key to close any active chat modal / popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettingsModal(false);
        setShowMediaDrawer(false);
        setShowAttachTaskModal(false);
        setShowStickerModal(false);
        setShowChannelModal(false);
        setShowDmModal(false);
        setMessageToDelete(null);
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(activeChannel.id, messageText);
    setMessageText('');
  };

  // REAL FILE UPLOAD HANDLER
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
    const mockBlobUrl = URL.createObjectURL(file);

    const getAttachmentType = (extension: string): 'pdf' | 'document' | 'image' | 'archive' => {
      if (extension === 'pdf') return 'pdf';
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension)) return 'image';
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
      return 'document';
    };

    sendMessage(
      activeChannel.id,
      `📎 Mengunggah dokumen: ${file.name}`,
      [
        {
          name: file.name,
          url: mockBlobUrl,
          type: getAttachmentType(ext),
          size: `${sizeMb === '0.0' ? (file.size / 1024).toFixed(0) + ' KB' : sizeMb + ' MB'}`
        }
      ]
    );
    if (e.target) e.target.value = '';
  };

  // REAL IMAGE UPLOAD HANDLER
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      sendMessage(
        activeChannel.id,
        `📷 Mengunggah foto: ${file.name}`,
        undefined,
        undefined,
        undefined,
        { imageUrl: dataUrl }
      );
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // ATTACH CARD APPROVAL TO CHAT GROUP WITH CUSTOM MESSAGE
  const handleAttachTaskCard = (task: Task, customNote?: string) => {
    const textToSend = customNote?.trim() || messageText.trim() || `Mohon review dan persetujuan untuk tugas: ${task.title}`;
    sendMessage(
      activeChannel.id,
      textToSend,
      undefined,
      undefined,
      undefined,
      { attachedTask: task }
    );
    setMessageText('');
    setAttachTaskCustomNote('');
    setShowAttachTaskModal(false);
  };

  // REAL GROUP AVATAR FILE UPLOAD
  const handleGroupAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleSendSticker = (sticker: StickerData) => {
    sendMessage(activeChannel.id, '', undefined, undefined, sticker);
    setShowStickerModal(false);
  };

  const handleCreateAndSendCustomSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStickerText.trim()) return;

    const newSticker: StickerData = {
      id: 'stk_custom_' + Date.now(),
      text: customStickerText.trim(),
      emoji: customStickerEmoji,
      style: customStickerStyle,
      authorName: currentUser.name
    };

    // Save to user collection
    setUserCreatedStickers(prev => [newSticker, ...prev]);

    // Send to current channel
    sendMessage(activeChannel.id, '', undefined, undefined, newSticker);
    setShowStickerModal(false);
  };

  const handlePhotoStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoStickerFile(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveAndSendPhotoSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoStickerFile) return;

    const newPhotoSticker: StickerData = {
      id: 'stk_photo_' + Date.now(),
      imageUrl: photoStickerFile,
      type: 'custom_photo',
      style: 'custom_photo',
      text: photoStickerCaption.trim() || undefined,
      authorName: currentUser.name
    };

    setUserCreatedStickers(prev => [newPhotoSticker, ...prev]);
    handleSendSticker(newPhotoSticker);
    setPhotoStickerFile(null);
    setPhotoStickerCaption('');
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    createChannel(newChanName, newChanDesc, newChanPrivate, newChanMembers);
    setNewChanName('');
    setNewChanDesc('');
    setNewChanPrivate(false);
    setNewChanMembers([]);
    setShowChannelModal(false);
  };

  // Channels filtering
  const allFiltered = channels.filter(c => {
    if (channelFilter === 'channels' && c.type !== 'channel') return false;
    if (channelFilter === 'direct' && c.type !== 'direct') return false;
    return c.name.toLowerCase().includes(searchChannel.toLowerCase());
  });

  const getDirectUser = (channel: Channel) => {
    if (channel.type !== 'direct' || !channel.otherUserId) return null;
    return users.find(u => u.id === channel.otherUserId);
  };

  const directUser = getDirectUser(activeChannel);

  // Sticker visual style renderer
  const renderStickerBadge = (sticker: StickerData, isMe: boolean) => {
    // Real WhatsApp Photo Sticker rendering
    if (sticker.imageUrl || sticker.type === 'custom_photo') {
      return (
        <div className="group/sticker relative inline-flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 select-none my-1">
          <div className="relative rounded-2xl overflow-hidden p-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-lg shadow-black/10 backdrop-blur-xs">
            <img
              src={sticker.imageUrl}
              alt={sticker.text || 'Stiker Foto'}
              className="h-32 w-32 sm:h-40 sm:w-40 object-contain rounded-xl drop-shadow-md"
            />
          </div>
          {sticker.text && (
            <span className="mt-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200 dark:border-slate-700 max-w-[200px] truncate text-center">
              {sticker.text}
            </span>
          )}
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium mt-0.5">
            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
            <span>{sticker.authorName ? `Stiker Foto • by ${sticker.authorName.split(' ')[0]}` : 'Stiker WhatsApp'}</span>
          </div>
        </div>
      );
    }

    const styleClasses = {
      neon: 'from-violet-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 border-violet-400/30 ring-2 ring-indigo-400/40',
      gold: 'from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25 border-yellow-200 ring-2 ring-amber-300',
      stamp: 'from-red-600 via-rose-600 to-red-700 text-white uppercase tracking-wider shadow-lg shadow-red-600/30 border-2 border-dashed border-red-200 ring-2 ring-red-400',
      emerald: 'from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-emerald-300/40 ring-2 ring-emerald-400/40',
      cyan: 'from-sky-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-300/40 ring-2 ring-cyan-400/40',
      bubble: 'from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 border-pink-300/40 ring-2 ring-pink-400/40',
      custom_photo: 'from-slate-700 to-slate-900 text-white'
    };

    return (
      <div
        className={`group/sticker relative inline-flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br px-5 py-3.5 transition-transform duration-200 hover:scale-105 select-none ${
          (sticker.style && styleClasses[sticker.style]) || styleClasses.neon
        }`}
      >
        <span className="text-3xl filter drop-shadow-sm transition-transform duration-200 group-hover/sticker:rotate-12 group-hover/sticker:scale-110">
          {sticker.emoji}
        </span>
        <span className="text-xs font-bold leading-tight text-center drop-shadow-xs max-w-[180px]">
          {sticker.text}
        </span>
        <div className="flex items-center gap-1 text-[9px] opacity-80 font-medium">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{sticker.authorName ? `by ${sticker.authorName.split(' ')[0]}` : 'Stiker Tim'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Left Sidebar: Seamless Channel & DM Directory */}
      <div
        className={`flex w-full flex-col border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/70 md:w-80 shrink-0 ${
          showMobileList ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Header & Quick Action Buttons */}
        <div className="border-b border-slate-200/80 p-3.5 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
                <Hash className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Chat & Diskusi
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDmModal(true)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Kirim Pesan Langsung (DM)"
              >
                <UserPlus className="h-3 w-3 text-red-600" />
                <span>DM</span>
              </button>
              <button
                onClick={() => setShowChannelModal(true)}
                className="flex items-center gap-1 rounded-xl bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-red-700"
                title="Buat Saluran Baru"
              >
                <Plus className="h-3 w-3" />
                <span>Channel</span>
              </button>
            </div>
          </div>

          {/* Elongated Search Channel */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari obrolan atau rekan kerja..."
              value={searchChannel}
              onChange={e => setSearchChannel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            {searchChannel && (
              <button
                onClick={() => setSearchChannel('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Unified Filter Tabs: Semua, Channel, DM */}
          <div className="mt-2.5 flex items-center gap-1 rounded-xl bg-slate-200/60 p-0.5 dark:bg-slate-800/80">
            <button
              onClick={() => setChannelFilter('all')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setChannelFilter('channels')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'channels'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setChannelFilter('direct')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'direct'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Pesan DM
            </button>
          </div>
        </div>

        {/* Unified Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allFiltered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada obrolan ditemukan.
            </div>
          ) : (
            allFiltered.map(c => {
              const isActive = c.id === activeChannel.id;
              const isDirect = c.type === 'direct';
              const user = isDirect ? getDirectUser(c) : null;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveChannelId(c.id);
                    markChannelAsRead(c.id);
                    setShowMobileList(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs transition duration-150 ${
                    isActive
                      ? 'bg-red-50/90 text-red-700 shadow-2xs dark:bg-red-950/40 dark:text-red-300'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isDirect ? (
                    <div className="relative shrink-0">
                      <img
                        src={user?.avatar || currentUser.avatar}
                        alt={c.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                          user?.status === 'online'
                            ? 'bg-emerald-500'
                            : user?.status === 'busy'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="relative shrink-0">
                      {c.avatar ? (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                        />
                      ) : (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold text-white shadow-2xs transition ${
                            isActive
                              ? 'bg-red-600'
                              : c.name.includes('announc') || c.name.includes('general')
                              ? 'bg-gradient-to-tr from-red-600 to-rose-500'
                              : c.name.includes('tech') || c.name.includes('engine')
                              ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                              : c.name.includes('design') || c.name.includes('product')
                              ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-500'
                              : c.name.includes('titan') || c.name.includes('project')
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                              : 'bg-gradient-to-tr from-slate-700 to-slate-900'
                          }`}
                        >
                          <Hash className="h-4.5 w-4.5" />
                        </div>
                      )}

                      {c.isPrivate && (
                        <span
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-amber-300 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                          title="Saluran Privat (Terkunci)"
                        >
                          <Lock className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`truncate font-semibold ${
                          isActive ? 'text-red-700 dark:text-red-300 font-bold' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isDirect ? c.name : `#${c.name}`}
                      </span>
                      {c.lastMessageTime && (
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {c.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {c.lastMessage || (isDirect ? user?.position : c.description) || 'Mulai obrolan...'}
                      </span>
                      {c.unreadCount ? (
                        <span className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Stream */}
      <div
        className={`flex flex-1 flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-950/40 ${
          showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Chat Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowMobileList(true)}
              className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {activeChannel.type === 'channel' ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  {activeChannel.avatar ? (
                    <img
                      src={activeChannel.avatar}
                      alt={activeChannel.name}
                      className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-2xs font-extrabold">
                      <Hash className="h-5 w-5" />
                    </div>
                  )}
                  {activeChannel.isPrivate && (
                    <span
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-amber-300 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                      title="Saluran Privat (Terkunci)"
                    >
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      #{activeChannel.name}
                    </span>
                    {activeChannel.isPrivate && (
                      <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Privat</span>
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {activeChannel.description || 'Saluran diskusi terpadu anggota tim'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={directUser?.avatar || currentUser.avatar}
                    alt={activeChannel.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                      directUser?.status === 'online'
                        ? 'bg-emerald-500'
                        : directUser?.status === 'busy'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {activeChannel.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {directUser?.status === 'online' ? '● Online' : 'Sedang Sibuk'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="truncate text-slate-500 dark:text-slate-400">
                      {directUser?.position || 'Anggota Tim'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Communication Actions, Media Drawer & Settings */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Star channel toggle */}
            <button
              type="button"
              onClick={() => toggleStarChannel(activeChannel.id)}
              className={`rounded-xl p-2 transition cursor-pointer ${
                activeChannel.isStarred
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={activeChannel.isStarred ? 'Hapus Bintang' : 'Beri Bintang Favorit'}
            >
              <Star className={`h-4 w-4 ${activeChannel.isStarred ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Media & Attachments Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowMediaDrawer(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
              title="Lihat Media & Dokumen Terlampir"
            >
              <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Media ({allImages.length + allDocs.length})</span>
            </button>

            {/* Group / Channel Settings */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Pengaturan Grup Divisi (Member, Foto, Deskripsi)"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Private Call / Group Call Triggers */}
            {activeChannel.type === 'direct' ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startHuddle(`Private Call: ${activeChannel.name}`, 'direct', activeChannel.id, true)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Private Call (1-on-1)"
                >
                  <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startHuddle(`Group Call: #${activeChannel.name}`, 'channel', activeChannel.id, false)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition cursor-pointer"
                  title="Group Call Tim & Share Screen"
                >
                  <Video className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Group Call</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Active Call Live Banner in Channel */}
          {activeHuddle && activeHuddle.targetId === activeChannel.id && (
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs shadow-xs backdrop-blur-md dark:border-emerald-500/30 dark:bg-emerald-950/80 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                  <Video className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {activeHuddle.type === 'direct' ? 'Private Call (1-on-1) Sedang Berlangsung' : 'Group Call Tim Sedang Berlangsung'}
                    </span>
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 truncate">
                    {activeHuddle.participants.length} peserta ({activeHuddle.participants.map(p => p.name.split(' ')[0]).join(', ')})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeHuddle.isMinimized) toggleHuddleMinimize();
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Buka Panggilan
                </button>
                <button
                  type="button"
                  onClick={endHuddle}
                  className="rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  Akhiri
                </button>
              </div>
            </div>
          )}

          {/* Pinned Messages Banner */}
          {pinnedMessages.length > 0 && (
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/95 p-3 text-xs shadow-xs backdrop-blur-md dark:border-amber-900/60 dark:bg-amber-950/90 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 rotate-45" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-900 dark:text-amber-300">
                      Pesan Disematkan ({pinnedMessages.length})
                    </span>
                    <span className="rounded-md bg-amber-200/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Penting
                    </span>
                  </div>
                  <p className="truncate text-amber-800/90 dark:text-amber-200/90 text-[11px] mt-0.5">
                    {pinnedMessages[pinnedMessages.length - 1].content || 'Berkas / Kartu Terlampir'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePinMessage(activeChannel.id, pinnedMessages[pinnedMessages.length - 1].id)}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 dark:text-amber-300 underline shrink-0 cursor-pointer ml-2"
              >
                Lepas Pin
              </button>
            </div>
          )}

          {currentMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                <Hash className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada percakapan di #{activeChannel.name}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Kirim pesan, unggah gambar/dokumen, atau lampirkan card tugas approval untuk memulai koordinasi tim!
              </p>
              <button
                onClick={() => {
                  setShowStickerModal(true);
                  setStickerTab('presets');
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kirim Stiker Pembuka 🎉</span>
              </button>
            </div>
          ) : (
            currentMessages.map(msg => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group/msg ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  )}

                  <div className={`max-w-[85%] sm:max-w-[72%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5">
                      {!isMe && (
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {msg.senderName}
                        </span>
                      )}
                      {msg.isPinned && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Pin className="h-2.5 w-2.5 rotate-45" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {msg.isStarred && (
                        <span className="text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                        </span>
                      )}
                    </div>

                    {/* Sticker Content Rendering with Pop Animation */}
                    {msg.sticker ? (
                      <div className={`my-1 ${isMe ? 'chat-bubble-animate-outgoing' : 'chat-bubble-animate-incoming'}`}>
                        {renderStickerBadge(msg.sticker, isMe)}
                      </div>
                    ) : (
                      <div
                        className={`relative rounded-2xl ${
                          msg.attachedTask || msg.leaveRequest
                            ? `p-4 sm:p-5 space-y-3.5 max-w-xl w-full ${
                                isMe
                                  ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md rounded-tr-xs'
                                  : 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-xs'
                              }`
                            : `px-4 py-2.5 space-y-1 shadow-2xs leading-relaxed ${
                                isMe
                                  ? 'chat-bubble-outgoing rounded-tr-xs chat-bubble-animate-outgoing'
                                  : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/70 rounded-tl-xs chat-bubble-animate-incoming'
                              }`
                        }`}
                      >
                        {/* Standard / Custom Text Message (Omitted when card is present to eliminate duplicate header text) */}
                        {msg.content && !msg.attachedTask && !msg.leaveRequest && (
                          <p className="whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}

                        {/* Image Preview Rendering */}
                        {msg.imageUrl && (
                          <div className="mt-2 overflow-hidden rounded-2xl">
                            <img
                              src={msg.imageUrl}
                              alt="Foto terlampir"
                              onClick={() => setPreviewImage(msg.imageUrl || null)}
                              className="max-h-64 w-full rounded-2xl object-cover hover:opacity-95 shadow-xs cursor-pointer transition"
                            />
                            <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
                              <span>Klik foto untuk memperbesar</span>
                            </div>
                          </div>
                        )}

                        {/* Task Card Approval Single-Layer Card */}
                        {msg.attachedTask && (
                          <div className="space-y-3 text-left">
                            <div className={`flex items-center justify-between gap-2 pb-2.5 ${isMe ? 'border-b border-white/15' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                              <div className="flex items-center gap-1.5">
                                <CheckSquare className={`h-4 w-4 ${isMe ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Task Card Approval
                                </span>
                              </div>
                              <span
                                className={`rounded-lg px-2.5 py-0.5 text-[9px] font-black shadow-2xs ${
                                  msg.attachedTask.status === 'done'
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-amber-300 text-slate-950'
                                }`}
                              >
                                {msg.attachedTask.status === 'done' ? 'DONE (APPROVED)' : 'ON REVIEW'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-black line-clamp-1">{msg.attachedTask.title}</h4>
                              <p className={`text-[11px] ${isMe ? 'text-white/85' : 'text-slate-600 dark:text-slate-300'} line-clamp-1`}>
                                {msg.attachedTask.project} • Assignee: <strong>{msg.attachedTask.assigneeName}</strong>
                              </p>
                              {msg.attachedTask.deadline && (
                                <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                  Deadline: {msg.attachedTask.deadline}
                                </p>
                              )}
                            </div>

                            {/* Manager Approval Buttons inside chat */}
                            <div className={`pt-2.5 flex items-center gap-2 ${isMe ? 'border-t border-white/15' : 'border-t border-slate-200 dark:border-slate-800'}`}>
                              {msg.attachedTask.status === 'done' ? (
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${isMe ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  <Check className="h-4 w-4" />
                                  <span>Card Telah Disetujui Penuh (Selesai/Done)</span>
                                </div>
                              ) : (() => {
                                const isRequester =
                                  currentUser.id === msg.senderId ||
                                  currentUser.id === msg.attachedTask?.approvalRequest?.requestedBy ||
                                  currentUser.id === msg.attachedTask?.reporterId;

                                if (isRequester) {
                                  return (
                                    <div className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                                      isMe
                                        ? 'bg-white/10 text-amber-200'
                                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                                    }`}>
                                      <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                      <span>Menunggu persetujuan rekan / manajer lain (Anda adalah pengaju kartu ini)</span>
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        processTaskApproval(
                                          msg.attachedTask!.id,
                                          currentUser.id,
                                          'declined',
                                          'Ditolak via chat grup'
                                        )
                                      }
                                      className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold text-center transition cursor-pointer ${
                                        isMe
                                          ? 'bg-white/20 hover:bg-white/30 text-white'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white'
                                      }`}
                                    >
                                      ✕ Tolak
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        processTaskApproval(
                                          msg.attachedTask!.id,
                                          currentUser.id,
                                          'approved',
                                          'Disetujui via chat grup'
                                        )
                                      }
                                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-black text-center shadow-xs transition cursor-pointer"
                                    >
                                      ✓ Setujui (Approve)
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Interactive Leave Request Single-Layer Card */}
                        {msg.leaveRequest && (
                          <div className="space-y-3.5 text-left">
                            {/* Card Header */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 ${isMe ? 'border-b border-white/15' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                                  <CalendarCheck className="h-5 w-5" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                                    FORM PENGAJUAN IZIN CUTI
                                  </span>
                                  <h4 className="text-sm font-extrabold leading-tight">
                                    {msg.leaveRequest.leaveTypeLabel}
                                  </h4>
                                </div>
                              </div>
                              <span
                                className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto shadow-2xs ${
                                  msg.leaveRequest.overallStatus === 'fully_approved'
                                    ? 'bg-emerald-500 text-white'
                                    : msg.leaveRequest.overallStatus === 'declined'
                                    ? 'bg-rose-500 text-white'
                                    : msg.leaveRequest.overallStatus === 'boss_approved'
                                    ? 'bg-blue-600 text-white'
                                    : msg.leaveRequest.overallStatus === 'hr_approved'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-amber-400 text-slate-950 font-black'
                                }`}
                              >
                                {msg.leaveRequest.overallStatus === 'fully_approved'
                                  ? '✓ CUTI TELAH DISETUJUI'
                                  : msg.leaveRequest.overallStatus === 'declined'
                                  ? '✕ DITOLAK'
                                  : msg.leaveRequest.overallStatus === 'boss_approved'
                                  ? 'DISETUJUI ATASAN • MENUNGGU HR'
                                  : msg.leaveRequest.overallStatus === 'hr_approved'
                                  ? 'DISETUJUI HR • MENUNGGU ATASAN'
                                  : 'MENUNGGU PERSETUJUAN'}
                              </span>
                            </div>

                            {/* Requester, Dates, Reason, Attachment */}
                            <div className={`p-3 space-y-2 rounded-xl text-xs ${
                              isMe ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'
                            }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="opacity-75">Karyawan Pemohon:</span>
                                <span className="font-bold flex items-center gap-1.5">
                                  <img src={msg.leaveRequest.requesterAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                                  <span>{msg.leaveRequest.requesterName}</span>
                                  <span className="opacity-60 text-[10px]">({msg.leaveRequest.requesterDept})</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="opacity-75">Periode & Durasi:</span>
                                <span className="font-bold font-mono">
                                  {msg.leaveRequest.startDate} s/d {msg.leaveRequest.endDate} ({msg.leaveRequest.totalDays} Hari Kerja)
                                </span>
                              </div>
                              <div className={`pt-1.5 ${isMe ? 'border-t border-white/10' : 'border-t border-slate-200 dark:border-slate-700/50'}`}>
                                <span className="opacity-75 block text-[11px] mb-0.5">Alasan Cuti:</span>
                                <p className="font-medium italic leading-relaxed">
                                  "{msg.leaveRequest.reason}"
                                </p>
                              </div>
                              {msg.leaveRequest.attachmentName && (
                                <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-sky-400">
                                  <span className="flex items-center gap-1.5">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span>{msg.leaveRequest.attachmentName}</span>
                                  </span>
                                  {msg.leaveRequest.attachmentUrl && (
                                    <a
                                      href={msg.leaveRequest.attachmentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline text-[10px] hover:text-sky-300"
                                    >
                                      Lihat Berkas
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Dual Approval Integration Status Rows */}
                            <div className="space-y-2 pt-1">
                              <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                                Progres Persetujuan Ganda (Dual-Approval):
                              </div>
                              {(() => {
                                const isRequester = currentUser.id === msg.leaveRequest?.requesterId;
                                const canApproveBoss =
                                  !isRequester &&
                                  msg.leaveRequest.bossApproval.status === 'pending' &&
                                  (currentUser.id === msg.leaveRequest.bossApproval.approverId ||
                                    currentUser.role === 'super_admin' ||
                                    currentUser.role === 'manager' ||
                                    currentUser.role === 'admin');

                                const canApproveHr =
                                  !isRequester &&
                                  msg.leaveRequest.hrApproval.status === 'pending' &&
                                  (currentUser.id === msg.leaveRequest.hrApproval.approverId ||
                                    currentUser.department.toLowerCase().includes('hr') ||
                                    currentUser.department.toLowerCase().includes('people') ||
                                    currentUser.position.toLowerCase().includes('hr') ||
                                    currentUser.role === 'super_admin');

                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {/* Box 1: Atasan Langsung */}
                                    <div className={`p-3 rounded-xl flex flex-col justify-between ${
                                      msg.leaveRequest.bossApproval.status === 'approved'
                                        ? isMe ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                                        : msg.leaveRequest.bossApproval.status === 'declined'
                                        ? isMe ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                                        : isMe ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'
                                    }`}>
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="font-bold text-[11px]">1. Atasan Langsung:</span>
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                            msg.leaveRequest.bossApproval.status === 'approved'
                                              ? 'bg-emerald-500 text-white'
                                              : msg.leaveRequest.bossApproval.status === 'declined'
                                              ? 'bg-rose-500 text-white'
                                              : 'bg-amber-400 text-slate-950'
                                          }`}>
                                            {msg.leaveRequest.bossApproval.status === 'approved'
                                              ? '✓ SUDAH DISETUJUI'
                                              : msg.leaveRequest.bossApproval.status === 'declined'
                                              ? '✕ DITOLAK'
                                              : '⏳ MENUNGGU'}
                                          </span>
                                        </div>
                                        <div className="font-bold truncate text-[11px]">
                                          {msg.leaveRequest.bossApproval.approverName}
                                        </div>
                                        {msg.leaveRequest.bossApproval.status === 'approved' && (
                                          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                                            <Check className="h-3 w-3 shrink-0" />
                                            <span>Sudah di-approve oleh Atasan Langsung ({msg.leaveRequest.bossApproval.approverName})</span>
                                          </div>
                                        )}
                                        {msg.leaveRequest.bossApproval.status === 'declined' && (
                                          <div className="text-[10px] text-rose-400 font-semibold mt-1">
                                            Ditolak oleh Atasan Langsung
                                          </div>
                                        )}
                                        {msg.leaveRequest.bossApproval.status === 'pending' && !canApproveBoss && (
                                          <div className="text-[10px] opacity-75 font-medium mt-1">
                                            Menunggu persetujuan Atasan Langsung
                                          </div>
                                        )}
                                      </div>

                                      {/* Individual Atasan Action Buttons */}
                                      {canApproveBoss && (
                                        <div className={`mt-3 pt-2 flex items-center gap-2 ${isMe ? 'border-t border-white/15' : 'border-t border-slate-200 dark:border-slate-700'}`}>
                                          <button
                                            type="button"
                                            onClick={() => processLeaveApproval(activeChannel.id, msg.id, 'boss', 'declined')}
                                            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-2 text-xs font-bold transition cursor-pointer shadow-xs text-center"
                                          >
                                            ✕ Tolak
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => processLeaveApproval(activeChannel.id, msg.id, 'boss', 'approved')}
                                            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 text-xs font-black transition cursor-pointer shadow-xs text-center"
                                          >
                                            ✓ Setujui
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Box 2: Tim HR */}
                                    <div className={`p-3 rounded-xl flex flex-col justify-between ${
                                      msg.leaveRequest.hrApproval.status === 'approved'
                                        ? isMe ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                                        : msg.leaveRequest.hrApproval.status === 'declined'
                                        ? isMe ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                                        : isMe ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'
                                    }`}>
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="font-bold text-[11px]">2. Tim HR:</span>
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                            msg.leaveRequest.hrApproval.status === 'approved'
                                              ? 'bg-emerald-500 text-white'
                                              : msg.leaveRequest.hrApproval.status === 'declined'
                                              ? 'bg-rose-500 text-white'
                                              : 'bg-amber-400 text-slate-950'
                                          }`}>
                                            {msg.leaveRequest.hrApproval.status === 'approved'
                                              ? '✓ SUDAH DISETUJUI'
                                              : msg.leaveRequest.hrApproval.status === 'declined'
                                              ? '✕ DITOLAK'
                                              : '⏳ MENUNGGU'}
                                          </span>
                                        </div>
                                        <div className="font-bold truncate text-[11px]">
                                          {msg.leaveRequest.hrApproval.approverName}
                                        </div>
                                        {msg.leaveRequest.hrApproval.status === 'approved' && (
                                          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                                            <Check className="h-3 w-3 shrink-0" />
                                            <span>Sudah di-approve & divalidasi oleh Tim HR ({msg.leaveRequest.hrApproval.approverName})</span>
                                          </div>
                                        )}
                                        {msg.leaveRequest.hrApproval.status === 'declined' && (
                                          <div className="text-[10px] text-rose-400 font-semibold mt-1">
                                            Ditolak oleh Tim HR
                                          </div>
                                        )}
                                        {msg.leaveRequest.hrApproval.status === 'pending' && !canApproveHr && (
                                          <div className="text-[10px] opacity-75 font-medium mt-1">
                                            Menunggu verifikasi & persetujuan Tim HR
                                          </div>
                                        )}
                                      </div>

                                      {/* Individual HR Action Buttons */}
                                      {canApproveHr && (
                                        <div className={`mt-3 pt-2 flex items-center gap-2 ${isMe ? 'border-t border-white/15' : 'border-t border-slate-200 dark:border-slate-700'}`}>
                                          <button
                                            type="button"
                                            onClick={() => processLeaveApproval(activeChannel.id, msg.id, 'hr', 'declined')}
                                            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-2 text-xs font-bold transition cursor-pointer shadow-xs text-center"
                                          >
                                            ✕ Tolak
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => processLeaveApproval(activeChannel.id, msg.id, 'hr', 'approved')}
                                            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 text-xs font-black transition cursor-pointer shadow-xs text-center"
                                          >
                                            ✓ Setujui
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Overall Status Banner */}
                            {msg.leaveRequest.overallStatus === 'fully_approved' && (
                              <div className="pt-2">
                                <div className="rounded-xl bg-emerald-500/20 p-2.5 text-center text-xs font-black text-emerald-300 flex items-center justify-center gap-2">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                  <span>CUTI TELAH RESMI DISETUJUI OLEH ATASAN & HR!</span>
                                </div>
                              </div>
                            )}
                            {msg.leaveRequest.overallStatus === 'declined' && (
                              <div className="pt-2">
                                <div className="rounded-xl bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-300">
                                  Pengajuan cuti ini telah ditolak.
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Document Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className={`flex items-center justify-between rounded-xl p-2.5 text-[11px] ${
                                  isMe
                                    ? 'bg-red-700/60 text-white'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Paperclip className="h-4 w-4 shrink-0 text-blue-300" />
                                  <div className="min-w-0">
                                    <span className="font-bold truncate block">{att.name}</span>
                                    <span className="text-[9px] opacity-75">{att.size}</span>
                                  </div>
                                </div>
                                {att.url && att.url !== '#' && (
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg p-1.5 hover:bg-white/20 transition shrink-0"
                                    title="Unduh Berkas"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions, Pin, Star & Timestamp */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Baru saja</span>
                      {isMe && <CheckCheck className="h-3 w-3 text-red-500" />}

                      {/* Reaction Badges */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex items-center gap-1">
                          {msg.reactions.map(r => (
                            <button
                              key={r.emoji}
                              onClick={() => toggleReaction(activeChannel.id, msg.id, r.emoji)}
                              className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.2 text-[10px] ${
                                r.userIds.includes(currentUser.id)
                                  ? 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span>{r.userIds.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hover Actions: Pin & Star */}
                      <button
                        type="button"
                        onClick={() => togglePinMessage(activeChannel.id, msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title={msg.isPinned ? 'Lepas Pin' : 'Sematkan Pesan (Pin)'}
                      >
                        <Pin className={`h-3 w-3 rotate-45 ${msg.isPinned ? 'text-amber-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleStarMessage(activeChannel.id, msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title={msg.isStarred ? 'Hapus Bintang' : 'Beri Bintang Favorit'}
                      >
                        <Star className={`h-3 w-3 ${msg.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      {/* Hapus Pesan Chat */}
                      {(isMe || currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => setMessageToDelete({
                            channelId: activeChannel.id,
                            messageId: msg.id,
                            previewText: msg.content || (msg.sticker ? 'Stiker' : 'Berkas Lampiran')
                          })}
                          className="transition rounded p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer opacity-100 md:opacity-0 md:group-hover/msg:opacity-100"
                          title="Hapus Pesan"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}

                      {/* Quick Reactions on Hover */}
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '👍')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah jempol"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '🔥')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah api"
                      >
                        🔥
                      </button>
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '❤️')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah hati"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar with Real Upload and Task Card Approval Attach */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shrink-0"
        >
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleDocUpload}
          />
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Real Document Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Unggah Dokumen Nyata (PDF, DOCX, XLSX, ZIP)"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Real Image Upload Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Unggah Foto / Gambar Nyata"
            >
              <ImageIcon className="h-4 w-4 text-emerald-600" />
            </button>

            {/* Attach Card Approval Button */}
            <button
              type="button"
              onClick={() => setShowAttachTaskModal(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Lampirkan Card Tugas untuk Approval Manager"
            >
              <CheckSquare className="h-4 w-4 text-amber-500" />
            </button>

            {/* Form Pengajuan Izin Cuti Button */}
            <button
              type="button"
              onClick={() => setQuickActionModal('leave')}
              className="rounded-xl p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition cursor-pointer"
              title="Form Pengajuan Izin Cuti (Kirim ke Atasan & HR)"
            >
              <CalendarCheck className="h-4 w-4 text-indigo-500" />
            </button>



            {/* Sticker Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowStickerModal(true)}
              className="flex items-center gap-1 rounded-xl p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition"
              title="Buka Stiker & Bikin Stiker Baru"
            >
              <SmilePlus className="h-4 w-4 text-red-600" />
            </button>

            <input
              type="text"
              placeholder={`Tulis pesan di #${activeChannel.name}...`}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs transition hover:bg-red-700 disabled:opacity-40 shrink-0"
              title="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* STICKER PICKER & MAKER STUDIO MODAL */}
      {showStickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stiker Korporat & Pembuat Stiker
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Kirim stiker ekspresif atau rancang stiker custom khas tim kamu!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStickerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="mt-3 flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setStickerTab('presets')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                  stickerTab === 'presets'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Katalog
              </button>
              <button
                type="button"
                onClick={() => setStickerTab('create')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  stickerTab === 'create'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Stiker Teks</span>
              </button>
              <button
                type="button"
                onClick={() => setStickerTab('photo')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  stickerTab === 'photo'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Foto Stiker (WA)</span>
              </button>
            </div>

            {/* TAB 1: PRESET & SAVED STICKERS */}
            {stickerTab === 'presets' && (
              <div className="mt-4 max-h-[380px] overflow-y-auto pr-1 space-y-4">
                {/* User's custom made stickers */}
                {userCreatedStickers.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Stiker Buatanmu ({userCreatedStickers.length})</span>
                      <button
                        onClick={() => setUserCreatedStickers([])}
                        className="text-[10px] font-medium text-slate-400 hover:text-red-500"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {userCreatedStickers.map(stk => (
                        <button
                          key={stk.id}
                          onClick={() => handleSendSticker(stk)}
                          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-red-400 hover:bg-red-50/40 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-red-500/50 transition cursor-pointer"
                        >
                          {renderStickerBadge(stk, false)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular corporate presets */}
                <div>
                  <div className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Stiker Siap Pakai
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {DEFAULT_PRESET_STICKERS.map(stk => (
                      <button
                        key={stk.id}
                        onClick={() => handleSendSticker(stk)}
                        className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 hover:border-red-400 hover:bg-red-50/30 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-red-500/50 transition cursor-pointer"
                      >
                        {renderStickerBadge(stk, false)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE STICKER MAKER STUDIO */}
            {stickerTab === 'create' && (
              <form onSubmit={handleCreateAndSendCustomSticker} className="mt-4 space-y-4">
                {/* Live Preview Display */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pratinjau Hasil Stiker
                  </div>
                  {renderStickerBadge(
                    {
                      id: 'preview',
                      text: customStickerText || 'CONTOH TEKS STIKER',
                      emoji: customStickerEmoji,
                      style: customStickerStyle,
                      authorName: currentUser.name
                    },
                    true
                  )}
                </div>

                {/* Input Slogan / Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teks Stiker (Slogan/Kata-kata)
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    placeholder="misal: ACC BOS 🌟 atau SIAP KAWAL!"
                    value={customStickerText}
                    onChange={e => setCustomStickerText(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>Maksimal 28 karakter untuk tampilan terbaik</span>
                    <span>{customStickerText.length}/28</span>
                  </div>
                </div>

                {/* Select Emoji */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Emotikon Utama
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {['🔥', '🚀', '✅', '⚡', '💡', '🎯', '💰', '🏆', '☕', '🛵', '💪', '🤝', '💯', '🦁', '⭐', '🍕'].map(
                      emo => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setCustomStickerEmoji(emo)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition ${
                            customStickerEmoji === emo
                              ? 'bg-white shadow-xs scale-110 ring-2 ring-red-500 dark:bg-slate-700'
                              : 'hover:bg-white/60 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {emo}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Select Style Theme */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tema Gaya Visual
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'neon', label: 'Neon Cyber', color: 'bg-violet-600' },
                      { key: 'gold', label: 'Gold Luxury', color: 'bg-amber-500' },
                      { key: 'stamp', label: 'Red Stamp', color: 'bg-red-600' },
                      { key: 'emerald', label: 'Emerald OK', color: 'bg-emerald-600' },
                      { key: 'cyan', label: 'Cyan Sky', color: 'bg-cyan-600' },
                      { key: 'bubble', label: 'Pink Pop', color: 'bg-pink-600' }
                    ].map(styleOpt => (
                      <button
                        key={styleOpt.key}
                        type="button"
                        onClick={() => setCustomStickerStyle(styleOpt.key as StickerData['style'])}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                          customStickerStyle === styleOpt.key
                            ? 'border-red-500 bg-red-50/50 font-bold text-red-700 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${styleOpt.color}`} />
                        <span className="truncate">{styleOpt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStickerTab('presets')}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!customStickerText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Kirim & Simpan Stiker</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WHATSAPP PHOTO STICKER MAKER */}
            {stickerTab === 'photo' && (
              <form onSubmit={handleSaveAndSendPhotoSticker} className="mt-4 space-y-4">
                <input
                  type="file"
                  ref={photoStickerInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handlePhotoStickerUpload}
                  className="hidden"
                />

                {photoStickerFile ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/40 p-5 dark:border-red-900/60 dark:bg-red-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                      Pratinjau Stiker WhatsApp
                    </div>

                    {renderStickerBadge(
                      {
                        id: 'photo_preview',
                        imageUrl: photoStickerFile,
                        type: 'custom_photo',
                        style: 'custom_photo',
                        text: photoStickerCaption || undefined,
                        authorName: currentUser.name
                      },
                      true
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoStickerInputRef.current?.click()}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoStickerFile(null);
                          setPhotoStickerCaption('');
                        }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => photoStickerInputRef.current?.click()}
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:border-red-500 hover:bg-red-50/30 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs group-hover:scale-110 transition dark:bg-slate-700">
                        <Camera className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                        Pilih Foto untuk Dijadikan Stiker
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
                        Upload foto dari perangkat Anda (JPG, PNG, WebP). Akan otomatis diformat menjadi stiker WhatsApp interaktif!
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
                        Pilih dari Perangkat
                      </span>
                    </div>

                    {/* Quick Sample Photo Stickers */}
                    <div className="mt-3">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Atau Coba Contoh Foto Cepat:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            name: 'Team Thumbs Up',
                            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=200&q=80'
                          },
                          {
                            name: 'Happy Coffee',
                            url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&h=200&q=80'
                          },
                          {
                            name: 'Victory Cheer',
                            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
                          }
                        ].map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPhotoStickerFile(sample.url);
                              setPhotoStickerCaption('MANTAP TIM! 🔥');
                            }}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-red-500 transition"
                          >
                            <img src={sample.url} alt={sample.name} className="h-full w-full object-cover group-hover:scale-110 transition" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[9px] font-bold text-white text-center truncate px-1">
                              {sample.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Caption Stiker (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="misal: MANTAP BOSKU! 👍 atau GASKEUN!"
                    value={photoStickerCaption}
                    onChange={e => setPhotoStickerCaption(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setStickerTab('presets');
                      setPhotoStickerFile(null);
                      setPhotoStickerCaption('');
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!photoStickerFile}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Kirim & Simpan ke Koleksi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* NEW DIRECT MESSAGE MODAL */}
      {showDmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Mulai Pesan Langsung (DM)
              </h3>
              <button
                onClick={() => setShowDmModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
              {users
                .filter(u => u.id !== currentUser.id)
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      startDirectMessage(user.id);
                      setShowDmModal(false);
                      setShowMobileList(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {user.position} • {user.department}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHANNEL MODAL */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Buat Saluran Tim Baru
              </h3>
              <button
                onClick={() => setShowChannelModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Saluran (Channel)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">#</span>
                  <input
                    type="text"
                    placeholder="project-phoenix atau produk-baru"
                    value={newChanName}
                    onChange={e => setNewChanName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi Saluran
                </label>
                <textarea
                  placeholder="Tujuan atau cakupan diskusi saluran ini..."
                  value={newChanDesc}
                  onChange={e => setNewChanDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="privCheck"
                  checked={newChanPrivate}
                  onChange={e => setNewChanPrivate(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="privCheck" className="text-xs text-slate-700 dark:text-slate-300">
                  Jadikan Saluran Privat (Hanya anggota terdaftar)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
                >
                  Buat Saluran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. ATTACH TASK CARD FOR APPROVAL MODAL */}
      {showAttachTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Lampirkan Card Tugas untuk Approval
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih kartu tugas yang ingin diajukan ke grup #{activeChannel.name}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachTaskModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tidak ada data tugas yang tersedia.
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 hover:border-amber-400 hover:bg-amber-50/30 transition dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-amber-500/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300 uppercase">
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{task.project}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>Assignee: {task.assigneeName}</span>
                        <span>•</span>
                        <span>Prioritas: {task.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttachTaskCard(task)}
                      className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition cursor-pointer"
                    >
                      Lampirkan Card
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MEDIA & DOKUMEN TERLAMPIR DRAWER */}
      {showMediaDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white p-5 shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Media & Berkas Terlampir
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaDrawer(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Tabs */}
            <div className="flex items-center gap-1 my-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setMediaTab('images')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'images'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Foto ({allImages.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('docs')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'docs'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Dokumen ({allDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('tasks')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'tasks'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Card ({allAttachedTasks.length})
              </button>
            </div>

            {/* Media Content Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {mediaTab === 'images' && (
                <div>
                  {allImages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada foto terlampir di obrolan ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {allImages.map(imgMsg => (
                        <div
                          key={imgMsg.id}
                          onClick={() => setPreviewImage(imgMsg.imageUrl || null)}
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                        >
                          <img
                            src={imgMsg.imageUrl}
                            alt="Lampiran"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                            Perbesar
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mediaTab === 'docs' && (
                <div className="space-y-2">
                  {allDocs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada dokumen yang diunggah.
                    </div>
                  ) : (
                    allDocs.flatMap(d => d.attachments || []).map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{att.size}</span>
                          </div>
                        </div>
                        {att.url && att.url !== '#' && (
                          <a
                            href={att.url}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {mediaTab === 'tasks' && (
                <div className="space-y-2.5">
                  {allAttachedTasks.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada kartu tugas yang dilampirkan.
                    </div>
                  ) : (
                    allAttachedTasks.map(msg => {
                      const task = msg.attachedTask!;
                      return (
                        <div
                          key={msg.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {task.project}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              task.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {task.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </h4>
                          <div className="text-[10px] text-slate-400">
                            Assignee: {task.assigneeName} • Deadline: {task.deadline}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PENGATURAN GRUP DIVISI / SALURAN (MANAGE MEMBERS, AVATAR, STARRING) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg my-auto max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-3 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Pengaturan Grup: #{activeChannel.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kelola foto profil/avatar grup, anggota divisi, dan status favorit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Quick Star & Avatar Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="group relative cursor-pointer shrink-0"
                  title="Klik untuk ganti foto profil grup"
                >
                  <img
                    src={
                      editAvatar ||
                      activeChannel.avatar ||
                      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=256&h=256&q=80'
                    }
                    alt={activeChannel.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs group-hover:opacity-75 transition"
                  />
                  {activeChannel.isPrivate && (
                    <span
                      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-amber-300 ring-2 ring-white dark:ring-slate-900 shadow-sm z-10"
                      title="Saluran Privat (Terkunci)"
                    >
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Foto Profil Grup / Divisi
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {activeChannel.memberIds.length} Anggota Terdaftar
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleStarChannel(activeChannel.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeChannel.isStarred
                    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${activeChannel.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{activeChannel.isStarred ? 'Favorit ★' : 'Beri Bintang'}</span>
              </button>
            </div>

            {/* Ubah Foto Profil Grup via File Upload & URL */}
            <div>
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleGroupAvatarUpload}
                className="hidden"
              />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Ubah Foto Profil Grup (Upload dari Perangkat atau URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-red-300 bg-red-50/60 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 transition cursor-pointer shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Foto dari Galeri</span>
                </button>
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="Atau tempel URL gambar..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400 hover:text-red-500"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Description Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi Grup
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Deskripsi peran dan fokus grup..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Manage Members Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kelola Anggota Tim ({activeChannel.memberIds.length} Member)
                </label>
                <span className="text-[10px] text-slate-400">Klik untuk tambah/hapus</span>
              </div>

              <input
                type="text"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Cari anggota tim..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {users
                  .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map(user => {
                    const isMember = activeChannel.memberIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {user.position} • {user.department}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newMembers = isMember
                              ? activeChannel.memberIds.filter(id => id !== user.id)
                              : [...activeChannel.memberIds, user.id];
                            updateChannelSettings(activeChannel.id, { memberIds: newMembers });
                          }}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            isMember
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-950 text-white hover:bg-black dark:bg-white dark:text-slate-900'
                          }`}
                        >
                          {isMember ? 'Hapus' : '+ Tambah'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

            {/* Save Channel Settings */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  updateChannelSettings(activeChannel.id, {
                    avatar: editAvatar.trim() || activeChannel.avatar,
                    description: editDesc.trim() || activeChannel.description
                  });
                  setShowSettingsModal(false);
                }}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black dark:bg-white dark:text-slate-900 transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. IMAGE LIGHTBOX PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Pratinjau Foto"
              className="max-h-[85vh] w-auto rounded-3xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. DELETE MESSAGE CONFIRMATION MODAL */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hapus Pesan Chat Ini?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                  "{messageToDelete.previewText}"
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Pesan yang telah dihapus akan terhapus secara permanen dari percakapan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMessage(messageToDelete.channelId, messageToDelete.messageId);
                  setMessageToDelete(null);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                Hapus Pesan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

