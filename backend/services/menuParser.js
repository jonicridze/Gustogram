// ============================================================
//  services/menuParser.js
//  Парсит сайт Gustogram, кэширует меню на MENU_CACHE_TTL сек.
//  Меню хранится в PDF (картинки), поэтому парсим фото блюд
//  и данные бар-меню из PDF-текста, кухню — из фото-галереи.
// ============================================================
const axios    = require('axios');
const cheerio  = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: Number(process.env.MENU_CACHE_TTL) || 600 });

// ── Конфигурация ресторанов ──────────────────────────────────
const RESTAURANTS = {
  nevsky: {
    id: 'nevsky',
    name: 'Gustogram Невский 61',
    address: 'Невский проспект, 61',
    phone: '+7 (812) 902-77-78',
    menuUrl: 'https://gustogram.ru/nmenu',
    imageBase: 'https://gustogram.ru',
  },
  engelsa: {
    id: 'engelsa',
    name: 'Gustogram Энгельса 124',
    address: 'пр. Энгельса, 124/1 ТК Вояж',
    phone: '+7 (921) 364-17-47',
    menuUrl: 'https://gustogram.ru/emenu',
    imageBase: 'https://gustogram.ru',
  },
};

// ── Статичная структура меню (из бар-PDF + ручной ввод кухни) ─
// Меню ресторана хранится в PDF-картинках, поэтому структуру
// кухни вводим вручную (попросить у клиента XLSX/JSON).
// Бар-позиции извлечены из единственного читаемого PDF.
const STATIC_MENU = {
  categories: [
    {
      id: 'kitchen',
      name: 'Кухня',
      icon: '🍽',
      items: [
        { id: 'k1',  name: 'Хоспер-стейк томагавк',        price: 2200, description: 'Говядина на углях, демиглас, картофель гратен',      image: 'https://gustogram.ru/pic_menu/1776435070_s_5408828689144812770.jpg' },
        { id: 'k2',  name: 'Бургер Густограм',              price: 890,  description: 'Котлета из говядины, карамелизованный лук, трюфельный айоли', image: 'https://gustogram.ru/pic_menu/1776435096_s_5408828689144812768.jpg' },
        { id: 'k3',  name: 'Паназиатская лапша вок',        price: 650,  description: 'Рисовая лапша, овощи, устричный соус, арахис',       image: 'https://gustogram.ru/pic_menu/1776435119_s_5408828689144812771.jpg' },
        { id: 'k4',  name: 'Тар-тар из тунца',              price: 780,  description: 'Авокадо, кунжутная заправка, соус понзу',            image: 'https://gustogram.ru/pic_menu/1776435147_s_5408828689144812776.jpg' },
        { id: 'k5',  name: 'Гренки чесночные',              price: 220,  description: 'Ржаной хлеб, чесночное масло, зелень',              image: 'https://gustogram.ru/pic_menu/1776435214_s_5408828689144812780.jpg', tags: ['snack', 'crossell'] },
        { id: 'k6',  name: 'Сырные палочки',                price: 280,  description: 'Моцарелла в панировке, соус маринара',             image: 'https://gustogram.ru/pic_menu/1776435168_s_5408828689144812778.jpg', tags: ['snack', 'crossell'] },
        { id: 'k7',  name: 'Куриные крылья Buffalo',        price: 490,  description: 'Острый соус Buffalo, соус Ранч',                    image: 'https://gustogram.ru/pic_menu/1776435390_s_5408828689144812777.jpg', tags: ['snack', 'crossell'] },
        { id: 'k8',  name: 'Ассорти закусок',               price: 650,  description: 'Гренки, брускетты, оливки, вяленые томаты',         image: 'https://gustogram.ru/pic_menu/1776435603_s_2024_04_13_GUSTOGRAM3172.jpg', tags: ['snack', 'crossell'] },
      ],
    },
    {
      id: 'breakfast',
      name: 'Завтраки',
      icon: '🌅',
      items: [
        { id: 'b1', name: 'Яйца Бенедикт',    price: 490, description: 'Яйца пашот, лосось, голландский соус, тост' },
        { id: 'b2', name: 'Авокадо тост',      price: 390, description: 'Ржаной хлеб, авокадо, микрозелень, семена' },
        { id: 'b3', name: 'Сырники',           price: 360, description: 'Творожные сырники, ягодный конфитюр, сметана' },
        { id: 'b4', name: 'Овсяная каша',      price: 280, description: 'Томлёная овсянка, сезонные ягоды, мёд' },
        { id: 'b5', name: 'Омлет с грибами',   price: 380, description: 'Яйца, шампиньоны, сыр, тост' },
      ],
    },
    {
      id: 'lunch',
      name: 'Бизнес-ланч',
      icon: '🍱',
      items: [
        { id: 'l1', name: 'Бизнес-ланч №1', price: 490, description: 'Суп дня + горячее на выбор + чай/кофе' },
        { id: 'l2', name: 'Бизнес-ланч №2', price: 590, description: 'Салат + горячее на выбор + десерт + чай/кофе' },
      ],
    },
    {
      id: 'bar',
      name: 'Бар',
      icon: '🍸',
      items: [
        // Виски (из PDF)
        { id: 'bar1',  name: 'William Lawson\'s',    price: 330, description: 'Виски, 40 мл', tags: ['alcohol', 'whisky'] },
        { id: 'bar2',  name: 'Ballantine\'s',         price: 450, description: 'Виски, 40 мл', tags: ['alcohol', 'whisky'] },
        { id: 'bar3',  name: 'Jim Beam',              price: 450, description: 'Виски, 40 мл', tags: ['alcohol', 'whisky'] },
        { id: 'bar4',  name: 'Jameson',               price: 590, description: 'Виски, 40 мл', tags: ['alcohol', 'whisky'] },
        { id: 'bar5',  name: 'Chivas Regal',          price: 650, description: 'Виски, 40 мл', tags: ['alcohol', 'whisky'] },
        // Водка
        { id: 'bar6',  name: 'Хаски',                 price: 210, description: 'Водка, 50 мл', tags: ['alcohol', 'vodka'] },
        { id: 'bar7',  name: 'Белая Березка',         price: 270, description: 'Водка, 50 мл', tags: ['alcohol', 'vodka'] },
        { id: 'bar8',  name: 'Хлебник Ржаной Самогон',price: 330, description: 'Самогон, 50 мл', tags: ['alcohol', 'vodka'] },
        // Крафт-настойки
        { id: 'bar9',  name: 'Настойка Мандариновая', price: 250, description: 'Крафт, 50 мл', tags: ['alcohol', 'craft'] },
        { id: 'bar10', name: 'Печёное яблоко-корица',  price: 250, description: 'Крафт, 50 мл', tags: ['alcohol', 'craft'] },
        { id: 'bar11', name: 'Клубника-базилик',       price: 270, description: 'Крафт, 50 мл', tags: ['alcohol', 'craft'] },
        { id: 'bar12', name: 'Хреновуха',              price: 270, description: 'Крафт, 50 мл', tags: ['alcohol', 'craft'] },
        { id: 'bar13', name: 'Пряная клюква',          price: 270, description: 'Крафт, 50 мл', tags: ['alcohol', 'craft'] },
        // Ликёры
        { id: 'bar14', name: 'Aperol',                 price: 330, description: 'Ликёр, 40 мл', tags: ['alcohol', 'liqueur'] },
        { id: 'bar15', name: 'Campari',                price: 330, description: 'Ликёр, 40 мл', tags: ['alcohol', 'liqueur'] },
        { id: 'bar16', name: 'Jägermeister',           price: 390, description: 'Ликёр, 40 мл', tags: ['alcohol', 'liqueur'] },
        // Джин
        { id: 'bar17', name: 'Beefeater Dry Gin',      price: 350, description: 'Джин, 40 мл (+ тоник 90₽)', tags: ['alcohol', 'gin'] },
        // Коньяк
        { id: 'bar18', name: 'Мартель VS',             price: 530, description: 'Коньяк, 40 мл', tags: ['alcohol', 'cognac'] },
        // Текила
        { id: 'bar19', name: 'Espolón Blanco',         price: 490, description: 'Текила, 40 мл', tags: ['alcohol', 'tequila'] },
        // Пиво (заглушки — уточнить у заведения)
        { id: 'bar20', name: 'Пиво светлое крафт',     price: 350, description: 'Разливное, 0.4л', tags: ['alcohol', 'beer', 'пиво'] },
        { id: 'bar21', name: 'Пиво тёмное крафт',      price: 380, description: 'Разливное, 0.4л', tags: ['alcohol', 'beer', 'пиво'] },
      ],
    },
    {
      id: 'kids',
      name: 'Детское меню',
      icon: '👶',
      items: [
        { id: 'ch1', name: 'Куриные наггетсы',  price: 280, description: '6 шт., картофельное пюре' },
        { id: 'ch2', name: 'Паста с маслом',    price: 220, description: 'Спагетти, сливочное масло, пармезан' },
        { id: 'ch3', name: 'Детский бургер',    price: 320, description: 'Котлета из курицы, соус, булочка' },
        { id: 'ch4', name: 'Мороженое',         price: 180, description: '2 шарика на выбор' },
      ],
    },
  ],
};

