import { useToast } from '../../context/ToastContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`toast ${t.type} ${t.dismissing ? 'dismissing' : ''}`}
                    onClick={() => removeToast(t.id)}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
