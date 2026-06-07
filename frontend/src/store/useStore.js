// ============================================================
//  store/useStore.js
//  Zustand — глобальное состояние приложения
// ============================================================
import { create } from 'zustand';
import api from '../utils/api';

const useStore = create((set, get) => ({
  // ── Локация ───────────────────────────────────────────────
  restaurantId: null,
  tableNum:     null,
  userId:       null,
  setLocation:  ({ restaurantId, tableNum, userId }) =>
    set({ restaurantId, tableNum, userId }),

  // ── Меню ─────────────────────────────────────────────────
  menu:        null,
  menuLoading: false,
  menuError:   null,
  fetchMenu: async (restaurantId) => {
  set({ menuLoading: false, menuError: null });
  const RESTAURANTS = {
    nevsky:  { id: 'nevsky',  name: 'Gustogram Невский 61',   address: 'Невский проспект, 61' },
    engelsa: { id: 'engelsa', name: 'Gustogram Энгельса 124', address: 'пр. Энгельса, 124/1' },
  };
  const categories = [
  { id: 'kitchen', name: 'Кухня', icon: '🍽', items: [
    { id: 'k1', name: 'Хоспер-стейк томагавк', price: 2200, description: 'Говядина на углях, демиглас, картофель гратен', image: 'https://gustogram.ru/pic_menu/1776435070_s_5408828689144812770.jpg' },
    { id: 'k2', name: 'Бургер Густограм', price: 890, description: 'Котлета из говядины, карамелизованный лук, трюфельный айоли', image: 'https://gustogram.ru/pic_menu/1776435096_s_5408828689144812768.jpg' },
    { id: 'k3', name: 'Паназиатская лапша вок', price: 650, description: 'Рисовая лапша, овощи, устричный соус, арахис', image: 'https://gustogram.ru/pic_menu/1776435119_s_5408828689144812771.jpg' },
    { id: 'k4', name: 'Тар-тар из тунца', price: 780, description: 'Авокадо, кунжутная заправка, соус понзу', image: 'https://gustogram.ru/pic_menu/1776435147_s_5408828689144812776.jpg' },
    { id: 'k5', name: 'Гренки чесночные', price: 220, description: 'Ржаной хлеб, чесночное масло, зелень', image: 'https://gustogram.ru/pic_menu/1776435214_s_5408828689144812780.jpg', tags: ['snack','crossell'] },
    { id: 'k6', name: 'Сырные палочки', price: 280, description: 'Моцарелла в панировке, соус маринара', image: 'https://gustogram.ru/pic_menu/1776435168_s_5408828689144812778.jpg', tags: ['snack','crossell'] },
    { id: 'k7', name: 'Куриные крылья Buffalo', price: 490, description: 'Острый соус Buffalo, соус Ранч', image: 'https://gustogram.ru/pic_menu/1776435390_s_5408828689144812777.jpg', tags: ['snack','crossell'] },
    { id: 'k8', name: 'Ассорти закусок', price: 650, description: 'Гренки, брускетты, оливки, вяленые томаты', image: 'https://gustogram.ru/pic_menu/1776435603_s_2024_04_13_GUSTOGRAM3172.jpg', tags: ['snack','crossell'] },
  ]},
  { id: 'breakfast', name: 'Завтраки', icon: '🌅', items: [
    { id: 'b1', name: 'Яйца Бенедикт', price: 490, description: 'Яйца пашот, лосось, голландский соус, тост' },
    { id: 'b2', name: 'Авокадо тост', price: 390, description: 'Ржаной хлеб, авокадо, микрозелень, семена' },
    { id: 'b3', name: 'Сырники', price: 360, description: 'Творожные сырники, ягодный конфитюр, сметана' },
    { id: 'b4', name: 'Овсяная каша', price: 280, description: 'Томлёная овсянка, сезонные ягоды, мёд' },
    { id: 'b5', name: 'Омлет с грибами', price: 380, description: 'Яйца, шампиньоны, сыр, тост' },
  ]},
  { id: 'lunch', name: 'Бизнес-ланч', icon: '🍱', items: [
    { id: 'l1', name: 'Бизнес-ланч №1', price: 490, description: 'Суп дня + горячее на выбор + чай/кофе' },
    { id: 'l2', name: 'Бизнес-ланч №2', price: 590, description: 'Салат + горячее на выбор + десерт + чай/кофе' },
  ]},
  { id: 'bar', name: 'Бар', icon: '🍸', items: [
    { id: 'bar1',  name: 'William Lawson\'s', price: 330, description: 'Виски, 40 мл', tags: ['alcohol','whisky'] },
    { id: 'bar2',  name: 'Jameson',           price: 590, description: 'Виски, 40 мл', tags: ['alcohol','whisky'] },
    { id: 'bar3',  name: 'Chivas Regal',      price: 650, description: 'Виски, 40 мл', tags: ['alcohol','whisky'] },
    { id: 'bar4',  name: 'Хаски',             price: 210, description: 'Водка, 50 мл', tags: ['alcohol','vodka'] },
    { id: 'bar5',  name: 'Настойка Мандариновая', price: 250, description: 'Крафт, 50 мл', tags: ['alcohol','craft'] },
    { id: 'bar6',  name: 'Печёное яблоко-корица', price: 250, description: 'Крафт, 50 мл', tags: ['alcohol','craft'] },
    { id: 'bar7',  name: 'Клубника-базилик',  price: 270, description: 'Крафт, 50 мл', tags: ['alcohol','craft'] },
    { id: 'bar8',  name: 'Хреновуха',         price: 270, description: 'Крафт, 50 мл', tags: ['alcohol','craft'] },
    { id: 'bar9',  name: 'Aperol',            price: 330, description: 'Ликёр, 40 мл', tags: ['alcohol','liqueur'] },
    { id: 'bar10', name: 'Campari',           price: 330, description: 'Ликёр, 40 мл', tags: ['alcohol','liqueur'] },
    { id: 'bar11', name: 'Jägermeister',      price: 390, description: 'Ликёр, 40 мл', tags: ['alcohol','liqueur'] },
    { id: 'bar12', name: 'Beefeater Dry Gin', price: 350, description: 'Джин, 40 мл', tags: ['alcohol','gin'] },{ id: 'bar13', name: 'Espolón Blanco',    price: 490, description: 'Текила, 40 мл', tags: ['alcohol','tequila'] },
    { id: 'bar14', name: 'Пиво светлое крафт',price: 350, description: 'Разливное, 0.4л', tags: ['alcohol','beer','пиво'] },
    { id: 'bar15', name: 'Пиво тёмное крафт', price: 380, description: 'Разливное, 0.4л', tags: ['alcohol','beer','пиво'] },
  ]},
  { id: 'kids', name: 'Детское меню', icon: '👶', items: [
    { id: 'ch1', name: 'Куриные наггетсы', price: 280, description: '6 шт., картофельное пюре' },
    { id: 'ch2', name: 'Паста с маслом',   price: 220, description: 'Спагетти, сливочное масло, пармезан' },
    { id: 'ch3', name: 'Детский бургер',   price: 320, description: 'Котлета из курицы, соус, булочка' },
    { id: 'ch4', name: 'Мороженое',        price: 180, description: '2 шарика на выбор' },
  ]},
];
  set({ menu: { restaurant: RESTAURANTS[restaurantId], categories }, menuLoading: false });
},

  // ── Активная категория ────────────────────────────────────
  activeCategory: 'kitchen',
  setActiveCategory: (id) => set({ activeCategory: id }),

  // ── Корзина ───────────────────────────────────────────────
  // cart: { [itemId]: { ...item, qty } }
  cart: {},
  addToCart: (item) => set((state) => {
    const existing = state.cart[item.id];
    return {
      cart: {
        ...state.cart,
        [item.id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { ...item, qty: 1 },
      },
    };
  }),
  removeFromCart: (itemId) => set((state) => {
    const existing = state.cart[itemId];
    if (!existing) return state;
    if (existing.qty <= 1) {
      const { [itemId]: _, ...rest } = state.cart;
      return { cart: rest };
    }
    return { cart: { ...state.cart, [itemId]: { ...existing, qty: existing.qty - 1 } } };
  }),
  clearCart: () => set({ cart: {} }),

  cartItems:     () => Object.values(get().cart),
  cartCount:     () => Object.values(get().cart).reduce((s, i) => s + i.qty, 0),
  cartTotal:     () => Object.values(get().cart).reduce((s, i) => s + i.qty * i.price, 0),

  // Проверить: есть ли в корзине алкоголь/пиво → показать кросс-сейл
  hasBeerInCart: () =>
    Object.values(get().cart).some(i => i.tags?.some(t => ['beer', 'пиво'].includes(t))),

  // ── Сессия (открытый чек) ─────────────────────────────────
  session:        null,
  sessionLoading: false,
  fetchSession: async () => {
  const { restaurantId, tableNum } = get();
  if (!restaurantId || !tableNum) return;
  // Локальная сессия без бэкенда
  set({ session: null, sessionLoading: false });
},

  // ── Заказ ─────────────────────────────────────────────────
  orderLoading: false,
  placeOrder: async () => {
  const { cart } = get();
  const items = Object.values(cart);
  if (!items.length) return { ok: false, error: 'Корзина пуста' };
  set({ orderLoading: true });
  // Сохраняем заказ локально
  const session = {
    items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    status: 'active',
  };
  get().clearCart();
  set({ session, orderLoading: false });
  return { ok: true };
},

  // ── Экран ─────────────────────────────────────────────────
  // 'welcome' | 'menu' | 'cart' | 'bill'
  screen: 'welcome',
  setScreen: (screen) => set({ screen }),
}));

export default useStore;
