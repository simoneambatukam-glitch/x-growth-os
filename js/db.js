// js/db.js
// Layer kecil di atas localStorage buat X Growth OS
// Semua data disimpen sebagai JSON di localStorage browser

const DB_KEYS = {
  JOURNAL: 'xgos_journal',     // entri harian
  CONTENT: 'xgos_content',     // database tweet
  GOALS: 'xgos_goals',         // target follower/monetisasi
};

const DB = {
  // ---- helper dasar ----
  _get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // ---- JOURNAL (entri harian) ----
  getJournal() {
    return this._get(DB_KEYS.JOURNAL).sort((a, b) => a.date.localeCompare(b.date));
  },
  addJournalEntry(entry) {
    const data = this._get(DB_KEYS.JOURNAL);
    // kalau tanggal sama udah ada, update aja (jangan dobel)
    const idx = data.findIndex(e => e.date === entry.date);
    if (idx >= 0) data[idx] = entry; else data.push(entry);
    this._set(DB_KEYS.JOURNAL, data);
  },
  deleteJournalEntry(date) {
    const data = this._get(DB_KEYS.JOURNAL).filter(e => e.date !== date);
    this._set(DB_KEYS.JOURNAL, data);
  },

  // ---- CONTENT (database tweet) ----
  getContent() {
    return this._get(DB_KEYS.CONTENT);
  },
  addTweet(tweet) {
    const data = this._get(DB_KEYS.CONTENT);
    tweet.id = Date.now().toString();
    data.push(tweet);
    this._set(DB_KEYS.CONTENT, data);
  },
  deleteTweet(id) {
    const data = this._get(DB_KEYS.CONTENT).filter(t => t.id !== id);
    this._set(DB_KEYS.CONTENT, data);
  },

  // ---- GOALS ----
  getGoals() {
    return this._get(DB_KEYS.GOALS);
  },
  addGoal(goal) {
    const data = this._get(DB_KEYS.GOALS);
    goal.id = Date.now().toString();
    data.push(goal);
    this._set(DB_KEYS.GOALS, data);
  },
  updateGoal(id, changes) {
    const data = this._get(DB_KEYS.GOALS);
    const idx = data.findIndex(g => g.id === id);
    if (idx >= 0) data[idx] = { ...data[idx], ...changes };
    this._set(DB_KEYS.GOALS, data);
  },
  deleteGoal(id) {
    const data = this._get(DB_KEYS.GOALS).filter(g => g.id !== id);
    this._set(DB_KEYS.GOALS, data);
  },

  // ---- ANALYTICS (dihitung dari journal) ----
  getLatestStats() {
    const journal = this.getJournal();
    if (journal.length === 0) return null;
    return journal[journal.length - 1];
  },
  getGrowthPercent() {
    const journal = this.getJournal();
    if (journal.length < 2) return 0;
    const first = journal[0].followers;
    const last = journal[journal.length - 1].followers;
    if (first === 0) return 0;
    return (((last - first) / first) * 100).toFixed(1);
  },
};
