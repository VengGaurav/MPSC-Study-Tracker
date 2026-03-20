import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select…' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="custom-select" ref={ref}>
            <button
                type="button"
                className={`custom-select-trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <span className={`custom-select-label ${!selected ? 'placeholder' : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="custom-select-arrow">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1.4 0L6 4.6L10.6 0L12 1.4L6 7.4L0 1.4L1.4 0Z" fill="currentColor" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className="custom-select-menu">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.icon && <span className="custom-select-opt-icon">{opt.icon}</span>}
                            <span>{opt.label}</span>
                            {opt.value === value && <span className="custom-select-check">✓</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
