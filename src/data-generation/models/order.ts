export interface OrderItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface OrderInput {
  status?: Order['status'];
  itemCount?: number;
}
