// ============================================================
//  services/telegram.js
//  Отправка уведомлений в чаты персонала через Telegram Bot API
// ============================================================
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL  = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Chat ID чатов персонала по ресторанам
const STAFF_CHATS = {
  nevsky:  process.env.STAFF_CHAT_NEVSKY,
  engelsa: process.env.STAFF_CHAT_ENGELSA,
};

/**
 * Отправить сообщение в Telegram-чат персонала.
 */
async function sendToStaff(restaurantId, text) {
  const chatId = STAFF_CHATS[restaurantId];
  if (!chatId) {
    console.warn(`⚠️  Нет chat_id для ресторана "${restaurantId}"`);
    return;
  }
  if (!BOT_TOKEN) {
    console.warn('⚠️  BOT_TOKEN не задан — уведомление не отправлено');
    return;
  }
  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id:    chatId,
      text,
      parse_mode: 'HTML',
    });
    console.log(`📨  Уведомление в "${restaurantId}": ${text.slice(0, 60)}...`);
  } catch (err) {
    console.error('❌  Telegram sendMessage error:', err.response?.data || err.message);
  }
}

/**
 * Форматирует уведомление о новом заказе.
 */
function formatOrderMessage(tableNum, items, isReorder = false) {
  const prefix  = isReorder ? '🔄 <b>ДОЗАКАЗ</b>' : '🍽 <b>НОВЫЙ ЗАКАЗ</b>';
  const itemList = items
    .map(i => `• ${i.name} — ${i.qty} шт. × ${i.price}₽`)
    .join('\n');
  const total    = items.reduce((s, i) => s + i.qty * i.price, 0);

  return `${prefix} · Стол №${tableNum}\n\n${itemList}\n\n💰 Итого: <b>${total}₽</b>`;
}

/**
 * Форматирует уведомление о вызове официанта / счёте.
 */
function formatCallMessage(tableNum, type) {
  const messages = {
    waiter: `🔔 <b>ВЫЗОВ ОФИЦИАНТА</b> · Стол №${tableNum}`,
    bill:   `💳 <b>ПРОСЯТ СЧЁТ</b> · Стол №${tableNum}`,
  };
  return messages[type] || `📢 Стол №${tableNum}: ${type}`;
}

module.exports = { sendToStaff, formatOrderMessage, formatCallMessage };
