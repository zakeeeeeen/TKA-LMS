import { useRef } from 'react';
import MathContent from '@/Components/MathContent';

const cursorToken = '__CURSOR__';

const toolbarItems = [
    { label: 'a/b', title: 'Pecahan', template: '$\\frac{' + cursorToken + '}{}$' },
    { label: 'sqrt', title: 'Akar', template: '$\\sqrt{' + cursorToken + '}$' },
    { label: 'x^n', title: 'Pangkat', template: '$x^{' + cursorToken + '}$' },
    { label: 'x_n', title: 'Subscript', template: '$x_{' + cursorToken + '}$' },
    { label: '( )', title: 'Kurung', template: '$\\left(' + cursorToken + '\\right)$' },
    { label: '±', title: 'Plus Minus', template: '±' },
    { label: '×', title: 'Kali', template: '×' },
    { label: '÷', title: 'Bagi', template: '÷' },
    { label: '≤', title: 'Kurang dari sama dengan', template: '≤' },
    { label: '≥', title: 'Lebih dari sama dengan', template: '≥' },
    { label: '≠', title: 'Tidak sama dengan', template: '≠' },
    { label: 'π', title: 'Pi', template: 'π' },
];

export default function MathTextInput({
    label,
    value,
    onChange,
    error,
    rows = 3,
    multiline = true,
    placeholder = '',
    helperText = 'Gunakan toolbar untuk sisipkan ekspresi matematika.',
    previewLabel = 'Preview',
}) {
    const inputRef = useRef(null);
    const InputTag = multiline ? 'textarea' : 'input';

    const insertTemplate = (template) => {
        const field = inputRef.current;

        if (!field) {
            onChange((value ?? '') + template.replace(cursorToken, ''));
            return;
        }

        const selectionStart = field.selectionStart ?? 0;
        const selectionEnd = field.selectionEnd ?? selectionStart;
        const currentValue = value ?? '';
        const cursorIndex = template.indexOf(cursorToken);
        const nextTemplate = template.replace(cursorToken, '');
        const nextValue = currentValue.slice(0, selectionStart) + nextTemplate + currentValue.slice(selectionEnd);
        const nextCursor = selectionStart + (cursorIndex >= 0 ? cursorIndex : nextTemplate.length);

        onChange(nextValue);

        requestAnimationFrame(() => {
            if (!inputRef.current) {
                return;
            }

            inputRef.current.focus();
            inputRef.current.setSelectionRange(nextCursor, nextCursor);
        });
    };

    return (
        <div>
            {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap gap-2">
                    {toolbarItems.map((item) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => insertTemplate(item.template)}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            title={item.title}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <InputTag
                    ref={inputRef}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={multiline ? rows : undefined}
                    type={multiline ? undefined : 'text'}
                    placeholder={placeholder}
                    className="mt-3 w-full rounded-xl border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />

                <div className="mt-2 text-xs text-slate-500">{helperText}</div>
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

            {String(value ?? '').trim() !== '' && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{previewLabel}</div>
                    <MathContent
                        content={value}
                        className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800"
                    />
                </div>
            )}
        </div>
    );
}
