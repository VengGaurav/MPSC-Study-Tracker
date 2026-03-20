export default function KeyboardShortcutsModal({ onClose }) {
    const shortcuts = [
        { keys: ['Ctrl', 'K'], action: 'Open global search' },
        { keys: ['Ctrl', 'N'], action: 'Log new session' },
        { keys: ['Ctrl', 'D'], action: 'Go to Dashboard' },
        { keys: ['Ctrl', 'R'], action: 'Go to Daily Routine' },
        { keys: ['Esc'], action: 'Close any modal' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="modal-header">
                    <h2 className="modal-title">⌨️ Keyboard Shortcuts</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="shortcuts-grid">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="shortcut-row">
                            <span style={{ color: 'var(--text2)' }}>{s.action}</span>
                            <div className="shortcut-keys">
                                {s.keys.map((k, j) => (
                                    <span key={j} className="kbd">{k}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-footer" style={{ marginTop: 16 }}>
                    <button className="btn btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
