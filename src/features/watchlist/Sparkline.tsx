import { Line, LineChart } from 'recharts';
import { useCandles } from '../../hooks/marketDataHooks';

export function Sparkline({ symbol }: { symbol: string }) {
  const { data } = useCandles(symbol, '1M');
  if (!data || data.length === 0) return <div className="h-8 w-24" />;
  const points = data.map((c) => ({ value: c.close }));
  const up = data[data.length - 1].close >= data[0].close;
  return (
    <LineChart width={96} height={32} data={points}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={up ? '#16a34a' : '#dc2626'}
        dot={false}
        strokeWidth={1.5}
        isAnimationActive={false}
      />
    </LineChart>
  );
}
