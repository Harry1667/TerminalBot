const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/tasks.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      target_window TEXT DEFAULT 'any',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      executed_at TEXT
    )
  `);
});

function all() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tasks ORDER BY scheduled_at ASC', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
}

function create(prompt, scheduled_at, target_window = 'any') {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tasks (prompt, scheduled_at, target_window) VALUES (?, ?, ?)',
      [prompt, scheduled_at, target_window],
      function (err) {
        err ? reject(err) : resolve({ id: this.lastID, prompt, scheduled_at, target_window, status: 'pending' });
      }
    );
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', [id], (err) => {
      err ? reject(err) : resolve();
    });
  });
}

function updateStatus(id, status) {
  return new Promise((resolve, reject) => {
    const executed_at = status === 'done' || status === 'failed' ? new Date().toISOString() : null;
    db.run(
      'UPDATE tasks SET status = ?, executed_at = ? WHERE id = ?',
      [status, executed_at, id],
      (err) => { err ? reject(err) : resolve(); }
    );
  });
}

function getPending() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM tasks WHERE status = 'pending' ORDER BY scheduled_at ASC",
      (err, rows) => { err ? reject(err) : resolve(rows); }
    );
  });
}

module.exports = { all, create, remove, updateStatus, getPending };
