import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Index() {
    const { course, allQuizzes } = usePage().props;
    const courseQuizIds = (course.quizzes ?? []).map(q => q.id);
    const { data, setData, put, processing, errors } = useForm({
        quiz_ids: courseQuizIds,
    });

    const toggleQuiz = (quizId) => {
        const exists = data.quiz_ids.includes(quizId);
        setData('quiz_ids', exists
            ? data.quiz_ids.filter((id) => id !== quizId)
            : [...data.quiz_ids, quizId]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('courses.quizzes.update', course));
    };

    const courseQuizzesMap = {};
    (course.quizzes ?? []).forEach(q => {
        courseQuizzesMap[q.id] = q;
    });

    const orderedCourseQuizzes = [];
    const allQuizzesMap = {};
    allQuizzes.forEach(q => {
        allQuizzesMap[q.id] = q;
        if (courseQuizIds.includes(q.id)) {
            orderedCourseQuizzes.push(q);
        }
    });

    orderedCourseQuizzes.sort((a, b) => {
        const posA = courseQuizzesMap[a.id]?.pivot?.position ?? 0;
        const posB = courseQuizzesMap[b.id]?.pivot?.position ?? 0;
        return posA - posB;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Kelola Quiz: {course.name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Kelola Quiz - ${course.name}`} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Pilih Quiz</h3>
                            <p className="text-sm text-slate-500">Pilih quiz yang ingin dimasukkan ke course ini.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                {data.quiz_ids.length} quiz dipilih
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {allQuizzes.map((quiz) => {
                            const selected = data.quiz_ids.includes(quiz.id);

                            return (
                                <label key={quiz.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                                    selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleQuiz(quiz.id)}
                                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-slate-900">{quiz.name}</span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            {quiz.total_questions ?? 0} soal - {quiz.duration} menit
                                        </span>
                                        {quiz.description && (
                                            <span className="mt-2 block text-xs text-slate-500">{quiz.description}</span>
                                        )}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </form>

                {orderedCourseQuizzes.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Urutan Quiz di Course</h3>
                        <div className="space-y-3">
                            {orderedCourseQuizzes.map((quiz, index) => {
                                const courseQuiz = courseQuizzesMap[quiz.id];
                                return (
                                    <div key={quiz.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                                                {courseQuiz?.pivot?.position ?? index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-slate-900">{quiz.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {index > 0 && (
                                                <Link
                                                    as="button"
                                                    method="post"
                                                    href={route('courses.quizzes.move', [course, quiz])}
                                                    data={{ direction: 'up' }}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                                                >
                                                    ↑
                                                </Link>
                                            )}
                                            {index < orderedCourseQuizzes.length - 1 && (
                                                <Link
                                                    as="button"
                                                    method="post"
                                                    href={route('courses.quizzes.move', [course, quiz])}
                                                    data={{ direction: 'down' }}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                                                >
                                                    ↓
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
