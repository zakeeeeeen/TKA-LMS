import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Edit({ settings = {} }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        site_title: settings.site_title || '',
        site_description: settings.site_description || '',
        hero_badge: settings.hero_badge || '',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        seo_keywords: settings.seo_keywords || '',
        seo_author: settings.seo_author || '',
        iconify_script: settings.iconify_script || '',
        hero_image_file: null,
        favicon_image_file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Icon icon="lucide:settings" className="w-6 h-6 text-blue-600" />
                    <span>Pengaturan Website & SEO</span>
                </h2>
            }
        >
            <Head title="Pengaturan Web & SEO" />

            <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
                {recentlySuccessful && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 shadow-sm flex items-center gap-2">
                        <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-emerald-600" />
                        <span>Pengaturan berhasil disimpan dan langsung diterapkan ke situs web.</span>
                    </div>
                )}

                {/* TAB 1: Teks Landing Page */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Icon icon="lucide:file-edit" className="w-5 h-5 text-blue-600" />
                            <span>Teks Landing Page (Halaman Utama)</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Ubah teks utama yang muncul pada bagian Hero di landing page.</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Badge Kategori Hero (Pill Atas)</label>
                            <input
                                type="text"
                                value={data.hero_badge}
                                onChange={(e) => setData('hero_badge', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="Contoh: 💡 AI-Powered Learning Platform TKA"
                            />
                            {errors.hero_badge && <div className="text-rose-600 mt-1">{errors.hero_badge}</div>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Judul Utama (Hero Title)</label>
                            <input
                                type="text"
                                value={data.hero_title}
                                onChange={(e) => setData('hero_title', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="Contoh: Tingkatkan Kemampuan Akademikmu Bersama"
                            />
                            {errors.hero_title && <div className="text-rose-600 mt-1">{errors.hero_title}</div>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Deskripsi Subtitle Hero</label>
                            <textarea
                                rows={3}
                                value={data.hero_subtitle}
                                onChange={(e) => setData('hero_subtitle', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="Masukkan ringkasan penjelasan tentang platform TKA..."
                            />
                            {errors.hero_subtitle && <div className="text-rose-600 mt-1">{errors.hero_subtitle}</div>}
                        </div>
                    </div>
                </div>

                {/* TAB 2: Foto & Gambar Landing Page */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Icon icon="lucide:image" className="w-5 h-5 text-blue-600" />
                            <span>Foto & Gambar Landing Page</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Unggah foto siswa/banner hero baru dan ikon favicon website.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Foto Murid / Hero Image */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700">Foto Murid / Banner Hero</label>
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                        src={settings.hero_image || '/murid.png'}
                                        alt="Hero Preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('hero_image_file', e.target.files[0])}
                                        className="text-xs font-medium text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                                    />
                                    <div className="text-[11px] text-slate-400 mt-1">Format PNG, JPG, WebP (Max 5MB). Rekomendasi gambar transparan.</div>
                                </div>
                            </div>
                            {errors.hero_image_file && <div className="text-xs text-rose-600">{errors.hero_image_file}</div>}
                        </div>

                        {/* Favicon Icon */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700">Icon / Favicon Website</label>
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-2">
                                    <img
                                        src={settings.favicon_image || '/icon.png'}
                                        alt="Favicon Preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('favicon_image_file', e.target.files[0])}
                                        className="text-xs font-medium text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                                    />
                                    <div className="text-[11px] text-slate-400 mt-1">Format PNG, ICO, SVG (Max 2MB). Rekomendasi 512x512px.</div>
                                </div>
                            </div>
                            {errors.favicon_image_file && <div className="text-xs text-rose-600">{errors.favicon_image_file}</div>}
                        </div>
                    </div>
                </div>

                {/* TAB 3: Iconify Integration */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Icon icon="lucide:sparkles" className="w-5 h-5 text-amber-500" />
                            <span>Skrip Iconify / Pengaturan Ikon</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Kustomisasi skripCDN atau tag tambahan untuk dukungan Iconify-icon pada website.</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Skrip CDN Iconify</label>
                            <textarea
                                rows={2}
                                value={data.iconify_script}
                                onChange={(e) => setData('iconify_script', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-xs font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder='<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>'
                            />
                            <div className="text-[11px] text-slate-400 font-normal mt-1">Skrip ini akan otomatis disuntikkan ke dalam head HTML website.</div>
                            {errors.iconify_script && <div className="text-rose-600 mt-1">{errors.iconify_script}</div>}
                        </div>
                    </div>
                </div>

                {/* TAB 4: Pengaturan SEO */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Icon icon="lucide:search" className="w-5 h-5 text-blue-600" />
                            <span>Pengaturan SEO (Search Engine Optimization)</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Maksimalkan visibilitas website Anda di mesin pencari Google.</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Judul Website (SEO Meta Title)</label>
                            <input
                                type="text"
                                value={data.site_title}
                                onChange={(e) => setData('site_title', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="TKA LMS - Tes Kemampuan Akademik"
                            />
                            {errors.site_title && <div className="text-rose-600 mt-1">{errors.site_title}</div>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Deskripsi Meta SEO (Meta Description)</label>
                            <textarea
                                rows={3}
                                value={data.site_description}
                                onChange={(e) => setData('site_description', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                placeholder="Ringkasan deskripsi yang akan muncul di hasil pencarian Google..."
                            />
                            {errors.site_description && <div className="text-rose-600 mt-1">{errors.site_description}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Kata Kunci SEO (Keywords)</label>
                                <input
                                    type="text"
                                    value={data.seo_keywords}
                                    onChange={(e) => setData('seo_keywords', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                    placeholder="TKA, Tryout SD, Ujian Online, Pembahasan AI"
                                />
                                {errors.seo_keywords && <div className="text-rose-600 mt-1">{errors.seo_keywords}</div>}
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Penulis / Pemilik (Author)</label>
                                <input
                                    type="text"
                                    value={data.seo_author}
                                    onChange={(e) => setData('seo_author', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                    placeholder="Tim TKA LMS Indonesia"
                                />
                                {errors.seo_author && <div className="text-rose-600 mt-1">{errors.seo_author}</div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
                    >
                        <Icon icon="lucide:save" className="w-4 h-4" />
                        <span>Simpan Seluruh Pengaturan</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
