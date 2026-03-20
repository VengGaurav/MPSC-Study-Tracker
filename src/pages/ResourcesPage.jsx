import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import EmptyState from '../components/common/EmptyState';

export default function ResourcesPage() {
    const { resources, addResource, deleteResource } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', url: '', type: 'link', notes: '' });

    const handleAdd = () => {
        if (!form.name.trim()) {
            toast.error('⚠️ Resource name is required');
            return;
        }
        addResource(form);
        toast.success('✅ Resource added!');
        setModalOpen(false);
        setForm({ name: '', url: '', type: 'link', notes: '' });
    };

    const handleDelete = async (id, name) => {
        await showConfirm({
            title: 'Delete Resource?',
            message: `Remove "${name}"?`,
            confirmText: 'Yes, Delete',
            danger: true,
            onConfirm: () => {
                deleteResource(id);
                toast.success('✅ Resource deleted');
            }
        });
    };

    const TYPE_ICONS = { link: '🔗', pdf: '📄', video: '🎬', book: '📖', other: '📁' };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Resources</h1>
                    <p className="page-subtitle">Study materials, links, and references</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Resource</button>
            </div>

            {resources.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="📂"
                        title="No resources yet"
                        subtitle="Add links, PDFs, or references for your study."
                        onAdd={() => setModalOpen(true)}
                        addLabel="Add Resource"
                    />
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>URL</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(r => (
                                <tr key={r.id}>
                                    <td>{TYPE_ICONS[r.type] || '📁'}</td>
                                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                                    <td>
                                        {r.url ? (
                                            <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', fontSize: 13 }}>
                                                Open ↗
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.notes || '—'}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id, r.name)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Resource</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        autoFocus
                                        placeholder="e.g. Laxmikanth Polity"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="link">🔗 Link</option>
                                        <option value="pdf">📄 PDF</option>
                                        <option value="video">🎬 Video</option>
                                        <option value="book">📖 Book</option>
                                        <option value="other">📁 Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>URL (optional)</label>
                                <input placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Notes (optional)</label>
                                <textarea rows={3} placeholder="Any notes about this resource" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Resource</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
