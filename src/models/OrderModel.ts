import { Address } from './UserModel';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderTimeline {
  step: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  timeline: OrderTimeline[];
  estimatedDelivery: string;
  trackingNumber: string;
}
