import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Alert, useAlerts } from '../../hooks/useAlerts';
import { formatPrice } from '../../lib/format';
import { cn } from '../../lib/cn';
import { AlertWatcher } from './AlertWatcher';

export function AlertsManager({ symbol }: { symbol: string }) {
  const { alerts, add, remove, markTriggered } = useAlerts();
  const [direction, setDirection] = useState<Alert['direction']>('above');
  const [price, setPrice] = useState('');

  const requestPermission = () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(price);
    if (Number.isNaN(value)) return;
    requestPermission();
    add(symbol, direction, value);
    setPrice('');
  };

  return (
    <Card>
      <CardTitle>Price alerts</CardTitle>

      {/* Headless watchers — one per active alert. */}
      {alerts.map((a) => (
        <AlertWatcher key={a.id} alert={a} onTrigger={markTriggered} />
      ))}

      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{symbol}</span>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as Alert['direction'])}
          aria-label="Alert direction"
          className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="above">rises above</option>
          <option value="below">drops below</option>
        </select>
        <Input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          aria-label="Alert price"
          className="w-28"
        />
        <Button type="submit">Add alert</Button>
      </form>

      <ul className="mt-3 space-y-1.5">
        {alerts.length === 0 && <li className="text-sm text-zinc-500">No alerts set.</li>}
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-1.5 text-sm dark:border-zinc-800"
          >
            <span>
              <span className="font-medium">{a.symbol}</span> {a.direction} {formatPrice(a.price)}
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs',
                  a.triggered
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-zinc-500/15 text-zinc-500',
                )}
              >
                {a.triggered ? 'triggered' : 'active'}
              </span>
            </span>
            <button
              onClick={() => remove(a.id)}
              aria-label="Remove alert"
              className="text-zinc-400 hover:text-bear"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
