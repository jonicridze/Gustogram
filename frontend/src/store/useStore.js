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
    set({ menuLoading: true, menuError: null });
    try {
      const { data } = await api.get(`/menu/${restaurantId}`);
      set({ menu: data.data, menuLoading: false });
    } catch (e) {
      set({ menuError: e.message, menuLoading: false });
    }
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
    set({ sessionLoading: true });
    try {
      const { data } = await api.get(`/sessions/${restaurantId}/${tableNum}`);
      set({ session: data.session, sessionLoading: false });
    } catch {
      set({ sessionLoading: false });
    }
  },

  // ── Заказ ─────────────────────────────────────────────────
  orderLoading: false,
  placeOrder: async () => {
    const { restaurantId, tableNum, userId, cart } = get();
    const items = Object.values(cart);
    if (!items.length) return { ok: false, error: 'Корзина пуста' };

    set({ orderLoading: true });
    try {
      const { data } = await api.post('/orders', {
        restaurantId,
        tableNum,
        userId,
        items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      });
      if (data.ok) {
        get().clearCart();
        await get().fetchSession();
      }
      set({ orderLoading: false });
      return data;
    } catch (e) {
      set({ orderLoading: false });
      return { ok: false, error: e.message };
    }
  },

  // ── Экран ─────────────────────────────────────────────────
  // 'welcome' | 'menu' | 'cart' | 'bill'
  screen: 'welcome',
  setScreen: (screen) => set({ screen }),
}));

export default useStore;
