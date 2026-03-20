import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MOBILE_NAV = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/schedule', icon: '📅', label: 'Schedule' },
    { path: '/timer', icon: '⏱️', label: 'Timer' },
    { path: '/progress', icon: '📊', label: 'Progress' },
    { path: '/profile', icon: '👤', label: 'Profile' },
];

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="bottom-nav">
            {MOBILE_NAV.map(item => (
                <div
                    key={item.path}
                    className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => {
                        if (item.path === '/profile') {
                            // handled by parent
                        }
                        navigate(item.path);
                    }}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export function MobileFAB({ onLogSession, onAddNote, onStartTimer }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="mobile-fab">
            {open && (
                <div className="fab-menu">
                    <div className="fab-menu-item" onClick={() => { setOpen(false); onLogSession?.(); }}>
                        ⏱️ Log Session
                    </div>
                    <div className="fab-menu-item" onClick={() => { setOpen(false); onAddNote?.(); }}>
                        ✏️ Add Note
                    </div>
                    <div className="fab-menu-item" onClick={() => { setOpen(false); navigate('/timer'); }}>
                        ▶️ Start Timer
                    </div>
                </div>
            )}
            <button className={`fab-btn ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
                +
            </button>
        </div>
    );
}
