import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import Modal from '@/Components/Modal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index() {
    const { questionPackages, courses, groups, flash } = usePage().props;
    const [selectedQuizIds, setSelectedQuizIds] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowModal(false);
            setSelectedQuizIds([]);
        }
    }, [flash?.success]);
    const { data, setData, post, processing, errors } = useForm({
        course_ids: [],
        group_ids: {},
        quiz_ids: [],
    });

    const toggleQuizSelection = (quizId) => {
        setSelectedQuizIds(prev => 
            prev.includes(quizId) 
                ? prev.filter(id => id !== quizId) 
                : [...prev, quizId]
        );
    };

    const toggleAllQuizzes = () => {
        if (selectedQuizIds.length === questionPackages.length) {
            setSelectedQuizIds([]);
        } else {
            setSelectedQuizIds(questionPackages.map(pkg => pkg.id));
        }
    };

    const openModal = () => {
        setData('quiz_ids', selectedQuizIds);
        setData('course_ids', []);
        setData('group_ids', {});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('courses.attach-quizzes'), {
            onSuccess: () => {
                setSelectedQuizIds([]);
                setShowModal(false);
            },
            onError: () => {
                setShowModal(false);
            }
        });
    };

    const toggleCourseSelection = (courseId) => {
        const isSelected = data.course_ids.includes(courseId);
        const nextCourseIds = isSelected
            ? data.course_ids.filter((id) => id !== courseId)
            : [...data.course_ids, courseId];

        const nextGroupIds = { ...(data.group_ids ?? {}) };
        if (isSelected) {
            delete nextGroupIds[courseId];
        } else {
            nextGroupIds[courseId] = '';
        }

        setData('course_ids', nextCourseIds);
        setData('group_ids', nextGroupIds);
    };

    const availableGroupsForCourse = (courseId) => {
        return (groups ?? [])
            .filter((group) => String(group.course_id) === String(courseId))
            .sort((a, b) => a.position - b.position);
    };

    const canSubmit = data.course_ids.length > 0 && data.course_ids.every((courseId) => Boolean((data.group_ids ?? {})[courseId]));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Quiz
                    </h2>
                    <div className="flex gap-3">
                        {selectedQuizIds.length > 0 && (
                            <button
                                onClick={openModal}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition"
                            >
                                Masukkan ke Course ({selectedQuizIds.length})
                            </button>
                        )}
                        <Link
                            href={route('quizzes.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
                        >
                            Tambah Quiz
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Quiz" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedQuizIds.length === questionPackages.length && questionPackages.length > 0}
                                        onChange={toggleAllQuizzes}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Deskripsi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Durasi (Menit)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Total Soal
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {questionPackages.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuizIds.includes(pkg.id)}
                                            onChange={() => toggleQuizSelection(pkg.id)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{pkg.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-500">{pkg.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">{pkg.duration}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">{pkg.questions_count ?? pkg.total_questions ?? 0}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={route('quizzes.edit', pkg.id)} className="text-blue-600 hover:text-blue-900 mr-3">
                                            Kelola
                                        </Link>
                                        <ConfirmDeleteButton
                                            href={route('quizzes.destroy', pkg.id)}
                                            itemName={`quiz ${pkg.name}`}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </ConfirmDeleteButton>
                                    </td>
                                </tr>
                            ))}

                            {questionPackages.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                        Belum ada quiz. Tambahkan quiz pertama untuk mulai menyusun soal.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Masukkan Quiz ke Course</h3>
                    
                    <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-3">Pilih course yang ingin dimasukkan quiz:</p>
                        
                        {courses.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">Belum ada course. Silakan buat course terlebih dahulu.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {courses.map((course) => {
                                    const selected = data.course_ids.includes(course.id);
                                    const groupOptions = availableGroupsForCourse(course.id);
                                    const groupError = errors?.[`group_ids.${course.id}`];

                                    return (
                                        <div key={course.id} className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleCourseSelection(course.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-slate-900">{course.name}</span>
                                            </label>

                                            {selected && (
                                                <div className="mt-3">
                                                    <label className="mb-1 block text-xs font-medium text-slate-600">Pilih group</label>
                                                    <select
                                                        value={(data.group_ids ?? {})[course.id] ?? ''}
                                                        onChange={(e) => {
                                                            setData('group_ids', {
                                                                ...(data.group_ids ?? {}),
                                                                [course.id]: e.target.value,
                                                            });
                                                        }}
                                                        required
                                                        className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <option value="">Pilih Group</option>
                                                        {groupOptions.map((group) => (
                                                            <option key={group.id} value={group.id}>{group.name}</option>
                                                        ))}
                                                    </select>
                                                    {groupError && <p className="mt-1 text-sm text-red-500">{groupError}</p>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {errors.course_ids && <p className="mt-2 text-sm text-red-500">{errors.course_ids}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || courses.length === 0 || !canSubmit}
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
