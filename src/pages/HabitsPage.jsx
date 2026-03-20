import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import EmptyState from '../components/common/EmptyState';

const DAYS_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitsPage() {
    const { habits, addHabit, toggleHabitDate, deleteHabit } = useAppData();
    const { toast } = useToast();
    const { showConfirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', icon: '📖' });

    const handleAdd = () => {
        if (!form.name.trim()) {
            toast.error('⚠️ Habit name is required');
            return;
        }
        addHabit(form);
        toast.success('✅ Habit created!');
        setModalOpen(false);
        setForm({ name: '', icon: '📖' });
    };

    const handleDelete = async (id, name) => {
        await showConfirm({
            title: 'Delete Habit?',
            message: `Remove "${name}" and all its history?`,
            confirmText: 'Yes, Delete',
            danger: true,
            onConfirm: () => {
                deleteHabit(id);
                toast.success('✅ Habit deleted');
            }
        });
    };

    const today = new Date().toISOString().split('T')[0];

    // Get last 7 days
    const last7days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toISOString().split('T')[0],
                day: DAYS_LABELS[d.getDay()],
                num: d.getDate(),
            });
        }
        return days;
    }, []);

    const ICONS = ['📖', '🏋️', '🧘', '✍️', '🏃', '💧', '🍎', '😴', '📝', '🔬'];

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Habits</h1>
                    <p className="page-subtitle">Build daily discipline for MPSC preparation</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Habit</button>
            </div>

            {habits.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon="🔥"
                        title="No habits added"
                        subtitle="Build your streak! Add daily study habits."
                        onAdd={() => setModalOpen(true)}
                        addLabel="Add Habit"
                    />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {habits.map(habit => (
                        <div key={habit.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 24 }}>{habit.icon || '📖'}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{habit.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                                            🔥 {habit.streak || 0} day streak
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(habit.id, habit.name)}>
                                    🗑️
                                </button>
                            </div>

                            <div className="streak-bar">
                                {last7days.map(day => {
                                    const done = (habit.completedDates || []).includes(day.date);
                                    return (
                                        <div
                                            key={day.date}
                                            className={`streak-day ${done ? 'done' : ''}`}
                                            onClick={() => toggleHabitDate(habit.id, day.date)}
                                            style={{ cursor: 'pointer', flexDirection: 'column' }}
                                            title={day.date}
                                        >
                                            <div style={{ fontSize: 8, lineHeight: 1 }}>{day.day}</div>
                                            <div>{done ? '✓' : day.num}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Habit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Habit</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Habit Name</label>
                                <input
                                    autoFocus
                                    placeholder="e.g. Read 30 pages daily"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <div className="form-group">
                                <label>Icon</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {ICONS.map(ic => (
                                        <div
                                            key={ic}
                                            onClick={() => setForm({ ...form, icon: ic })}
                                            style={{
                                                width: 36, height: 36, borderRadius: 8, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontSize: 20,
                                                background: form.icon === ic ? 'var(--accent-glow)' : 'var(--surface2)',
                                                border: form.icon === ic ? '2px solid var(--accent)' : '2px solid transparent',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {ic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Habit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
