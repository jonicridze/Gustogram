// ============================================================
//  routes/menu.js
//  GET /api/menu/:restaurantId
// ============================================================
const express = require('express');
const { getMenu, getCrossSellItems } = require('../services/menuParser');

const router = express.Router();

// GET /api/menu/:restaurantId
router.get('/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const menu = await getMenu(restaurantId);
    res.json({ ok: true, data: menu });
  } catch (err) {
    console.error('Menu route error:', err.message);
    res.status(404).json({ ok: false, error: err.message });
  }
});

// GET /api/menu/:restaurantId/crossell
// Возвращает закуски для кросс-сейла (когда гость выбирает пиво/алкоголь)
router.get('/:restaurantId/crossell', (req, res) => {
  try {
    const items = getCrossSellItems();
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
