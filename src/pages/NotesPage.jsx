import { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import EmptyState from '../components/common/EmptyState';

export default function NotesPage() {
    const { notes, subjects, addNote, updateNote, deleteNote } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ text: '', subjectId: '' });
    const inputRef = useRef(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen]);

    const openAdd = () => {
        setEditId(null);
        setForm({ text: '', subjectId: '' });
        setModalOpen(true);
    };

    const openEdit = (note) => {
        setEditId(note.id);
        setForm({ text: note.text, subjectId: note.subjectId || '' });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.text.trim()) {
            toast.error('⚠️ Note text is required');
            return;
        }
        if (editId) {
            updateNote(editId, form);
            toast.success('✅ Note updated!');
        } else {
            addNote(form);
            toast.success('✅ Note added!');
        }
        setModalOpen(false);
    };

    const handleDelete = async (id) => {
        await showConfirm({
            title: 'Delete Note?',
            message: 'This note will be permanently removed.',
            confirmText: 'Yes, Delete',
            danger: true,
            onConfirm: () => {
                deleteNote(id);
                toast.success('✅ Note deleted');
            }
        });
    };

    const sorted = [...notes].sort((a, b) => b.createdAt?.localeCompare(a.createdAt));

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Quick Notes</h1>
                    <p className="page-subtitle">Jot down quick study notes and reminders</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Note</button>
            </div>

            {sorted.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="✏️"
                        title="No notes yet"
                        subtitle="Add your first quick note!"
                        onAdd={openAdd}
                        addLabel="Add Note"
                    />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {sorted.map(note => {
                        const sub = subjects.find(s => s.id === note.subjectId);
                        return (
                            <div key={note.id} className="note-card" onClick={() => openEdit(note)}>
                                {sub && (
                                    <div style={{ marginBottom: 8 }}>
                                        <span className="badge badge-gold" style={{ fontSize: 11 }}>
                                            {sub.name}
                                        </span>
                                    </div>
                                )}
                                <div className="note-text">{note.text}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="note-date">
                                        {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                                        style={{ padding: '2px 6px', fontSize: 12 }}
                                    >🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editId ? 'Edit Note' : 'Add Note'}</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Subject (optional)</label>
                                <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                                    <option value="">None</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <textarea
                                    ref={inputRef}
                                    rows={5}
                                    placeholder="Write your note here..."
                                    value={form.text}
                                    onChange={e => setForm({ ...form, text: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editId ? 'Save Changes' : 'Add Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