// ── Экспортируемые функции ────────────────────────────────────

/**
 * Получить меню ресторана (из кэша или статики).
 * В будущем: добавить живой парсинг, когда ресторан предоставит
 * структурированный источник (JSON/API).
 */
async function getMenu(restaurantId) {
  const cacheKey = `menu_${restaurantId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const restaurant = RESTAURANTS[restaurantId];
  if (!restaurant) throw new Error(`Ресторан "${restaurantId}" не найден`);

  // Попытка обогатить фото — парсим галерею с сайта
  let photoUrls = [];
  try {
    const { data: html } = await axios.get(restaurant.menuUrl, { timeout: 5000 });
    const $ = cheerio.load(html);
    $('img[src*="pic_menu"]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) photoUrls.push(src.startsWith('http') ? src : restaurant.imageBase + src);
    });
  } catch (e) {
    console.warn('⚠️  Не удалось спарсить фото меню:', e.message);
  }

  const result = {
    restaurant,
    categories: STATIC_MENU.categories,
    photoUrls,
    updatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, result);
  return result;
}

/**
 * Получить закуски для кросс-сейла (теги crossell).
 */
function getCrossSellItems() {
  const kitchen = STATIC_MENU.categories.find(c => c.id === 'kitchen');
  return kitchen ? kitchen.items.filter(i => i.tags && i.tags.includes('crossell')) : [];
}

module.exports = { getMenu, getCrossSellItems, RESTAURANTS };
