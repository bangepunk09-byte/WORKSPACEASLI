import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Plus,
  Clapperboard,
  Film,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  Tag,
  UserCheck,
  Building2,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskPriority, TaskStatus, VideoDraftScene, SlideDraftItem, PosterDraftItem, CreativeBriefFormat, TaskAssignee } from '../../types';

export const CreateTaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, users, createTask, divisions, selectedTaskGroup, managedBrands, setIsBrandModalOpen } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState(() => managedBrands[0]?.name || 'Asli RI');
  const [customBrand, setCustomBrand] = useState('');
  const [requestorId, setRequestorId] = useState(currentUser.id);
  const [divisionId, setDivisionId] = useState<string>(() => {
    if (selectedTaskGroup && selectedTaskGroup !== 'all') return selectedTaskGroup;
    return divisions[0]?.id || 'tech';
  });
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [deadline, setDeadline] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [checklists, setChecklists] = useState(['']);

  // Candidate users belonging to the selected division
  const targetDivision = divisions.find(d => d.id === divisionId) || divisions[0];
  const divisionUsers = users.filter(u => {
    if (!targetDivision) return true;
    const match = (targetDivision.departmentMatch || targetDivision.name).toLowerCase();
    const userDept = (u.department || '').toLowerCase();
    return userDept.includes(match) || match.includes(userDept);
  });
  const candidateUsers = divisionUsers.length > 0 ? divisionUsers : users;

  // Multi-select assignees from this division
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(() => {
    return [candidateUsers[0]?.id || currentUser.id];
  });

  // When division changes, ensure at least one assignee is selected from candidate users
  useEffect(() => {
    const validIds = selectedAssigneeIds.filter(id => candidateUsers.some(u => u.id === id));
    if (validIds.length === 0 && candidateUsers.length > 0) {
      setSelectedAssigneeIds([candidateUsers[0].id]);
    }
  }, [divisionId]);

  // Support ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds(prev => {
      if (prev.includes(userId)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Creative Brief Format state (Default to 'poster')
  const [briefFormat, setBriefFormat] = useState<CreativeBriefFormat>('poster');

  // Poster Draft state (All empty initially for requester to fill in)
  const [posterHeadline, setPosterHeadline] = useState('');
  const [posterSubheadline, setPosterSubheadline] = useState('');
  const [posterBodyCopy, setPosterBodyCopy] = useState('');
  const [posterComposition, setPosterComposition] = useState('');
  const [posterCta, setPosterCta] = useState('');
  const [posterSelectedSizes, setPosterSelectedSizes] = useState<string[]>(['Portrait 4:5']);
  const [posterCustomWidth, setPosterCustomWidth] = useState<number | undefined>();
  const [posterCustomHeight, setPosterCustomHeight] = useState<number | undefined>();
  const [posterCustomUnit, setPosterCustomUnit] = useState<'m' | 'cm' | 'mm' | 'px'>('cm');

  // Carousel Slide Draft state
  const [slideItems, setSlideItems] = useState<SlideDraftItem[]>([]);

  // Video Scene Draft state
  const [videoScenes, setVideoScenes] = useState<VideoDraftScene[]>([]);

  const handleAddChecklist = () => {
    setChecklists([...checklists, '']);
  };

  const handleChecklistChange = (idx: number, val: string) => {
    const updated = [...checklists];
    updated[idx] = val;
    setChecklists(updated);
  };

  // Slide Handlers
  const handleAddSlide = () => {
    const nextNum = slideItems.length + 1;
    const newSlide: SlideDraftItem = {
      id: 'sld_' + Date.now(),
      slideNumber: nextNum,
      title: `Slide ${nextNum}: Judul Slide`,
      headline: '',
      bodyContent: '',
      visualLayout: ''
    };
    setSlideItems([...slideItems, newSlide]);
  };

  // Video Scene Handlers
  const handleAddScene = () => {
    const nextNum = videoScenes.length + 1;
    const newScene: VideoDraftScene = {
      id: 'sc_' + Date.now(),
      sceneNumber: nextNum,
      title: `Scene ${nextNum}: Scene Baru`,
      visualDirection: '',
      audioScript: '',
      durationText: '00:04',
      googleLinks: []
    };
    setVideoScenes([...videoScenes, newScene]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenBrand = customBrand.trim() || brand;
    const requestor = users.find(u => u.id === requestorId) || currentUser;
    const selectedUsers = candidateUsers.filter(u => selectedAssigneeIds.includes(u.id));
    const primaryAssignee = selectedUsers[0] || candidateUsers[0] || currentUser;

    const assigneesList: TaskAssignee[] = (selectedUsers.length > 0 ? selectedUsers : [primaryAssignee]).map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      dept: u.department,
      role: u.role
    }));

    const finalLabels = Array.from(new Set([
      chosenBrand,
      ...labelsInput.split(',').map(l => l.trim()).filter(Boolean)
    ]));

    const matchedBrandObj = managedBrands.find(
      b => b.name.toLowerCase() === chosenBrand.toLowerCase()
    );

    createTask({
      title: title.trim(),
      description: description.trim(),
      brand: chosenBrand,
      brandId: matchedBrandObj?.id,
      brandLogo: matchedBrandObj?.logo,
      brandColor: matchedBrandObj?.color,
      status,
      priority,
      requestorId: requestor.id,
      requestorName: requestor.name,
      requestorAvatar: requestor.avatar,
      assigneeId: primaryAssignee.id,
      assigneeName: primaryAssignee.name,
      assigneeAvatar: primaryAssignee.avatar,
      assigneeDept: targetDivision?.departmentMatch || primaryAssignee.department,
      assignees: assigneesList,
      groupId: targetDivision?.id || 'tech',
      groupName: targetDivision?.name || 'Technology & Engineering',
      reporterId: requestor.id,
      reporterName: requestor.name,
      deadline,
      labels: finalLabels,
      checklists: checklists
        .filter(c => c.trim().length > 0)
        .map((text, idx) => ({
          id: 'chk_' + Date.now() + '_' + idx,
          text,
          completed: false
        })),
      briefFormat,
      posterDraftItem: briefFormat === 'poster' ? {
        dimensions: posterSelectedSizes.join(', ') || '1080 x 1350 px',
        selectedSizes: posterSelectedSizes,
        customWidth: posterCustomWidth,
        customHeight: posterCustomHeight,
        customUnit: posterCustomUnit,
        headline: posterHeadline || title,
        subheadline: posterSubheadline,
        bodyCopy: posterBodyCopy,
        visualComposition: posterComposition,
        callToAction: posterCta
      } : undefined,
      slideDraftItems: briefFormat === 'slides' ? slideItems : undefined,
      videoDraftScenes: briefFormat === 'scenes' ? videoScenes : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl my-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[86vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xs">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Buat Tugas Baru & Creative Brief
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lengkapi detail pekerjaan, deadline, tim pelaksana, serta brief kreatif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Judul Tugas */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Judul Tugas *
            </label>
            <input
              type="text"
              placeholder="contoh: Produksi Key Visual Kampanye Q4"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
            />
          </div>

          {/* Label Brand & Tenggat Waktu (Workspace/Proyek removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-red-600" />
                <span>Label Brand</span>
              </label>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {managedBrands.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => { setBrand(b.name); setCustomBrand(''); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        brand === b.name && !customBrand
                          ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: b.color }}
                        />
                      )}
                      <span>{b.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold border border-dashed border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Buka panel manajemen brand & pasang logo kustom"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Kelola Brand</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Atau ketik nama brand kustom..."
                  value={customBrand}
                  onChange={e => setCustomBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tenggat Waktu
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          {/* Requestor & Divisi Pelaksana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Requestor</span>
              </label>
              <select
                value={requestorId}
                onChange={e => setRequestorId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-purple-600" />
                <span>Divisi Pelaksana *</span>
              </label>
              <select
                value={divisionId}
                onChange={e => setDivisionId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs cursor-pointer"
              >
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Penanggung Jawab Multi-select (Orang di divisi tersebut) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Penanggung Jawab ({candidateUsers.length} anggota di {targetDivision?.name || 'divisi'})
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedAssigneeIds.length} orang terpilih (dapat pilih lebih dari 1)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 max-h-48 overflow-y-auto">
              {candidateUsers.map(u => {
                const isSelected = selectedAssigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAssignee(u.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200 shadow-2xs'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-[11px]">{u.name}</div>
                    </div>
                    {isSelected ? (
                      <div className="h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioritas & Tahap Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs cursor-pointer"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tahap Flow
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs cursor-pointer"
              >
                <option value="not_started">Not started</option>
                <option value="on_progress">On Progress</option>
                <option value="on_review">On Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Deskripsi Scope Pekerjaan
            </label>
            <textarea
              placeholder="Tuliskan tujuan campaign, target audiens, dan ekspektasi output..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
            />
          </div>

          {/* 🌟 CREATIVE BRIEF WIDGET (Matching TaskManagement.tsx format) */}
          <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-blue-50/40 p-4 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/30 space-y-4 shadow-xs">
            {/* Header & Format Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3 dark:border-indigo-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
                  <Clapperboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Creative Brief
                  </h4>
                </div>
              </div>

              {/* 3-Mode Format Switcher Button Group (Poster -> Carousel -> Video) */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800/90 shrink-0">
                <button
                  type="button"
                  onClick={() => setBriefFormat('poster')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer ${
                    briefFormat === 'poster'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>🖼️ Poster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBriefFormat('slides')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer ${
                    briefFormat === 'slides'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>📑 Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBriefFormat('scenes')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer ${
                    briefFormat === 'scenes'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>🎬 Video</span>
                </button>
              </div>
            </div>

            {/* FORMAT 1: POSTER BRIEF (DEFAULT) */}
            {briefFormat === 'poster' && (
              <div className="space-y-4">
                {/* Multi-select standard sizes and custom dimensions */}
                <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                    📐 Pilih Ukuran & Dimensi Poster:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['A4', 'A3', 'A5', 'A2', 'Square 1:1', 'Story 9:16', 'Portrait 4:5', 'Landscape 16:9'].map(sz => {
                      const isSelected = posterSelectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setPosterSelectedSizes(
                              isSelected ? posterSelectedSizes.filter(s => s !== sz) : [...posterSelectedSizes, sz]
                            );
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-300 ease-out cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Dimensions inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Lebar Custom</span>
                      <input
                        type="number"
                        placeholder="Lebar"
                        value={posterCustomWidth || ''}
                        onChange={e => setPosterCustomWidth(parseFloat(e.target.value) || undefined)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Tinggi Custom</span>
                      <input
                        type="number"
                        placeholder="Tinggi"
                        value={posterCustomHeight || ''}
                        onChange={e => setPosterCustomHeight(parseFloat(e.target.value) || undefined)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Satuan (Unit)</span>
                      <select
                        value={posterCustomUnit}
                        onChange={e => setPosterCustomUnit(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none font-bold cursor-pointer"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="m">m</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Poster Inputs */}
                <div className="space-y-3 rounded-xl bg-white p-4 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Judul Poster (Main Headline)
                    </label>
                    <input
                      type="text"
                      placeholder="cth: ASLI GROUP Innovation Summit 2026"
                      value={posterHeadline}
                      onChange={e => setPosterHeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subheadline
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Akselerasi Transformasi Digital & Kolaborasi Lintas Divisi"
                      value={posterSubheadline}
                      onChange={e => setPosterSubheadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      ✍️ Teks Konten & Poin-Poin Poster
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan poin-poin naskah atau copywriting poster..."
                      value={posterBodyCopy}
                      onChange={e => setPosterBodyCopy(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      🎯 Primary Call to Action (CTA)
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Registrasi di hub.asli.group/summit"
                      value={posterCta}
                      onChange={e => setPosterCta(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 2: CAROUSEL BRIEF */}
            {briefFormat === 'slides' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    📑 Susunan Slide Carousel ({slideItems.length} Slide)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Slide</span>
                  </button>
                </div>

                {slideItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-indigo-200 bg-white/60 p-6 text-center text-xs text-slate-500 dark:border-indigo-800 dark:bg-slate-900/60">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada slide carousel.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Klik Tambah Slide untuk mulai menyusun carousel.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slideItems.map((slide, sIdx) => (
                      <div key={slide.id} className="rounded-xl border border-indigo-100 bg-white p-3.5 dark:border-indigo-900 dark:bg-slate-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300">Slide {sIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setSlideItems(slideItems.filter(s => s.id !== slide.id))}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Headline slide..."
                          value={slide.headline}
                          onChange={e => {
                            const val = e.target.value;
                            setSlideItems(slideItems.map(s => s.id === slide.id ? { ...s, headline: val } : s));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <textarea
                          rows={2}
                          placeholder="Konten penjelasan slide..."
                          value={slide.bodyContent}
                          onChange={e => {
                            const val = e.target.value;
                            setSlideItems(slideItems.map(s => s.id === slide.id ? { ...s, bodyContent: val } : s));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FORMAT 3: VIDEO BRIEF */}
            {briefFormat === 'scenes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    🎬 Storyboard Video Scenes ({videoScenes.length} Scene)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = videoScenes.length + 1;
                      const newScene: VideoDraftScene = {
                        id: 'sc_' + Date.now(),
                        sceneNumber: nextNum,
                        title: `Scene ${nextNum}: Baru`,
                        visualDirection: '',
                        audioScript: '',
                        durationText: '00:04'
                      };
                      setVideoScenes([...videoScenes, newScene]);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Scene</span>
                  </button>
                </div>

                {videoScenes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-indigo-200 bg-white/60 p-6 text-center text-xs text-slate-500 dark:border-indigo-800 dark:bg-slate-900/60">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada scene video.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Klik Tambah Scene untuk mulai menyusun storyboard.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videoScenes.map((scene, vIdx) => (
                      <div key={scene.id} className="rounded-xl border border-indigo-100 bg-white p-3.5 dark:border-indigo-900 dark:bg-slate-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300">Scene {vIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setVideoScenes(videoScenes.filter(v => v.id !== scene.id))}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Arahan visual & shot kamera..."
                          value={scene.visualDirection}
                          onChange={e => {
                            const val = e.target.value;
                            setVideoScenes(videoScenes.map(v => v.id === scene.id ? { ...v, visualDirection: val } : v));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <textarea
                          rows={2}
                          placeholder="Naskah voiceover / audio script..."
                          value={scene.audioScript}
                          onChange={e => {
                            const val = e.target.value;
                            setVideoScenes(videoScenes.map(v => v.id === scene.id ? { ...v, audioScript: val } : v));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtask Checklists */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Checklist / Tahapan Eksekusi
              </label>
              <button
                type="button"
                onClick={handleAddChecklist}
                className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                Tambah Item
              </button>
            </div>
            <div className="space-y-1.5">
              {checklists.map((c, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Subtask ${i + 1}`}
                  value={c}
                  onChange={e => handleChecklistChange(i, e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md transition cursor-pointer"
            >
              Simpan Tugas & Creative Brief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
