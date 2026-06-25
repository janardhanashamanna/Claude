import { createContext, ReactNode, useContext, useState } from 'react';

interface SymbolState {
  symbol: string;
  setSymbol: (s: string) => void;
}

const SymbolContext = createContext<SymbolState | null>(null);

export function SymbolProvider({ children }: { children: ReactNode }) {
  const [symbol, setSymbolRaw] = useState('AAPL');
  const setSymbol = (s: string) => setSymbolRaw(s.toUpperCase());
  return <SymbolContext.Provider value={{ symbol, setSymbol }}>{children}</SymbolContext.Provider>;
}

export function useSymbol(): SymbolState {
  const ctx = useContext(SymbolContext);
  if (!ctx) throw new Error('useSymbol must be used within a SymbolProvider');
  return ctx;
}
