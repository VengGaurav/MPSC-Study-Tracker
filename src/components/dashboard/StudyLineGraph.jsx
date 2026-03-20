import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useAppData } from '../../context/AppDataContext';

function fmtHours(mins) {
    if (mins === 0) return '0h';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

export default function StudyLineGraph() {
    // Use sessions from React context so the graph re-renders when sessions change
    const { sessions } = useAppData();

    // Build minutes-by-date from reactive sessions state
    const minutesByDate = useMemo(() => {
        const map = {};
        sessions.forEach(s => {
            map[s.date] = (map[s.date] || 0) + (s.minutes || 0);
        });
        return map;
    }, [sessions]);

    // Last 14 days — short enough to read every label, long enough to show trends
    const chartData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const minutes = minutesByDate[dateStr] || 0;
            days.push({
                date: d.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
                weekday: d.toLocaleDateString('en', { weekday: 'short' }),
                fullDate: dateStr,
                minutes,
                hours: +(minutes / 60).toFixed(2),
            });
        }
        return days;
    }, [minutesByDate]);

    const totalMins = chartData.reduce((s, d) => s + d.minutes, 0);
    const daysActive = chartData.filter(d => d.minutes > 0).length;
    const avgPerDay = daysActive > 0 ? Math.round(totalMins / daysActive) : 0;
    const bestDay = chartData.reduce((best, d) => d.minutes > best.minutes ? d : best, chartData[0]);
    const maxHours = Math.max(...chartData.map(d => d.hours), 1);

    // Dynamic Y ticks in hours — adapts well beyond 4 hrs
    const yTicks = useMemo(() => {
        const ceilH = Math.ceil(maxHours);
        const step = ceilH <= 4 ? 1 : ceilH <= 8 ? 2 : ceilH <= 16 ? 4 : 6;
        const ticks = [];
        for (let t = 0; t <= ceilH + step; t += step) ticks.push(t);
        return ticks;
    }, [maxHours]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        const mins = payload[0].payload.minutes;
        const weekday = payload[0].payload.weekday;
        return (
            <div className="study-graph-tooltip">
                <div className="study-graph-tooltip-date">{weekday}, {label}</div>
                <div className="study-graph-tooltip-value">
                    <span className="study-graph-tooltip-dot" />
                    {fmtHours(mins)}
                </div>
                {mins === 0 && <div className="study-graph-tooltip-empty">No study recorded</div>}
            </div>
        );
    };

    return (
        <div className="study-graph-container">
            {/* ── Inline summary strip ── */}
            <div className="study-graph-summary">
                <div className="study-graph-summary-item">
                    <span className="study-graph-summary-val">{fmtHours(totalMins)}</span>
                    <span className="study-graph-summary-label">Total</span>
                </div>
                <div className="study-graph-summary-divider" />
                <div className="study-graph-summary-item">
                    <span className="study-graph-summary-val">{daysActive}<span className="study-graph-summary-unit">/14</span></span>
                    <span className="study-graph-summary-label">Days Active</span>
                </div>
                <div className="study-graph-summary-divider" />
                <div className="study-graph-summary-item">
                    <span className="study-graph-summary-val">{fmtHours(avgPerDay)}</span>
                    <span className="study-graph-summary-label">Avg / Day</span>
                </div>
                <div className="study-graph-summary-divider" />
                <div className="study-graph-summary-item best">
                    <span className="study-graph-summary-val">{fmtHours(bestDay.minutes)}</span>
                    <span className="study-graph-summary-label">Best Day</span>
                </div>
            </div>

            {/* ── Chart ── */}
            <div className="study-graph-chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f0a500" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#f0a500" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--border)"
                            opacity={0.4}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text3)', fontSize: 11 }}
                            interval={0}
                            angle={-35}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            ticks={yTicks}
                            domain={[0, yTicks[yTicks.length - 1]]}
                            tick={{ fill: 'var(--text3)', fontSize: 11 }}
                            tickFormatter={(v) => `${v}h`}
                            width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="var(--border)" />
                        <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#f0a500"
                            strokeWidth={2.5}
                            fill="url(#studyGrad)"
                            fillOpacity={1}
                            dot={{ r: 3, fill: '#f0a500', stroke: 'var(--surface)', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#f0a500', stroke: 'var(--surface)', strokeWidth: 3 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
