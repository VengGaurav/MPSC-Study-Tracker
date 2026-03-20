import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatMinutes, getSidebarCollapsed, setSidebarCollapsed as saveSidebarCollapsed } from '../../utils/storage';

const NAV_ITEMS = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/subjects', icon: '📚', label: 'Subjects' },
    { path: '/sessions', icon: '⏱️', label: 'Sessions' },
    { path: '/timer', icon: '▶️', label: 'Study Timer' },
    { path: '/schedule', icon: '📅', label: 'Daily Routine' },
    { path: '/habits', icon: '🔥', label: 'Habits' },
    { path: '/notes', icon: '✏️', label: 'Quick Notes' },
    { path: '/resources', icon: '📂', label: 'Resources' },
    { path: '/progress', icon: '📊', label: 'Progress' },
];

export default function Sidebar({ onShortcutsOpen }) {
    const [collapsed, setCollapsed] = useState(() => getSidebarCollapsed());
    const { todayMinutes } = useAppData();
    const location = useLocation();

    useEffect(() => {
        saveSidebarCollapsed(collapsed);
        document.documentElement.style.setProperty(
            '--current-sidebar-width',
            collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
        );
    }, [collapsed]);

    return (
        <nav
            className="desktop-sidebar"
            style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
        >
            {/* Brand */}
            <div
                className="sidebar-brand"
                style={{
                    padding: collapsed ? '16px 0' : '16px 20px',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}
            >
                {!collapsed && (
                    <div className="sidebar-brand-logo">
                        <span className="sidebar-brand-icon">📚</span>
                        <span className="sidebar-brand-name">Sadhana</span>
                    </div>
                )}
                {collapsed && <span className="sidebar-brand-icon">📚</span>}
                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    style={{
                        position: collapsed ? 'absolute' : 'relative',
                        right: collapsed ? -14 : 'auto',
                        zIndex: 10,
                    }}
                >
                    {collapsed ? '›' : '‹'}
                </button>
            </div>

            {/* Nav Items */}
            <div className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : ''}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? 'active' : ''}`
                        }
                        style={{
                            padding: collapsed ? '12px 0' : '12px 16px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        }}
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div
                className="sidebar-footer"
                style={{
                    padding: collapsed ? '12px 0' : '12px 20px',
                    alignItems: collapsed ? 'center' : 'stretch',
                }}
            >
                {!collapsed && (
                    <div className="sidebar-today-stat">
                        Today: <span className="sidebar-today-value">
                            {formatMinutes(todayMinutes)}
                        </span>
                    </div>
                )}
                <button
                    className="sidebar-shortcuts-btn"
                    onClick={onShortcutsOpen}
                    title="Keyboard Shortcuts"
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    <span className="sidebar-shortcut-icon">?</span>
                    {!collapsed && <span>Shortcuts</span>}
                </button>
            </div>
        </nav>
    );
}
