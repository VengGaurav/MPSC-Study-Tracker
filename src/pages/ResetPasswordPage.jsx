import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password.trim()) {
            setError('Please enter a new password');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(password);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update password');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="brand">📚 <span>Sadhana</span></div>
                <h1>Reset Password</h1>
                <p className="login-subtitle">Enter your new password below</p>

                {success ? (
                    <div className="login-success">
                        ✅ Password updated successfully! Redirecting…
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-wrapper">
                                <input
                                    autoFocus
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a
                        href="/login"
                        onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                        style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}
                    >
                        ← Back to Sign In
                    </a>
                </div>
            </div>
        </div>
    );
}
