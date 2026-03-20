import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="nf-code">404</div>
            <div className="nf-message">Page not found</div>
            <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 400 }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 12 }}>
                🏠 Go to Dashboard
            </button>
        </div>
    );
}
