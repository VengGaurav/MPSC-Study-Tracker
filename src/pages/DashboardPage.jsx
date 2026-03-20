import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { formatMinutes, getStudyMinutesByDate } from '../utils/storage';
import { SkeletonCards, SkeletonLines } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import StudyActivityChart from '../components/dashboard/StudyActivityChart';
import StudyLineGraph from '../components/dashboard/StudyLineGraph';

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Education is the most powerful weapon to change the world.", author: "Nelson Mandela" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 5) return { text: 'Good Night', emoji: '🌙' };
    if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    if (h < 21) return { text: 'Good Evening', emoji: '🌅' };
    return { text: 'Good Night', emoji: '🌙' };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { subjects, sessions, habits, schedule, loading, todayMinutes, examDate, setExamDate } = useAppData();
    const navigate = useNavigate();
    const [isEditingExam, setIsEditingExam] = useState(false);

    const greeting = getGreeting();
    const quote = QUOTES[new Date().getDate() % QUOTES.length];

    const totalMinutes = useMemo(() =>
        sessions.reduce((sum, s) => sum + (s.minutes || 0), 0), [sessions]
    );

    const totalSessions = sessions.length;
    const totalSubjects = subjects.length;
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    const recentSessions = useMemo(() =>
        [...sessions].sort((a, b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5),
        [sessions]
    );

    // Get streak
    const currentStreak = useMemo(() => {
        const minutesByDate = getStudyMinutesByDate();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            if (minutesByDate[dateStr] > 0) streak++;
            else if (i > 0) break;
        }
        return streak;
    }, [sessions]);

    // Weekly data for mini chart
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
                minutes: dayMins,
            });
        }
        return days;
    }, [sessions]);

    const maxWeekly = Math.max(...weeklyData.map(d => d.minutes), 60);

    // Today's schedule
    const todayDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    const todaySlots = useMemo(() =>
        schedule.filter(s => (s.days || []).includes(todayDay)).sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 4),
        [schedule, todayDay]
    );

    if (loading) return (
        <div className="page-container">
            <SkeletonCards count={4} />
            <SkeletonLines count={5} />
        </div>
    );

    return (
        <div className="page-container">
            {/* ── Greeting Banner ── */}
            <div className="dash-greeting">
                <div className="dash-greeting-left">
                    <div className="dash-greeting-emoji">{greeting.emoji}</div>
                    <div>
                        <h1 className="dash-greeting-text">
                            {greeting.text}, <span className="dash-name">{user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="dash-greeting-sub">
                            {todayMinutes > 0
                                ? `You've studied ${formatMinutes(todayMinutes)} today. Keep going! 🚀`
                                : "Start your study session to build momentum today!"}
                        </p>
                    </div>
                </div>
                <div className="dash-quick-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* Exam Date Widget */}
                    <div className="dash-exam-widget" style={{ 
                        background: 'var(--surface-variant)', 
                        padding: '8px 16px', 
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: '20px' }}>🎯</div>
                        {isEditingExam ? (
                            <input type="date" autoFocus 
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setExamDate(e.target.value);
                                    setIsEditingExam(false);
                                }}
                                onBlur={() => setIsEditingExam(false)}
                                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        ) : examDate ? (() => {
                            const diffDays = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Exam</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: diffDays < 30 ? 'var(--danger)' : 'var(--accent)' }}>
                                            {diffDays > 0 ? `${diffDays} Days Left` : diffDays === 0 ? "It's Today! Good Luck!" : "Exam Passed"}
                                        </span>
                                        <button onClick={() => setIsEditingExam(true)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px', fontSize: '12px' }} title="Change Date">✏️</button>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>No Exam Set</div>
                                <button onClick={() => setIsEditingExam(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 500, textAlign: 'left' }}>
                                    + Add Target Date
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="dash-action-btn" onClick={() => navigate('/timer')}>
                        <span>▶️</span> Start Timer
                    </button>
                    <button className="dash-action-btn secondary" onClick={() => navigate('/sessions')}>
                        <span>📝</span> Log Session
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="dash-stats-grid">
                <div className="dash-stat-card stat-today">
                    <div className="dash-stat-glow" />
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap today">⏱️</div>
                        <div className="dash-stat-trend up">
                            {todayMinutes > 0 ? '↗' : '—'}
                        </div>
                    </div>
                    <div className="dash-stat-value">{formatMinutes(todayMinutes)}</div>
                    <div className="dash-stat-label">Today's Study</div>
                    <div className="dash-stat-bar">
                        <div className="dash-stat-bar-fill" style={{ width: `${Math.min(100, (todayMinutes / (todayMinutes > 480 ? 600 : todayMinutes > 360 ? 480 : todayMinutes > 240 ? 360 : 240)) * 100)}%` }} />
                    </div>
                    <div className="dash-stat-hint">Goal: {todayMinutes > 480 ? '10' : todayMinutes > 360 ? '8' : todayMinutes > 240 ? '6' : '4'} hours</div>
                </div>

                <div className="dash-stat-card stat-total">
                    <div className="dash-stat-glow" />
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap total">📊</div>
                        <span className="dash-stat-badge">{totalSessions} sessions</span>
                    </div>
                    <div className="dash-stat-value">{formatMinutes(totalMinutes)}</div>
                    <div className="dash-stat-label">Total Study Time</div>
                    <div className="dash-stat-extra">
                        Avg: <strong>{formatMinutes(avgMinutes)}</strong> / session
                    </div>
                </div>

                <div className="dash-stat-card stat-streak">
                    <div className="dash-stat-glow" />
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap streak">🔥</div>
                    </div>
                    <div className="dash-stat-value">
                        {currentStreak}<span className="dash-stat-unit">days</span>
                    </div>
                    <div className="dash-stat-label">Current Streak</div>
                    <div className="dash-streak-dots">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            const dateStr = d.toISOString().split('T')[0];
                            const mins = getStudyMinutesByDate()[dateStr] || 0;
                            return (
                                <div key={i} className={`dash-streak-dot ${mins > 0 ? 'active' : ''}`}
                                    title={d.toLocaleDateString('en', { weekday: 'short' })}
                                >
                                    {mins > 0 ? '✓' : '·'}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="dash-stat-card stat-subjects">
                    <div className="dash-stat-glow" />
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap subjects">📚</div>
                        <button className="dash-stat-add" onClick={() => navigate('/subjects')}>+ Add</button>
                    </div>
                    <div className="dash-stat-value">{totalSubjects}</div>
                    <div className="dash-stat-label">Subjects</div>
                    <div className="dash-subject-dots">
                        {subjects.slice(0, 5).map(s => (
                            <div key={s.id} className="dash-subject-dot" style={{ background: s.color }} title={s.name} />
                        ))}
                        {subjects.length > 5 && <span className="dash-subject-more">+{subjects.length - 5}</span>}
                    </div>
                </div>
            </div>

            {/* ── Weekly Overview + Quote ── */}
            <div className="dash-row-2">
                <div className="dash-weekly-card card">
                    <div className="card-header">
                        <span className="card-title">📊 This Week</span>
                        <span className="badge badge-gold">{formatMinutes(weeklyData.reduce((s, d) => s + d.minutes, 0))}</span>
                    </div>
                    <div className="dash-weekly-chart">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="dash-weekly-col">
                                <div className="dash-weekly-val">{d.minutes > 0 ? formatMinutes(d.minutes) : ''}</div>
                                <div className="dash-weekly-bar-wrap">
                                    <div
                                        className="dash-weekly-bar"
                                        style={{ height: `${Math.max(6, (d.minutes / maxWeekly) * 100)}%` }}
                                        data-active={d.minutes > 0 ? 'true' : 'false'}
                                    />
                                </div>
                                <div className="dash-weekly-day">{d.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-quote-card card">
                    <div className="dash-quote-icon">💡</div>
                    <blockquote className="dash-quote-text">"{quote.text}"</blockquote>
                    <cite className="dash-quote-author">— {quote.author}</cite>
                    <div className="dash-quote-date">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* ── Study Line Graph ── */}
            <div className="card dash-heatmap-card">
                <div className="card-header">
                    <span className="card-title">📈 Study Activity — Last 14 Days</span>
                    <span className="badge">{totalSessions} total sessions</span>
                </div>
                <StudyLineGraph />
            </div>

            {/* ── Bottom Grid: Recent Sessions + Today's Schedule + Subject Breakdown ── */}
            <div className="dash-bottom-grid">
                {/* Recent Sessions */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">⏱️ Recent Sessions</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sessions')}>View All →</button>
                    </div>
                    {recentSessions.length === 0 ? (
                        <EmptyState
                            icon="⏱️"
                            title="No study sessions logged yet"
                            subtitle="Start the timer to track your first session!"
                            onAdd={() => navigate('/timer')}
                            addLabel="Start Timer"
                        />
                    ) : (
                        <div className="dash-session-list">
                            {recentSessions.map(s => {
                                const sub = subjects.find(sub => sub.id === s.subjectId);
                                return (
                                    <div key={s.id} className="dash-session-item">
                                        <div className="dash-session-color" style={{ background: sub?.color || 'var(--accent)' }} />
                                        <div className="dash-session-info">
                                            <div className="dash-session-name">{sub?.name || 'Unknown'}</div>
                                            <div className="dash-session-date">{s.date}</div>
                                        </div>
                                        <span className="badge badge-gold">{formatMinutes(s.minutes)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Today's Schedule */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📅 Today's Schedule</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/schedule')}>Edit →</button>
                    </div>
                    {todaySlots.length === 0 ? (
                        <EmptyState
                            icon="📅"
                            title={`No slots for ${todayDay}`}
                            subtitle="Plan your routine to stay focused!"
                            onAdd={() => navigate('/schedule')}
                            addLabel="Add Slot"
                        />
                    ) : (
                        <div className="dash-schedule-list">
                            {todaySlots.map(slot => {
                                const sub = subjects.find(s => s.id === slot.subjectId);
                                return (
                                    <div key={slot.id} className="dash-schedule-item">
                                        <div className="dash-schedule-time">
                                            <div className="dash-time-start">{slot.startTime}</div>
                                            <div className="dash-time-line" />
                                            <div className="dash-time-end">{slot.endTime}</div>
                                        </div>
                                        <div className="dash-schedule-info">
                                            <div className="dash-schedule-title">{slot.title}</div>
                                            {sub && <div className="dash-schedule-subject" style={{ color: sub.color }}>{sub.name}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Subject Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📚 Subject Breakdown</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')}>Manage →</button>
                    </div>
                    {subjects.length === 0 ? (
                        <EmptyState
                            icon="📚"
                            title="No subjects yet"
                            subtitle="Add your first subject to start tracking!"
                            onAdd={() => navigate('/subjects')}
                            addLabel="Add Subject"
                        />
                    ) : (
                        <div className="dash-subjects-list">
                            {subjects.map(sub => {
                                const perc = totalMinutes > 0 ? Math.round((sub.totalMinutes || 0) / totalMinutes * 100) : 0;
                                return (
                                    <div key={sub.id} className="dash-subject-row">
                                        <div className="dash-subject-left">
                                            <span className="subject-dot" style={{ background: sub.color || 'var(--accent)' }} />
                                            <span className="dash-subject-name">{sub.name}</span>
                                        </div>
                                        <div className="dash-subject-right">
                                            <div className="dash-subject-progress">
                                                <div className="dash-subject-progress-fill" style={{ width: `${perc}%`, background: sub.color || 'var(--accent)' }} />
                                            </div>
                                            <span className="dash-subject-perc">{formatMinutes(sub.totalMinutes)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
