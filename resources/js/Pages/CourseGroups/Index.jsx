import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Index() {
    const { course, groups, materials, quizzes, flash } = usePage().props;
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    const sortedGroups = useMemo(() => {
        return [...(groups ?? [])].sort((a, b) => a.position - b.position);
    }, [groups]);

    useEffect(() => {
        if (flash?.success) {
            setShowEditModal(false);
            setEditingGroup(null);
        }
    }, [flash?.success]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const openEditModal = (group) => {
        setEditingGroup(group);
        editForm.setData('name', group.name);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingGroup(null);
    };

    const createGroup = (e) => {
        e.preventDefault();
        post(route('courses.groups.store', course.id), {
            onSuccess: () => {
                reset('name');
            },
        });
    };

    const updateGroup = (e) => {
        e.preventDefault();
        if (!editingGroup) return;
        editForm.put(route('courses.groups.update', [course.id, editingGroup.id]));
    };

    const moveGroup = (groupId, direction) => {
        router.post(route('courses.groups.move', [course.id, groupId]), { direction }, { preserveScroll: true });
    };

    const assignMaterial = (materialId, groupId) => {
        router.post(route('courses.groups.materials.assign', [course.id, materialId]), { group_id: groupId }, { preserveScroll: true });
    };

    const assignQuiz = (quizId, groupId) => {
        router.post(route('courses.groups.quizzes.assign', [course.id, quizId]), { group_id: groupId }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Group Konten: {course.name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Group Konten - ${course.name}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Daftar Group</h3>

                        <form onSubmit={createGroup} className="flex gap-3 mb-5">
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama group (mis. TKP, MTK, IPA)"
                                className="flex-1 rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                            >
                                Tambah
                            </button>
                        </form>
                        {errors.name && <p className="mb-4 text-sm text-red-500">{errors.name}</p>}

                        {sortedGroups.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada group.</p>
                        ) : (
                            <div className="space-y-2">
                                {sortedGroups.map((group, index) => (
                                    <div key={group.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                                {group.position}
                                            </span>
                                            <span className="text-sm font-medium text-slate-900">{group.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => moveGroup(group.id, 'up')}
                                                disabled={index === 0}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveGroup(group.id, 'down')}
                                                disabled={index === sortedGroups.length - 1}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(group)}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                            >
                                                Edit
                                            </button>
                                            <ConfirmDeleteButton
                                                href={route('courses.groups.destroy', [course.id, group.id])}
                                                itemName={`group ${group.name}`}
                                                className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Hapus
                                            </ConfirmDeleteButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Assign Konten</h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Materi</h4>
                                {materials.length === 0 ? (
                                    <p className="text-sm text-slate-500">Belum ada materi.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {materials.map((material) => (
                                            <div key={material.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{material.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Posisi: {material.position} • Group: {material.group?.name ?? '-'}
                                                    </p>
                                                </div>
                                                <select
                                                    value={material.group_id ?? ''}
                                                    onChange={(e) => assignMaterial(material.id, e.target.value)}
                                                    className="w-48 rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    {sortedGroups.map((group) => (
                                                        <option key={group.id} value={group.id}>{group.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Quiz</h4>
                                {quizzes.length === 0 ? (
                                    <p className="text-sm text-slate-500">Belum ada quiz.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {quizzes.map((quiz) => (
                                            <div key={quiz.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{quiz.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Posisi: {quiz.position} • Group: {quiz.group_name ?? '-'}
                                                    </p>
                                                </div>
                                                <select
                                                    value={quiz.group_id ?? ''}
                                                    onChange={(e) => assignQuiz(quiz.id, e.target.value)}
                                                    className="w-48 rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    {sortedGroups.map((group) => (
                                                        <option key={group.id} value={group.id}>{group.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={updateGroup} className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Group</h3>
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nama Group</label>
                        <input
                            type="text"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {editForm.errors.name && <p className="mt-1 text-sm text-red-500">{editForm.errors.name}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
