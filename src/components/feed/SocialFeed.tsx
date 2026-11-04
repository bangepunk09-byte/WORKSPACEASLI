import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Pin,
  Send,
  BarChart2,
  Image,
  Paperclip,
  Search,
  Sparkles,
  TrendingUp,
  Tag,
  Share2,
  Trash2,
  CheckCircle2,
  X,
  Maximize2,
  MessageSquare
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Post, Attachment, User } from '../../types';

export const SocialFeed: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    createPost,
    likePost,
    reactToPost,
    bookmarkPost,
    addComment,
    votePoll,
    togglePinPost,
    deletePost,
    customStickers,
    addCustomSticker,
    openEmployeeProfileByName,
    startDirectMessage,
    setActiveTab
  } = useWorkspace();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Reaction picker state
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [activePickerPostId, setActivePickerPostId] = useState<string | null>(null);

  // Advanced Comment feature states
  const [replyingTo, setReplyingTo] = useState<Record<string, { id: string; name: string } | null>>({});
  const [showStickerPicker, setShowStickerPicker] = useState<Record<string, boolean>>({});
  const [showGifPicker, setShowGifPicker] = useState<Record<string, boolean>>({});
  const [showStickerPopover, setShowStickerPopover] = useState<Record<string, boolean>>({});
  const [showGifPopover, setShowGifPopover] = useState<Record<string, boolean>>({});
  const [showMentionDropdown, setShowMentionDropdown] = useState<Record<string, boolean>>({});
  const [mentionCardUser, setMentionCardUser] = useState<User | null>(null);

  const handleMentionClick = (nameWithoutAt: string) => {
    const found = users.find(
      u => u.name.toLowerCase() === nameWithoutAt.toLowerCase() || u.name.toLowerCase().includes(nameWithoutAt.toLowerCase())
    );
    if (found) {
      setMentionCardUser(found);
    }
  };

  // New post state
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'standard' | 'announcement' | 'poll'>('standard');
  const [pollOptionsInput, setPollOptionsInput] = useState(['', '']);
  const [postTags, setPostTags] = useState('');
  const [isExpandingCreator, setIsExpandingCreator] = useState(false);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);
  const [repostToastMsg, setRepostToastMsg] = useState<string | null>(null);

  // Image Upload State for Social Feed
  const [selectedImages, setSelectedImages] = useState<{ name: string; url: string; size: string }[]>([]);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ url: string; title?: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const sizeFormatted = (file.size / 1024).toFixed(0) + ' KB';
      reader.onload = () => {
        if (reader.result) {
          setSelectedImages(prev => [
            ...prev,
            {
              name: file.name,
              url: reader.result as string,
              size: sizeFormatted
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    setIsExpandingCreator(true);
    if (e.target) e.target.value = '';
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'Semua Kiriman' },
    { id: 'announcements', label: '📢 Pengumuman Resmi' },
    { id: 'tech', label: '💻 Tech & Engineering' },
    { id: 'hr', label: '🌿 HR & People Ops' },
    { id: 'polls', label: '📊 Polling Tim' },
  ];

  const computedTrendingHashtags = React.useMemo(() => {
    const counts: Record<string, number> = {};

    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(t => {
          const cleanTag = t.replace(/^#/, '').trim();
          if (cleanTag) {
            counts[cleanTag] = (counts[cleanTag] || 0) + 1;
          }
        });
      }

      const matches = post.content.match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g);
      if (matches) {
        matches.forEach(m => {
          const cleanTag = m.replace(/^#/, '').trim();
          if (cleanTag) {
            counts[cleanTag] = (counts[cleanTag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({
        tag,
        rawCount: count,
        count: `${count} kiriman`
      }))
      .sort((a, b) => b.rawCount - a.rawCount)
      .slice(0, 10);
  }, [posts]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && selectedImages.length === 0) return;

    let pollOptions = undefined;
    if (postType === 'poll') {
      const validOptions = pollOptionsInput.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        setPostErrorMsg('Mohon isi minimal 2 pilihan polling.');
        setTimeout(() => setPostErrorMsg(null), 3000);
        return;
      }
      pollOptions = validOptions.map((text, idx) => ({
        id: 'opt_' + Date.now() + '_' + idx,
        text,
        votes: []
      }));
    }

    const postAttachments: Attachment[] = selectedImages.map(img => ({
      name: img.name,
      url: img.url,
      type: 'image' as const,
      size: img.size
    }));

    createPost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.position,
      authorDept: currentUser.department,
      content: postContent,
      type: postType,
      pollOptions,
      attachments: postAttachments.length > 0 ? postAttachments : undefined,
      tags: postTags.split(',').map(t => t.trim()).filter(Boolean),
      category: postType === 'announcement' ? 'announcements' : 'general',
      isPinned: postType === 'announcement' && currentUser.role === 'super_admin'
    });

    setPostContent('');
    setSelectedImages([]);
    setPollOptionsInput(['', '']);
    setPostType('standard');
    setIsExpandingCreator(false);
  };

  const handleAddPollOption = () => {
    if (pollOptionsInput.length < 5) {
      setPollOptionsInput([...pollOptionsInput, '']);
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptionsInput];
    updated[index] = val;
    setPollOptionsInput(updated);
  };

  const handleCommentSubmit = (postId: string, stickerUrl?: string, gifUrl?: string) => {
    const text = commentInputs[postId] || '';
    if (!text.trim() && !stickerUrl && !gifUrl) return;
    const rep = replyingTo[postId];
    addComment(postId, text, {
      parentId: rep?.id,
      replyToName: rep?.name,
      stickerUrl,
      gifUrl
    });
    setCommentInputs({ ...commentInputs, [postId]: '' });
    setReplyingTo({ ...replyingTo, [postId]: null });
    setShowStickerPicker({ ...showStickerPicker, [postId]: false });
    setShowGifPicker({ ...showGifPicker, [postId]: false });
    setShowMentionDropdown({ ...showMentionDropdown, [postId]: false });
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (activeCategory === 'announcements' && post.type !== 'announcement') return false;
    if (activeCategory === 'polls' && post.type !== 'poll') return false;
    if (activeCategory === 'tech' && post.category !== 'tech') return false;
    if (activeCategory === 'hr' && post.category !== 'hr') return false;

    if (selectedTag && !post.tags.includes(selectedTag)) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(query);
      const matchAuthor = post.authorName.toLowerCase().includes(query);
      const matchTags = post.tags.some(t => t.toLowerCase().includes(query));
      return matchContent || matchAuthor || matchTags;
    }

    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 animate-in fade-in duration-200">
      {/* Main Feed Column (3 cols on large screen) */}
      <div className="space-y-5 lg:col-span-3">
        {postErrorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
            {postErrorMsg}
          </div>
        )}
        {repostToastMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
            {repostToastMsg}
          </div>
        )}
        {/* Post Creation Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
            />
            <div className="flex-1">
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                onFocus={() => setIsExpandingCreator(true)}
                placeholder={`Bagikan update, ide, atau pengumuman perusahaan, ${currentUser.name.split(' ')[0]}...`}
                rows={isExpandingCreator ? 3 : 2}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
              />

              {/* Selected Images Preview Thumbnails */}
              {selectedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <img src={img.url} alt={img.name} className="h-16 w-16 sm:h-20 sm:w-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(idx)}
                        className="absolute top-1 right-1 rounded-full bg-black/75 p-1 text-white hover:bg-red-600 transition cursor-pointer"
                        title="Hapus foto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate px-1">
                        {img.size}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:border-red-400 transition cursor-pointer"
                  >
                    <Image className="h-4 w-4 mb-0.5" />
                    <span className="text-[10px] font-bold">+ Foto</span>
                  </button>
                </div>
              )}

              {/* Poll options if poll type selected */}
              {postType === 'poll' && (
                <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Opsi Polling:
                  </div>
                  {pollOptionsInput.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Pilihan ${i + 1}`}
                      value={opt}
                      onChange={e => handlePollOptionChange(i, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  ))}
                  {pollOptionsInput.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      + Tambah Pilihan
                    </button>
                  )}
                </div>
              )}

              {/* Creator Controls */}
              {isExpandingCreator && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Hidden Native File Input for Images */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {/* Image Attachment Trigger Button */}
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200/70 dark:border-slate-700"
                      title="Kirim Foto / Gambar"
                    >
                      <Image className="h-3.5 w-3.5 text-red-500" />
                      <span>Kirim Gambar {selectedImages.length > 0 && `(${selectedImages.length})`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostType('standard')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        postType === 'standard'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      Standar
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostType('poll')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        postType === 'poll'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span>Polling</span>
                    </button>

                    {(currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'manager') && (
                      <button
                        type="button"
                        onClick={() => setPostType('announcement')}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          postType === 'announcement'
                            ? 'bg-red-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        📢 Pengumuman
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpandingCreator(false);
                        setSelectedImages([]);
                        setPostType('standard');
                      }}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={!postContent.trim() && selectedImages.length === 0}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Post</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Elongated Search Bar */}
        <div className="space-y-3">
          {/* Elongated Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari postingan, topik hashtag #, pembuat pengumuman, atau konten feed..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  setSelectedTag(null);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === c.id && !selectedTag
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
            <span>Filter tag aktif: <strong>#{selectedTag}</strong></span>
            <button
              onClick={() => setSelectedTag(null)}
              className="font-bold underline ml-auto text-[11px]"
            >
              Hapus Filter
            </button>
          </div>
        )}

        {/* Feed Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <Sparkles className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                Tidak ada kiriman yang sesuai
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau kategori filter Anda.
              </p>
            </div>
          ) : (
            filteredPosts.map(post => {
              const hasLiked = post.likes.includes(currentUser.id);
              const hasBookmarked = post.bookmarks.includes(currentUser.id);
              const isAuthor = post.authorId === currentUser.id;
              const canModerate = currentUser.role === 'super_admin' || currentUser.role === 'admin';
              const showComments = expandedComments[post.id];

              return (
                <article
                  key={post.id}
                  className={`rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                    post.isPinned
                      ? 'border-red-200 bg-red-50/20 dark:border-red-900/50 dark:bg-red-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Pinned banner */}
                  {post.isPinned && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                      <Pin className="h-3.5 w-3.5 fill-red-600" />
                      <span>Pengumuman Tersemat Perusahaan (Pinned)</span>
                    </div>
                  )}

                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                            {post.authorName}
                          </span>
                          {post.type === 'announcement' && (
                            <span className="rounded-md bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                              Official
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {post.authorRole} • {post.authorDept.split('&')[0]}
                        </div>
                      </div>
                    </div>

                    {/* Post actions menu */}
                    <div className="flex items-center gap-1">
                      {canModerate && (
                        <button
                          onClick={() => togglePinPost(post.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                          title={post.isPinned ? 'Lepas sematan' : 'Sematkan ke atas'}
                        >
                          <Pin className={`h-4 w-4 ${post.isPinned ? 'fill-red-600 text-red-600' : ''}`} />
                        </button>
                      )}
                      {(isAuthor || canModerate) && (
                        <button
                          onClick={() => deletePost(post.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                          title="Hapus kiriman"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mt-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 sm:text-sm whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Poll Options Card */}
                  {post.pollOptions && (
                    <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 dark:border-slate-800 dark:bg-slate-800/60">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Pilih opsi Anda (klik untuk vote):
                      </div>
                      {(() => {
                        const totalVotes = post.pollOptions.reduce((s, o) => s + o.votes.length, 0);
                        return post.pollOptions.map(opt => {
                          const hasVotedThis = opt.votes.includes(currentUser.id);
                          const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => votePoll(post.id, opt.id)}
                              className={`relative w-full overflow-hidden rounded-xl border p-2.5 text-left transition ${
                                hasVotedThis
                                  ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                              }`}
                            >
                              <div
                                style={{ width: `${pct}%` }}
                                className="absolute inset-y-0 left-0 bg-red-100/60 dark:bg-red-950/40 transition-all duration-300"
                              />
                              <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                                <span className="flex items-center gap-2">
                                  {hasVotedThis && <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />}
                                  {opt.text}
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                  {pct}% ({opt.votes.length} suara)
                                </span>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {/* Photo & Image Attachments Gallery */}
                  {post.attachments && post.attachments.filter(a => a.type === 'image').length > 0 && (
                    <div className="mt-3">
                      {(() => {
                        const imgs = post.attachments.filter(a => a.type === 'image');
                        if (imgs.length === 1) {
                          return (
                            <div
                              onClick={() => setActiveLightboxImage({ url: imgs[0].url, title: imgs[0].name })}
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 max-h-[380px] cursor-pointer"
                            >
                              <img
                                src={imgs[0].url}
                                alt={imgs[0].name}
                                className="w-full h-full max-h-[380px] object-cover transition duration-300 group-hover:scale-[1.01]"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs shadow-md">
                                  <Maximize2 className="h-3.5 w-3.5" />
                                  <span>Lihat Foto Penuh</span>
                                </span>
                              </div>
                            </div>
                          );
                        }
                        if (imgs.length === 2) {
                          return (
                            <div className="grid grid-cols-2 gap-2">
                              {imgs.map((img, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setActiveLightboxImage({ url: img.url, title: img.name })}
                                  className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 h-44 sm:h-52 cursor-pointer"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="h-5 w-5 text-white drop-shadow" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-3 gap-2">
                            {imgs.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setActiveLightboxImage({ url: img.url, title: img.name })}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 h-32 sm:h-40 cursor-pointer"
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                />
                                {idx === 2 && imgs.length > 3 ? (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-base font-black backdrop-blur-xs">
                                    +{imgs.length - 3} Foto
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="h-4 w-4 text-white drop-shadow" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Non-Image File Attachments */}
                  {post.attachments && post.attachments.filter(a => a.type !== 'image').length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.attachments.filter(a => a.type !== 'image').map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Paperclip className="h-3.5 w-3.5 text-red-600" />
                          <span className="font-medium">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Pills & Animated Emoji Picker */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 relative">
                    {(() => {
                      const availableEmojis = ['😍', '❤️', '🔥', '⚡', '🤝', '👍', '🎉', '🚀'];
                      const postReactions = post.reactions && post.reactions.length > 0 ? post.reactions : [
                        { emoji: '😍', userIds: post.likes.slice(0, 14) },
                        { emoji: '❤️', userIds: post.likes },
                        { emoji: '🔥', userIds: post.likes.slice(0, 35) },
                        { emoji: '⚡', userIds: post.likes.slice(0, 19) },
                        { emoji: '🤝', userIds: post.likes.slice(0, 22) }
                      ];

                      const userReactedEmojis = postReactions
                        .filter(r => r.userIds.includes(currentUser.id))
                        .map(r => r.emoji);

                      const unchosenEmojis = availableEmojis.filter(e => !userReactedEmojis.includes(e));

                      return (
                        <>
                          {postReactions.map(r => {
                            const hasUser = r.userIds.includes(currentUser.id);
                            return (
                              <button
                                key={r.emoji}
                                onClick={() => reactToPost(post.id, r.emoji)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${
                                  hasUser
                                    ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300 font-bold'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <span>{r.emoji}</span>
                                <span>{r.userIds.length}</span>
                              </button>
                            );
                          })}

                          {/* Hover / Click Emoji Picker Trigger */}
                          <div
                            className="relative"
                            onMouseEnter={() => setHoveredPostId(post.id)}
                            onMouseLeave={() => setHoveredPostId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => setActivePickerPostId(activePickerPostId === post.id ? null : post.id)}
                              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 transition cursor-pointer shadow-2xs"
                              title="Tambah reaksi emoji"
                            >
                              <span>+</span>
                              <span>😊</span>
                            </button>

                            {/* Popup Animated Emoji Picker (disappears already chosen emojis) */}
                            {(hoveredPostId === post.id || activePickerPostId === post.id) && unchosenEmojis.length > 0 && (
                              <div className="absolute bottom-full mb-2 left-0 z-30 flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                {unchosenEmojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      reactToPost(post.id, emoji);
                                      setActivePickerPostId(null);
                                      setHoveredPostId(null);
                                    }}
                                    className="h-9 w-9 flex items-center justify-center rounded-xl text-xl transition transform hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title={`Reaksi ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Interaction Bar */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-slate-500">
                    <div className="flex items-center gap-4">
                      {/* Comment button */}
                      <button
                        onClick={() =>
                          setExpandedComments({
                            ...expandedComments,
                            [post.id]: !showComments
                          })
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments.length} Komentar</span>
                      </button>

                      {/* Repost button */}
                      <button
                        onClick={() => {
                          setRepostToastMsg('Kiriman berhasil dibagikan ulang (reposted)!');
                          setTimeout(() => setRepostToastMsg(null), 3000);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold hover:text-emerald-600 transition cursor-pointer"
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span>{post.reposts.length} Bagikan</span>
                      </button>
                    </div>

                    {/* Bookmark button */}
                    <button
                      onClick={() => bookmarkPost(post.id)}
                      className={`rounded-lg p-1.5 transition ${
                        hasBookmarked ? 'text-red-600' : 'hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      title={hasBookmarked ? 'Hapus simpanan' : 'Simpan kiriman'}
                    >
                      <Bookmark className={`h-4 w-4 ${hasBookmarked ? 'fill-red-600' : ''}`} />
                    </button>
                  </div>

                  {/* Comments Section - Always Visible (Max 4 initially with Show More) */}
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {/* Comments list */}
                    <div className="space-y-2.5">
                      {(() => {
                        const commentsList = showComments ? post.comments : post.comments.slice(0, 4);
                        return commentsList.map(c => (
                          <div key={c.id} className={`flex gap-2.5 text-xs ${c.parentId ? 'ml-6 sm:ml-8 border-l-2 border-red-200 dark:border-red-900/50 pl-2.5' : ''}`}>
                            <img
                              src={c.authorAvatar}
                              alt={c.authorName}
                              className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1 rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-800/70">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {c.authorName}
                                  {c.replyToName && (
                                    <span className="text-[10px] font-normal text-slate-400">
                                      membalas @{c.replyToName}
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">Baru saja</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyingTo({
                                        ...replyingTo,
                                        [post.id]: { id: c.id, name: c.authorName }
                                      })
                                    }
                                    className="text-[10px] font-bold text-red-600 hover:underline dark:text-red-400 cursor-pointer"
                                  >
                                    Balas
                                  </button>
                                </div>
                              </div>
                              <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {c.content.split(' ').map((word, idx) => {
                                  if (word.startsWith('@')) {
                                    const nameWithoutAt = word.substring(1).replace(/[,.]/g, '');
                                    return (
                                      <span
                                        key={idx}
                                        onClick={() => handleMentionClick(nameWithoutAt)}
                                        className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer inline-block mx-0.5"
                                      >
                                        {word}{' '}
                                      </span>
                                    );
                                  }
                                  return word + ' ';
                                })}
                              </p>

                              {/* Sticker attachment in comment */}
                              {c.stickerUrl && (
                                <div className="mt-2">
                                  <img src={c.stickerUrl} alt="sticker" className="h-20 w-20 object-contain rounded-xl" />
                                </div>
                              )}

                              {/* GIF attachment in comment */}
                              {c.gifUrl && (
                                <div className="mt-2 overflow-hidden rounded-xl max-w-xs">
                                  <img src={c.gifUrl} alt="gif" className="max-h-36 w-full object-cover rounded-xl" />
                                </div>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Show More / Show Less Comments Button */}
                    {post.comments.length > 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedComments({
                            ...expandedComments,
                            [post.id]: !showComments
                          })
                        }
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 cursor-pointer"
                      >
                        {showComments ? 'Tutup Komentar' : `Lihat ${post.comments.length - 4} komentar lainnya...`}
                      </button>
                    )}

                    {/* Replying banner */}
                    {replyingTo[post.id] && (
                      <div className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-1.5 text-xs text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        <span>Membalas <strong>@{replyingTo[post.id]?.name}</strong></span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo({ ...replyingTo, [post.id]: null })}
                          className="font-bold hover:underline text-[11px]"
                        >
                          Batal
                        </button>
                      </div>
                    )}

                    {/* Add comment input & Pickers */}
                    <div className="relative">
                      {/* Sticker Picker Popover */}
                      {showStickerPopover[post.id] && (
                        <div className="absolute bottom-full mb-2 left-0 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in">
                          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Pilih / Tambah Stiker</span>
                            <button
                              type="button"
                              onClick={() => {
                                const name = prompt('Nama stiker baru:');
                                const url = prompt('URL gambar stiker (PNG/JPG):');
                                if (name && url) {
                                  addCustomSticker(name, url);
                                }
                              }}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-700 cursor-pointer transition"
                            >
                              + Stiker Baru
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                            {customStickers.map(stk => (
                              <button
                                key={stk.id}
                                type="button"
                                onClick={() => handleCommentSubmit(post.id, stk.url, undefined)}
                                className="group flex flex-col items-center rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title={stk.name}
                              >
                                <img src={stk.url} alt={stk.name} className="h-12 w-12 object-cover rounded-lg" />
                                <span className="mt-1 text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">{stk.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GIF Picker Popover */}
                      {showGifPopover[post.id] && (
                        <div className="absolute bottom-full mb-2 left-0 z-30 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 w-72 animate-in fade-in">
                          <div className="col-span-2 text-[11px] font-bold text-slate-500 mb-1">Pilih GIF Reaksi:</div>
                        {[
                          { name: 'Celebration', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Handshake', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Coffee Break', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Ideas', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&auto=format&fit=crop&q=80' }
                        ].map(gif => (
                          <button
                            key={gif.name}
                            type="button"
                            onClick={() => handleCommentSubmit(post.id, undefined, gif.url)}
                            className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 h-20 hover:scale-[1.02] transition cursor-pointer"
                          >
                            <img src={gif.url} alt={gif.name} className="w-full h-full object-cover" />
                            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5">
                              {gif.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Mention Dropdown */}
                    {showMentionDropdown[post.id] && (
                      <div className="absolute bottom-full mb-2 left-0 z-30 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 w-64 animate-in fade-in">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400">Mention Rekan Kerja:</div>
                        {users.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              const currentVal = commentInputs[post.id] || '';
                              const lastAtIndex = currentVal.lastIndexOf('@');
                              const newVal = lastAtIndex !== -1 ? currentVal.substring(0, lastAtIndex) + `@${u.name} ` : currentVal + `@${u.name} `;
                              setCommentInputs({ ...commentInputs, [post.id]: newVal });
                              setShowMentionDropdown({ ...showMentionDropdown, [post.id]: false });
                            }}
                            className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.position}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <img
                        src={currentUser.avatar}
                        alt="me"
                        className="h-7 w-7 rounded-full object-cover shrink-0"
                      />
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Tulis balasan komentar... (ketik @ untuk mention)"
                          value={commentInputs[post.id] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setCommentInputs({ ...commentInputs, [post.id]: val });
                            if (val.endsWith('@') || val.includes('@')) {
                              setShowMentionDropdown({ ...showMentionDropdown, [post.id]: true });
                            } else {
                              setShowMentionDropdown({ ...showMentionDropdown, [post.id]: false });
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-28 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 dark:bg-slate-800/95 px-1.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              setShowStickerPopover({ ...showStickerPopover, [post.id]: !showStickerPopover[post.id] });
                              setShowGifPopover({ ...showGifPopover, [post.id]: false });
                            }}
                            className="flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Kirim Stiker"
                          >
                            <span>🏷️</span>
                            <span className="hidden sm:inline">Stiker</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowGifPopover({ ...showGifPopover, [post.id]: !showGifPopover[post.id] });
                              setShowStickerPopover({ ...showStickerPopover, [post.id]: false });
                            }}
                            className="flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Kirim GIF"
                          >
                            <span>🎞️</span>
                            <span className="hidden sm:inline">GIF</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer shrink-0"
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Trending Topics & Feed Rules */}
      <div className="space-y-5">
        {/* Trending Hashtags Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Trending Topics
            </h3>
          </div>
          {computedTrendingHashtags.length === 0 ? (
            <div className="py-5 text-center">
              <Tag className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600 mb-1.5" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Belum ada topik populer.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                Tulis #tag di postingan Anda untuk memulai trending topic.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {computedTrendingHashtags.map(t => (
                <div
                  key={t.tag}
                  onClick={() => setSelectedTag(t.tag)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600">
                      #{t.tag}
                    </div>
                    <div className="text-[10px] text-slate-400">{t.count}</div>
                  </div>
                  <Tag className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Corporate Guidelines Card */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/40">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Etika Komunikasi Feed
          </h4>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Feed internal WORKSPACE dirancang untuk meningkatkan transparansi, kolaborasi lintas divisi, dan pertukaran ide positif perusahaan. Jaga kerahasiaan data kredensial dan patuhi pedoman kode etik korporat.
          </p>
        </div>
      </div>

      {/* Lightbox Modal for Social Feed Images */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeLightboxImage.url}
              alt={activeLightboxImage.title || 'Foto Kiriman'}
              className="max-h-[85vh] w-auto object-contain rounded-2xl"
            />
            {activeLightboxImage.title && (
              <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent p-4 text-xs font-bold text-white">
                {activeLightboxImage.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mention Employee Profile Card Modal */}
      {mentionCardUser && (
        <div
          onClick={() => setMentionCardUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={() => setMentionCardUser(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <img
                src={mentionCardUser.avatar}
                alt={mentionCardUser.name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md mb-3"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mentionCardUser.name}
              </h3>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">
                {mentionCardUser.position}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {mentionCardUser.department} • {mentionCardUser.location}
              </p>

              <div className="mt-4 w-full space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-left text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Email Kantor:</span>
                  <span className="font-medium">{mentionCardUser.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Nomor Telepon:</span>
                  <span className="font-medium">{mentionCardUser.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600 capitalize">{mentionCardUser.status}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    startDirectMessage(mentionCardUser.id);
                    setMentionCardUser(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Kirim Pesan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMentionCardUser(null);
                    setActiveTab('directory');
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Direktori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
