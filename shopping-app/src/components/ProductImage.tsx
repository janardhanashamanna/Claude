import type { CategorySlug } from '../types';

const categoryTint: Record<CategorySlug, string> = {
  groceries: 'from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/30',
  medical: 'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-800/30',
  stationery: 'from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30',
  'home-hardware': 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/30',
  'general-merchandise': 'from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/30',
};

interface ProductImageProps {
  icon: string;
  category: CategorySlug;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProductImage({ icon, category, size = 'md', className = '' }: ProductImageProps) {
  const sizeClass = size === 'sm' ? 'text-3xl' : size === 'lg' ? 'text-7xl' : 'text-5xl';
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${categoryTint[category]} ${className}`}
    >
      <span className={sizeClass} aria-hidden="true">
        {icon}
      </span>
    </div>
  );
}
