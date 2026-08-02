import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { exam, questionPackages, students } = usePage().props;

    const formatDateTimeLocal = (value) => {
        if (!value) {
            return '';
        }

        return value.replace(' ', 'T').replace('Z', '').slice(0, 16);
    };

    const { data, setData, put, errors } = useForm({
        name: exam.name ?? '',
        question_package_id: exam.question_package_id,
        start_time: formatDateTimeLocal(exam.start_time),
        duration: String(exam.duration ?? 60),
        status: exam.status,
        student_ids: exam.students.map((student) => student.id),
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        put(route('exams.update', exam.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Edit Legacy Exam
                    </h2>
                </div>
            }
        >
            <Head title="Edit Legacy Exam" />

            <div className="mx-auto max-w-4xl space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="text-sm font-semibold text-amber-900">Modul Lama</div>
                    <div className="mt-2 text-sm leading-7 text-amber-800">
                        Halaman ini khusus untuk mengelola sesi exam lama. Flow utama siswa sekarang tidak lagi lewat modul ini.
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nama Sesi</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Quiz</label>
                            <select
                                value={data.question_package_id}
                                onChange={(event) => {
                                    const selectedId = event.target.value;
                                    const selectedPackage = questionPackages.find((pkg) => String(pkg.id) === selectedId);

                                    setData((current) => ({
                                        ...current,
                                        question_package_id: selectedId,
                                        duration: selectedPackage ? String(selectedPackage.duration) : current.duration,
                                    }));
                                }}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Pilih Quiz</option>
                                {questionPackages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.name}
                                    </option>
                                ))}
                            </select>
                            {errors.question_package_id && <p className="mt-1 text-sm text-red-500">{errors.question_package_id}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Durasi (Menit)</label>
                            <input
                                type="number"
                                min="1"
                                value={data.duration}
                                onChange={(event) => setData('duration', event.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Waktu Mulai</label>
                            <input
                                type="datetime-local"
                                value={data.start_time}
                                onChange={(event) => setData('start_time', event.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.start_time && <p className="mt-1 text-sm text-red-500">{errors.start_time}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                            <select
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="not_started">Belum Mulai</option>
                                <option value="ongoing">Berjalan</option>
                                <option value="completed">Selesai</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-slate-800">Pilih Siswa</h3>
                            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                {data.student_ids.length} siswa dipilih
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 p-4">
                            {students.map((student) => (
                                <div key={student.id} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
                                    <input
                                        type="checkbox"
                                        id={`student-${student.id}`}
                                        checked={data.student_ids.includes(student.id)}
                                        onChange={(event) => {
                                            const ids = [...data.student_ids];
                                            if (event.target.checked) {
                                                ids.push(student.id);
                                            } else {
                                                const index = ids.indexOf(student.id);
                                                if (index > -1) ids.splice(index, 1);
                                            }
                                            setData('student_ids', ids);
                                        }}
                                        className="mt-1"
                                    />
                                    <label htmlFor={`student-${student.id}`} className="flex-1">
                                        <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                        <div className="text-xs text-slate-500">{student.email}</div>
                                    </label>
                                </div>
                            ))}

                            {students.length === 0 && (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    Belum ada data siswa.
                                </div>
                            )}
                        </div>
                        {errors.student_ids && <p className="mt-2 text-sm text-red-500">{errors.student_ids}</p>}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-800"
                        >
                            Update Sesi Lama
                        </button>
                        <Link href={route('exams.index')} className="rounded-xl bg-slate-200 px-6 py-2 font-medium text-slate-800 transition hover:bg-slate-300">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
