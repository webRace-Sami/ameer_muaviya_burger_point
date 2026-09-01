export interface ShopSetting {
  id: string;
  nameEn: string;
  nameUr: string;
  phone: string;
  locationEn: string;
  locationUr: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  announcement?: string | null;
  updatedAt?: string | Date;
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameUr: string;
  description?: string | null;
  price: number;
  category: string; // 'Burgers' | 'Shawarma' | 'Fries & Sides' | 'Drinks'
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  id: string;
  nameEn: string;
  nameUr: string;
  price: number;
  image: string;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  nameEn: string;
  nameUr: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  specialNotes?: string | null;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
