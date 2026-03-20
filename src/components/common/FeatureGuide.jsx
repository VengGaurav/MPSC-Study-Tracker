import { useState, useEffect } from 'react';

const FEATURES = [
    {
        id: 'timer',
        icon: '⏱️',
        title: 'Focus Timer',
        desc: 'Crush your study sessions using the Pomodoro technique or an open-ended Stopwatch. Track deep work intervals with soothing focus music.',
        color: 'linear-gradient(135deg, rgba(240, 165, 0, 0.15), rgba(212, 148, 10, 0.05))',
        border: 'rgba(240, 165, 0, 0.3)'
    },
    {
        id: 'routine',
        icon: '📅',
        title: 'Daily Routine',
        desc: 'Plan your day down to the minute. Build a structured timetable, allocate specific subjects to time-blocks, and stay on top of your schedule.',
        color: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15), rgba(31, 111, 235, 0.05))',
        border: 'rgba(88, 166, 255, 0.3)'
    },
    {
        id: 'progress',
        icon: '📈',
        title: 'Progress Analytics',
        desc: 'Visualize your journey. Get detailed insights, weekly trends, and subject-wise distribution charts to know exactly where you stand.',
        color: 'linear-gradient(135deg, rgba(63, 185, 80, 0.15), rgba(35, 134, 54, 0.05))',
        border: 'rgba(63, 185, 80, 0.3)'
    },
    {
        id: 'habits',
        icon: '🌱',
        title: 'Habit Tracker',
        desc: 'Consistency is key for MPSC. Track daily habits like Reading Newspapers or Revision, and build unbreakable momentum with streaks.',
        color: 'linear-gradient(135deg, rgba(210, 153, 34, 0.15), rgba(187, 128, 9, 0.05))',
        border: 'rgba(210, 153, 34, 0.3)'
    }
];

export default function FeatureGuide() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % FEATURES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const activeFeature = FEATURES[activeIndex];

    return (
        <div className="feature-guide">
            <div className="feature-guide-header">
                <h2>Welcome to Sadhana</h2>
                <p>Your Ultimate MPSC Companion</p>
            </div>

            <div 
                className="feature-slide"
                style={{
                    background: activeFeature.color,
                    borderColor: activeFeature.border
                }}
            >
                <div className="feature-icon">{activeFeature.icon}</div>
                <h3>{activeFeature.title}</h3>
                <p>{activeFeature.desc}</p>
            </div>

            <div className="feature-dots">
                {FEATURES.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`feature-dot ${idx === activeIndex ? 'active' : ''}`}
                        onClick={() => setActiveIndex(idx)}
                    />
                ))}
            </div>

            <div className="feature-guide-footer">
                <p>Explore these features fully once you sign in.</p>
            </div>
        </div>
    );
}
