// ── Local Storage Data Layer ──
// All app data persists in localStorage, scoped per Supabase user ID.

let _currentUserId = localStorage.getItem('mpsc_current_uid') || null;

export function setCurrentUserId(id) {
  _currentUserId = id;
  if (id) {
    localStorage.setItem('mpsc_current_uid', id);
  } else {
    localStorage.removeItem('mpsc_current_uid');
  }
}

function userKey(base) {
  return _currentUserId ? `mpsc_${_currentUserId}_${base}` : `mpsc_${base}`;
}

const KEYS = {
  get USER()      { return userKey('user'); },
  get SUBJECTS()  { return userKey('subjects'); },
  get SESSIONS()  { return userKey('sessions'); },
  get SCHEDULE()  { return userKey('schedule'); },
  get HABITS()    { return userKey('habits'); },
  get NOTES()     { return userKey('notes'); },
  get RESOURCES() { return userKey('resources'); },
  get EXAM_DATE() { return userKey('exam_date'); },
  THEME: 'mpsc_theme',              // shared across users
  SIDEBAR: 'mpsc_sidebar_collapsed', // shared across users
};

function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Subjects ──
export function getSubjects() { return get(KEYS.SUBJECTS, []); }
export function saveSubjects(s) { set(KEYS.SUBJECTS, s); }
export function addSubject(sub) {
  const subjects = getSubjects();
  const newSub = { id: uid(), createdAt: new Date().toISOString(), totalMinutes: 0, ...sub };
  subjects.push(newSub);
  saveSubjects(subjects);
  return newSub;
}
export function updateSubject(id, data) {
  const subjects = getSubjects().map(s => s.id === id ? { ...s, ...data } : s);
  saveSubjects(subjects);
  return subjects.find(s => s.id === id);
}
export function deleteSubject(id) {
  saveSubjects(getSubjects().filter(s => s.id !== id));
  // Also delete related sessions
  saveSessions(getSessions().filter(s => s.subjectId !== id));
}

// ── Sessions ──
export function getSessions() { return get(KEYS.SESSIONS, []); }
export function saveSessions(s) { set(KEYS.SESSIONS, s); }
export function addSession(session) {
  const sessions = getSessions();
  const newSession = { id: uid(), date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString(), ...session };
  sessions.push(newSession);
  saveSessions(sessions);
  // Update subject total
  const subjects = getSubjects();
  const sub = subjects.find(s => s.id === newSession.subjectId);
  if (sub) {
    sub.totalMinutes = (sub.totalMinutes || 0) + (newSession.minutes || 0);
    saveSubjects(subjects);
  }
  return newSession;
}
export function deleteSession(id) {
  const session = getSessions().find(s => s.id === id);
  if (session) {
    const subjects = getSubjects();
    const sub = subjects.find(s => s.id === session.subjectId);
    if (sub) {
      sub.totalMinutes = Math.max(0, (sub.totalMinutes || 0) - (session.minutes || 0));
      saveSubjects(subjects);
    }
  }
  saveSessions(getSessions().filter(s => s.id !== id));
}

// ── Schedule ──
export function getSchedule() { return get(KEYS.SCHEDULE, []); }
export function saveSchedule(s) { set(KEYS.SCHEDULE, s); }
export function addSlot(slot) {
  const schedule = getSchedule();
  const newSlot = { id: uid(), createdAt: new Date().toISOString(), ...slot };
  schedule.push(newSlot);
  saveSchedule(schedule);
  return newSlot;
}
export function updateSlot(id, data) {
  const schedule = getSchedule().map(s => s.id === id ? { ...s, ...data } : s);
  saveSchedule(schedule);
  return schedule.find(s => s.id === id);
}
export function deleteSlot(id) {
  saveSchedule(getSchedule().filter(s => s.id !== id));
}

