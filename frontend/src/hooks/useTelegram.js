// ============================================================
//  hooks/useTelegram.js
//  Инициализация Telegram WebApp SDK.
//  Парсинг startParam для определения ресторана и стола.
//
//  Формат startParam: "{restaurantId}_table{N}"
//  Примеры: "nevsky_table5"  "engelsa_table12"
// ============================================================

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  // Если открыто вне Telegram (для разработки) — мок
  if (!tg) {
    return {
      tg: null,
      user: { id: 0, first_name: 'Dev', last_name: 'User' },
      startParam: null,
      parsedLocation: null,
      ready: () => {},
      close: () => {},
      showAlert: (msg) => alert(msg),
      haptic: () => {},
    };
  }

  tg.ready();
  tg.expand(); // Раскрыть на весь экран

  // Подтянуть цвета из темы Telegram (если нужно)
  // tg.setHeaderColor('#26593c');

  const startParam = tg.initDataUnsafe?.start_param || null;

  // Парсинг: "nevsky_table5" → { restaurantId: 'nevsky', tableNum: 5 }
  let parsedLocation = null;
  if (startParam) {
    const match = startParam.match(/^(nevsky|engelsa)_table(\d+)$/i);
    if (match) {
      parsedLocation = {
        restaurantId: match[1].toLowerCase(),
        tableNum: Number(match[2]),
      };
    }
  }

  return {
    tg,
    user:          tg.initDataUnsafe?.user || null,
    startParam,
    parsedLocation,
    ready:         () => tg.ready(),
    close:         () => tg.close(),
    showAlert:     (msg) => tg.showAlert(msg),
    haptic:        (type = 'light') => tg.HapticFeedback?.impactOccurred(type),
  };
}
