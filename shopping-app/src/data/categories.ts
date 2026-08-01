import type { Category } from '../types';

export const categories: Category[] = [
  {
    slug: 'groceries',
    name: 'Groceries',
    description: 'Fresh food, pantry staples, drinks, snacks and household essentials',
    icon: '🛒',
    subcategories: [
      'Fruit & Veg',
      'Bakery',
      'Dairy & Eggs',
      'Meat & Seafood',
      'Pantry',
      'Snacks & Confectionery',
      'Drinks',
      'Frozen',
      'Cleaning & Laundry',
      'Baby & Pet',
    ],
  },
  {
    slug: 'medical',
    name: 'Health & Pharmacy',
    description: 'Pain relief, first aid, vitamins, personal care and everyday health',
    icon: '💊',
    subcategories: [
      'Pain Relief',
      'Cold & Flu',
      'First Aid',
      'Vitamins & Supplements',
      'Skin Care',
      'Personal Care',
      'Oral Care',
      'Baby Health',
    ],
  },
  {
    slug: 'stationery',
    name: 'Stationery & Office',
    description: 'Pens, paper, art supplies, school and home office gear',
    icon: '✏️',
    subcategories: [
      'Writing & Correction',
      'Paper & Notebooks',
      'Art & Craft',
      'Filing & Organisation',
      'School Supplies',
      'Printers & Ink',
      'Desk Accessories',
    ],
  },
  {
    slug: 'home-hardware',
    name: 'Home & Hardware',
    description: 'Tools, hardware, garden, paint and DIY building supplies',
    icon: '🔨',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Fixings & Fasteners',
      'Paint & Supplies',
      'Garden & Outdoor',
      'Plumbing',
      'Electrical',
      'Storage & Shelving',
    ],
  },
  {
    slug: 'general-merchandise',
    name: 'General Merchandise',
    description: 'Homewares, kitchen, kids, apparel basics and everyday extras',
    icon: '🏠',
    subcategories: [
      'Kitchen & Dining',
      'Homewares & Decor',
      'Bedding & Bath',
      'Toys & Kids',
      'Clothing Basics',
      'Storage & Cleaning',
      'Party & Gifting',
      'Tech Accessories',
    ],
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
