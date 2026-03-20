import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FeatureGuide from '../components/common/FeatureGuide';

export default function LoginPage() {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);
    const { login, register, loginWithGoogle, forgotPassword, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('Please fill all fields');
            return;
        }
        if (tab === 'register' && !name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (tab === 'register' && password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            if (tab === 'login') {
                await login(email, password);
                toast.success('✅ Login Successful! Welcome back.');
            } else {
                await register(email, password, name);
                toast.success('✅ Account Created Successfully!');
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        try {
            await loginWithGoogle();
            // Google OAuth redirects away — toast not needed here
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!forgotEmail.trim()) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(forgotEmail);
            setForgotSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        }
        setLoading(false);
    };

    // ── Forgot Password View ──
    if (forgotMode) {
        return (
            <div className="login-layout">
                <div className="login-showcase">
                    <FeatureGuide />
                </div>
                <div className="login-form-container">
                    <div className="login-card">
                    <div className="brand">📚 <span>Sadhana</span></div>
                    <h1>Forgot Password</h1>
                    <p className="login-subtitle">Enter your email and we'll send you a reset link</p>

                    {forgotSent ? (
                        <div className="login-success">
                            📧 Password reset email sent to <strong>{forgotEmail}</strong>.<br />
                            Check your inbox (and spam folder) for the reset link.
                        </div>
                    ) : (
                        <>
                            {error && <div className="login-error">{error}</div>}
                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        autoFocus
                                        type="email"
                                        placeholder="you@example.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                                    {loading ? 'Sending…' : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setForgotMode(false); setError(''); setForgotSent(false); }}
                            style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}
                        >
                            ← Back to Sign In
                        </a>
                    </div>
                </div>
            </div>
            </div>
        );
    }

    // ── Main Login / Register View ──
    return (
        <div className="login-layout">
            <div className="login-showcase">
                <FeatureGuide />
            </div>
            <div className="login-form-container">
                <div className="login-card">
                <div className="brand">📚 <span>Sadhana</span></div>
                <h1>MPSC Study Tracker</h1>
                <p className="login-subtitle">Track your preparation, build discipline</p>

                <div className="login-tabs">
                    <div className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
                        Sign In
                    </div>
                    <div className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
                        Sign Up
                    </div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {tab === 'register' && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            autoFocus={tab === 'login'}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '🙈' : '👁️'}
                            </span>
                        </div>
                    </div>

                    {tab === 'login' && (
                        <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 8 }}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setForgotMode(true); setError(''); setForgotEmail(email); }}
                                className="forgot-password-link"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'Please wait…' : (tab === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

            </div>
            </div>
        </div>
    );
}
