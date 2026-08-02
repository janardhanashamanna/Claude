export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Shop</h4>
            <p>Groceries</p>
            <p>Health & Pharmacy</p>
            <p>Stationery & Office</p>
            <p>Home & Hardware</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Help</h4>
            <p>Delivery info</p>
            <p>Returns</p>
            <p>Contact us</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Account</h4>
            <p>My orders</p>
            <p>My account</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">About</h4>
            <p>EveryDay is a demo shopping app for groceries, health & pharmacy, stationery, and home & hardware.</p>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-4 text-xs dark:border-gray-800">
          © {new Date().getFullYear()} EveryDay Demo Store. Prices in AUD, for demonstration only.
        </p>
      </div>
    </footer>
  );
}
