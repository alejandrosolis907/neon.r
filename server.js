// server.js (CommonJS)
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

// ---------- Rutas estáticas ----------
const PUBLIC_DIR = path.join(__dirname, 'frontend');
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Favicon (evita 502 si el navegador lo pide)
app.get('/favicon.ico', (req, res) => {
  const fav = path.join(PUBLIC_DIR, 'favicon.ico');
  if (fs.existsSync(fav)) return res.sendFile(fav);
  res.status(204).end();
});

// Página principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ---------- Base de datos (opcional pero útil) ----------
const dbUrl = process.env.DATABASE_URL;
let pool = null;

async function initDb() {
  if (!dbUrl) {
    console.log('ℹ️  DATABASE_URL no definida. Continuando sin DB…');
    return;
  }

  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // típico en Railway
    max: 5,
  });

  // Ejecuta schema.sql si existe
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    if (sql.trim()) {
      await pool.query(sql);
      console.log('✅ Tablas listas en PostgreSQL');
    }
  } else {
    console.log('ℹ️ schema.sql no encontrado, saltando migración');
  }
}

// Endpoint de prueba de DB
app.get('/db-test', async (_req, res) => {
  try {
    if (!pool) return res.status(200).json({ ok: true, db: false });
    const { rows } = await pool.query('SELECT NOW() AS now');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- Arranque ----------
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor NEÓN-R escuchando en: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error iniciando DB:', err);
    // Aún así levanta el server sin DB
    app.listen(PORT, () => {
      console.log(`🚀 Servidor NEÓN-R (sin DB) en: ${PORT}`);
    });
  });
