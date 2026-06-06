# Gustogram Telegram Mini App

Интерактивное цифровое меню для сети ресторанов Gustogram на базе Telegram WebApp.

## Архитектура проекта

```
gustogram-tma/
├── backend/                        # Node.js + Express
│   ├── server.js                   # Точка входа, Express-сервер
│   ├── .env.example                # Переменные окружения (скопировать в .env)
│   ├── routes/
│   │   ├── menu.js                 # GET /api/menu/:restaurantId
│   │   ├── orders.js               # POST/PATCH /api/orders, POST /api/orders/call
│   │   └── sessions.js             # GET/POST /api/sessions
│   └── services/
│       ├── menuParser.js           # Парсинг сайта + кэш + структура меню
│       ├── sessionStore.js         # In-memory хранилище открытых чеков
│       └── telegram.js             # Отправка уведомлений в чаты персонала
│
└── frontend/                       # React + Vite
    ├── index.html                  # Подключение Telegram WebApp SDK
    ├── vite.config.js
    └── src/
        ├── main.jsx                # Точка входа React
        ├── App.jsx                 # Роутинг экранов
        ├── index.css               # Глобальные стили (цвета бренда)
        ├── hooks/
        │   └── useTelegram.js      # ★ Инициализация SDK + парсинг startParam
        ├── store/
        │   └── useStore.js         # Zustand — корзина, сессия, меню
        ├── utils/
        │   └── api.js              # Axios instance
        └── pages/
            ├── WelcomeScreen.jsx   # Выбор ресторана и стола (без QR)
            ├── MenuScreen.jsx      # Меню с категориями + кросс-сейл
            ├── CartScreen.jsx      # Корзина + отправка заказа
            └── BillScreen.jsx      # ★ Открытый чек + вызов официанта
```

## Быстрый старт

### 1. Создать бота в Telegram

1. Открой @BotFather → `/newbot`
2. Получи `BOT_TOKEN`
3. `/newapp` → создай Mini App → укажи URL фронтенда после деплоя
4. Создай 2 группы для персонала (Невский / Энгельса), добавь бота, получи chat_id

### 2. Бэкенд

```bash
cd backend
cp .env.example .env
# Заполни .env: BOT_TOKEN, STAFF_CHAT_NEVSKY, STAFF_CHAT_ENGELSA
npm install
npm run dev     # http://localhost:3001
```

### 3. Фронтенд

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### 4. Деплой (продакшн)

**Бэкенд** → VPS (Timeweb / Selectel) или Railway.app
```bash
npm start
# Или через PM2: pm2 start server.js --name gustogram-backend
```

**Фронтенд** → Vercel (бесплатно)
```bash
# В Vercel: VITE_API_URL=https://your-backend-domain.ru/api
vercel deploy
```

**Обязательно HTTPS** — Telegram требует для Mini App.

### 5. QR-коды для столов

Формат ссылки:
```
https://t.me/YOUR_BOT_NAME/APP_NAME?startapp=nevsky_table5
https://t.me/YOUR_BOT_NAME/APP_NAME?startapp=engelsa_table12
```

Генерируй QR для каждого стола и распечатывай на тейбл-тенты.

## Потоки работы

### Гость с QR-кодом
1. Сканирует QR → открывается Telegram Mini App
2. `startParam = "nevsky_table5"` парсится автоматически
3. Меню открывается сразу, минуя приветственный экран
4. Гость выбирает блюда → корзина → "Отправить заказ"
5. Уведомление летит в чат персонала Невского

### Дозаказ
1. Гость возвращается в приложение
2. Добавляет новые блюда → "Дозаказать"
3. Бэкенд апдейтит существующую сессию, не создаёт новую
4. В чат персонала: "🔄 ДОЗАКАЗ · Стол №5"

### Вызов официанта
Экран "Мой чек" → кнопки:
- "🔔 Вызвать официанта" → чат персонала: "🔔 ВЫЗОВ ОФИЦИАНТА · Стол №5"
- "💳 Попросить счёт" → чат персонала: "💳 ПРОСЯТ СЧЁТ · Стол №5"

## API Reference

| Метод | URL | Описание |
|-------|-----|----------|
| GET  | `/api/menu/:restaurantId` | Получить меню ресторана |
| GET  | `/api/menu/:restaurantId/crossell` | Закуски для кросс-сейла |
| POST | `/api/orders` | Первый заказ / дозаказ |
| PATCH | `/api/orders/reorder` | Явный дозаказ |
| POST | `/api/orders/call` | Вызов официанта / счёт |
| GET  | `/api/sessions/:restaurantId/:tableNum` | Текущий открытый чек |
| POST | `/api/sessions/close` | Закрыть сессию стола |

## Следующие шаги

- [ ] Подключить реальный JSON-источник меню (попросить у ресторана)
- [ ] Заменить in-memory sessionStore на Redis/PostgreSQL
- [ ] Добавить систему лояльности (штампы)
- [ ] Интеграция с iiko/r-keeper через WebHook
- [ ] Аналитика заказов в Google Sheets / Metabase
