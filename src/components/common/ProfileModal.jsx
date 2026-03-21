import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAppData } from '../../context/AppDataContext';

export default function ProfileModal({ onClose }) {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
    const { loadDemoData, clearDemoData } = useAppData();
    const { showConfirm } = useConfirm();
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

    const memberSince = user?.memberSince
        ? new Date(user.memberSince).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="modal-header">
                    <h2 className="modal-title">My Profile</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div className="user-avatar large">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            initials
                        )}
                    </div>

                    {editing ? (
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, maxWidth: 250 }}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                        />
                    ) : (
                        <div
                            onClick={() => setEditing(true)}
                            style={{
                                fontSize: 18, fontWeight: 600, cursor: 'pointer',
                                padding: '4px 12px', borderRadius: 6,
                                border: '1px dashed transparent',
                            }}
                            onMouseEnter={e => e.target.style.borderColor = 'var(--border)'}
                            onMouseLeave={e => e.target.style.borderColor = 'transparent'}
                            title="Click to edit name"
                        >
                            {user?.name || 'Unknown'} ✏️
                        </div>
                    )}

                    <span style={{ fontSize: 14, color: 'var(--text2)' }}>{user?.email}</span>

                    <span className={`badge ${user?.authMethod === 'google' ? 'badge-gold' : 'badge-green'}`}>
                        {user?.authMethod === 'google' ? '🔗 Google Account' : '✉️ Email Account'}
                    </span>

                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                        Member since {memberSince}
                    </span>
                </div>

                <div style={{ marginTop: 8, marginBottom: 24, padding: '16px', background: 'var(--surface-variant)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Management</h3>
                    <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                        Load demo data to see how the app looks when fully populated, or clear all data to start fresh.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button 
                            className="btn btn-secondary" 
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => {
                                loadDemoData();
                                toast.success('✨ Successfully loaded demo data!');
                                onClose();
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
                                    onClose();
                                }
                            }}
                        >
                            🗑️ Clear All Data
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    {hasChanges && (
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save Changes
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
