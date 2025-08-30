// server.js - Railway-ready Express server
// Runs on process.env.PORT, serves /frontend, optional DB health if DATABASE_URL is set.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Root -> index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Healthcheck
app.get('/health', (_req, res) => res.status(200).send('OK'));

// Optional DB healthcheck (only if DATABASE_URL exists)
app.get('/db/health', async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ db: 'not_configured' });
  }
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    });
    const result = await pool.query('SELECT 1 as ok');
    await pool.end();
    res.json({ db: 'ok', result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
