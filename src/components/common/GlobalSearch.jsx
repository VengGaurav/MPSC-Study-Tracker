import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';

export default function GlobalSearch() {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const navigate = useNavigate();
    const { subjects, notes, sessions, schedule } = useAppData();
    const debounceRef = useRef(null);

    // Build searchable items
    const searchItems = useMemo(() => {
        const items = [];
        subjects.forEach(s => items.push({ type: 'subject', icon: '📊', name: s.name, route: '/subjects', id: s.id }));
        notes.forEach(n => items.push({ type: 'note', icon: '✏️', name: n.text?.slice(0, 60) || 'Untitled', route: '/notes', id: n.id }));
        sessions.forEach(s => {
            const sub = subjects.find(sub => sub.id === s.subjectId);
            items.push({ type: 'session', icon: '⏱️', name: `${sub?.name || 'Unknown'} — ${s.minutes}min`, route: '/sessions', id: s.id });
        });
        schedule.forEach(s => items.push({ type: 'slot', icon: '📅', name: s.title || s.subject || 'Slot', route: '/schedule', id: s.id }));
        return items;
    }, [subjects, notes, sessions, schedule]);

    useEffect(() => {
        if (expanded && inputRef.current) inputRef.current.focus();
    }, [expanded]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setExpanded(false);
                setQuery('');
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Keyboard shortcut to open
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setExpanded(true);
            }
            if (e.key === 'Escape' && expanded) {
                setExpanded(false);
                setQuery('');
                setResults([]);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [expanded]);

    const handleSearch = (val) => {
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (!val.trim()) { setResults([]); return; }
            const q = val.toLowerCase();
            setResults(searchItems.filter(item =>
                item.name.toLowerCase().includes(q)
            ).slice(0, 8));
        }, 300);
    };

    const handleResultClick = (item) => {
        navigate(item.route);
        setExpanded(false);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="search-container" ref={wrapRef}>
            <div className={`search-input-wrap ${expanded ? 'expanded' : ''}`}>
                <button
                    className="btn-icon"
                    onClick={() => setExpanded(!expanded)}
                    style={{ border: 'none', background: 'transparent', flexShrink: 0, fontSize: 16 }}
                >
                    🔍
                </button>
                <input
                    ref={inputRef}
                    placeholder="Search… (Ctrl+K)"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                />
            </div>

            {expanded && results.length > 0 && (
                <div className="search-results">
                    {results.map(item => (
                        <div
                            key={item.type + item.id}
                            className="search-result-item"
                            onClick={() => handleResultClick(item)}
                        >
                            <span className="sr-icon">{item.icon}</span>
                            <div>
                                <div>{item.name}</div>
                                <span className="sr-label">{item.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {expanded && query && results.length === 0 && (
                <div className="search-results" style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                    No results found
                </div>
            )}
        </div>
    );
}
