import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Minimize2,
  Maximize2,
  Smile,
  Users,
  Send,
  X,
  Pin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hand,
  Volume2,
  Check,
  Radio,
  MessageSquare,
  Sparkles,
  Disc,
  StopCircle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { soundEffects } from '../../services/soundEffects';

export const HuddleRoom: React.FC = () => {
  const {
    activeHuddle,
    endHuddle,
    toggleHuddleMinimize,
    toggleHuddleMic,
    toggleHuddleVideo,
    toggleHuddleScreenShare,
    toggleHuddleRecording,
    sendHuddleReaction,
    currentUser,
    users
  } = useWorkspace();

  const [callDuration, setCallDuration] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number; duration: number; delay: number; rotate: number }[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [recordingToast, setRecordingToast] = useState<string | null>(null);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState<'video' | 'audio' | null>(null);

  // Toggleable Panels to prevent any UI overlapping
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(true);

  // Pinning / focused participant on main stage (for group call)
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);

  // Bottom carousel scroll window index (for group call)
  const [carouselIndex, setCarouselIndex] = useState(0);

  // In-Call Chat Messages & Polls
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [pollQuestionInput, setPollQuestionInput] = useState('');
  const [pollOptionsInput, setPollOptionsInput] = useState(['', '']);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Call duration timer
  useEffect(() => {
    if (!activeHuddle) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHuddle]);

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentParticipant = activeHuddle?.participants.find(p => p.id === currentUser.id);
  const isVideoOn = currentParticipant?.isVideoOn ?? false;
  const isMuted = currentParticipant?.isMuted ?? false;
  const isScreenSharing = currentParticipant?.isScreenSharing ?? false;
  const isRecording = activeHuddle?.isRecording ?? false;

  // ESC key to minimize call
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeHuddle && !activeHuddle.isMinimized) {
        toggleHuddleMinimize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHuddle, toggleHuddleMinimize]);

  // Handle webcam video and audio stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeHuddle && (isVideoOn || !isMuted)) {
      navigator.mediaDevices
        ?.getUserMedia({ video: isVideoOn, audio: !isMuted })
        .then(s => {
          stream = s;
          setMediaStream(s);
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setMediaStream(null);
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn, isMuted, activeHuddle]);

  // Handle Screen Sharing logic is moved to click handler
  // to comply with browser security constraints for getDisplayMedia.

  if (!activeHuddle) return null;

  // Prepare participants list
  const participants = activeHuddle.participants.length > 0 ? activeHuddle.participants : [
    {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: currentUser.position || 'Team Member',
      isMuted: false,
      isVideoOn: true,
      isSpeaking: true
    }
  ];

  // 1-on-1 condition: either direct call type OR participants count is exactly 2
  const isOneOnOne = activeHuddle.type === 'direct' || participants.length === 2;

  // In 1-on-1: find the other participant
  const remoteParticipant = isOneOnOne
    ? participants.find(p => p.id !== currentUser.id) || {
        id: 'remote_user',
        name: activeHuddle.title.replace('Call with ', '').replace('Huddle: ', '') || 'Rahmat Hidayat',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=800&q=80',
        role: 'Technology & Engineering',
        isMuted: false,
        isVideoOn: true,
        isSpeaking: true
      }
    : null;

  // Active/pinned speaker on main video stage (for group call)
  const mainSpeaker = pinnedParticipantId
    ? participants.find(p => p.id === pinnedParticipantId) || participants[0]
    : participants.find(p => p.id !== currentUser.id && p.isSpeaking) ||
      participants.find(p => p.id !== currentUser.id) ||
      participants[0];

  // Trigger floating reaction animation
  const handleSendReaction = (emoji: string) => {
    sendHuddleReaction(emoji);
    
    // Create more emojis for a "meriah" effect
    const count = 15;
    const newEmojis = Array.from({ length: count }).map(() => ({
      id: Date.now() + Math.random(),
      emoji,
      // Randomize trajectories for confetti-like effect
      left: Math.floor(Math.random() * 90) + 5, // 5% to 95%
      duration: Math.floor(Math.random() * 2000) + 1500, // 1.5s to 3.5s
      delay: Math.random() * 500,
      rotate: Math.floor(Math.random() * 360)
    }));
    
    setFloatingEmojis(prev => [...prev, ...newEmojis]);
    
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => !newEmojis.some(ne => ne.id === e.id)));
    }, 4000);
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          toggleHuddleScreenShare();
          setScreenStream(null);
        };
        toggleHuddleScreenShare();
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      toggleHuddleScreenShare();
    }
  };

  const handleToggleHandRaise = () => {
    soundEffects.playHandRaiseSound();
    setIsHandRaised(!isHandRaised);
  };

  const handleToggleRecord = () => {
    toggleHuddleRecording();
    if (!isRecording) {
      setRecordingToast('Perekaman panggilan aktif • Disimpan ke Google Drive');
    } else {
      setRecordingToast('Perekaman dihentikan & disimpan ke arsip rapat.');
    }
    setTimeout(() => {
      setRecordingToast(null);
    }, 3500);
  };

  const handleSendInCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: 'msg_' + Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
    ]);
    setChatInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleVotePoll = (msgId: string, optionId: string) => {
    setChatMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId || !m.pollData) return m;
        const updatedOptions = m.pollData.options.map((opt: { id: string; text: string; votes: string[] }) => {
          const filteredVotes = opt.votes.filter((id: string) => id !== currentUser.id);
          if (opt.id === optionId) {
            return { ...opt, votes: [...filteredVotes, currentUser.id] };
          }
          return { ...opt, votes: filteredVotes };
        });
        return {
          ...m,
          pollData: { ...m.pollData, options: updatedOptions }
        };
      })
    );
  };

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestionInput.trim()) return;
    const validOpts = pollOptionsInput.filter(o => o.trim().length > 0);
    if (validOpts.length < 2) return;

    const newPollMsg = {
      id: 'poll_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'poll' as const,
      pollData: {
        question: pollQuestionInput,
        options: validOpts.map((text, idx) => ({
          id: 'opt_' + idx + '_' + Date.now(),
          text,
          votes: []
        }))
      }
    };

    setChatMessages(prev => [...prev, newPollMsg]);
    setPollQuestionInput('');
    setPollOptionsInput(['', '']);
    setShowCreatePollModal(false);
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Carousel navigation (for group call)
  const visibleCarouselCount = 3;
  const maxCarouselStart = Math.max(0, participants.length - visibleCarouselCount);
  const handlePrevCarousel = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
  };
  const handleNextCarousel = () => {
    setCarouselIndex(prev => Math.min(maxCarouselStart, prev + 1));
  };

  // 1. FLOATING MINIMIZED WIDGET
  if (activeHuddle.isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 text-slate-900 px-4 py-2.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold leading-tight truncate max-w-[150px]">
              {activeHuddle.title}
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
          <button
            type="button"
            onClick={toggleHuddleMic}
            className={`rounded-full p-2 transition cursor-pointer ${
              isMuted
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleHuddleVideo}
            className={`rounded-full p-2 transition cursor-pointer ${
              isVideoOn
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title={isVideoOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {isVideoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleHuddleMinimize}
            className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Perbesar Layar Panggilan"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={endHuddle}
            className="rounded-full bg-rose-600 p-2 text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
            title="Tinggalkan Panggilan"
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. EXPANDED FULL-SCREEN CALL INTERFACE
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Floating Animated Emojis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            style={{ 
              left: `${item.left}%`,
              animationDuration: `${item.duration}ms`,
              animationDelay: `${item.delay}ms`,
              transform: `rotate(${item.rotate}deg)`
            }}
            className="absolute bottom-[-50px] text-3xl sm:text-5xl animate-emoji-fly"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Container - Non-overlapping flex layout */}
      <div className="relative w-full max-w-[1450px] h-[94vh] flex flex-col rounded-[32px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* ================= 1. TOP HEADER BAR ================= */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleHuddleMinimize}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs shrink-0"
              title="Perkecil ke Widget (Esc)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {activeHuddle.title || 'Ever Weekly Meet, 15 June 2026'}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  {isOneOnOne ? '1-on-1 Split Screen' : `${participants.length} Peserta`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatDuration(callDuration)}
                </span>
                <span>•</span>
                <span>HD Audio & Video Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Recording Indicator */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-rose-500/20'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Klik untuk Jeda/Mulai Rekam Panggilan"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
              <span>{isRecording ? 'Recording' : 'Record'}</span>
            </button>

            {/* Toggle Chat Panel */}
            <button
              type="button"
              onClick={() => setShowChatPanel(!showChatPanel)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                showChatPanel
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300'
              }`}
              title="Buka/Tutup Chat Panggilan"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
              <span className="rounded-full bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 font-black">
                {chatMessages.length}
              </span>
            </button>
          </div>
        </div>

        {/* Optional Recording Toast Notification */}
        {recordingToast && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-1.5 px-4 text-center animate-in fade-in shrink-0">
            {recordingToast}
          </div>
        )}

        {/* ================= 2. MIDDLE WORKSPACE CONTENT ================= */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
          
          {/* ================= LEFT / CENTER VIDEO STAGE ================= */}
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            
            {/* If 1-on-1: Render SPLIT SCREEN KANAN KIRI */}
            {isOneOnOne && remoteParticipant ? (
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 overflow-hidden">
                {/* 1. Left Tile: Local User (You) */}
                <div className="relative rounded-[28px] overflow-hidden bg-slate-900 border-2 border-slate-700/60 dark:border-slate-800 shadow-md flex items-center justify-center group h-full min-h-[220px]">
                  {isScreenSharing ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {screenStream ? (
                        <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-4">
                          <Monitor className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
                          <p className="text-xs font-bold text-white mt-2">Layar Anda Sedang Dibagikan</p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 rounded-xl bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/40">
                        🖥️ Layar Anda
                      </div>
                    </div>
                  ) : isVideoOn ? (
                    mediaStream ? (
                      <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover opacity-90 transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    )
                  ) : (
                    /* Camera Turned Off Tile */
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="relative">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-700/80 shadow-lg"
                        />
                        <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center text-white">
                          <VideoOff className="h-3 w-3" />
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                        <span className="text-[11px] text-slate-400">Kamera Dinonaktifkan</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient Bottom Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Left Info Tag */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 shadow-xs">
                    <img src={currentUser.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{currentUser.name}</span>
                    <span className="rounded-md bg-emerald-500/90 text-white px-1.5 py-0.2 text-[9px] font-black">You</span>
                  </div>

                  {/* Bottom Right Mic & Status Indicators */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-white shadow-xs ${
                        isMuted ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      title={isMuted ? 'Mikrofon Mati' : 'Mikrofon Aktif'}
                    >
                      {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-white shadow-xs ${
                        isVideoOn ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      title={isVideoOn ? 'Kamera Aktif' : 'Kamera Mati'}
                    >
                      {isVideoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>

                {/* 2. Right Tile: Remote Participant */}
                <div className="relative rounded-[28px] overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-md flex items-center justify-center group h-full min-h-[220px]">
                  <img
                    src={remoteParticipant.avatar}
                    alt={remoteParticipant.name}
                    className="w-full h-full object-cover opacity-95 transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Top Right Speaking Waveform Indicator */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-xs">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>Speaking</span>
                  </div>

                  {/* Bottom Left Info Tag */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 shadow-xs">
                    <img src={remoteParticipant.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">{remoteParticipant.name}</span>
                      <span className="text-[9px] text-slate-300">{remoteParticipant.role}</span>
                    </div>
                  </div>

                  {/* Bottom Right Remote Controls */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                      <Mic className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Group Call Mode (Stage + Bottom Strip) */
              <div className="flex-1 min-h-0 flex flex-col justify-between space-y-3 overflow-hidden">
                {/* Main Hero Stage */}
                <div className="flex-1 min-h-[240px] relative rounded-[28px] overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900 flex items-center justify-center group">
                  {isScreenSharing ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {screenStream ? (
                        <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-4">
                          <Monitor className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
                          <p className="text-xs font-bold text-white mt-2">Layar Anda Sedang Ditampilkan</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/40">
                        🖥️ Presentasi Layar Aktif
                      </div>
                    </div>
                  ) : mainSpeaker.id === currentUser.id && isVideoOn && mediaStream ? (
                    <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                      <img
                        src={mainSpeaker.avatar}
                        alt={mainSpeaker.name}
                        className="w-full h-full object-cover opacity-90 transition duration-300 group-hover:scale-102"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-white font-bold text-xs">
                    <span>{mainSpeaker.name}</span>
                    {mainSpeaker.id === currentUser.id && <span className="text-[10px] text-emerald-400">You</span>}
                  </div>
                </div>

                {/* Bottom Carousel for other participants */}
                <div className="flex items-center gap-2 shrink-0 py-1">
                  {participants.length > visibleCarouselCount && (
                    <button
                      type="button"
                      onClick={handlePrevCarousel}
                      disabled={carouselIndex === 0}
                      className="h-8 w-8 rounded-full border border-slate-200 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs shrink-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-hidden">
                    {participants.slice(carouselIndex, carouselIndex + 4).map(p => {
                      const isSelected = mainSpeaker.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setPinnedParticipantId(p.id)}
                          className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border-2 cursor-pointer transition ${
                            isSelected ? 'border-emerald-500 scale-[1.02]' : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white truncate max-w-[80%]">
                            {p.name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {participants.length > visibleCarouselCount && (
                    <button
                      type="button"
                      onClick={handleNextCarousel}
                      disabled={carouselIndex >= maxCarouselStart}
                      className="h-8 w-8 rounded-full border border-slate-200 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs shrink-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

           {/* ================= RIGHT INTERACTIVE CHAT PANEL ================= */}
          {showChatPanel && (
            <div className="w-full lg:w-80 shrink-0 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    Pesan Interaktif
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isOneOnOne && (
                    <button
                      type="button"
                      onClick={() => setShowCreatePollModal(true)}
                      className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition cursor-pointer"
                      title="Buat Polling khusus Video Call Group"
                    >
                      📊 Buat Polling
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowChatPanel(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Sembunyikan Panel Chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum ada pesan</p>
                    <p className="text-[11px] text-slate-400">Ketik pesan atau buat polling untuk mulai diskusi interaktif.</p>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    if (msg.type === 'poll' && msg.pollData) {
                      const totalVotes = msg.pollData.options.reduce((sum: number, opt: any) => sum + opt.votes.length, 0);
                      return (
                        <div key={msg.id} className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <img src={msg.senderAvatar} alt="" className="h-4.5 w-4.5 rounded-full object-cover" />
                              <span className="text-[10px] font-bold text-slate-500">{msg.senderName.split(' ')[0]}</span>
                            </div>
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              📊 Polling Aktif
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {msg.pollData.question}
                          </div>
                          <div className="space-y-1.5">
                            {msg.pollData.options.map((opt: any) => {
                              const hasVotedThis = opt.votes.includes(currentUser.id);
                              const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleVotePoll(msg.id, opt.id)}
                                  className={`relative w-full overflow-hidden rounded-xl border p-2 text-left transition text-xs font-semibold cursor-pointer ${
                                    hasVotedThis
                                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="absolute inset-y-0 left-0 bg-emerald-100/70 dark:bg-emerald-900/30 transition-all duration-300"
                                  />
                                  <div className="relative z-10 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                      {hasVotedThis && <Check className="h-3 w-3 text-emerald-600" />}
                                      {opt.text}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                      {pct}% ({opt.votes.length})
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (msg.isMe) {
                      return (
                        <div key={msg.id} className="flex flex-col items-end space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {msg.senderName.split(' ')[0]}
                            </span>
                            <img src={msg.senderAvatar} alt="" className="h-4.5 w-4.5 rounded-full object-cover ring-1 ring-slate-200" />
                          </div>
                          <div className="rounded-2xl rounded-tr-xs bg-emerald-600 text-white px-3 py-1.5 text-xs shadow-xs max-w-[88%] font-medium">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="flex flex-col items-start space-y-1">
                        <div className="flex items-center gap-1.5">
                          <img src={msg.senderAvatar} alt="" className="h-4.5 w-4.5 rounded-full object-cover ring-1 ring-slate-200" />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {msg.senderName.split(' ')[0]}
                          </span>
                        </div>
                        <div className="rounded-2xl rounded-tl-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 text-xs shadow-2xs max-w-[88%] font-medium">
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendInCallChat} className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-40 transition cursor-pointer"
                    title="Kirim pesan"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* ================= 3. BOTTOM CALL CONTROLS DOCK ================= */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          
          {/* Left Controls: Video, Mic, Screen Share */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleHuddleVideo}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                isVideoOn
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
              title={isVideoOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{isVideoOn ? 'Kamera On' : 'Nyalakan Kamera'}</span>
            </button>

            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleHuddleMic}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}
              title={isMuted ? 'Unmute Mikrofon' : 'Mute Mikrofon'}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Mic Mati' : 'Mic On'}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
              title="Bagi Layar Anda (Share Screen)"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden md:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>
          </div>

          {/* Center Controls: Emoji Reactions, Hand Raise, Record */}
          <div className="flex items-center gap-2">
            {/* Emoji Reactions Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs"
                title="Kirim Reaksi Emoji"
              >
                <Smile className="h-4.5 w-4.5 text-amber-500" />
              </button>

              {showReactions && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95">
                  {['👍', '❤️', '👏', '🎉', '🔥', '🚀', '💡', '😂'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleSendReaction(emoji);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Raise Hand Toggle */}
            <button
              type="button"
              onClick={handleToggleHandRaise}
              className={`flex items-center justify-center h-10 w-10 rounded-2xl border transition cursor-pointer shadow-xs ${
                isHandRaised
                  ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
              title="Angkat Tangan (Raise Hand)"
            >
              <Hand className="h-4.5 w-4.5" />
            </button>

            {/* Quick Record Button */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`hidden sm:flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                isRecording
                  ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
              title="Perekaman Panggilan"
            >
              <Disc className={`h-4 w-4 ${isRecording ? 'text-rose-500 animate-spin-slow' : 'text-slate-400'}`} />
              <span>{isRecording ? 'Recording' : 'Record'}</span>
            </button>
          </div>

          {/* Right Controls: End Call */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={endHuddle}
              className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
              title="Akhiri / Tinggalkan Panggilan"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Leave Call</span>
            </button>
          </div>

        </div>

      </div>

      {/* Create Poll Modal */}
      {showCreatePollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📊 Buat Polling Video Call</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreatePollModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pertanyaan Polling
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Setuju deploy fitur baru sekarang?"
                  value={pollQuestionInput}
                  onChange={e => setPollQuestionInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Opsi Pilihan (Min 2)
                </label>
                {pollOptionsInput.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Opsi ${idx + 1}`}
                    value={opt}
                    onChange={e => {
                      const updated = [...pollOptionsInput];
                      updated[idx] = e.target.value;
                      setPollOptionsInput(updated);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required={idx < 2}
                  />
                ))}
                {pollOptionsInput.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptionsInput([...pollOptionsInput, ''])}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + Tambah Opsi Lain
                  </button>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePollModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Kirim Polling ke Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
