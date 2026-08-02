import { useRef, useState } from 'react';

function extractImageFile(fileList) {
    const files = Array.from(fileList ?? []);
    return files.find((file) => file.type?.startsWith('image/')) ?? null;
}

function extractImageFromClipboard(items) {
    const clipboardItems = Array.from(items ?? []);

    for (const item of clipboardItems) {
        if (item.type?.startsWith('image/')) {
            return item.getAsFile();
        }
    }

    return null;
}

export default function QuestionImageUpload({
    previewUrl,
    error,
    fileName,
    onFileChange,
    label = 'Gambar Soal',
    helperText = 'Mendukung file gambar, screenshot hasil paste, atau copy image dari browser.',
    previewAlt = 'Preview soal',
    compact = false,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handlePickedFiles = (files) => {
        const nextImage = extractImageFile(files);
        if (nextImage) {
            onFileChange(nextImage);
        }
        setIsDragging(false);
    };

    const handlePaste = (event) => {
        const pastedImage = extractImageFromClipboard(event.clipboardData?.items);
        if (!pastedImage) {
            return;
        }

        event.preventDefault();
        onFileChange(pastedImage);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handlePickedFiles(event.target.files)}
            />

            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onPaste={handlePaste}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    handlePickedFiles(event.dataTransfer?.files);
                }}
                className={`border-2 border-dashed text-center outline-none transition ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                } ${compact ? 'rounded-xl p-4' : 'rounded-2xl p-5'}`}
            >
                <div className={`font-semibold text-slate-700 ${compact ? 'text-xs' : 'text-sm'}`}>
                    Klik, drag gambar ke sini, atau paste dari clipboard
                </div>
                <div className="mt-1 text-xs text-slate-500">
                    {helperText}
                </div>
                {fileName && (
                    <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                        {fileName}
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {previewUrl && (
                <div className={`border border-slate-200 bg-white ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-3'}`}>
                    <img
                        src={previewUrl}
                        alt={previewAlt}
                        className={`border border-slate-200 object-contain ${compact ? 'max-h-40 rounded-lg' : 'max-h-72 rounded-xl'}`}
                    />
                </div>
            )}
        </div>
    );
}
