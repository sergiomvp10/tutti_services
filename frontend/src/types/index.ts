export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  purchase_volume: string | null;
  role: 'admin' | 'buyer';
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  category_id: number | null;
  category_name: string | null;
  image_url: string | null;
  image_url_2: string | null;
  stock: number;
  min_order: number;
  is_active: boolean;
  discount_percent: number | null;
  final_price: number | null;
}

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  discount_percent: number;
  product_id: number | null;
  product_name: string | null;
  category_id: number | null;
  category_name: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_phone: string | null;
  user_address: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_address: string | null;
  payment_method: string | null;
  status: string;
  total: number;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
