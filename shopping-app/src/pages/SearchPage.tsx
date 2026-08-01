import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { searchProducts } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const results = useMemo(() => searchProducts(query), [query]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
        Search results for "{query}"
      </h1>
      <p className="mb-6 mt-1 text-sm text-gray-500 dark:text-gray-400">{results.length} products found</p>

      {results.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No products match your search. Try a different term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
