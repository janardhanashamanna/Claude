import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Candle } from '../../lib/marketData';
import { SignalBadges } from './SignalBadges';

function candles(closes: number[]): Candle[] {
  return closes.map((close, i) => ({ time: i * 86400, open: close, high: close, low: close, close, volume: 0 }));
}

describe('SignalBadges', () => {
  it('renders an oversold signal for a falling series', () => {
    const data = candles(Array.from({ length: 40 }, (_, i) => 100 - i));
    render(<SignalBadges candles={data} />);
    expect(screen.getByText(/Oversold/i)).toBeInTheDocument();
  });

  it('renders nothing without enough data', () => {
    const { container } = render(<SignalBadges candles={candles([1, 2, 3])} />);
    expect(container).toBeEmptyDOMElement();
  });
});
