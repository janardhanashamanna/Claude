import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User as UserIcon, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { categories } from '../data/categories';

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useUserStore((s) => s.user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🛍️</span>
          <span className="hidden text-lg font-bold text-brand-700 dark:text-brand-400 sm:inline">
            EveryDay
          </span>
        </Link>

        <form onSubmit={handleSearch} className="mx-2 flex-1">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groceries, meds, stationery, tools..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        <Link
          to="/orders"
          className="hidden items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600 dark:text-gray-200 sm:flex"
        >
          <Package size={20} />
          <span className="hidden lg:inline">Orders</span>
        </Link>

        <Link
          to="/account"
          className="hidden items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600 dark:text-gray-200 sm:flex"
        >
          <UserIcon size={20} />
          <span className="hidden lg:inline">{user ? user.name.split(' ')[0] : 'Account'}</span>
        </Link>

        <Link to="/cart" className="relative flex items-center gap-1 text-gray-700 dark:text-gray-200">
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
              {totalItems}
            </span>
          )}
          <span className="hidden text-sm font-medium lg:inline">Cart</span>
        </Link>
      </div>

      <nav className="hidden border-t border-gray-100 dark:border-gray-800 md:block">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium transition border-b-2 ${
                location.pathname === `/category/${c.slug}`
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-gray-600 hover:text-brand-600 dark:text-gray-300'
              }`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800 md:hidden">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {c.icon} {c.name}
            </Link>
          ))}
          <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            📦 Orders
          </Link>
          <Link to="/account" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            👤 Account
          </Link>
        </div>
      )}
    </header>
  );
}
