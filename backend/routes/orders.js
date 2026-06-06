// ============================================================
//  routes/orders.js
//  POST   /api/orders            — первый заказ
//  PATCH  /api/orders/reorder    — дозаказ
//  POST   /api/orders/call       — вызов официанта / счёт
// ============================================================
const express = require('express');
const {
  getActiveSession,
  createSession,
  appendToSession,
  getSessionTotal,
} = require('../services/sessionStore');
const {
  sendToStaff,
  formatOrderMessage,
  formatCallMessage,
} = require('../services/telegram');

const router = express.Router();

// ── POST /api/orders — создать первый заказ ──────────────────
router.post('/', async (req, res) => {
  const { restaurantId, tableNum, userId, items } = req.body;

  if (!restaurantId || !tableNum || !items?.length) {
    return res.status(400).json({ ok: false, error: 'Нехватает данных: restaurantId, tableNum, items' });
  }

  try {
    let session = getActiveSession(restaurantId, tableNum);
    let isReorder = false;

    if (session) {
      // Стол уже открыт — это дозаказ
      session   = appendToSession(restaurantId, tableNum, items);
      isReorder = true;
    } else {
      // Новая сессия
      session = createSession({ restaurantId, tableNum, userId, items });
    }

    // Отправить уведомление персоналу
    const msg = formatOrderMessage(tableNum, items, isReorder);
    await sendToStaff(restaurantId, msg);

    res.json({
      ok: true,
      sessionId: session.id,
      isReorder,
      total: getSessionTotal(session),
    });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── PATCH /api/orders/reorder — явный дозаказ ───────────────
router.patch('/reorder', async (req, res) => {
  const { restaurantId, tableNum, items } = req.body;

  if (!restaurantId || !tableNum || !items?.length) {
    return res.status(400).json({ ok: false, error: 'Нехватает данных' });
  }

  try {
    const session = appendToSession(restaurantId, tableNum, items);
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Активная сессия не найдена' });
    }

    const msg = formatOrderMessage(tableNum, items, true);
    await sendToStaff(restaurantId, msg);

    res.json({ ok: true, total: getSessionTotal(session) });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/orders/call — вызов официанта или счёт ────────
router.post('/call', async (req, res) => {
  // type: 'waiter' | 'bill'
  const { restaurantId, tableNum, type = 'waiter' } = req.body;

  if (!restaurantId || !tableNum) {
    return res.status(400).json({ ok: false, error: 'Нехватает данных' });
  }

  try {
    const msg = formatCallMessage(tableNum, type);
    await sendToStaff(restaurantId, msg);
    res.json({ ok: true });
  } catch (err) {
    console.error('Call error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
