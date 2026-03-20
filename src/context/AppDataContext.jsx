import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as storage from '../utils/storage';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
    const [subjects, setSubjects] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [habits, setHabits] = useState([]);
    const [notes, setNotes] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(() => {
        setSubjects(storage.getSubjects());
        setSessions(storage.getSessions());
        setSchedule(storage.getSchedule());
        setHabits(storage.getHabits());
        setNotes(storage.getNotes());
        setResources(storage.getResources());
        setLoading(false);
    }, []);

    useEffect(() => { reload(); }, [reload]);

    // ── Subject ops ──
    const addSubject = useCallback((sub) => {
        const s = storage.addSubject(sub);
        reload();
        return s;
    }, [reload]);

    const updateSubject = useCallback((id, data) => {
        storage.updateSubject(id, data);
        reload();
    }, [reload]);

    const deleteSubject = useCallback((id) => {
        storage.deleteSubject(id);
        reload();
    }, [reload]);

    // ── Session ops ──
    const addSession = useCallback((session) => {
        const s = storage.addSession(session);
        reload();
        return s;
    }, [reload]);

    const deleteSession = useCallback((id) => {
        storage.deleteSession(id);
        reload();
    }, [reload]);

    // ── Schedule ops ──
    const addSlot = useCallback((slot) => {
        const s = storage.addSlot(slot);
        reload();
        return s;
    }, [reload]);

    const updateSlot = useCallback((id, data) => {
        storage.updateSlot(id, data);
        reload();
    }, [reload]);

    const deleteSlot = useCallback((id) => {
        storage.deleteSlot(id);
        reload();
    }, [reload]);

    // ── Habit ops ──
    const addHabit = useCallback((habit) => {
        const h = storage.addHabit(habit);
        reload();
        return h;
    }, [reload]);

    const toggleHabitDate = useCallback((id, date) => {
        storage.toggleHabitDate(id, date);
        reload();
    }, [reload]);

    const deleteHabit = useCallback((id) => {
        storage.deleteHabit(id);
        reload();
    }, [reload]);

    // ── Note ops ──
    const addNote = useCallback((note) => {
        const n = storage.addNote(note);
        reload();
        return n;
    }, [reload]);

    const updateNote = useCallback((id, data) => {
        storage.updateNote(id, data);
        reload();
    }, [reload]);

    const deleteNote = useCallback((id) => {
        storage.deleteNote(id);
        reload();
    }, [reload]);

    // ── Resource ops ──
    const addResource = useCallback((res) => {
        const r = storage.addResource(res);
        reload();
        return r;
    }, [reload]);

    const deleteResource = useCallback((id) => {
        storage.deleteResource(id);
        reload();
    }, [reload]);

    // ── Helpers ──
    const todayMinutes = storage.getTodayStudyMinutes();

    const checkSlotOverlap = useCallback((newSlot, excludeId) => {
        const conflicting = schedule.filter(slot => {
            if (slot.id === excludeId) return false;
            // Check day overlap
            const sameDays = (newSlot.days || []).some(d => (slot.days || []).includes(d));
            if (!sameDays) return false;
            // Check time overlap
            return newSlot.startTime < slot.endTime && newSlot.endTime > slot.startTime;
        });
        return conflicting;
    }, [schedule]);

    return (
        <AppDataContext.Provider value={{
            subjects, sessions, schedule, habits, notes, resources, loading,
            addSubject, updateSubject, deleteSubject,
            addSession, deleteSession,
            addSlot, updateSlot, deleteSlot, checkSlotOverlap,
            addHabit, toggleHabitDate, deleteHabit,
            addNote, updateNote, deleteNote,
            addResource, deleteResource,
            todayMinutes, reload,
        }}>
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const ctx = useContext(AppDataContext);
    if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
    return ctx;
}
