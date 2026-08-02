import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Truck, Store, CreditCard } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useUserStore } from '../store/userStore';
import { productById } from '../data/products';
import type { Address, Order } from '../types';

const DELIVERY_FEE = 4.95;
const FREE_DELIVERY_THRESHOLD = 75;

const emptyAddress: Address = {
  fullName: '',
  line1: '',
  suburb: '',
  state: 'NSW',
  postcode: '',
  phone: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState<Address>({
    ...emptyAddress,
    fullName: user?.name ?? '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [placing, setPlacing] = useState(false);

  const cartProducts = items
    .map((item) => ({ item, product: productById(item.productId) }))
    .filter((x): x is { item: typeof x.item; product: NonNullable<typeof x.product> } => Boolean(x.product));

  if (cartProducts.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const sub = subtotal();
  const deliveryFee = deliveryMethod === 'pickup' || sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = sub + deliveryFee;

  const isFormValid =
    (deliveryMethod === 'pickup' ||
      (address.fullName && address.line1 && address.suburb && address.postcode && address.phone)) &&
    (paymentMethod !== 'card' || cardNumber.replace(/\s/g, '').length >= 12);

  const handlePlaceOrder = () => {
    setPlacing(true);
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      items: cartProducts.map(({ item, product }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
      })),
      subtotal: sub,
      deliveryFee,
      total,
      address,
      deliveryMethod,
      paymentMethod: paymentMethod === 'card' ? `Card ending ${cardNumber.slice(-4)}` : 'Cash on pickup',
      status: 'placed',
    };
    setTimeout(() => {
      addOrder(order);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Checkout</h1>

        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">Fulfilment method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium ${
                deliveryMethod === 'delivery'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Truck size={18} /> Home Delivery
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium ${
                deliveryMethod === 'pickup'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Store size={18} /> Click & Collect
            </button>
          </div>
        </section>

        {deliveryMethod === 'delivery' && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">Delivery address</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Full name"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 sm:col-span-2"
              />
              <input
                placeholder="Street address"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 sm:col-span-2"
              />
              <input
                placeholder="Suburb"
                value={address.suburb}
                onChange={(e) => setAddress({ ...address, suburb: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
              <select
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                placeholder="Postcode"
                value={address.postcode}
                onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
              <input
                placeholder="Phone number"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
          </section>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">Payment</h2>
          <div className="mb-3 flex gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium ${
                paymentMethod === 'card'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <CreditCard size={18} /> Card
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium ${
                paymentMethod === 'cash'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              Pay on pickup/delivery
            </button>
          </div>
          {paymentMethod === 'card' && (
            <input
              placeholder="Card number (demo only, not validated)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          )}
          <p className="mt-2 text-xs text-gray-400">
            This is a demo store — no real payment is processed.
          </p>
        </section>
      </div>

      <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-50">Order Summary</h2>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
          {cartProducts.map(({ item, product }) => (
            <div key={item.productId} className="flex justify-between text-gray-600 dark:text-gray-300">
              <span className="line-clamp-1 pr-2">{item.quantity} × {product.name}</span>
              <span className="shrink-0">${(product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-50">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={!isFormValid || placing}
          className="mt-5 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:dark:bg-gray-600"
        >
          {placing ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
