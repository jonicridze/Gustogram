// ============================================================
//  pages/WelcomeScreen.jsx
//  Показывается если приложение открыто вручную (нет QR startParam)
// ============================================================
import { useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import useStore from '../store/useStore';
import styles from './WelcomeScreen.module.css';

const RESTAURANTS = [
  { id: 'nevsky',  label: 'Невский 61',   address: 'Невский проспект, 61' },
  { id: 'engelsa', label: 'Энгельса 124', address: 'пр. Энгельса, 124/1 ТК Вояж' },
];

export default function WelcomeScreen() {
  const { user, haptic } = useTelegram();
  const { setLocation, fetchMenu, fetchSession, setScreen } = useStore();

  const [selectedRest, setSelectedRest] = useState(null);
  const [tableInput,   setTableInput]   = useState('');
  const [error,        setError]        = useState('');

  const handleStart = async () => {
    if (!selectedRest) return setError('Выберите ресторан');
    const tableNum = Number(tableInput.trim());
    if (!tableNum || tableNum < 1 || tableNum > 99) return setError('Введите корректный номер стола (1–99)');

    haptic('medium');
    setLocation({ restaurantId: selectedRest, tableNum, userId: user?.id });
    await fetchMenu(selectedRest);
    await fetchSession();
    setScreen('menu');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>G</div>
      <h1 className={styles.title}>Gustogram</h1>
      <p className={styles.sub}>Добро пожаловать{user?.first_name ? `, ${user.first_name}` : ''}!</p>

      <div className={styles.section}>
        <p className={styles.label}>Выберите ресторан</p>
        <div className={styles.restGrid}>
          {RESTAURANTS.map(r => (
            <button
              key={r.id}
              className={`${styles.restBtn} ${selectedRest === r.id ? styles.active : ''}`}
              onClick={() => { setSelectedRest(r.id); setError(''); haptic(); }}
            >
              <span className={styles.restName}>{r.label}</span>
              <span className={styles.restAddr}>{r.address}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.label}>Номер вашего стола</p>
        <input
          className={styles.tableInput}
          type="number"
          placeholder="Например: 5"
          min="1" max="99"
          value={tableInput}
          onChange={e => { setTableInput(e.target.value); setError(''); }}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.startBtn} onClick={handleStart}>
        Открыть меню
      </button>
    </div>
  );
}
