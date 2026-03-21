import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';

const POMODORO_MINUTES = 25;

function fmtDuration(totalMins) {
    if (!totalMins || totalMins <= 0) return '0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

export default function TimerPage() {
    const { subjects, addSession } = useAppData();
    const { toast } = useToast();
    const [selectedSubject, setSelectedSubject] = useState('');
    const [running, setRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [goalHours, setGoalHours] = useState('');
    const [goalMins, setGoalMins] = useState('');
    const intervalRef = useRef(null);
    const alertedRef = useRef({ 25: false, 50: false });

    // Tab title update
    useEffect(() => {
        if (running) {
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            document.title = `⏱️ ${h}:${m}:${s} — Sadhana`;
        } else {
            document.title = 'Study Timer — Sadhana';
        }
    }, [seconds, running]);

    // Timer logic
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    const next = prev + 1;
                    const mins = Math.floor(next / 60);
                    if (mins === 25 && !alertedRef.current[25]) {
                        alertedRef.current[25] = true;
                        playChime();
                        toast.info('🍅 25 minutes! Pomodoro complete. Take a break?');
                    }
                    if (mins === 50 && !alertedRef.current[50]) {
                        alertedRef.current[50] = true;
                        playChime();
                        toast.info('🍅 50 minutes! Double Pomodoro!');
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, toast]);

    // Session goal reached alert
    const totalGoalMins = (parseInt(goalHours) || 0) * 60 + (parseInt(goalMins) || 0);
    useEffect(() => {
        if (running && totalGoalMins > 0 && seconds === totalGoalMins * 60) {
            playChime();
            toast.success(`🎉 Session goal reached: ${fmtDuration(totalGoalMins)}!`);
            setRunning(false);
        }
    }, [seconds, totalGoalMins, running, toast]);

    const playChime = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) { }
    };

    const handleStart = () => {
        if (!selectedSubject) {
            toast.error('⚠️ Select a subject first');
            return;
        }
        setRunning(true);
        alertedRef.current = { 25: false, 50: false };
    };

    const handlePause = () => setRunning(false);

    const handleStop = () => {
        setRunning(false);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0 && selectedSubject) {
            addSession({ subjectId: selectedSubject, minutes, notes: 'Timer session' });
            toast.success(`✅ Session logged: ${fmtDuration(minutes)}`);
        }
        setSeconds(0);
        alertedRef.current = { 25: false, 50: false };
    };

    const handleReset = () => {
        setRunning(false);
        setSeconds(0);
        alertedRef.current = { 25: false, 50: false };
    };

    // Format time
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    // Pomodoro progress (resets every 25 min)
    const pomodoroSeconds = seconds % (POMODORO_MINUTES * 60);
    const pomodoroProgress = pomodoroSeconds / (POMODORO_MINUTES * 60);
    const circumference = 2 * Math.PI * 130;
    const strokeDashoffset = circumference * (1 - pomodoroProgress);

    // Goal progress
    const currentMins = seconds / 60;
    const goalProgress = totalGoalMins > 0 ? Math.min(1, currentMins / totalGoalMins) * 100 : 0;

    return (
        <div className="page-container">
            <h1 className="page-title">Study Timer</h1>
            <p className="page-subtitle">Focus mode — track with Pomodoro technique</p>

            <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: 40 }}>
                {/* Subject selector */}
                <div className="form-group" style={{ maxWidth: 300, margin: '0 auto 36px' }}>
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        style={{ textAlign: 'center' }}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {/* Timer Display with Pomodoro Ring */}
                <div className={`timer-display ${running ? 'running' : ''}`}>
                    <svg className="pomodoro-ring" viewBox="0 0 280 280">
                        <circle className="ring-bg" cx="140" cy="140" r="130" />
                        <circle
                            className="ring-progress"
                            cx="140" cy="140" r="130"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 140 140)"
                        />
                    </svg>
                    <span className="timer-time">{h}:{m}:{s}</span>
                    <span className="timer-label">
                        {running ? '● Recording' : 'Ready'}
                    </span>
                </div>

                {/* Controls */}
                <div className="timer-controls">
                    {!running ? (
                        <button className="btn btn-primary" onClick={handleStart} style={{ minWidth: 120 }}>
                            ▶ {seconds > 0 ? 'Resume' : 'Start'}
                        </button>
                    ) : (
                        <button className="btn btn-ghost" onClick={handlePause} style={{ minWidth: 120 }}>
                            ⏸ Pause
                        </button>
                    )}
                    {seconds > 0 && (
                        <>
                            <button className="btn btn-primary" onClick={handleStop}>
                                ⏹ Stop & Save
                            </button>
                            <button className="btn btn-ghost" onClick={handleReset}>
                                ↺ Reset
                            </button>
                        </>
                    )}
                </div>

                {/* Session Goal */}
                <div style={{ marginTop: 28, maxWidth: 300, margin: '28px auto 0' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>
                        Session Goal
                    </label>
                    <div className="timer-goal-inputs">
                        <div className="timer-goal-field">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={goalHours}
                                onChange={e => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    setGoalHours(v);
                                }}
                                className="timer-goal-input"
                            />
                            <span className="timer-goal-unit">hrs</span>
                        </div>
                        <span className="timer-goal-sep">:</span>
                        <div className="timer-goal-field">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="00"
                                value={goalMins}
                                onChange={e => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    if (parseInt(v) > 59) return;
                                    setGoalMins(v);
                                }}
                                className="timer-goal-input"
                            />
                            <span className="timer-goal-unit">min</span>
                        </div>
                    </div>
                    {totalGoalMins > 0 && (
                        <div className="timer-goal-status">
                            <span>{fmtDuration(Math.floor(currentMins))}</span>
                            <span>of {fmtDuration(totalGoalMins)} goal</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
