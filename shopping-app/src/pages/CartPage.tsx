import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { productById } from '../data/products';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';

const DELIVERY_FEE = 4.95;
const FREE_DELIVERY_THRESHOLD = 75;

export default function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCartStore();
  const navigate = useNavigate();

  const cartProducts = items
    .map((item) => ({ item, product: productById(item.productId) }))
    .filter((x): x is { item: typeof x.item; product: NonNullable<typeof x.product> } => Boolean(x.product));

  const sub = subtotal();
  const deliveryFee = sub === 0 || sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = sub + deliveryFee;

  if (cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add some groceries, health essentials, stationery or hardware to get started.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-50">
          Your Cart ({cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'})
        </h1>
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
          {cartProducts.map(({ item, product }) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <Link to={`/product/${product.id}`} className="shrink-0">
                <ProductImage icon={product.image} category={product.category} size="sm" className="h-20 w-20" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/product/${product.id}`} className="font-medium text-gray-900 hover:underline dark:text-gray-100">
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.brand} · {product.unit}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(q) => setQuantity(item.productId, q)}
                    max={product.stockCount}
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${product.name}`}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold text-gray-900 dark:text-gray-100">
                ${(product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-50">Order Summary</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-xs text-brand-600 dark:text-brand-400">
              Add ${(FREE_DELIVERY_THRESHOLD - sub).toFixed(2)} more for free delivery
            </p>
          )}
        </div>
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-50">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="mt-5 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
