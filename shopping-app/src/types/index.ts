export type CategorySlug =
  | 'groceries'
  | 'medical'
  | 'stationery'
  | 'home-hardware'
  | 'general-merchandise';

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  price: number;
  unit: string;
  wasPrice?: number;
  image: string;
  description: string;
  tags: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  line1: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
}

export type OrderStatus = 'placed' | 'packed' | 'out-for-delivery' | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: Address;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: string;
  status: OrderStatus;
}

export interface User {
  name: string;
  email: string;
  addresses: Address[];
}
