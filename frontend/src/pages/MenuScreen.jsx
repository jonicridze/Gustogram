// ============================================================
//  pages/MenuScreen.jsx
//  Главный экран: категории + список блюд + плавающая корзина
// ============================================================
import { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import useStore from '../store/useStore';
import api from '../utils/api';
import styles from './MenuScreen.module.css';

export default function MenuScreen() {
  const { haptic } = useTelegram();
  const {
    menu, menuLoading, activeCategory, setActiveCategory,
    cart, addToCart, removeFromCart, cartCount, cartTotal,
    hasBeerInCart, setScreen, restaurantId, tableNum,
  } = useStore();

  const [crossSell, setCrossSell] = useState([]);

  // Загрузить кросс-сейл закуски
  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/menu/${restaurantId}/crossell`)
      .then(r => setCrossSell(r.data.data || []))
      .catch(() => {});
  }, [restaurantId]);

  if (menuLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загружаем меню...</p>
      </div>
    );
  }

  if (!menu) return null;

  const categories = menu.categories || [];
  const category   = categories.find(c => c.id === activeCategory);
  const showCross  = hasBeerInCart() && crossSell.length > 0;

  return (
    <div className={styles.wrapper}>
      {/* Шапка */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.logo}>G</span>
          <div>
            <div className={styles.restName}>{menu.restaurant?.name}</div>
            <div className={styles.tableBadge}>Стол {tableNum}</div>
          </div>
        </div>
        <button className={styles.billBtn} onClick={() => setScreen('bill')}>
          Мой чек
        </button>
      </header>

      {/* Категории */}
      <nav className={styles.categories}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${activeCategory === cat.id ? styles.catActive : ''}`}
            onClick={() => { setActiveCategory(cat.id); haptic(); }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </nav>

      {/* Список блюд */}
      <div className={styles.menuList}>
        {category?.items.map(item => {
          const qty = cart[item.id]?.qty || 0;
          return (
            <div key={item.id} className={styles.card}>
              {item.image && (
                <img src={item.image} alt={item.name} className={styles.cardImg} loading="lazy" />
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{item.name}</div>
                {item.description && (
                  <div className={styles.cardDesc}>{item.description}</div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>{item.price} ₽</span>
                  {qty === 0 ? (
                    <button
                      className={styles.addBtn}
                      onClick={() => { addToCart(item); haptic(); }}
                    >+</button>
                  ) : (
                    <div className={styles.qtyCtrl}>
                      <button className={styles.qtyBtn} onClick={() => { removeFromCart(item.id); haptic(); }}>−</button>
                      <span className={styles.qtyNum}>{qty}</span>
                      <button className={styles.qtyBtn} onClick={() => { addToCart(item); haptic(); }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Кросс-сейл блок */}
      {showCross && (
        <div className={styles.crossSell}>
          <p className={styles.crossTitle}>🍺 К пиву рекомендуем:</p>
          <div className={styles.crossList}>
            {crossSell.map(item => {
              const qty = cart[item.id]?.qty || 0;
              return (
                <div key={item.id} className={styles.crossCard}>
                  <span className={styles.crossName}>{item.name}</span>
                  <span className={styles.crossPrice}>{item.price} ₽</span>
                  {qty === 0 ? (
                    <button className={styles.addBtnSmall} onClick={() => { addToCart(item); haptic(); }}>+</button>
                  ) : (
                    <div className={styles.qtyCtrlSmall}>
                      <button onClick={() => { removeFromCart(item.id); haptic(); }}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => { addToCart(item); haptic(); }}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Плавающая кнопка корзины */}
      {cartCount() > 0 && (
        <button className={styles.floatingCart} onClick={() => { setScreen('cart'); haptic('medium'); }}>
          <span className={styles.cartBadge}>{cartCount()}</span>
          Корзина
          <span className={styles.cartSum}>{cartTotal()} ₽</span>
        </button>
      )}
    </div>
  );
}
