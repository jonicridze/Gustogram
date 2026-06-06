// ============================================================
//  server.js — Gustogram TMA Backend
//  Стек: Node.js + Express
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const menuRouter    = require('./routes/menu');
const orderRouter   = require('./routes/orders');
const sessionRouter = require('./routes/sessions');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',  // Vite dev
    'https://web.telegram.org',
  ],
  methods: ['GET', 'POST', 'PATCH'],
}));
app.use(express.json());

// ── Роуты ────────────────────────────────────────────────────
app.use('/api/menu',     menuRouter);    // GET  /api/menu/:restaurantId
app.use('/api/orders',   orderRouter);   // POST /api/orders  |  PATCH /api/orders/:sessionId
app.use('/api/sessions', sessionRouter); // GET  /api/sessions/:restaurantId/:tableNum

// ── Health-check ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`✅  Gustogram TMA backend запущен на порту ${PORT}`);
});
