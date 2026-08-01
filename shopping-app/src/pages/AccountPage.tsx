import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useOrderStore } from '../store/orderStore';

export default function AccountPage() {
  const { user, login, logout } = useUserStore();
  const orders = useOrderStore((s) => s.orders);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!user) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-50">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Demo account — enter any name and email to continue.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name && email) login(name, email);
          }}
          className="space-y-3"
        >
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <UserIcon size={28} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-50">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{orders.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total orders</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total spent</p>
        </div>
      </div>
    </div>
  );
}
