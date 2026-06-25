import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Candle } from '../../lib/marketData';
import { rsi } from '../../lib/indicators';

export function RsiPanel({ candles }: { candles: Candle[] }) {
  const data = rsi(candles).map((p) => ({ time: p.time, value: Number(p.value.toFixed(2)) }));
  if (data.length === 0) return <p className="text-sm text-zinc-500">Not enough data for RSI.</p>;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <YAxis domain={[0, 100]} ticks={[30, 50, 70]} width={28} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
        <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="3 3" />
        <ReferenceLine y={30} stroke="#16a34a" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(t) => new Date((t as number) * 1000).toLocaleDateString()}
          formatter={(v) => [v as number, 'RSI']}
        />
        <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={1.5} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
