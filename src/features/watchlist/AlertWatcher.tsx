import { useEffect } from 'react';
import { useQuote } from '../../hooks/marketDataHooks';
import { Alert, alertMatches } from '../../hooks/useAlerts';
import { useToast } from '../../state/ToastContext';
import { formatPrice } from '../../lib/format';

interface Props {
  alert: Alert;
  onTrigger: (id: string) => void;
}

/** Headless component: watches one alert's symbol and fires when crossed. */
export function AlertWatcher({ alert, onTrigger }: Props) {
  const { data: quote } = useQuote(alert.symbol);
  const { notify } = useToast();

  useEffect(() => {
    if (!quote || alert.triggered) return;
    if (alertMatches(alert, quote.price)) {
      const message = `${alert.symbol} is ${alert.direction} ${formatPrice(alert.price)} — now ${formatPrice(quote.price)}`;
      notify(message);
      fireBrowserNotification(`Alert: ${alert.symbol}`, message);
      onTrigger(alert.id);
    }
  }, [quote, alert, notify, onTrigger]);

  return null;
}

function fireBrowserNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
