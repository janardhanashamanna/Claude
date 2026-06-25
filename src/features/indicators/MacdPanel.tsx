import { Bar, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Candle } from '../../lib/marketData';
import { macd } from '../../lib/indicators';

export function MacdPanel({ candles }: { candles: Candle[] }) {
  const data = macd(candles).map((p) => ({
    time: p.time,
    macd: Number(p.macd.toFixed(3)),
    signal: Number(p.signal.toFixed(3)),
    histogram: Number(p.histogram.toFixed(3)),
  }));
  if (data.length === 0) return <p className="text-sm text-zinc-500">Not enough data for MACD.</p>;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <YAxis width={36} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(t) => new Date((t as number) * 1000).toLocaleDateString()}
        />
        <Bar dataKey="histogram" isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.histogram >= 0 ? '#16a34a' : '#dc2626'} />
          ))}
        </Bar>
        <Line type="monotone" dataKey="macd" stroke="#2563eb" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        <Line type="monotone" dataKey="signal" stroke="#f59e0b" dot={false} strokeWidth={1.5} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
