import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { setCurrentUserId } from '../utils/storage';

const AuthContext = createContext(null);

// Map Supabase user object to our app's user shape
function mapUser(supaUser) {
    if (!supaUser) return null;
    return {
        id: supaUser.id,
        email: supaUser.email,
        name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
        avatar: supaUser.user_metadata?.avatar_url || null,
        memberSince: supaUser.created_at,
        authMethod: supaUser.app_metadata?.provider || 'email',
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const mapped = mapUser(session?.user ?? null);
            setUser(mapped);
            setCurrentUserId(mapped?.id ?? null);
            setLoading(false);
        });

        // Subscribe to auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const mapped = mapUser(session?.user ?? null);
            setUser(mapped);
            setCurrentUserId(mapped?.id ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return mapUser(data.user);
    }, []);

    const register = useCallback(async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) throw error;
        return mapUser(data.user);
    }, []);

    const loginWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
    }, []);

    const logout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setCurrentUserId(null);
    }, []);

    const forgotPassword = useCallback(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    }, []);

    const updatePassword = useCallback(async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    }, []);

    const updateProfile = useCallback(async (data) => {
        const { error } = await supabase.auth.updateUser({
            data: { name: data.name, avatar_url: data.avatar },
        });
        if (error) throw error;
        const updated = { ...user, ...data };
        setUser(updated);
        return updated;
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login, register, loginWithGoogle, logout,
            forgotPassword, updatePassword, updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
