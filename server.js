import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret-change-me";

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Test endpoint
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// Auth endpoints (mínimos)
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "missing fields" });

    const exists = await pool.query("SELECT 1 FROM users WHERE username=$1", [username]);
    if (exists.rowCount) return res.status(400).json({ error: "user exists" });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, hash]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "register failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query("SELECT id, password_hash FROM users WHERE username=$1", [username]);
    if (!rows.length) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ sub: rows[0].id, username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "login failed" });
  }
});

// Initialize DB (tables)
async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      balance_tokens NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      currency TEXT PRIMARY KEY,
      tokens_per_unit NUMERIC NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      kind TEXT NOT NULL, -- DEPOSIT | SPEND | ADJUST | REWARD
      fiat_amount NUMERIC,
      fiat_currency TEXT,
      tokens NUMERIC NOT NULL,
      nfc_payload TEXT,
      description TEXT,
      prev_hash TEXT NOT NULL,
      hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("✅ Tablas listas en PostgreSQL");
}
initDb();

// root serves frontend/index.html automáticamente desde carpeta estática
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`🚀 NEÓN‑R server listening on :${PORT}`));