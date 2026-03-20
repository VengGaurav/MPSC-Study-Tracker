import { useMemo, useState } from 'react';
import { getStudyMinutesByDate, formatMinutes } from '../../utils/storage';

export default function StudyActivityChart() {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const minutesByDate = getStudyMinutesByDate();

    // Last 14 days data
    const chartData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                displayDate: d.toLocaleDateString('en', { day: 'numeric' }),
                dayName: d.toLocaleDateString('en', { weekday: 'short' }),
                monthName: d.toLocaleDateString('en', { month: 'short' }),
                minutes: minutesByDate[dateStr] || 0,
                isToday: i === 0,
            });
        }
        return days;
    }, [minutesByDate]);

    const maxMin = Math.max(...chartData.map(d => d.minutes), 60);

    // Monthly summary for last 3 months
    const monthlySummary = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let m = 2; m >= 0; m--) {
            const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en', { month: 'short', year: 'numeric' });
            let totalMins = 0;
            let daysStudied = 0;
            const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
                const mins = minutesByDate[dateStr] || 0;
                if (mins > 0) {
                    totalMins += mins;
                    daysStudied++;
                }
            }
            months.push({ label, totalMins, daysStudied, daysInMonth });
        }
        return months;
    }, [minutesByDate]);

    const totalLast14 = chartData.reduce((s, d) => s + d.minutes, 0);
    const daysActive = chartData.filter(d => d.minutes > 0).length;

    return (
        <div className="study-chart">
            {/* Summary row */}
            <div className="study-chart-summary">
                <div className="study-chart-stat">
                    <span className="study-chart-stat-val">{formatMinutes(totalLast14)}</span>
                    <span className="study-chart-stat-label">Last 14 Days</span>
                </div>
                <div className="study-chart-stat">
                    <span className="study-chart-stat-val">{daysActive}/14</span>
                    <span className="study-chart-stat-label">Days Active</span>
                </div>
                <div className="study-chart-stat">
                    <span className="study-chart-stat-val">{daysActive > 0 ? formatMinutes(Math.round(totalLast14 / daysActive)) : '0m'}</span>
                    <span className="study-chart-stat-label">Avg / Day</span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="study-chart-bars">
                {chartData.map((d, i) => (
                    <div
                        key={i}
                        className={`study-chart-col ${d.isToday ? 'today' : ''}`}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        {hoveredIdx === i && d.minutes > 0 && (
                            <div className="study-chart-tooltip">
                                {formatMinutes(d.minutes)}
                            </div>
                        )}
                        <div className="study-chart-bar-wrap">
                            <div
                                className="study-chart-bar"
                                style={{
                                    height: `${d.minutes > 0 ? Math.max(8, (d.minutes / maxMin) * 100) : 4}%`,
                                }}
                                data-active={d.minutes > 0 ? 'true' : 'false'}
                            />
                        </div>
                        <div className="study-chart-day">{d.displayDate}</div>
                        <div className="study-chart-dow">{d.dayName.charAt(0)}</div>
                    </div>
                ))}
            </div>

            {/* Monthly summary cards */}
            <div className="study-chart-months">
                {monthlySummary.map((m, i) => (
                    <div key={i} className="study-chart-month">
                        <div className="study-chart-month-name">{m.label}</div>
                        <div className="study-chart-month-val">{formatMinutes(m.totalMins)}</div>
                        <div className="study-chart-month-sub">
                            {m.daysStudied} of {m.daysInMonth} days
                        </div>
                        <div className="study-chart-month-bar">
                            <div
                                className="study-chart-month-fill"
                                style={{ width: `${(m.daysStudied / m.daysInMonth) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
