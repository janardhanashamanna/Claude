import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({ rating, reviewCount, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300 dark:text-gray-600'
            }
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {rating.toFixed(1)}
        {reviewCount !== undefined ? ` (${reviewCount})` : ''}
      </span>
    </div>
  );
}
