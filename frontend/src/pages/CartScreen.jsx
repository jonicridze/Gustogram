// ============================================================
//  pages/CartScreen.jsx
//  Корзина: список позиций + кнопка "Отправить заказ на кухню"
// ============================================================
import { useTelegram } from '../hooks/useTelegram';
import useStore from '../store/useStore';
import styles from './CartScreen.module.css';

export default function CartScreen() {
  const { haptic, showAlert } = useTelegram();
  const {
    cart, addToCart, removeFromCart, cartTotal,
    placeOrder, orderLoading, setScreen, tableNum,
  } = useStore();

  const items = Object.values(cart);

  const handleOrder = async () => {
    haptic('heavy');
    const result = await placeOrder();
    if (result.ok) {
      showAlert('✅ Заказ принят! Ваши блюда готовятся.');
      setScreen('bill');
    } else {
      showAlert(`❌ Ошибка: ${result.error}`);
    }
  };

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <button className={styles.back} onClick={() => setScreen('menu')}>← Меню</button>
        <div className={styles.emptyIcon}>🛒</div>
        <p>Корзина пуста</p>
        <button className={styles.goMenu} onClick={() => setScreen('menu')}>Перейти в меню</button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => setScreen('menu')}>←</button>
        <h1>Корзина · Стол {tableNum}</h1>
      </header>

      <div className={styles.list}>
        {items.map(item => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemPrice}>{item.price} ₽ × {item.qty}</div>
            </div>
            <div className={styles.qtyCtrl}>
              <button onClick={() => { removeFromCart(item.id); haptic(); }}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => { addToCart(item); haptic(); }}>+</button>
            </div>
            <div className={styles.itemTotal}>{item.price * item.qty} ₽</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span>Итого</span>
          <strong>{cartTotal()} ₽</strong>
        </div>
        <p className={styles.note}>Оплата — официанту. Онлайн-оплата не требуется.</p>
        <button
          className={styles.orderBtn}
          onClick={handleOrder}
          disabled={orderLoading}
        >
          {orderLoading ? 'Отправляем...' : '🍽 Отправить заказ на кухню'}
        </button>
        <button className={styles.backToMenu} onClick={() => setScreen('menu')}>
          Добавить ещё
        </button>
      </div>
    </div>
  );
}
