export function SkeletonCards({ count = 4 }) {
    return (
        <div className="stats-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
            ))}
        </div>
    );
}

export function SkeletonLines({ count = 4 }) {
    return (
        <div style={{ padding: 20 }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton skeleton-line ${i % 3 === 0 ? 'short' : i % 2 === 0 ? 'medium' : ''}`} />
            ))}
        </div>
    );
}

export function SkeletonSubjectCards({ count = 6 }) {
    return (
        <div className="subjects-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius)' }} />
            ))}
        </div>
    );
}
