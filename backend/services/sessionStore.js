// ============================================================
//  services/sessionStore.js
//  In-memory хранилище сессий столов.
//  В продакшне заменить на Redis или PostgreSQL.
// ============================================================

// Структура сессии:
// {
//   id: 'nevsky_5_userId123',
//   restaurantId: 'nevsky',
//   tableNum: 5,
//   userId: '123456789',   // Telegram user ID
//   items: [{ id, name, price, qty }],
//   status: 'active' | 'closed',
//   createdAt: ISO string,
//   updatedAt: ISO string,
// }

const sessions = new Map();

function makeKey(restaurantId, tableNum) {
  return `${restaurantId}_${tableNum}`;
}

/**
 * Найти активную сессию стола.
 */
function getActiveSession(restaurantId, tableNum) {
  const key = makeKey(restaurantId, tableNum);
  const session = sessions.get(key);
  if (session && session.status === 'active') return session;
  return null;
}

/**
 * Создать новую сессию стола.
 */
function createSession({ restaurantId, tableNum, userId, items }) {
  const key = makeKey(restaurantId, tableNum);
  const session = {
    id: `${key}_${Date.now()}`,
    restaurantId,
    tableNum: Number(tableNum),
    userId: String(userId),
    items: [...items],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessions.set(key, session);
  return session;
}

/**
 * Добавить позиции к существующей сессии (дозаказ).
 */
function appendToSession(restaurantId, tableNum, newItems) {
  const session = getActiveSession(restaurantId, tableNum);
  if (!session) return null;

  newItems.forEach(newItem => {
    const existing = session.items.find(i => i.id === newItem.id);
    if (existing) {
      existing.qty += newItem.qty;
    } else {
      session.items.push({ ...newItem });
    }
  });

  session.updatedAt = new Date().toISOString();
  return session;
}

/**
 * Закрыть сессию стола (гость ушёл, счёт оплачен).
 */
function closeSession(restaurantId, tableNum) {
  const session = getActiveSession(restaurantId, tableNum);
  if (!session) return null;
  session.status  = 'closed';
  session.updatedAt = new Date().toISOString();
  return session;
}

/**
 * Подсчитать итог по сессии.
 */
function getSessionTotal(session) {
  return session.items.reduce((sum, i) => sum + i.qty * i.price, 0);
}

module.exports = {
  getActiveSession,
  createSession,
  appendToSession,
  closeSession,
  getSessionTotal,
};
