# EveryDay — Shopping App

A demo shopping web app covering daily household groceries, health & pharmacy, stationery & office, home & hardware, and general merchandise (Bunnings/Kmart-style) items.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router for pages
- Zustand (with localStorage persistence) for cart, orders, and mock user auth

## Features

- Home page with category tiles, deals, and per-category featured products
- Category browsing with subcategory filters, in-stock filter, and sorting
- Full-text search across name/brand/subcategory/tags
- Product detail pages with related items
- Cart with quantity controls and free-delivery threshold
- Checkout flow (delivery or click & collect, address form, mock payment)
- Order confirmation and order history with "buy again"
- Mock account sign-in (no real backend/auth)
- Responsive layout with light/dark mode support

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the production build
```

This is a frontend-only demo: all product data is seeded locally (`src/data/`) and all cart/order/user state persists to the browser's localStorage. No backend or payment processing is involved.
