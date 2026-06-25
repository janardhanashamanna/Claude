import { Badge } from '../../components/ui/Badge';
import { Candle } from '../../lib/marketData';
import { signals } from '../../lib/indicators';

export function SignalBadges({ candles }: { candles: Candle[] }) {
  const list = signals(candles);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((s) => (
        <Badge key={s.label} tone={s.tone}>
          {s.label}
        </Badge>
      ))}
    </div>
  );
}
