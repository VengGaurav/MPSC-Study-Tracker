import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { formatMinutes } from '../utils/storage';

export default function ProgressPage() {
    const { subjects, sessions } = useAppData();

    // Weekly data
    const weeklyData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayMins = sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + (s.minutes || 0), 0);
            days.push({
                label: d.toLocaleDateString('en', { weekday: 'short' }),
                date: dateStr,
                minutes: dayMins,
            });
        }
        return days;
    }, [sessions]);

    const maxWeekly = Math.max(...weeklyData.map(d => d.minutes), 1);

    // Subject stats
    const subjectStats = useMemo(() =>
        subjects.map(sub => {
            const subSessions = sessions.filter(s => s.subjectId === sub.id);
            const totalMins = subSessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
            const count = subSessions.length;
            const targetHours = parseInt(sub.targetHours) || 0;
            const targetMins = targetHours * 60;
            const progress = targetMins > 0 ? Math.min(100, Math.round(totalMins / targetMins * 100)) : 0;
            return { ...sub, totalMins, count, progress, targetMins };
        }),
        [subjects, sessions]
    );

    const totalMins = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

    return (
        <div className="page-container">
            <h1 className="page-title">Progress</h1>
            <p className="page-subtitle">Track your preparation progress</p>

            {/* Weekly Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">📊 This Week</span>
                    <span className="badge badge-gold">{formatMinutes(weeklyData.reduce((s, d) => s + d.minutes, 0))} total</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 8px' }}>
                    {weeklyData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text2)' }}>{formatMinutes(d.minutes)}</span>
                            <div style={{
                                width: '100%', maxWidth: 40,
                                height: `${Math.max(4, (d.minutes / maxWeekly) * 120)}px`,
                                background: d.minutes > 0
                                    ? 'linear-gradient(180deg, var(--accent), var(--accent2))'
                                    : 'var(--surface2)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.5s ease',
                            }} />
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subject Progress */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">📚 Subject Progress</span>
                </div>
                {subjectStats.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                        Add subjects to see progress
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {subjectStats.map(sub => (
                            <div key={sub.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="subject-dot" style={{ background: sub.color }} />
                                        <span style={{ fontWeight: 500, fontSize: 14 }}>{sub.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text2)' }}>
                                        <span>{formatMinutes(sub.totalMins)}</span>
                                        <span>·</span>
                                        <span>{sub.count} sessions</span>
                                        {sub.targetMins > 0 && (
                                            <>
                                                <span>·</span>
                                                <span className="badge badge-gold">{sub.progress}%</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {sub.targetMins > 0 && (
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${sub.progress}%`, background: sub.color }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Overall Stats */}
            <div className="stats-grid" style={{ marginTop: 20 }}>
                <div className="stat-card">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{formatMinutes(totalMins)}</span>
                    <span className="stat-label">Total Study Time</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">{sessions.length}</span>
                    <span className="stat-label">Total Sessions</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📈</span>
                    <span className="stat-value">{sessions.length > 0 ? formatMinutes(Math.round(totalMins / sessions.length)) : '0m'}</span>
                    <span className="stat-label">Avg Session</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📚</span>
                    <span className="stat-value">{subjects.length}</span>
                    <span className="stat-label">Subjects</span>
                </div>
            </div>
        </div>
    );
}
