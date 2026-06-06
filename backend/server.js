const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Подключаем маршруты Клода
try {
    const menuRouter = require('./routes/menu');
    const ordersRouter = require('./routes/orders');
    const sessionsRouter = require('./routes/sessions');
    
    app.use('/api/menu', menuRouter);
    app.use('/api/orders', ordersRouter);
    app.use('/api/sessions', sessionsRouter);
} catch (e) {
    console.log("Ошибка подключения роутов:", e.message);
}

app.get('/', (req, res) => {
    res.send('Бэкенд Gustogram успешно работает!');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});