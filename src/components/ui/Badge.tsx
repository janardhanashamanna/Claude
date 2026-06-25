import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { SignalTone } from '../../lib/indicators';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: SignalTone;
}

const TONE: Record<SignalTone, string> = {
  bullish: 'bg-green-500/15 text-green-600 dark:text-green-400',
  bearish: 'bg-red-500/15 text-red-600 dark:text-red-400',
  neutral: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300',
};

export function Badge({ className, tone = 'neutral', ...props }: Props) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', TONE[tone], className)}
      {...props}
    />
  );
}
