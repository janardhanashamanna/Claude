import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types';
import ProductImage from './ProductImage';
import StarRating from './StarRating';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <ProductImage icon={product.image} category={product.category} className="aspect-square w-full mb-3" />
      {product.wasPrice && (
        <span className="mb-1 w-fit rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
          SAVE ${(product.wasPrice - product.price).toFixed(2)}
        </span>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900 dark:text-gray-100">
        {product.name}
      </h3>
      <div className="mt-1">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
              ${product.price.toFixed(2)}
            </span>
            {product.wasPrice && (
              <span className="text-xs text-gray-400 line-through">${product.wasPrice.toFixed(2)}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">{product.unit}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
            justAdded
              ? 'bg-brand-600 text-white'
              : 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-300 disabled:dark:bg-gray-600'
          }`}
        >
          {justAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
      {!product.inStock && (
        <p className="mt-1 text-[11px] font-medium text-red-500">Out of stock</p>
      )}
    </Link>
  );
}
