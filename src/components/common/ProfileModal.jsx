import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProfileModal({ onClose }) {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
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
