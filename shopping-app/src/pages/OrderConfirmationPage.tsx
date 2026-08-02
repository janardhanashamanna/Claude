import { useParams, Navigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-xl text-center">
      <CheckCircle2 className="mx-auto mb-4 text-brand-600" size={64} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Order placed!</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Thanks{order.address.fullName ? `, ${order.address.fullName}` : ''} — your order{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-200">{order.id}</span> has been confirmed.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-left dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-700">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">{item.quantity} × {item.name}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="mt-1 flex justify-between font-bold text-gray-900 dark:text-gray-50">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {order.deliveryMethod === 'delivery'
          ? `Delivering to ${order.address.line1}, ${order.address.suburb} ${order.address.state} ${order.address.postcode}`
          : 'Ready for pickup at your selected store'}
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/orders" className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
          View orders
        </Link>
        <Link to="/" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
