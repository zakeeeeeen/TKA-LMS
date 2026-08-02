import MathContent from '@/Components/MathContent';
import { Icon } from '@iconify/react';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const mathSymbols = [
    { label: 'a/b', title: 'Pecahan', snippet: '$\\frac{a}{b}$' },
    { label: '√x', title: 'Akar Kuadrat', snippet: '$\\sqrt{x}$' },
    { label: 'xⁿ', title: 'Pangkat / Eksponen', snippet: '$x^{n}$' },
    { label: 'xₙ', title: 'Subscript / Indeks', snippet: '$x_{n}$' },
    { label: '(a)', title: 'Kurung', snippet: '$\\left( a \\right)$' },
    { label: '±', title: 'Plus Minus', snippet: '±' },
    { label: '×', title: 'Kali', snippet: '×' },
    { label: '÷', title: 'Bagi', snippet: '÷' },
    { label: '≤', title: 'Kurang dari sama dengan', snippet: '≤' },
    { label: '≥', title: 'Lebih dari sama dengan', snippet: '≥' },
    { label: '≠', title: 'Tidak sama dengan', snippet: '≠' },
    { label: 'π', title: 'Pi', snippet: 'π' },
    { label: '∫', title: 'Integral', snippet: '$\\int_{a}^{b} f(x) dx$' },
    { label: '∑', title: 'Sigma / Sumasi', snippet: '$\\sum_{i=1}^{n} x_i$' },
    { label: 'α', title: 'Alpha', snippet: 'α' },
    { label: 'β', title: 'Beta', snippet: 'β' },
    { label: 'θ', title: 'Theta', snippet: 'θ' },
    { label: '∞', title: 'Tak Hingga', snippet: '∞' },
];

export default function RichTextMathEditor({
    label,
    value = '',
    onChange,
    error,
    placeholder = 'Ketik isi soal di sini...',
    helperText = 'Gunakan toolbar di atas untuk format bold, italic, rata teks (justify), sisipkan gambar di tengah, atau simbol matematika.',
}) {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showMathModal, setShowMathModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full my-4 shadow-md border border-slate-200 block mx-auto',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[160px] p-4 text-sm font-medium text-slate-800 leading-relaxed',
            },
        },
    });

    // Keep editor content in sync when value changes externally (e.g. form reset or initial load)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const insertMathSymbol = (snippet) => {
        editor.chain().focus().insertContent(` ${snippet} `).run();
    };

    const handleImageFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const res = await axios.post(route('questions.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.url) {
                editor.chain().focus().setImage({ src: res.data.url }).run();
            }
        } catch (err) {
            alert('Gagal mengunggah gambar. Pastikan format gambar valid (JPG, PNG, WebP) & ukuran max 5MB.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {label}
                </label>
            )}

            <div className="rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                {/* TOOLBAR MS WORD STYLE */}
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 p-2 text-slate-700 select-none">
                    {/* Text Style formatting */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('bold') ? 'bg-slate-200 text-blue-600 font-bold' : ''
                        }`}
                        title="Tebal (Bold)"
                    >
                        <Icon icon="lucide:bold" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('italic') ? 'bg-slate-200 text-blue-600 font-bold' : ''
                        }`}
                        title="Miring (Italic)"
                    >
                        <Icon icon="lucide:italic" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('underline') ? 'bg-slate-200 text-blue-600 font-bold' : ''
                        }`}
                        title="Garis Bawah (Underline)"
                    >
                        <Icon icon="lucide:underline" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('strike') ? 'bg-slate-200 text-blue-600 font-bold' : ''
                        }`}
                        title="Coretan (Strikethrough)"
                    >
                        <Icon icon="lucide:strikethrough" className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 mx-1"></div>

                    {/* Alignment options */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Rata Kiri (Align Left)"
                    >
                        <Icon icon="lucide:align-left" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Rata Tengah (Align Center)"
                    >
                        <Icon icon="lucide:align-center" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Rata Kanan (Align Right)"
                    >
                        <Icon icon="lucide:align-right" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Rata Kanan Kiri (Justify)"
                    >
                        <Icon icon="lucide:align-justify" className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 mx-1"></div>

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Daftar Poin (Bullet List)"
                    >
                        <Icon icon="lucide:list" className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 ${
                            editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : ''
                        }`}
                        title="Daftar Angka (Numbered List)"
                    >
                        <Icon icon="lucide:list-ordered" className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 mx-1"></div>

                    {/* Image Inserter Button */}
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition active:scale-95 border border-blue-200"
                        title="Sisipkan Gambar di Posisi Kursor"
                    >
                        <Icon icon={isUploading ? 'lucide:loader-2' : 'lucide:image-plus'} className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                        <span>{isUploading ? 'Mengunggah...' : 'Sisipkan Gambar'}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                    />

                    {/* Math Palette Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowMathModal(!showMathModal)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold transition border ${
                            showMathModal
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                        }`}
                        title="Palet Simbol & Rumus Matematika"
                    >
                        <Icon icon="lucide:binary" className="w-4 h-4" />
                        <span>Simbol Math</span>
                    </button>
                </div>

                {/* MATH SYMBOL PALETTE QUICK BAR */}
                {showMathModal && (
                    <div className="bg-amber-50/90 border-b border-amber-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 text-amber-600" />
                                Klik Simbol untuk Menyisipkan ke Kursor Teks:
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowMathModal(false)}
                                className="text-amber-800 hover:text-amber-950 font-bold text-xs"
                            >
                                Tutup ✕
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {mathSymbols.map((sym) => (
                                <button
                                    key={sym.title}
                                    type="button"
                                    onClick={() => insertMathSymbol(sym.snippet)}
                                    className="rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-amber-400 hover:text-white transition shadow-sm"
                                    title={sym.title}
                                >
                                    {sym.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* TIPTAP EDITOR CONTENT */}
                <EditorContent editor={editor} />
            </div>

            {helperText && <p className="text-xs text-slate-400 font-medium">{helperText}</p>}
            {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}

            {/* LIVE KATEX PREVIEW */}
            {String(value ?? '').trim() !== '' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2">
                        <Icon icon="lucide:eye" className="w-4 h-4 text-blue-600" />
                        <span>Preview Hasil Tampilan Soal & Rumus Siswa</span>
                    </div>
                    <MathContent content={value} isHtml className="text-slate-900 leading-relaxed font-medium" />
                </div>
            )}
        </div>
    );
}
