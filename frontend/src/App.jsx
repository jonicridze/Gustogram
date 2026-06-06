// ============================================================
//  App.jsx — корневой компонент, роутинг между экранами
// ============================================================
import { useEffect } from 'react';
import { useTelegram }   from './hooks/useTelegram';
import useStore           from './store/useStore';

import WelcomeScreen from './pages/WelcomeScreen';
import MenuScreen    from './pages/MenuScreen';
import CartScreen    from './pages/CartScreen';
import BillScreen    from './pages/BillScreen';

export default function App() {
  const { parsedLocation, user } = useTelegram();
  const { screen, setScreen, setLocation, fetchMenu, fetchSession } = useStore();

  // ── При старте — парсинг QR startParam ───────────────────
  useEffect(() => {
    if (parsedLocation) {
      const { restaurantId, tableNum } = parsedLocation;
      setLocation({ restaurantId, tableNum, userId: user?.id });
      fetchMenu(restaurantId);
      fetchSession();
      setScreen('menu');       // Сразу в меню, минуя приветствие
    }
  }, []);

  // ── Роутинг ───────────────────────────────────────────────
  const screens = {
    welcome: <WelcomeScreen />,
    menu:    <MenuScreen />,
    cart:    <CartScreen />,
    bill:    <BillScreen />,
  };

  return (
    <div className="app">
      {screens[screen] || <WelcomeScreen />}
    </div>
  );
}