// ── Demo Schedule Data (from MPSC Study Plan) ──
export function seedDemoSchedule() {
  const existing = getSchedule();
  if (existing.length > 0) return 0; // Don't overwrite

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const SUNDAY = ['Sun'];

  const weekdaySlots = [
    { title: 'Sleep', startTime: '22:45', endTime: '05:00', details: '6h 15m — consistent sleep is memory consolidation', category: 'SLEEP', days: WEEKDAYS },
    { title: 'STUDY BLOCK 1', startTime: '05:00', endTime: '06:15', details: 'Current Affairs · Polity · GK — fresh brain, use it for hard topics', category: 'STUDY', days: WEEKDAYS },
    { title: 'Cook Breakfast + Lunch', startTime: '06:15', endTime: '06:55', details: 'Batch cook both together — saves 25 min daily', category: 'ROUTINE', days: WEEKDAYS },
    { title: 'Morning Routine + Eat', startTime: '06:55', endTime: '07:30', details: 'Freshen up, eat breakfast, get ready for office', category: 'ROUTINE', days: WEEKDAYS },
    { title: 'Commute to Work', startTime: '07:30', endTime: '08:00', details: 'Audio notes / flashcards / Marathi vocab', category: 'REVIEW', days: WEEKDAYS },
    { title: 'JOB', startTime: '09:00', endTime: '18:00', details: 'Lunch break: 15 min optional review of notes', category: 'WORK', days: WEEKDAYS },
    { title: 'Commute Home', startTime: '18:00', endTime: '18:30', details: 'MPSC podcast / current affairs audio', category: 'REVIEW', days: WEEKDAYS },
    { title: 'Decompression Walk', startTime: '18:30', endTime: '19:00', details: 'No phone, no study — mental reset is essential', category: 'BREAK', days: WEEKDAYS },
    { title: 'Cook + Eat Dinner', startTime: '19:00', endTime: '19:50', details: 'Keep it simple: khichdi / poha / roti-sabzi', category: 'ROUTINE', days: WEEKDAYS },
    { title: 'Free Time', startTime: '19:50', endTime: '20:10', details: 'Family / social media / complete switch-off', category: 'BREAK', days: WEEKDAYS },
    { title: 'STUDY BLOCK 2', startTime: '20:10', endTime: '22:30', details: 'History · Geography · Economy · Science (rotate)', category: 'STUDY', days: WEEKDAYS },
    { title: 'Wind Down', startTime: '22:30', endTime: '22:45', details: 'Write 3 key points from memory · Plan tomorrow', category: 'ROUTINE', days: WEEKDAYS },
  ];

  const sundaySlots = [
    { title: 'Sleep', startTime: '22:30', endTime: '05:30', details: '7 hours — slightly more than weekday, earned it', category: 'SLEEP', days: SUNDAY },
    { title: 'Morning Routine', startTime: '05:30', endTime: '06:00', details: 'Yoga / longer walk — invest in your health today', category: 'ROUTINE', days: SUNDAY },
    { title: 'STUDY BLOCK 1', startTime: '06:00', endTime: '08:30', details: 'Weak subject deep dive + Previous Year Questions', category: 'STUDY', days: SUNDAY },
    { title: 'Cook + Eat Breakfast', startTime: '08:30', endTime: '09:15', details: 'Batch cook for full day — prep lunch too', category: 'ROUTINE', days: SUNDAY },
    { title: 'STUDY BLOCK 2', startTime: '09:30', endTime: '12:00', details: 'Full week revision — connect all concepts together', category: 'STUDY', days: SUNDAY },
    { title: 'Lunch + Rest', startTime: '12:00', endTime: '13:00', details: 'Eat well · Short power nap (max 20 min)', category: 'BREAK', days: SUNDAY },
    { title: 'STUDY BLOCK 3', startTime: '13:00', endTime: '15:00', details: 'Maharashtra GK · Marathi language · Current affairs', category: 'STUDY', days: SUNDAY },
    { title: 'Tea Break + Short Walk', startTime: '15:00', endTime: '15:30', details: 'Stretch, breathe, reset — you deserve it', category: 'BREAK', days: SUNDAY },
    { title: 'STUDY BLOCK 4', startTime: '15:30', endTime: '17:30', details: 'MCQ drill · Answer writing practice · Flashcards', category: 'STUDY', days: SUNDAY },
    { title: 'Cook + Eat Dinner', startTime: '17:30', endTime: '18:15', details: 'Batch prep vegetables for weekday mornings', category: 'ROUTINE', days: SUNDAY },
    { title: 'Free Time + Family', startTime: '18:15', endTime: '19:30', details: 'Complete rest — hobby / family / no study guilt', category: 'BREAK', days: SUNDAY },
    { title: 'STUDY BLOCK 5', startTime: '19:30', endTime: '21:00', details: 'Plan next week schedule · Revise today\'s notes', category: 'STUDY', days: SUNDAY },
    { title: 'Wind Down', startTime: '21:00', endTime: '22:30', details: 'Light reading / newspaper · Prep for week ahead', category: 'ROUTINE', days: SUNDAY },
  ];

  const allSlots = [...weekdaySlots, ...sundaySlots].map(slot => ({
    id: uid(),
    createdAt: new Date().toISOString(),
    ...slot,
  }));

  saveSchedule(allSlots);
  return allSlots.length;
}

