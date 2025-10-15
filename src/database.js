const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.NODE_ENV === 'production' ? ':memory:' : (process.env.DB_PATH || './database.sqlite');
let db;

function initDatabase() {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('📊 Connected to SQLite database');
      createTables();
    }
  });
}

function createTables() {
  const createQueries = `
    CREATE TABLE IF NOT EXISTS symptom_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symptoms TEXT NOT NULL,
      response TEXT NOT NULL,
      llm_provider TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT
    );
  `;

  db.exec(createQueries, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('✅ Database tables ready');
    }
  });
}

function saveQuery(symptoms, response, llmProvider, sessionId = null) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO symptom_queries (symptoms, response, llm_provider, session_id)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([symptoms, JSON.stringify(response), llmProvider, sessionId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    
    stmt.finalize();
  });
}

function getHistory(limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT id, symptoms, response, llm_provider, timestamp
      FROM symptom_queries
      ORDER BY timestamp DESC
      LIMIT ?
    `, [limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const history = rows.map(row => ({
          ...row,
          response: JSON.parse(row.response)
        }));
        resolve(history);
      }
    });
  });
}

module.exports = {
  initDatabase,
  saveQuery,
  getHistory
};