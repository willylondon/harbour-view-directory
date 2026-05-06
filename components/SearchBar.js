import { useRef, useEffect } from 'react';

export default function SearchBar({ value = '', onChange }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') { onChange(''); inputRef.current?.blur(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onChange]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                placeholder="Search businesses, services, food..."
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-5 py-3.5 pl-11 bg-bg border border-border rounded-btn text-text placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition text-base"
                aria-label="Search businesses"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">🔍</span>
            {value && (
                <button onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition" aria-label="Clear search">
                    ✕
                </button>
            )}
        </div>
    );
}
