// ============================================================
//  routes/sessions.js
//  GET  /api/sessions/:restaurantId/:tableNum — получить активный чек
//  POST /api/sessions/close                   — закрыть сессию
// ============================================================
const express = require('express');
const {
  getActiveSession,
  closeSession,
  getSessionTotal,
} = require('../services/sessionStore');

const router = express.Router();

// GET /api/sessions/:restaurantId/:tableNum
router.get('/:restaurantId/:tableNum', (req, res) => {
  const { restaurantId, tableNum } = req.params;
  const session = getActiveSession(restaurantId, Number(tableNum));

  if (!session) {
    return res.json({ ok: true, session: null });
  }

  res.json({
    ok: true,
    session: {
      ...session,
      total: getSessionTotal(session),
    },
  });
});

// POST /api/sessions/close
router.post('/close', (req, res) => {
  const { restaurantId, tableNum } = req.body;
  const session = closeSession(restaurantId, Number(tableNum));
  res.json({ ok: true, closed: !!session });
});

module.exports = router;
