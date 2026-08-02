import DOMPurify from 'dompurify';
import { useEffect, useRef } from 'react';
import renderMathInElement from 'katex/contrib/auto-render';

const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
];

export function parseMarkdownToHtml(text = '') {
    if (!text) return '';

    let html = text;

    // Horizontal rule ---
    html = html.replace(/(?:^|\n)\s*---+\s*(?:\n|$)/g, '<hr class="my-3 border-slate-200" />');

    // Headers: ### Title, ## Title, # Title (handles inline or newline)
    html = html.replace(/(?:^|\n)\s*###\s+(.*$)/gim, '<h4 class="font-bold text-slate-900 text-sm mt-3 mb-1.5">$1</h4>');
    html = html.replace(/(?:^|\n)\s*##\s+(.*$)/gim, '<h3 class="font-bold text-slate-900 text-base mt-3 mb-1.5">$1</h3>');
    html = html.replace(/(?:^|\n)\s*#\s+(.*$)/gim, '<h2 class="font-bold text-slate-900 text-lg mt-3.5 mb-1.5">$1</h2>');

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Italic: *text* or _text_
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    // Bullet lists: * item or - item (handles inline or line start)
    html = html.replace(/(?:^|\n)\s*[*:-]\s+(.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-blue-500 font-bold">•</span><span>$1</span></div>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
}

export default function MathContent({
    as: Component = 'div',
    content = '',
    className = '',
    isHtml = false,
    isMarkdown = false,
}) {
    const containerRef = useRef(null);

    const htmlContent = isMarkdown ? parseMarkdownToHtml(content) : content;

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        renderMathInElement(containerRef.current, {
            delimiters,
            throwOnError: false,
            strict: 'ignore',
        });
    }, [content, isHtml, isMarkdown]);

    if (isHtml || isMarkdown) {
        const cleanHtml = DOMPurify.sanitize(htmlContent ?? '', {
            ADD_TAGS: ['img', 'iframe'],
            ADD_ATTR: ['target', 'style', 'src', 'alt', 'class'],
        });
        return (
            <Component
                ref={containerRef}
                className={`prose max-w-none ${className}`}
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
        );
    }

    return (
        <Component ref={containerRef} className={className}>
            {content ?? ''}
        </Component>
    );
}

