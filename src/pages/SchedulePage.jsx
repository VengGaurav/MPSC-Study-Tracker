import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import EmptyState from '../components/common/EmptyState';

const TABS = [
    { key: 'workday', label: '🟢 Mon – Sat (Work Day)' },
    { key: 'sunday', label: '🟠 Sunday (Power Study)' },
];

const CATEGORY_COLORS = {
    STUDY: { bg: 'rgba(248,81,73,0.15)', color: '#f85149', border: 'rgba(248,81,73,0.3)' },
    REVIEW: { bg: 'rgba(63,185,80,0.15)', color: '#3fb950', border: 'rgba(63,185,80,0.3)' },
    BREAK: { bg: 'rgba(88,166,255,0.15)', color: '#58a6ff', border: 'rgba(88,166,255,0.3)' },
    WORK: { bg: 'rgba(210,153,34,0.15)', color: '#d29922', border: 'rgba(210,153,34,0.3)' },
    ROUTINE: { bg: 'rgba(139,148,158,0.15)', color: '#8b949e', border: 'rgba(139,148,158,0.3)' },
    SLEEP: { bg: 'rgba(136,108,228,0.15)', color: '#886ce4', border: 'rgba(136,108,228,0.3)' },
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_COLORS);

function calcDuration(start, end) {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}min` : `${h} hrs`;
    }
    return `${mins} min`;
}

function formatTimeDisplay(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function SchedulePage() {
    const { schedule, subjects, addSlot, updateSlot, deleteSlot, checkSlotOverlap, reload } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [activeTab, setActiveTab] = useState('workday');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [overlapWarnings, setOverlapWarnings] = useState([]);
    const [editingCell, setEditingCell] = useState(null); // { id, field }
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef(null);
    const inputRef = useRef(null);

    const [form, setForm] = useState({
        title: '', subjectId: '', startTime: '09:00', endTime: '10:00',
        details: '', category: '', days: ['Mon'],
    });

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen]);

    useEffect(() => {
        if (editingCell && editInputRef.current) editInputRef.current.focus();
    }, [editingCell]);

    useEffect(() => {
        if (modalOpen) {
            const conflicts = checkSlotOverlap(form, editId);
            setOverlapWarnings(conflicts);
        }
    }, [form.startTime, form.endTime, form.days, modalOpen, checkSlotOverlap, editId]);

    // Filtered slots by tab
    const filteredSlots = useMemo(() => {
        const daySet = activeTab === 'workday'
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            : ['Sun'];
        return schedule
            .filter(s => (s.days || []).some(d => daySet.includes(d)))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [schedule, activeTab]);

    // Stats
    const totalStudyMins = useMemo(() => {
        return filteredSlots
            .filter(s => s.category === 'STUDY' || s.category === 'REVIEW')
            .reduce((sum, s) => {
                const [sh, sm] = (s.startTime || '0:0').split(':').map(Number);
                const [eh, em] = (s.endTime || '0:0').split(':').map(Number);
                let mins = (eh * 60 + em) - (sh * 60 + sm);
                if (mins < 0) mins += 24 * 60;
                return sum + mins;
            }, 0);
    }, [filteredSlots]);

    const openAdd = () => {
        setEditId(null);
        const days = activeTab === 'workday'
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            : ['Sun'];
        setForm({ title: '', subjectId: '', startTime: '09:00', endTime: '10:00', details: '', category: '', days });
        setOverlapWarnings([]);
        setModalOpen(true);
    };

    const openEdit = (slot) => {
        setEditId(slot.id);
        setForm({
            title: slot.title, subjectId: slot.subjectId || '', startTime: slot.startTime,
            endTime: slot.endTime, details: slot.details || '', category: slot.category || '',
            days: slot.days || [],
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.title.trim()) { toast.error('⚠️ Activity name is required'); return; }
        if (form.days.length === 0) { toast.error('⚠️ Select at least one day'); return; }
        if (overlapWarnings.length > 0) toast.warn('⚡ Saved with overlapping slots');
        if (editId) {
            updateSlot(editId, form);
            toast.success('✅ Slot updated!');
        } else {
            addSlot(form);
            toast.success('✅ Slot added!');
        }
        setModalOpen(false);
    };

    const handleDelete = async (id, title) => {
        await showConfirm({
            title: 'Delete Activity?',
            message: `Remove "${title}" from your routine?`,
            confirmText: 'Yes, Delete',
            danger: true,
            onConfirm: () => { deleteSlot(id); toast.success('✅ Removed'); },
        });
    };

    // Inline editing
    const startEdit = (id, field, value) => {
        setEditingCell({ id, field });
        setEditValue(value || '');
    };

    const saveEdit = () => {
        if (!editingCell) return;
        updateSlot(editingCell.id, { [editingCell.field]: editValue });
        setEditingCell(null);
        setEditValue('');
    };

    const cancelEdit = () => { setEditingCell(null); setEditValue(''); };

    const DAYS_ALL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const toggleDay = (day) => {
        setForm(prev => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
        }));
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="routine-header">
                <div>
                    <h1 className="page-title">Daily Routine</h1>
                    <p className="page-subtitle routine-summary">
                        {filteredSlots.length} activities · Study time:{' '}
                        <strong>{Math.floor(totalStudyMins / 60)}h {totalStudyMins % 60}m</strong> effective daily
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Activity</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="routine-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`routine-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            {filteredSlots.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="📅"
                        title="No activities for this tab"
                        subtitle="Add your first activity to plan your routine!"
                        onAdd={openAdd}
                        addLabel="Add Activity"
                    />
                </div>
            ) : (
                <div className="routine-table-wrap">
                    <table className="routine-table">
                        <thead>
                            <tr>
                                <th className="rt-time-col">TIME</th>
                                <th className="rt-activity-col">ACTIVITY</th>
                                <th className="rt-details-col">DETAILS</th>
                                <th className="rt-duration-col">DURATION</th>
                                <th className="rt-actions-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSlots.map(slot => {
                                const sub = subjects.find(s => s.id === slot.subjectId);
                                const cat = CATEGORY_COLORS[slot.category];
                                const dur = calcDuration(slot.startTime, slot.endTime);
                                const isEditingDetails = editingCell?.id === slot.id && editingCell?.field === 'details';
                                const isEditingTitle = editingCell?.id === slot.id && editingCell?.field === 'title';

                                return (
                                    <tr key={slot.id}>
                                        {/* Time */}
                                        <td className="rt-time-cell">
                                            <span className="rt-time-text">
                                                {formatTimeDisplay(slot.startTime)} – {formatTimeDisplay(slot.endTime)}
                                            </span>
                                        </td>

                                        {/* Activity */}
                                        <td className="rt-activity-cell">
                                            <div className="rt-activity-content">
                                                <span className="rt-activity-dot" style={{ background: sub?.color || 'var(--text3)' }} />
                                                {isEditingTitle ? (
                                                    <input
                                                        ref={editInputRef}
                                                        className="rt-inline-input"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={saveEdit}
                                                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="rt-activity-name"
                                                        onClick={() => startEdit(slot.id, 'title', slot.title)}
                                                        title="Click to edit"
                                                    >
                                                        {slot.title}
                                                    </span>
                                                )}
                                                {cat && (
                                                    <span className="rt-category-badge" style={{
                                                        background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                                                    }}>
                                                        {slot.category}
                                                    </span>
                                                )}
                                                {sub && (
                                                    <span className="rt-subject-name">
                                                        <span className="rt-subject-color" style={{ background: sub.color }} />
                                                        {sub.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Details */}
                                        <td className="rt-details-cell">
                                            {isEditingDetails ? (
                                                <input
                                                    ref={editInputRef}
                                                    className="rt-inline-input"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onBlur={saveEdit}
                                                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                />
                                            ) : (
                                                <span
                                                    className="rt-details-text"
                                                    onClick={() => startEdit(slot.id, 'details', slot.details)}
                                                    title="Click to edit"
                                                >
                                                    {slot.details || <span className="rt-details-placeholder">Click to add details…</span>}
                                                </span>
                                            )}
                                        </td>

                                        {/* Duration */}
                                        <td className="rt-duration-cell">
                                            <span className="rt-duration-badge">{dur}</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="rt-actions-cell">
                                            <button className="rt-edit-btn" onClick={() => openEdit(slot)} title="Edit">
                                                ✏️
                                            </button>
                                            <button className="rt-delete-btn" onClick={() => handleDelete(slot.id, slot.title)} title="Delete">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tip Cards */}
            <div className="routine-tips">
                <div className="routine-tip" style={{ borderLeft: '3px solid #f85149' }}>
                    <div className="routine-tip-title">⏱️ TIME AUDIT (DAILY)</div>
                    <div className="routine-tip-text">
                        Track actual vs. planned time. Aim for {Math.floor(totalStudyMins / 60)}h+ effective study daily.
                    </div>
                </div>
                <div className="routine-tip" style={{ borderLeft: '3px solid #3fb950' }}>
                    <div className="routine-tip-title">🍳 EFFICIENCY TIP</div>
                    <div className="routine-tip-text">
                        Batch cook meals, use Pomodoro for study blocks. Minimize context-switching.
                    </div>
                </div>
                <div className="routine-tip" style={{ borderLeft: '3px solid #58a6ff' }}>
                    <div className="routine-tip-title">📘 STUDY STRATEGY</div>
                    <div className="routine-tip-text">
                        Use fresh brain for hard topics. Review and revision before sleep for memory consolidation.
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editId ? 'Edit Activity' : 'Add Activity'}</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {overlapWarnings.length > 0 && (
                                <div className="overlap-warning">
                                    ⚡ Overlaps with: {overlapWarnings.map(w => w.title).join(', ')}
                                </div>
                            )}
                            <div className="form-group">
                                <label>Activity Name</label>
                                <input
                                    ref={inputRef}
                                    placeholder="e.g. STUDY BLOCK 1, Morning Routine"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">None</option>
                                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Subject (optional)</label>
                                    <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                                        <option value="">None</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Details / Notes</label>
                                <input
                                    placeholder="e.g. Current Affairs, Polity – use fresh brain for hard topics"
                                    value={form.details}
                                    onChange={e => setForm({ ...form, details: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Apply to Days</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {DAYS_ALL.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`btn btn-sm ${form.days.includes(day) ? 'btn-primary' : 'btn-ghost'}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editId ? 'Save Changes' : 'Add Activity'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
