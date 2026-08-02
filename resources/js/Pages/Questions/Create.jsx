import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QuestionImageUpload from '@/Components/QuestionImageUpload';
import MathTextInput from '@/Components/MathTextInput';
import RichTextMathEditor from '@/Components/RichTextMathEditor';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const optionKeys = ['a', 'b', 'c', 'd', 'e'];

const typeLabels = {
    single_choice: 'Pilihan Ganda 1 Jawaban',
    multiple_choice: 'Pilihan Ganda Multi Jawaban',
    matrix_binary: 'Tabel 2 Kolom',
    essay: 'Isian Lama',
};

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        subject_id: '',
        grade_level: 'SD',
        question_type: 'single_choice',
        question_text: '',
        image: null,
        option_a: '',
        option_a_image: null,
        option_b: '',
        option_b_image: null,
        option_c: '',
        option_c_image: null,
        option_d: '',
        option_d_image: null,
        option_e: '',
        option_e_image: null,
        correct_option: '',
        correct_options: [],
        matrix_left_label: 'Benar',
        matrix_right_label: 'Salah',
        matrix_rows: [
            { statement: '', correct_answer: 'left' },
            { statement: '', correct_answer: 'left' },
        ],
        explanation: '',
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [optionImagePreviewUrls, setOptionImagePreviewUrls] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questions.store'), { forceFormData: true });
    };

    const { subjects, questionTypeOptions = [] } = usePage().props;
    const isSingle = data.question_type === 'single_choice';
    const isMulti = data.question_type === 'multiple_choice';
    const isMatrix = data.question_type === 'matrix_binary';
    const isEssay = data.question_type === 'essay';

    const handleTypeChange = (nextType) => {
        setData('question_type', nextType);

        if (nextType === 'matrix_binary') {
            optionKeys.forEach((option) => {
                setData(`option_${option}`, '');
                setData(`option_${option}_image`, null);
            });
            setData('correct_option', '');
            setData('correct_options', []);
            if (data.matrix_rows.length === 0) {
                setData('matrix_rows', [
                    { statement: '', correct_answer: 'left' },
                    { statement: '', correct_answer: 'left' },
                ]);
            }
            return;
        }

        setData('matrix_left_label', data.matrix_left_label || 'Benar');
        setData('matrix_right_label', data.matrix_right_label || 'Salah');

        if (nextType === 'single_choice') {
            setData('correct_options', []);
        }

        if (nextType === 'multiple_choice') {
            setData('correct_option', '');
        }
    };

    const updateMatrixRow = (index, key, value) => {
        const nextRows = [...data.matrix_rows];
        nextRows[index] = { ...nextRows[index], [key]: value };
        setData('matrix_rows', nextRows);
    };

    const addMatrixRow = () => {
        setData('matrix_rows', [...data.matrix_rows, { statement: '', correct_answer: 'left' }]);
    };

    const removeMatrixRow = (index) => {
        setData('matrix_rows', data.matrix_rows.filter((_, rowIndex) => rowIndex !== index));
    };

    const toggleCorrectOption = (option) => {
        const nextValues = data.correct_options.includes(option)
            ? data.correct_options.filter((value) => value !== option)
            : [...data.correct_options, option];
        setData('correct_options', nextValues);
    };

    const handleOptionImageChange = (option, file) => {
        setData(`option_${option}_image`, file);
    };

    const hasOptionContent = (option, textValue = data[`option_${option}`]) => {
        return textValue.trim() !== '' || Boolean(data[`option_${option}_image`]);
    };

    const handleOptionTextChange = (option, value) => {
        setData(`option_${option}`, value);

        if (hasOptionContent(option, value)) {
            return;
        }

        if (data.correct_option === option) {
            setData('correct_option', '');
        }

        if (data.correct_options.includes(option)) {
            setData('correct_options', data.correct_options.filter((item) => item !== option));
        }
    };

    useEffect(() => {
        if (!data.image) {
            setImagePreviewUrl(null);
            return undefined;
        }

        const nextPreviewUrl = URL.createObjectURL(data.image);
        setImagePreviewUrl(nextPreviewUrl);

        return () => URL.revokeObjectURL(nextPreviewUrl);
    }, [data.image]);

    useEffect(() => {
        const nextPreviewUrls = {};

        optionKeys.forEach((option) => {
            const file = data[`option_${option}_image`];
            if (file) {
                nextPreviewUrls[option] = URL.createObjectURL(file);
            }
        });

        setOptionImagePreviewUrls(nextPreviewUrls);

        return () => {
            Object.values(nextPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [
        data.option_a_image,
        data.option_b_image,
        data.option_c_image,
        data.option_d_image,
        data.option_e_image,
    ]);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Add Question
                    </h2>
                </div>
            }
        >
            <Head title="Add Question" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select
                                value={data.subject_id}
                                onChange={(e) => setData('subject_id', e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat Sekolah</label>
                            <select
                                value={data.grade_level}
                                onChange={(e) => setData('grade_level', e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                            >
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                            </select>
                            {errors.grade_level && <p className="text-red-500 text-sm mt-1">{errors.grade_level}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Soal</label>
                            <select
                                value={data.question_type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {questionTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {typeLabels[type] ?? type}
                                    </option>
                                ))}
                            </select>
                            {errors.question_type && <p className="text-red-500 text-sm mt-1">{errors.question_type}</p>}
                        </div>
                    </div>

                    <RichTextMathEditor
                        label="Isi Soal (Teks, Gambar Inline & Math Editor)"
                        value={data.question_text}
                        onChange={(value) => setData('question_text', value)}
                        error={errors.question_text}
                    />

                    <QuestionImageUpload
                        previewUrl={imagePreviewUrl}
                        error={errors.image}
                        fileName={data.image?.name ?? null}
                        onFileChange={(file) => setData('image', file)}
                    />

                    {isMatrix ? (
                        <div>
                            <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Label Kolom Kiri</label>
                                        <input
                                            type="text"
                                            value={data.matrix_left_label}
                                            onChange={(e) => setData('matrix_left_label', e.target.value)}
                                            className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.matrix_left_label && <p className="text-red-500 text-sm mt-1">{errors.matrix_left_label}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Label Kolom Kanan</label>
                                        <input
                                            type="text"
                                            value={data.matrix_right_label}
                                            onChange={(e) => setData('matrix_right_label', e.target.value)}
                                            className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.matrix_right_label && <p className="text-red-500 text-sm mt-1">{errors.matrix_right_label}</p>}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pernyataan</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">{data.matrix_left_label || 'Kiri'}</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">{data.matrix_right_label || 'Kanan'}</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {data.matrix_rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <MathTextInput
                                                            value={row.statement}
                                                            onChange={(value) => updateMatrixRow(index, 'statement', value)}
                                                            rows={2}
                                                            placeholder={`Pernyataan ${index + 1}`}
                                                            previewLabel={`Preview Pernyataan ${index + 1}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="radio"
                                                            checked={row.correct_answer === 'left'}
                                                            onChange={() => updateMatrixRow(index, 'correct_answer', 'left')}
                                                            className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="radio"
                                                            checked={row.correct_answer === 'right'}
                                                            onChange={() => updateMatrixRow(index, 'correct_answer', 'right')}
                                                            className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMatrixRow(index)}
                                                            disabled={data.matrix_rows.length <= 1}
                                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {errors.matrix_rows && <p className="text-red-500 text-sm">{errors.matrix_rows}</p>}
                                <button
                                    type="button"
                                    onClick={addMatrixRow}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Tambah Baris
                                </button>
                            </div>
                        </div>
                    ) : isEssay ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            Tipe isian lama hanya ditampilkan untuk kompatibilitas data lama.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {optionKeys.map((option) => (
                                    <div key={option}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Option {option.toUpperCase()}
                                        </label>
                                        <MathTextInput
                                            value={data[`option_${option}`]}
                                            onChange={(value) => handleOptionTextChange(option, value)}
                                            error={errors[`option_${option}`]}
                                            multiline={false}
                                            previewLabel={`Preview Opsi ${option.toUpperCase()}`}
                                        />

                                        <div className="mt-3">
                                            <QuestionImageUpload
                                                label={`Gambar Opsi ${option.toUpperCase()}`}
                                                helperText="Opsional. Klik, drag-drop, atau paste gambar untuk opsi ini."
                                                previewAlt={`Preview opsi ${option.toUpperCase()}`}
                                                previewUrl={optionImagePreviewUrls[option] ?? null}
                                                error={errors[`option_${option}_image`]}
                                                fileName={data[`option_${option}_image`]?.name ?? null}
                                                onFileChange={(file) => handleOptionImageChange(option, file)}
                                                compact
                                            />
                                        </div>

                                        {(isSingle || isMulti) && (
                                            <label className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                                                hasOptionContent(option)
                                                    ? 'border-slate-200 text-slate-700'
                                                    : 'border-slate-100 text-slate-400'
                                            }`}>
                                                <input
                                                    type={isSingle ? 'radio' : 'checkbox'}
                                                    name={isSingle ? 'correct_option_inline' : undefined}
                                                    checked={isSingle ? data.correct_option === option : data.correct_options.includes(option)}
                                                    onChange={() => {
                                                        if (isSingle) {
                                                            setData('correct_option', option);
                                                            return;
                                                        }

                                                        toggleCorrectOption(option);
                                                    }}
                                                    disabled={!hasOptionContent(option)}
                                                    className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    title={isSingle ? 'Pilih sebagai jawaban benar' : 'Tandai sebagai kunci'}
                                                />
                                                <span>{isSingle ? 'Jadikan jawaban benar' : 'Tandai sebagai kunci'}</span>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {errors.correct_option && <p className="text-red-500 text-sm mt-1">{errors.correct_option}</p>}
                            {errors.correct_options && <p className="text-red-500 text-sm mt-1">{errors.correct_options}</p>}
                        </>
                    )}

                    <RichTextMathEditor
                        label="Pembahasan / Solusi Soal (Explanation)"
                        value={data.explanation}
                        onChange={(value) => setData('explanation', value)}
                        error={errors.explanation}
                    />

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
                        >
                            {processing ? 'Menyimpan...' : 'Save'}
                        </button>
                        <Link href={route('questions.index')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-xl font-medium transition">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
