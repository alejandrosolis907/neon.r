import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;  // 👈 Railway asigna dinámicamente el puerto
const JWT_SECRET = process.env.JWT_SECRET || "devsecret-change-me";

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// --- TEST de DB rápido
app.get("/api/test-db", async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    console.error("DB test error:", e);
    res.status(500).json({ ok: false, error: "DB" });
  }
});

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor NEON-R corriendo en puerto ${PORT}`);
});
