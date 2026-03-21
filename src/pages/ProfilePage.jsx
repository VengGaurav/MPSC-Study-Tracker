import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, updateProfile, logout } = useAuth();
    const { toast } = useToast();
    const { loadDemoData, clearDemoData } = useAppData();
    const { showConfirm } = useConfirm();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    const [name, setName] = useState(user?.name || '');
    const [editing, setEditing] = useState(false);

    const hasChanges = name !== user?.name;
    const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('⚠️ Name cannot be empty');
            return;
        }
        updateProfile({ name: name.trim() });
        toast.success('✅ Profile updated!');
        setEditing(false);
    };

    const handleSignOut = async () => {
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

    const memberSince = user?.memberSince
        ? new Date(user.memberSince).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            <h1 className="page-title" style={{ marginBottom: 24 }}>My Profile</h1>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24, padding: '32px 16px' }}>
                <div className="user-avatar large" style={{ width: 80, height: 80, fontSize: 32 }}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                        initials
                    )}
                </div>

                {editing ? (
                    <input
                        autoFocus
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, maxWidth: 280 }}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                    />
                ) : (
                    <div
                        onClick={() => setEditing(true)}
                        style={{
                            fontSize: 20, fontWeight: 700, cursor: 'pointer',
                            padding: '4px 16px', borderRadius: 8,
                            border: '1px dashed transparent',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                        onMouseEnter={e => e.target.style.borderColor = 'var(--border)'}
                        onMouseLeave={e => e.target.style.borderColor = 'transparent'}
                        title="Click to edit name"
                    >
                        {user?.name || 'Unknown'} <span style={{fontSize: 14, opacity: 0.6}}>✏️</span>
                    </div>
                )}

                <span style={{ fontSize: 15, color: 'var(--text2)' }}>{user?.email}</span>

                <span className={`badge ${user?.authMethod === 'google' ? 'badge-gold' : 'badge-green'}`} style={{ marginTop: 8 }}>
                    {user?.authMethod === 'google' ? '🔗 Google Account' : '✉️ Email Account'}
                </span>

                <span style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                    Member since {memberSince}
                </span>

                {hasChanges && (
                    <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 16 }}>
                        Save Name
                    </button>
                )}
            </div>

            <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>App Theme</div>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={toggleTheme}>
                        {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: 24, background: 'var(--surface-variant)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Management</h3>
                <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 20 }}>
                    Load demo data to see how the app looks when fully populated, or clear all data to start fresh.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%', justifyContent: 'center', background: 'var(--surface2)' }}
                        onClick={() => {
                            loadDemoData();
                            toast.success('✨ Successfully loaded demo data!');
                        }}
                    >
                        🧪 Load Demo Data
                    </button>
                    <button 
                        className="btn btn-outline" 
                        style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={async () => {
                            const confirmed = await showConfirm({
                                title: 'Clear All Data?',
                                message: 'Are you sure you want to delete all subjects, sessions, schedule, and habits? This action cannot be undone.',
                                confirmText: 'Yes, Clear Data',
                                cancelText: 'Cancel',
                                danger: true
                            });
                            if (confirmed) {
                                clearDemoData();
                                toast.success('🗑️ All data has been cleared.');
                            }
                        }}
                    >
                        🗑️ Clear All Data
                    </button>
                </div>
            </div>

            <button 
                className="btn btn-danger" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                onClick={handleSignOut}
            >
                🚪 Sign Out
            </button>
        </div>
    );
}
