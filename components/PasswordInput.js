import { useState } from 'react';

export default function PasswordInput({ value, onChange, required = true, minLength, placeholder = '••••••••', id = 'password', label = 'Password', hint = '' }) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-bold text-text mb-1">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    required={required}
                    minLength={minLength}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={id === 'password' ? 'current-password' : 'new-password'}
                    className="w-full px-4 py-3 pr-32 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    aria-controls={id}
                    aria-pressed={show}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-3 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition"
                >
                    {show ? 'Hide password' : 'Show password'}
                </button>
            </div>
            {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
        </div>
    );
}
