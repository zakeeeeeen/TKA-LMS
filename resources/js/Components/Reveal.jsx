import { useEffect, useRef, useState } from 'react';

/**
 * Reveal Component for Scroll Reveal Animation
 * 
 * Specs:
 * - Fade in & Slide up (translate-y-8 / 20px - 40px)
 * - Duration: 500ms - 800ms (default duration-600)
 * - Trigger threshold: 15% - 20% (default 0.18)
 * - Once only (disconnect / unobserve on intersect)
 * - Stagger support via `delay` prop (ms)
 */
export default function Reveal({ children, className = '', delay = 0, threshold = 0.18, offset = 'translate-y-8' }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-600 ease-out transform ${
                isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : `opacity-0 ${offset} scale-95`
            } ${className}`}
        >
            {children}
        </div>
    );
}
