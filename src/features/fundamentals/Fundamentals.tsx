import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardTitle } from '../../components/ui/Card';
import { ErrorState, LoadingState } from '../../components/ui/States';
import { useFundamentals, useProfile } from '../../hooks/marketDataHooks';
import { formatCompact, formatPrice } from '../../lib/format';

export function Fundamentals({ symbol }: { symbol: string }) {
  const { data: profile } = useProfile(symbol);
  const { data, isLoading, isError, refetch } = useFundamentals(symbol);

  if (isLoading) return <LoadingState label="Loading fundamentals…" />;
  if (isError || !data) return <ErrorState message="Could not load fundamentals." onRetry={() => refetch()} />;

  const metrics: Array<[string, string]> = [
    ['Market cap', formatCompact(data.marketCap)],
    ['P/E (TTM)', data.peRatio?.toFixed(2) ?? '—'],
    ['EPS (TTM)', data.eps?.toFixed(2) ?? '—'],
    ['Dividend yield', data.dividendYield !== undefined ? `${data.dividendYield.toFixed(2)}%` : '—'],
    ['52-week high', formatPrice(data.high52Week)],
    ['52-week low', formatPrice(data.low52Week)],
    ['Beta', data.beta?.toFixed(2) ?? '—'],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>Company profile</CardTitle>
        <div className="flex items-start gap-3">
          {profile?.logo && (
            <img src={profile.logo} alt="" className="h-10 w-10 rounded bg-white object-contain" />
          )}
          <div>
            <p className="font-semibold">{profile?.name ?? symbol}</p>
            <p className="text-xs text-zinc-500">
              {[profile?.exchange, profile?.industry, profile?.country].filter(Boolean).join(' · ')}
            </p>
            {profile?.weburl && (
              <a
                href={profile.weburl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                {profile.weburl}
              </a>
            )}
          </div>
        </div>
        {profile?.description && (
          <p className="mt-3 line-clamp-4 text-sm text-zinc-600 dark:text-zinc-400">{profile.description}</p>
        )}
      </Card>

      <Card>
        <CardTitle>Key metrics</CardTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {metrics.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-800">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {data.history.length > 0 && (
        <>
          <Card>
            <CardTitle>Revenue history (B)</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a33" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} width={32} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardTitle>EPS history</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a33" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} width={32} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="eps" fill="#16a34a" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
