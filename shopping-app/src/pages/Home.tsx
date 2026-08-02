import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categories } from '../data/categories';
import { featuredProducts, dealsProducts } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const deals = dealsProducts().slice(0, 8);

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="text-2xl font-bold sm:text-4xl">
          Everything for home, health & office
        </h1>
        <p className="mt-2 max-w-xl text-brand-50/90">
          Groceries, pharmacy essentials, stationery and hardware — all in one place, delivered to your door.
        </p>
        <Link
          to="/category/groceries"
          className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Start shopping
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-50">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="text-4xl">{c.icon}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">🔥 Today's deals</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {categories.map((c) => {
        const items = featuredProducts(c.slug, 8);
        if (items.length === 0) return null;
        return (
          <section key={c.slug}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                {c.icon} {c.name}
              </h2>
              <Link
                to={`/category/${c.slug}`}
                className="flex items-center text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
