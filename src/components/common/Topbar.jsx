import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAppData } from '../../context/AppDataContext';
import ProfileModal from './ProfileModal';
import GlobalSearch from './GlobalSearch';

const PAGE_NAMES = {
    '/dashboard': 'Dashboard',
    '/subjects': 'Subjects',
    '/sessions': 'Study Sessions',
    '/timer': 'Study Timer',
    '/schedule': 'Daily Routine',
    '/habits': 'Habits',
    '/notes': 'Quick Notes',
    '/resources': 'Resources',
    '/progress': 'Progress',
};

export default function Topbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const pageName = PAGE_NAMES[location.pathname] || '';

    useEffect(() => {
        document.title = pageName ? `${pageName} — Sadhana` : 'Sadhana — MPSC Study Tracker';
    }, [pageName]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSignOut = async () => {
        setDropdownOpen(false);
        const confirmed = await showConfirm({
            title: 'Sign Out?',
            message: 'Are you sure you want to sign out?',
            confirmText: 'Yes, Sign Out',
            cancelText: 'Cancel',
            danger: false,
        });
        if (confirmed) {
            toast.info('Signing you out…');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 1000);
        }
    };

    const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';
    const displayName = user?.name ? (user.name.length > 14 ? user.name.slice(0, 14) + '…' : user.name) : '';

    return (
        <>
            <header className="topbar">
                {/* Left — Page name */}
                <div className="topbar-left">
                    <span className="topbar-page-name page-name">
                        {pageName}
                    </span>
                    <div className="topbar-datetime">
                        <span className="datetime-item">
                            <span className="datetime-icon">📅</span> {formattedDate}
                        </span>
                        <div className="datetime-divider" />
                        <span className="datetime-item">
                            <span className="datetime-icon">⏰</span> {formattedTime}
                        </span>
                    </div>
                </div>

                {/* Right — Search, Theme Toggle, User */}
                <div className="topbar-right">
                    <GlobalSearch />

                    {/* Quick theme toggle */}
                    <button
                        className="btn-icon"
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        style={{ fontSize: 18 }}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* User avatar + dropdown */}
                    <div ref={dropdownRef} className="topbar-user-wrap">
                        <div
                            className="topbar-user-trigger"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span className="topbar-user-name">
                                {displayName}
                            </span>
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>

                        {dropdownOpen && (
                            <div className="avatar-dropdown">
                                <div
                                    className="avatar-dropdown-item"
                                    onClick={() => { setDropdownOpen(false); setProfileOpen(true); }}
                                >
                                    <span className="item-icon">👤</span>
                                    My Profile
                                </div>
                                <div className="avatar-dropdown-item theme-toggle" onClick={toggleTheme}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="item-icon">{isDark ? '🌙' : '☀️'}</span>
                                        {isDark ? 'Dark Mode' : 'Light Mode'}
                                    </div>
                                    <div className={`toggle-switch ${isDark ? 'active' : ''}`} />
                                </div>
                                <div className="avatar-dropdown-divider" />
                                <div
                                    className="avatar-dropdown-item danger"
                                    onClick={handleSignOut}
                                >
                                    <span className="item-icon">🚪</span>
                                    Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
        </>
    );
}
