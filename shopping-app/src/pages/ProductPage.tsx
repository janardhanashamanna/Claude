import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { productById, productsByCategory } from '../data/products';
import { categoryBySlug } from '../data/categories';
import ProductImage from '../components/ProductImage';
import StarRating from '../components/StarRating';
import QuantityStepper from '../components/QuantityStepper';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = productById(id ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return <Navigate to="/" replace />;

  const category = categoryBySlug(product.category);
  const related = productsByCategory(product.category)
    .filter((p) => p.id !== product.id && p.subcategory === product.subcategory)
    .slice(0, 4);

  const handleAdd = () => {
    addItem(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/category/${product.category}`} className="hover:underline">
          {category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 dark:text-gray-300">{product.subcategory}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductImage icon={product.image} category={product.category} size="lg" className="aspect-square w-full" />

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              ${product.price.toFixed(2)}
            </span>
            {product.wasPrice && (
              <span className="text-lg text-gray-400 line-through">${product.wasPrice.toFixed(2)}</span>
            )}
            <span className="text-sm text-gray-400">/ {product.unit}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {t}
              </span>
            ))}
          </div>

          <p className={`mt-4 text-sm font-medium ${product.inStock ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
            {product.inStock ? `In stock — ${product.stockCount} available` : 'Out of stock'}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <QuantityStepper quantity={qty} onChange={setQty} max={product.stockCount} />
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition sm:flex-none ${
                added ? 'bg-brand-700' : 'bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300'
              }`}
            >
              {added ? <Check size={18} /> : null}
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-50">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
