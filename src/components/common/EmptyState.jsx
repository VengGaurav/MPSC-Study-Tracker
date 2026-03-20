export default function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <span className="empty-title">{title}</span>
            <span className="empty-subtitle">{subtitle}</span>
        </div>
    );
}
