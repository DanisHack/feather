import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import MorningBrief from './screens/MorningBrief';
import StockResearch from './screens/StockResearch';
import Portfolio from './screens/Portfolio';
import Watchlist from './screens/Watchlist';
import Screener from './screens/Screener';
import Earnings from './screens/Earnings';
import Markets from './screens/Markets';
import Settings from './screens/Settings';
import { PaywallScreen } from './screens/Auth/PaywallScreen';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <MorningBrief /> },
      { path: '/research', element: <StockResearch /> },
      { path: '/research/:ticker', element: <StockResearch /> },
      { path: '/stock/:ticker', element: <StockResearch /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/watchlist', element: <Watchlist /> },
      { path: '/screener', element: <Screener /> },
      { path: '/earnings', element: <Earnings /> },
      { path: '/markets', element: <Markets /> },
      { path: '/settings', element: <Settings /> },
      { path: '/paywall', element: <PaywallScreen /> },
    ],
  },
]);
