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

// ── Demo Data Operations ──
export function clearAllDemoData() {
  localStorage.removeItem(KEYS.SUBJECTS);
  localStorage.removeItem(KEYS.SESSIONS);
  localStorage.removeItem(KEYS.SCHEDULE);
  localStorage.removeItem(KEYS.HABITS);
  localStorage.removeItem(KEYS.NOTES);
  localStorage.removeItem(KEYS.RESOURCES);
  localStorage.removeItem(KEYS.EXAM_DATE);
}

export function injectDemoData() {
  clearAllDemoData();

  const subjects = [
    { id: uid(), createdAt: new Date().toISOString(), name: 'History', category: 'GS1', color: '#ffb74d', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Geography', category: 'GS1', color: '#4dd0e1', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Polity', category: 'GS2', color: '#81c784', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Economics', category: 'GS3', color: '#ffd54f', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Science & Tech', category: 'GS3', color: '#ba68c8', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Current Affairs', category: 'General', color: '#f06292', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'CSAT', category: 'Aptitude', color: '#a1887f', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Ethics', category: 'GS4', color: '#90a4ae', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Marathi Grammar', category: 'Language', color: '#4db6ac', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'English Grammar', category: 'Language', color: '#e57373', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'Agriculture', category: 'GS1', color: '#dce775', totalMinutes: 0 },
    { id: uid(), createdAt: new Date().toISOString(), name: 'HRD & HR', category: 'GS3', color: '#7986cb', totalMinutes: 0 },
  ];

  const sessions = [];
  const now = new Date();
  subjects.forEach(sub => {
    // Generate many sessions to populate graphs properly
    const count = Math.floor(Math.random() * 8) + 5; // 5 to 12 sessions per subject
    for (let i = 0; i < count; i++) {
        const d = new Date(now);
        // spread heavily over the last 30 days
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        const dateStr = d.toISOString().split('T')[0];
        const minutes = Math.floor(Math.random() * 120) + 15; // 15 to 135 mins
        sessions.push({
            id: uid(),
            createdAt: d.toISOString(),
            date: dateStr,
            subjectId: sub.id,
            minutes,
            note: 'Studied chapter ' + (i + 1) + ' and revised notes.'
        });
        sub.totalMinutes += minutes;
    }
  });

  saveSubjects(subjects);
  saveSessions(sessions);

  seedDemoSchedule();

  const habits = [
    { id: uid(), title: 'Read Newspaper', icon: '📰', frequency: 'daily', timeOfDay: 'morning', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Meditation', icon: '🧘', frequency: 'daily', timeOfDay: 'morning', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Answer Writing Practice', icon: '✍️', frequency: 'daily', timeOfDay: 'evening', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Exercise / Walk', icon: '🏃', frequency: 'daily', timeOfDay: 'afternoon', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Revise Flashcards', icon: '🃏', frequency: 'weekly', timeOfDay: 'any', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Mock Test', icon: '📝', frequency: 'weekly', timeOfDay: 'morning', completedDates: [], streak: 0, createdAt: new Date().toISOString() },
  ];

  habits.forEach(h => {
    const isDaily = h.frequency === 'daily';
    const count = isDaily ? Math.floor(Math.random() * 8) + 7 : Math.floor(Math.random() * 3) + 2;
    h.streak = count;
    for(let i=0; i<count; i++) {
       const d = new Date(now);
       const daysPassed = isDaily ? i : i * 4; 
       d.setDate(d.getDate() - daysPassed - (Math.floor(Math.random() * 2)));
       h.completedDates.push(d.toISOString().split('T')[0]);
    }
  });
  saveHabits(habits);

  const notes = [
    { id: uid(), title: 'MPSC 2026 Strategy', content: 'Focus on mains answer writing. Revise polity daily. Consistency is key.', color: 'var(--surface-variant)', tags: ['Strategy'], isPinned: true, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Important Articles (Polity)', content: 'Article 14-18: Right to Equality\nArticle 19-22: Right to Freedom\nArticle 21A: Right to Education\nArticle 32: Constitutional Remedies', color: '#ffb74d33', tags: ['Polity', 'Revision'], isPinned: true, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Geography Map Pointers', content: 'Rivers of Maharashtra: Godavari, Krishna, Tapi, Narmada. Check tributaries and dams.', color: '#4dd0e133', tags: ['Geography'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Modern History Timeline', content: '1857 Revolt -> 1885 INC Formation -> 1905 Partition of Bengal -> 1920 Non-Cooperation -> 1942 Quit India', color: '#ba68c833', tags: ['History'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Economy Concepts', content: 'Repo Rate, Reverse Repo Rate, CRR, SLR. Understand inflation targeting by RBI.', color: '#ffd54f33', tags: ['Economics'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Science - Diseases', content: 'Bacterial vs Viral diseases. Focus on endemic diseases in Maharashtra. Recent outbreaks.', color: '#81c78433', tags: ['Science'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Essay Topics', content: '1. AI in Education\n2. Women Empowerment in Rural India\n3. Climate Change and Agriculture', color: 'var(--surface-variant)', tags: ['Essay'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Pending Tasks', content: '- Buy new notebook for CSAT\n- Download last 5 years question papers\n- Renew library membership', color: '#f0629233', tags: ['To-Do'], isPinned: true, createdAt: new Date().toISOString() },
  ];
  saveNotes(notes);

  const resources = [
    { id: uid(), title: 'MPSC Official Syllabus PDF', url: 'https://mpsc.gov.in', type: 'pdf', category: 'Official', tags: ['Syllabus', 'Essential'], isPinned: true, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Laxmikanth Polity Highlighted', url: '#', type: 'pdf', category: 'Study Material', tags: ['Polity'], isPinned: true, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Daily Current Affairs Video', url: 'https://youtube.com', type: 'video', category: 'Current Affairs', tags: ['Daily', 'CA'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Maharashtra State Board Books', url: 'http://cart.ebalbharati.in/', type: 'link', category: 'Reference', tags: ['State Board'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Previous Year Questions (PYQ) App', url: '#', type: 'link', category: 'Practice', tags: ['PYQ', 'App'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Spectrum Modern History Audio', url: '#', type: 'audio', category: 'Study Material', tags: ['History', 'Audiobook'], isPinned: true, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Ethics Case Studies Compilation', url: '#', type: 'doc', category: 'Study Material', tags: ['Ethics', 'GS4'], isPinned: false, createdAt: new Date().toISOString() },
    { id: uid(), title: 'Economic Survey Highlights', url: '#', type: 'doc', category: 'Current Affairs', tags: ['Economics', 'Survey'], isPinned: false, createdAt: new Date().toISOString() },
  ];
  saveResources(resources);

  const examD = new Date(now);
  examD.setDate(examD.getDate() + 75);
  saveExamDate(examD.toISOString().split('T')[0]);
}

export { KEYS };
