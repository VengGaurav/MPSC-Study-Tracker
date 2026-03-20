import { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { formatMinutes } from '../utils/storage';
import EmptyState from '../components/common/EmptyState';

export default function SessionsPage() {
    const { sessions, subjects, addSession, deleteSession } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ subjectId: '', minutes: '', date: new Date().toISOString().split('T')[0], notes: '' });
    const inputRef = useRef(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen]);

    // Listen for Ctrl+N
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setModalOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const openAdd = () => {
        setForm({ subjectId: subjects[0]?.id || '', minutes: '', date: new Date().toISOString().split('T')[0], notes: '' });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.subjectId || !form.minutes) {
            toast.error('⚠️ Please select a subject and enter duration');
            return;
        }
        addSession({ ...form, minutes: parseInt(form.minutes) });
        toast.success('✅ Session logged!');
        setModalOpen(false);
    };

    const handleDelete = async (id) => {
        await showConfirm({
            title: 'Delete Session?',
            message: 'This study session will be permanently removed.',
            confirmText: 'Yes, Delete',
            danger: true,
            onConfirm: () => {
                deleteSession(id);
                toast.success('✅ Session deleted');
            }
        });
    };

    const sorted = [...sessions].sort((a, b) => b.createdAt?.localeCompare(a.createdAt));

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Study Sessions</h1>
                    <p className="page-subtitle">Log and track your study sessions</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Log Session</button>
            </div>

            {sorted.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="⏱️"
                        title="No study sessions logged yet"
                        subtitle="Start the timer or manually log a session!"
                        onAdd={openAdd}
                        addLabel="Log Session"
                    />
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Duration</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(s => {
                                const sub = subjects.find(sub => sub.id === s.subjectId);
                                return (
                                    <tr key={s.id}>
                                        <td>{s.date}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className="subject-dot" style={{ background: sub?.color || 'var(--accent)' }} />
                                                {sub?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-gold">{formatMinutes(s.minutes)}</span></td>
                                        <td style={{ color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.notes || '—'}
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Log Session Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Log Study Session</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    ref={inputRef}
                                    value={form.subjectId}
                                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 60"
                                        value={form.minutes}
                                        onChange={e => setForm({ ...form, minutes: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes (optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="What did you study?"
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Log Session</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
