// ============================================================
//  pages/BillScreen.jsx
//  Экран "Мой чек" — показывает все заказанные позиции за визит,
//  кнопки "Вызвать официанта" и "Попросить счёт".
//  Кнопка "Дозаказать" → возврат в меню.
// ============================================================
import { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import useStore from '../store/useStore';
import api from '../utils/api';
import styles from './BillScreen.module.css';

export default function BillScreen() {
  const { haptic, showAlert } = useTelegram();
  const {
    session, sessionLoading, fetchSession,
    restaurantId, tableNum, setScreen,
  } = useStore();

  const [calling, setCalling] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  // ── Вызов персонала ──────────────────────────────────────
  const callStaff = async (type) => {
    setCalling(true);
    haptic('heavy');
    try {
      await api.post('/orders/call', { restaurantId, tableNum, type });
      const messages = {
        waiter: '🔔 Официант уже спешит к вашему столу!',
        bill:   '💳 Счёт готовят. Ждите официанта!',
      };
      showAlert(messages[type]);
    } catch {
      showAlert('Не удалось отправить сигнал. Попробуйте снова.');
    } finally {
      setCalling(false);
    }
  };

  // ── Состояние загрузки ────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // ── Пустой чек (заказов ещё не было) ─────────────────────
  if (!session || !session.items?.length) {
    return (
      <div className={styles.empty}>
        <button className={styles.back} onClick={() => setScreen('menu')}>← Меню</button>
        <div className={styles.emptyIcon}>🧾</div>
        <p>Вы ещё ничего не заказали</p>
        <button className={styles.goMenu} onClick={() => setScreen('menu')}>
          Открыть меню
        </button>
      </div>
    );
  }

  const total = session.items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className={styles.wrapper}>
      {/* Шапка */}
      <header className={styles.header}>
        <button className={styles.back} onClick={() => setScreen('menu')}>←</button>
        <h1>Мой чек · Стол {tableNum}</h1>
      </header>

      {/* Список всех позиций за визит */}
      <div className={styles.list}>
        <p className={styles.listTitle}>Всё что вы заказали:</p>
        {session.items.map((item, idx) => (
          <div key={`${item.id}_${idx}`} className={styles.item}>
            <div className={styles.itemQty}>{item.qty}×</div>
            <div className={styles.itemName}>{item.name}</div>
            <div className={styles.itemPrice}>{item.qty * item.price} ₽</div>
          </div>
        ))}
      </div>

      {/* Итог */}
      <div className={styles.totalBlock}>
        <span>Итого к оплате</span>
        <strong>{total} ₽</strong>
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        {/* Дозаказать */}
        <button
          className={styles.reorderBtn}
          onClick={() => { haptic(); setScreen('menu'); }}
        >
          ＋ Дозаказать
        </button>

        {/* Вызвать официанта */}
        <button
          className={styles.waiterBtn}
          onClick={() => callStaff('waiter')}
          disabled={calling}
        >
          🔔 Вызвать официанта
        </button>

        {/* Попросить счёт */}
        <button
          className={styles.billBtn}
          onClick={() => callStaff('bill')}
          disabled={calling}
        >
          💳 Попросить счёт
        </button>
      </div>

      <p className={styles.hint}>Оплата наличными или картой — официанту за столом</p>
    </div>
  );
}
