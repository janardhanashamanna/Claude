import type { CategorySlug, Product } from '../types';
import {
  groceriesSeed,
  medicalSeed,
  stationerySeed,
  homeHardwareSeed,
  generalMerchandiseSeed,
  type SeedTuple,
} from './productSeed';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Simple deterministic pseudo-random generator so ratings/stock stay stable across renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildProducts(category: CategorySlug, seed: SeedTuple[]): Product[] {
  return seed.map(([name, brand, price, unit, subcategory, icon, description], index) => {
    const id = `${category}-${slugify(name)}-${index}`;
    const rand1 = seededRandom(index * 7 + price);
    const rand2 = seededRandom(index * 13 + price * 3);
    const rating = Math.round((3.6 + rand1 * 1.4) * 10) / 10;
    const reviewCount = Math.floor(8 + rand2 * 480);
    const hasDiscount = rand1 > 0.78;
    const stockCount = Math.floor(4 + rand2 * 120);

    return {
      id,
      name,
      brand,
      category,
      subcategory,
      price,
      unit,
      wasPrice: hasDiscount ? Math.round(price * 1.25 * 100) / 100 : undefined,
      image: icon,
      description:
        description ??
        `${name} from ${brand}. Quality ${subcategory.toLowerCase()} essential, ${unit}.`,
      tags: [subcategory.toLowerCase(), brand.toLowerCase(), category],
      inStock: stockCount > 0,
      stockCount,
      rating,
      reviewCount,
    };
  });
}

export const products: Product[] = [
  ...buildProducts('groceries', groceriesSeed),
  ...buildProducts('medical', medicalSeed),
  ...buildProducts('stationery', stationerySeed),
  ...buildProducts('home-hardware', homeHardwareSeed),
  ...buildProducts('general-merchandise', generalMerchandiseSeed),
];

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const productsByCategory = (category: CategorySlug): Product[] =>
  products.filter((p) => p.category === category);

export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
};

export const featuredProducts = (category: CategorySlug, count = 8): Product[] => {
  const items = productsByCategory(category);
  return items.slice(0, count);
};

export const dealsProducts = (): Product[] => products.filter((p) => p.wasPrice);
