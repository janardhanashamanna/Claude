import { useQuery } from '@tanstack/react-query';
import { marketData, Range } from '../lib/marketData';

export function useSymbolSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => marketData.searchSymbols(query),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => marketData.getQuote(symbol),
    enabled: !!symbol,
    refetchInterval: 15_000,
  });
}

export function useCandles(symbol: string, range: Range) {
  return useQuery({
    queryKey: ['candles', symbol, range],
    queryFn: () => marketData.getCandles(symbol, range),
    enabled: !!symbol,
    staleTime: 30_000,
  });
}

export function useProfile(symbol: string) {
  return useQuery({
    queryKey: ['profile', symbol],
    queryFn: () => marketData.getCompanyProfile(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}

export function useFundamentals(symbol: string) {
  return useQuery({
    queryKey: ['fundamentals', symbol],
    queryFn: () => marketData.getFundamentals(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}
