import { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { categoryBySlug } from '../data/categories';
import { productsByCategory } from '../data/products';
import ProductCard from '../components/ProductCard';
import type { CategorySlug } from '../types';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categoryBySlug(slug ?? '');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);

  const products = useMemo(() => {
    if (!category) return [];
    let items = productsByCategory(category.slug as CategorySlug);
    if (activeSub) items = items.filter((p) => p.subcategory === activeSub);
    if (inStockOnly) items = items.filter((p) => p.inStock);
    switch (sort) {
      case 'price-asc':
        items = [...items].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items = [...items].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items = [...items].sort((a, b) => b.rating - a.rating);
        break;
    }
    return items;
  }, [category, activeSub, sort, inStockOnly]);

  if (!category) return <Navigate to="/" replace />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {category.icon} {category.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="shrink-0 md:w-56">
          <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Subcategories</h3>
          <div className="flex flex-wrap gap-2 md:flex-col md:gap-1">
            <button
              onClick={() => setActiveSub(null)}
              className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                activeSub === null
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                  activeSub === sub
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded"
            />
            In stock only
          </label>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} products</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {products.length === 0 ? (
            <p className="py-12 text-center text-gray-500 dark:text-gray-400">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
