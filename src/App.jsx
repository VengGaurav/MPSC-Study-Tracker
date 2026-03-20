import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { AppDataProvider } from './context/AppDataContext';

import Topbar from './components/common/Topbar';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import BackToTop from './components/common/BackToTop';
import KeyboardShortcutsModal from './components/common/KeyboardShortcutsModal';
import { BottomNav, MobileFAB } from './components/common/MobileNav';

import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import SessionsPage from './pages/SessionsPage';
import TimerPage from './pages/TimerPage';
import SchedulePage from './pages/SchedulePage';
import HabitsPage from './pages/HabitsPage';
import NotesPage from './pages/NotesPage';
import ResourcesPage from './pages/ResourcesPage';
import ProgressPage from './pages/ProgressPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import { getSidebarCollapsed } from './utils/storage';

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--surface)',
            }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    color: 'var(--on-surface-variant)',
                }}>
                    <div className="spinner" style={{
                        width: 40, height: 40, border: '3px solid var(--outline-variant)',
                        borderTopColor: 'var(--primary)', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppLayout() {
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => getSidebarCollapsed());
    const navigate = useNavigate();
    const location = useLocation();

    // Global keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            // Escape closes modals (handled by individual modals too)
            if (e.key === 'Escape') {
                setShortcutsOpen(false);
            }
            // Ctrl+D → Dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                navigate('/dashboard');
            }
            // Ctrl+R → Daily Routine (prevent reload)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                navigate('/schedule');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate]);

    // Listen for sidebar collapse changes
    useEffect(() => {
        const check = () => setSidebarCollapsed(getSidebarCollapsed());
        const interval = setInterval(check, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-layout">
            <Sidebar onShortcutsOpen={() => setShortcutsOpen(true)} />
            <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Topbar />
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/subjects" element={<SubjectsPage />} />
                    <Route path="/sessions" element={<SessionsPage />} />
                    <Route path="/timer" element={<TimerPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/habits" element={<HabitsPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/profile" element={<DashboardPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>

            {/* Mobile */}
            <BottomNav />
            <MobileFAB />

            {/* Global UI */}
            <BackToTop />
            <ToastContainer />

            {shortcutsOpen && <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <ConfirmProvider>
                            <AppDataProvider>
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                                    <Route path="/" element={<Navigate to="/dashboard" />} />
                                    <Route path="/*" element={
                                        <ProtectedRoute>
                                            <AppLayout />
                                        </ProtectedRoute>
                                    } />
                                </Routes>
                            </AppDataProvider>
                        </ConfirmProvider>
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
