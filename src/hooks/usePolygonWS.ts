import { useEffect, useRef, useCallback, useState } from 'react';
import { mockWatchlistData } from '../mocks/watchlist';

interface LiveQuote {
  price: number;
  change: number;
  changePercent: number;
  prevPrice: number;
}

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const WS_URL = 'wss://socket.polygon.io/stocks';
const MAX_RETRIES = 5;

interface InitialQuoteData {
  price: number;
  prevClose: number;
}

export function usePolygonWS(
  tickers: string[],
  initialQuotes?: Record<string, InitialQuoteData>
) {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const basePricesRef = useRef<Record<string, number>>({});
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const tickerKey = tickers.join(',');

  // Store base prices from initial quotes or mock data
  useEffect(() => {
    const bases: Record<string, number> = {};
    for (const t of tickers) {
      if (initialQuotes?.[t]) {
        bases[t] = initialQuotes[t].prevClose;
      } else {
        const mock = mockWatchlistData[t];
        if (mock) {
          bases[t] = mock.price - mock.change;
        }
      }
    }
    basePricesRef.current = bases;
  }, [tickerKey, initialQuotes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize quotes from initial data or mock data
  useEffect(() => {
    const initial: Record<string, LiveQuote> = {};
    for (const t of tickers) {
      if (initialQuotes?.[t]) {
        const iq = initialQuotes[t];
        const change = Math.round((iq.price - iq.prevClose) * 100) / 100;
        const changePercent = iq.prevClose > 0
          ? Math.round(((iq.price - iq.prevClose) / iq.prevClose) * 10000) / 100
          : 0;
        initial[t] = {
          price: iq.price,
          change,
          changePercent,
          prevPrice: iq.price,
        };
      } else {
        const mock = mockWatchlistData[t];
        if (mock) {
          initial[t] = {
            price: mock.price,
            change: mock.change,
            changePercent: mock.changePercent,
            prevPrice: mock.price,
          };
        }
      }
    }
    setQuotes(initial);
  }, [tickerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const startMockSimulation = useCallback(() => {
    mockIntervalRef.current = setInterval(() => {
      setQuotes((prev) => {
        const next = { ...prev };
        const count = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...tickers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
          const t = shuffled[i];
          const current = next[t];
          if (!current) continue;
          const pctChange = (Math.random() - 0.48) * 0.005;
          const newPrice = Math.round(current.price * (1 + pctChange) * 100) / 100;
          const basePrice = basePricesRef.current[t] ?? current.price;
          next[t] = {
            price: newPrice,
            change: Math.round((newPrice - basePrice) * 100) / 100,
            changePercent: basePrice > 0
              ? Math.round(((newPrice - basePrice) / basePrice) * 10000) / 100
              : 0,
            prevPrice: current.price,
          };
        }
        return next;
      });
    }, 3000);
  }, [tickerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(() => {
    const apiKey = import.meta.env.VITE_POLYGON_API_KEY;

    if (!apiKey) {
      setStatus('connected');
      startMockSimulation();
      return;
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'auth', params: apiKey }));
      };

      ws.onmessage = (event) => {
        const messages = JSON.parse(event.data as string) as Array<Record<string, unknown>>;

        for (const msg of messages) {
          if (msg.ev === 'status' && msg.message === 'authenticated') {
            setStatus('connected');
            retriesRef.current = 0;
            ws.send(
              JSON.stringify({
                action: 'subscribe',
                params: tickers.map((t) => `Q.${t}`).join(','),
              })
            );
          }
          if (msg.ev === 'Q' && typeof msg.sym === 'string') {
            const sym = msg.sym;
            const bidPrice = msg.bp as number | undefined;
            if (bidPrice) {
              setQuotes((prev) => {
                const old = prev[sym];
                const basePrice = basePricesRef.current[sym] ?? bidPrice;
                return {
                  ...prev,
                  [sym]: {
                    price: bidPrice,
                    change: Math.round((bidPrice - basePrice) * 100) / 100,
                    changePercent: basePrice > 0
                      ? Math.round(((bidPrice - basePrice) / basePrice) * 10000) / 100
                      : 0,
                    prevPrice: old?.price ?? bidPrice,
                  },
                };
              });
            }
          }
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;
        if (retriesRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
          retriesRef.current++;
          setTimeout(connect, delay);
        } else {
          startMockSimulation();
          setStatus('connected');
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setStatus('connected');
      startMockSimulation();
    }
  }, [tickerKey, startMockSimulation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
    };
  }, [connect]);

  return { quotes, status };
}
