import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ManagedBrand } from '../../types';
import {
  Building2,
  Plus,
  Search,
  Upload,
  X,
  Edit2,
  Trash2,
  Check,
  Globe,
  Tag,
  Palette,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const PRESET_BRAND_COLORS = [
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Forest Emerald', hex: '#059669' },
  { name: 'Royal Violet', hex: '#7c3aed' },
  { name: 'Sunset Amber', hex: '#ea580c' },
  { name: 'Cyan Modern', hex: '#0284c7' },
  { name: 'Hot Pink', hex: '#db2777' },
  { name: 'Corporate Slate', hex: '#334155' }
];

export const BrandManagementModal: React.FC = () => {
  const {
    managedBrands,
    addManagedBrand,
    updateManagedBrand,
    deleteManagedBrand,
    isBrandModalOpen,
    setIsBrandModalOpen,
    editingBrand,
    setEditingBrand,
    tasks
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formBrandId, setFormBrandId] = useState<string | null>(null);

  // Form Fields
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [brandCategory, setBrandCategory] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandWebsite, setBrandWebsite] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when editingBrand is passed from context
  useEffect(() => {
    if (editingBrand) {
      setFormBrandId(editingBrand.id);
      setBrandName(editingBrand.name);
      setBrandCode(editingBrand.code || '');
      setBrandLogo(editingBrand.logo || '');
      setBrandColor(editingBrand.color || '#2563eb');
      setBrandCategory(editingBrand.category || '');
      setBrandDescription(editingBrand.description || '');
      setBrandWebsite(editingBrand.website || '');
      setIsFormOpen(true);
    }
  }, [editingBrand]);

  // Support ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFormOpen && !editingBrand) {
          setIsFormOpen(false);
        } else {
          handleClose();
        }
      }
    };
    if (isBrandModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBrandModalOpen, isFormOpen, editingBrand]);

  if (!isBrandModalOpen) return null;

  const handleClose = () => {
    setIsBrandModalOpen(false);
    setEditingBrand(null);
    resetForm();
  };

  const resetForm = () => {
    setFormBrandId(null);
    setBrandName('');
    setBrandCode('');
    setBrandLogo('');
    setBrandColor('#2563eb');
    setBrandCategory('');
    setBrandDescription('');
    setBrandWebsite('');
    setIsFormOpen(false);
    setDeleteConfirmId(null);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (brand: ManagedBrand) => {
    setFormBrandId(brand.id);
    setBrandName(brand.name);
    setBrandCode(brand.code || '');
    setBrandLogo(brand.logo || '');
    setBrandColor(brand.color || '#2563eb');
    setBrandCategory(brand.category || '');
    setBrandDescription(brand.description || '');
    setBrandWebsite(brand.website || '');
    setIsFormOpen(true);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setBrandLogo(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    if (formBrandId) {
      // Update existing brand
      updateManagedBrand(formBrandId, {
        name: brandName.trim(),
        code: (brandCode.trim() || brandName.substring(0, 4)).toUpperCase(),
        logo: brandLogo.trim(),
        color: brandColor,
        category: brandCategory.trim() || 'General Client',
        description: brandDescription.trim(),
        website: brandWebsite.trim()
      });
    } else {
      // Create new brand
      addManagedBrand({
        name: brandName.trim(),
        code: (brandCode.trim() || brandName.substring(0, 4)).toUpperCase(),
        logo: brandLogo.trim(),
        color: brandColor,
        category: brandCategory.trim() || 'General Client',
        description: brandDescription.trim(),
        website: brandWebsite.trim()
      });
    }

    resetForm();
  };

  const filteredBrands = managedBrands.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-4xl my-auto max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-4 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Manajemen Label Brand & Perusahaan
                </h3>
                <span className="rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 px-2 py-0.5 text-[10px] font-black text-red-600 dark:text-red-400">
                  {managedBrands.length} Brand
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola daftar brand/klien yang ditangani, pasang logo kustom, dan atur warna aksen brand.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition"
            title="Tutup (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Bar: Search + Add Brand Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama brand, kategori, atau kode..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isFormOpen ? (
                <button
                  type="button"
                  onClick={handleOpenCreateForm}
                  className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Brand Baru</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Tutup Form</span>
                </button>
              )}
            </div>
          </div>

          {/* Form: Add or Edit Brand */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveBrand}
              className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50/40 via-white to-slate-50 p-5 dark:border-red-900/50 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 space-y-4 shadow-sm animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-red-100 pb-3 dark:border-red-900/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formBrandId ? 'Edit Konfigurasi Brand' : 'Daftarkan Brand Baru'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Batal
                </button>
              </div>

              {/* Logo Upload & Customizer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-white/90 p-4 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                {/* Logo Preview */}
                <div className="relative group shrink-0">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt={brandName || 'Brand Logo'}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-sm"
                      style={{ backgroundColor: brandColor }}
                    >
                      {brandName ? brandName.substring(0, 2).toUpperCase() : 'BR'}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    title="Ganti logo"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 transition cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Logo Brand (File)</span>
                    </button>
                    {brandLogo && (
                      <button
                        type="button"
                        onClick={() => setBrandLogo('')}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:border-slate-700 cursor-pointer"
                      >
                        Reset Logo
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={brandLogo}
                      onChange={e => setBrandLogo(e.target.value)}
                      placeholder="Atau tempel URL gambar logo brand (https://...)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    PNG, SVG, atau JPG transparan direkomendasikan untuk tampilan kartu & brief.
                  </p>
                </div>
              </div>

              {/* Brand Name, Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                    Nama Brand / Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: Movadex, Asli RI, Finova"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                    Kode Singkat
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="contoh: MVDX"
                    value={brandCode}
                    onChange={e => setBrandCode(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 uppercase focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Color Customizer */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-xs flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-red-600" />
                  <span>Warna Aksen Identitas Brand</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_BRAND_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBrandColor(c.hex)}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        brandColor.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-slate-900 ring-2 ring-slate-900 dark:ring-white dark:border-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{c.name}</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 ml-1">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="h-7 w-7 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0"
                      title="Pilih hex kustom"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                    Kategori / Bidang Usaha
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: Fintech, Creative Agency, E-Commerce"
                    value={brandCategory}
                    onChange={e => setBrandCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                    Website / Link Dokumen Brand
                  </label>
                  <input
                    type="url"
                    placeholder="https://client-company.com"
                    value={brandWebsite}
                    onChange={e => setBrandWebsite(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                  Deskripsi Klien / Catatan Brand
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan gambaran singkat tentang perusahaan atau produk klien ini..."
                  value={brandDescription}
                  onChange={e => setBrandDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  {formBrandId ? 'Simpan Perubahan Brand' : 'Daftarkan Brand'}
                </button>
              </div>
            </form>
          )}

          {/* Managed Brands Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Daftar Perusahaan & Brand ({filteredBrands.length})</span>
              <span>Klik kartu atau tombol untuk mengedit logo & detail</span>
            </div>

            {filteredBrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Tidak ada brand yang sesuai dengan pencarian
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Coba kata kunci lain atau daftarkan brand baru menggunakan tombol di atas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredBrands.map(brand => {
                  const taskCount = tasks.filter(
                    t => t.brand === brand.name || t.brandId === brand.id
                  ).length;

                  return (
                    <div
                      key={brand.id}
                      className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Brand Logo Display */}
                        <div className="relative shrink-0">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-2xs group-hover:scale-105 transition duration-200"
                            />
                          ) : (
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white shadow-2xs group-hover:scale-105 transition duration-200"
                              style={{ backgroundColor: brand.color }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span
                            className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: brand.color }}
                            title={`Warna aksen: ${brand.color}`}
                          />
                        </div>

                        {/* Brand Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                {brand.name}
                              </h4>
                              {brand.code && (
                                <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[9px] font-black text-slate-600 dark:text-slate-300">
                                  {brand.code}
                                </span>
                              )}
                              {brand.isDefault && (
                                <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.5 text-[9px] font-bold">
                                  Utama
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => handleOpenEditForm(brand)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer transition"
                                title="Edit Brand & Pasang Logo"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {managedBrands.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(brand.id)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 cursor-pointer transition"
                                  title="Hapus Brand"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Category and task count */}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className="rounded-lg px-2 py-0.5 text-[10px] font-bold border"
                              style={{
                                color: brand.color,
                                borderColor: `${brand.color}40`,
                                backgroundColor: `${brand.color}15`
                              }}
                            >
                              {brand.category || 'General Client'}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {taskCount} Tugas Aktif
                            </span>
                          </div>

                          {/* Description */}
                          {brand.description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {brand.description}
                            </p>
                          )}

                          {/* Website Link */}
                          {brand.website && (
                            <div className="mt-2 flex items-center gap-1">
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition"
                              >
                                <Globe className="h-3 w-3" />
                                <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Confirmation prompt */}
                      {deleteConfirmId === brand.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs animate-in fade-in">
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Yakin hapus brand "{brand.name}"?
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-md text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteManagedBrand(brand.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 rounded-md text-[11px] bg-rose-600 text-white font-bold hover:bg-rose-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Brand yang ditambahkan otomatis tersedia di selector formulir tugas & filter kampanye.
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 font-bold hover:opacity-90 transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