// ── Habits ──
export function getHabits() { return get(KEYS.HABITS, []); }
export function saveHabits(h) { set(KEYS.HABITS, h); }
export function addHabit(habit) {
  const habits = getHabits();
  const newHabit = { id: uid(), createdAt: new Date().toISOString(), completedDates: [], streak: 0, ...habit };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}
export function toggleHabitDate(id, date) {
  const habits = getHabits();
  const habit = habits.find(h => h.id === id);
  if (habit) {
    if (habit.completedDates.includes(date)) {
      habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
      habit.completedDates.push(date);
    }
    // Recalculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) break;
    }
    habit.streak = streak;
    saveHabits(habits);
  }
  return habit;
}
export function deleteHabit(id) {
  saveHabits(getHabits().filter(h => h.id !== id));
}

// ── Notes ──
export function getNotes() { return get(KEYS.NOTES, []); }
export function saveNotes(n) { set(KEYS.NOTES, n); }
export function addNote(note) {
  const notes = getNotes();
  const newNote = { id: uid(), createdAt: new Date().toISOString(), ...note };
  notes.push(newNote);
  saveNotes(notes);
  return newNote;
}
export function updateNote(id, data) {
  const notes = getNotes().map(n => n.id === id ? { ...n, ...data } : n);
  saveNotes(notes);
}
export function deleteNote(id) {
  saveNotes(getNotes().filter(n => n.id !== id));
}

// ── Exam Date ──
export function getExamDate() { return get(KEYS.EXAM_DATE, null); }
export function saveExamDate(dateStr) { set(KEYS.EXAM_DATE, dateStr); }

// ── Resources ──
export function getResources() { return get(KEYS.RESOURCES, []); }
export function saveResources(r) { set(KEYS.RESOURCES, r); }
export function addResource(res) {
  const resources = getResources();
  const newRes = { id: uid(), createdAt: new Date().toISOString(), ...res };
  resources.push(newRes);
  saveResources(resources);
  return newRes;
}
export function deleteResource(id) {
  saveResources(getResources().filter(r => r.id !== id));
}

// ── User ──
export function getUser() { return get(KEYS.USER, null); }
export function saveUser(u) { set(KEYS.USER, u); }
export function clearUser() { localStorage.removeItem(KEYS.USER); }

// ── Theme ──
export function getTheme() { return localStorage.getItem(KEYS.THEME) || 'dark'; }
export function setTheme(t) { localStorage.setItem(KEYS.THEME, t); }

// ── Sidebar ──
export function getSidebarCollapsed() { return get(KEYS.SIDEBAR, false); }
export function setSidebarCollapsed(v) { set(KEYS.SIDEBAR, v); }

// ── Helpers ──
export function getTodayStudyMinutes() {
  const today = new Date().toISOString().split('T')[0];
  return getSessions()
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + (s.minutes || 0), 0);
}

export function formatMinutes(min) {
  if (!min || min <= 0) return '0m';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getStudyMinutesByDate() {
  const map = {};
  getSessions().forEach(s => {
    map[s.date] = (map[s.date] || 0) + (s.minutes || 0);
  });
  return map;
}

export { KEYS };
