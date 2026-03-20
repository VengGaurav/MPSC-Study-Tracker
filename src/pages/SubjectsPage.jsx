import { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import EmptyState from '../components/common/EmptyState';

const COLORS = ['#f0a500', '#58a6ff', '#3fb950', '#f85149', '#bc8cff', '#ff7b72', '#79c0ff', '#d2a8ff', '#ffa657', '#7ee787'];

export default function SubjectsPage() {
    const { subjects, addSubject, updateSubject, deleteSubject } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', color: COLORS[0], targetHours: '' });
    const inputRef = useRef(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen]);

    const openAdd = () => {
        setEditId(null);
        setForm({ name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], targetHours: '' });
        setModalOpen(true);
    };

    const openEdit = (sub) => {
        setEditId(sub.id);
        setForm({ name: sub.name, color: sub.color, targetHours: sub.targetHours || '' });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) {
            toast.error('⚠️ Subject name is required');
            return;
        }
        if (editId) {
            updateSubject(editId, form);
            toast.success('✅ Subject updated!');
        } else {
            addSubject(form);
            toast.success('✅ Subject added!');
        }
        setModalOpen(false);
    };

    const handleDelete = async (id, name) => {
        const confirmed = await showConfirm({
            title: 'Delete Subject?',
            message: `This will remove "${name}" and all sessions linked to it.`,
            confirmText: 'Yes, Delete',
            cancelText: 'Cancel',
            danger: true,
            onConfirm: () => {
                deleteSubject(id);
                toast.success('✅ Subject deleted');
            }
        });
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Subjects</h1>
                    <p className="page-subtitle">Manage your MPSC exam subjects</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Subject</button>
            </div>

            {subjects.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="📚"
                        title="No subjects yet"
                        subtitle="Add your first subject to start tracking!"
                        onAdd={openAdd}
                        addLabel="Add Subject"
                    />
                </div>
            ) : (
                <div className="subjects-grid">
                    {subjects.map(sub => (
                        <div key={sub.id} className="subject-card" onClick={() => openEdit(sub)}>
                            <div className="subject-color-top" style={{ background: sub.color || 'var(--accent)' }} />
                            <div className="subject-name">{sub.name}</div>
                            <div className="subject-meta">
                                <span>⏱️ {Math.floor((sub.totalMinutes || 0) / 60)}h {(sub.totalMinutes || 0) % 60}m</span>
                                {sub.targetHours && <span>🎯 {sub.targetHours}h target</span>}
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={(e) => { e.stopPropagation(); handleDelete(sub.id, sub.name); }}
                                style={{ position: 'absolute', top: 12, right: 12, fontSize: 12, padding: '4px 8px' }}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editId ? 'Edit Subject' : 'Add Subject'}</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Subject Name</label>
                                <input
                                    ref={inputRef}
                                    placeholder="e.g. Polity, History, Geography"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLORS.map(c => (
                                        <div
                                            key={c}
                                            onClick={() => setForm({ ...form, color: c })}
                                            style={{
                                                width: 28, height: 28, borderRadius: '50%', background: c,
                                                cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent',
                                                transition: 'border-color 0.2s',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Target Hours (optional)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={form.targetHours}
                                    onChange={e => setForm({ ...form, targetHours: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editId ? 'Save Changes' : 'Add Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
