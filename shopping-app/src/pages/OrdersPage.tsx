import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Package } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import type { OrderStatus } from '../types';

const statusLabel: Record<OrderStatus, string> = {
  placed: 'Order placed',
  packed: 'Packed',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
};

const statusColor: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  packed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'out-for-delivery': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  delivered: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const addItem = useCartStore((s) => s.addItem);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">No orders yet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your past orders will show up here once you check out.
        </p>
        <Link to="/" className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Start shopping
        </Link>
      </div>
    );
  }

  const buyAgain = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    order?.items.forEach((item) => addItem(item.productId, item.quantity));
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-50">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(order.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {order.items.reduce((n, i) => n + i.quantity, 0)} items · ${order.total.toFixed(2)}
                </p>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
              />
            </button>

            {expanded === order.id && (
              <div className="border-t border-gray-100 p-4 dark:border-gray-700">
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.quantity} × {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.deliveryMethod === 'delivery' ? 'Delivered to' : 'Pickup'}: {order.address.suburb || 'In-store'}
                  </p>
                  <button
                    onClick={() => buyAgain(order.id)}
                    className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Buy again
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
