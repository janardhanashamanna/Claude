import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Alert {
  id: string;
  symbol: string;
  direction: 'above' | 'below';
  price: number;
  triggered: boolean;
}

const KEY = 'stock-analyzer:alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useLocalStorage<Alert[]>(KEY, []);

  const add = useCallback(
    (symbol: string, direction: Alert['direction'], price: number) => {
      const alert: Alert = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        symbol: symbol.toUpperCase(),
        direction,
        price,
        triggered: false,
      };
      setAlerts((prev) => [...prev, alert]);
    },
    [setAlerts],
  );

  const remove = useCallback(
    (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id)),
    [setAlerts],
  );

  const markTriggered = useCallback(
    (id: string) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, triggered: true } : a))),
    [setAlerts],
  );

  return { alerts, add, remove, markTriggered };
}

export function alertMatches(alert: Alert, price: number): boolean {
  return alert.direction === 'above' ? price >= alert.price : price <= alert.price;
}
