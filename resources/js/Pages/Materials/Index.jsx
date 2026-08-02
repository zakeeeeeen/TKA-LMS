import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index() {
    const { materials, courses, groups, flash } = usePage().props;
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowModal(false);
            setSelectedMaterials([]);
        }
    }, [flash?.success]);
    const { data, setData, post, processing, errors } = useForm({
        material_ids: [],
        course_id: '',
        group_id: '',
    });

    const availableGroups = groups
        .filter((group) => String(group.course_id) === String(data.course_id))
        .sort((a, b) => a.position - b.position);

    const toggleSelectAll = () => {
        if (selectedMaterials.length === materials.length) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(materials.map(m => m.id));
        }
    };

    const toggleSelectMaterial = (materialId) => {
        if (selectedMaterials.includes(materialId)) {
            setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
        } else {
            setSelectedMaterials([...selectedMaterials, materialId]);
        }
    };

    const openModal = () => {
        setData('material_ids', selectedMaterials);
        setData('course_id', '');
        setData('group_id', '');
        setShowModal(true);
    };

    const handleBulkMove = (e) => {
        e.preventDefault();
        post(route('materials.bulk-move'), {
            onSuccess: () => {
                setShowModal(false);
                setSelectedMaterials([]);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            Bank Materi
                        </h2>
                        <p className="text-sm text-slate-600 font-medium mt-0.5">
                            Repositori dokumen (PDF, PPT, DOCX) & catatan pembelajaran terpusat.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedMaterials.length > 0 && (
                            <button
                                onClick={openModal}
                                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition"
                            >
                                Pindahkan / Masukkan ke Kursus ({selectedMaterials.length})
                            </button>
                        )}
                        <Link href={route('materials.create')} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-md transition flex items-center gap-2">
                            <span>+</span> Upload / Tambah Materi
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Bank Materi" />

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                {materials.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                            📚
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Bank Materi Masih Kosong</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5">Upload file PDF, Powerpoint, Word, atau catatan pembelajaran untuk disimpan di repositori.</p>
                        <Link href={route('materials.create')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-md transition">
                            Upload Materi Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={selectedMaterials.length === materials.length && materials.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span>Pilih Semua ({materials.length} Materi)</span>
                            </label>
                        </div>
                        
                        {materials.map((material) => {
                            const ext = material.file_path ? material.file_path.split('.').pop().toLowerCase() : 'text';
                            let iconBg = 'bg-slate-100 text-slate-700';
                            let fileLabel = 'Catatan Text';

                            if (['pdf'].includes(ext)) {
                                iconBg = 'bg-rose-100 text-rose-700 border border-rose-200';
                                fileLabel = 'PDF Dokument';
                            } else if (['ppt', 'pptx'].includes(ext)) {
                                iconBg = 'bg-amber-100 text-amber-700 border border-amber-200';
                                fileLabel = 'PowerPoint';
                            } else if (['doc', 'docx'].includes(ext)) {
                                iconBg = 'bg-blue-100 text-blue-700 border border-blue-200';
                                fileLabel = 'Word Document';
                            }

                            return (
                                <div key={material.id} className="rounded-2xl border border-slate-200/90 p-5 transition hover:border-slate-300 hover:shadow-md bg-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            <input
                                                type="checkbox"
                                                checked={selectedMaterials.includes(material.id)}
                                                onChange={() => toggleSelectMaterial(material.id)}
                                                className="mt-1 sm:mt-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                            />
                                            <div className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider ${iconBg}`}>
                                                {ext.toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-base text-slate-900">{material.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                                    <span>Terhubung ke:</span>
                                                    {material.course ? (
                                                        <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                                                            {material.course.name}
                                                        </span>
                                                    ) : (
                                                        <span className="font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                                            Belum Ditugaskan ke Kursus (Bank Only)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0">
                                            {material.is_published ? (
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                                                    Draf
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                {material.course && (
                                                    <Link href={route('courses.materials.show', [material.course, material])} className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                                                        Lihat
                                                    </Link>
                                                )}
                                                <Link href={route('materials.edit', material)} className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    {material.content && (
                                        <div className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-2 ml-8 sm:ml-12 pl-1.5">{material.content}</div>
                                    )}
                                    {material.file_path && (
                                        <div className="text-xs text-slate-500 mt-2.5 ml-8 sm:ml-12 pl-1.5 flex items-center gap-2">
                                            <span className="font-bold text-slate-700">📎 File:</span> 
                                            <a href={`/storage/${material.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">
                                                {material.file_path.split('/').pop()}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pindahkan ke Kursus</h3>
                        <form onSubmit={handleBulkMove}>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Pilih Kursus</label>
                                <select
                                    name="course_id"
                                    value={data.course_id}
                                    onChange={(e) => {
                                        const nextCourseId = e.target.value;
                                        const nextGroupId = groups
                                            .filter((group) => String(group.course_id) === String(nextCourseId))
                                            .sort((a, b) => a.position - b.position)[0]?.id ?? '';
                                        setData('course_id', nextCourseId);
                                        setData('group_id', nextGroupId);
                                    }}
                                    required
                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Kursus</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                                {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Pilih Group</label>
                                <select
                                    name="group_id"
                                    value={data.group_id}
                                    onChange={(e) => setData('group_id', e.target.value)}
                                    required
                                    disabled={!data.course_id}
                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50"
                                >
                                    <option value="">Pilih Group</option>
                                    {availableGroups.map((group) => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                                {errors.group_id && <p className="mt-1 text-sm text-red-500">{errors.group_id}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.course_id || !data.group_id}
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
