import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [confirmState, setConfirmState] = useState(null);

    const showConfirm = useCallback((opts) => {
        return new Promise((resolve) => {
            setConfirmState({ ...opts, resolve });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirmState?.onConfirm) confirmState.onConfirm();
        confirmState?.resolve?.(true);
        setConfirmState(null);
    }, [confirmState]);

    const handleCancel = useCallback(() => {
        confirmState?.resolve?.(false);
        setConfirmState(null);
    }, [confirmState]);

    useEffect(() => {
        if (!confirmState) return;
        const handler = (e) => {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleConfirm();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [confirmState, handleCancel, handleConfirm]);

    return (
        <ConfirmContext.Provider value={{ showConfirm }}>
            {children}
            {confirmState && (
                <div className="confirm-overlay" onClick={handleCancel}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>{confirmState.title || 'Confirm'}</h3>
                        <p>{confirmState.message || 'Are you sure?'}</p>
                        <div className="confirm-actions">
                            <button className="btn btn-ghost" onClick={handleCancel}>
                                {confirmState.cancelText || 'Cancel'}
                            </button>
                            <button
                                className={`btn ${confirmState.danger ? 'btn-danger' : 'btn-primary'}`}
                                onClick={handleConfirm}
                                autoFocus
                            >
                                {confirmState.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
    return ctx;
}
