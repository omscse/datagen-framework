import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import type { Order, OrderInput, OrderItem } from '../models/order.js';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildItems(count: number): OrderItem[] {
  return Array.from({ length: count }, () => {
    const qty = rand(1, 5);
    const unitPrice = rand(5, 200);
    return { productId: `prod-${uid()}`, qty, unitPrice };
  });
}

function buildOrder(status: Order['status'], itemCount: number): Order {
  const items = buildItems(itemCount);
  const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  return {
    id:     `order-${uid()}`,
    userId: `user-${uid()}`,
    items,
    total,
    status,
  };
}

@Pack({ name: 'order', description: 'Generates order test data with random items and totals' })
export class OrderPack implements DataGenerationPack<Order, OrderInput> {
  async createDefault(): Promise<Order> {
    return buildOrder('pending', rand(1, 3));
  }

  async createCustom(input: OrderInput): Promise<Order> {
    const status = input.status ?? 'pending';
    const itemCount = input.itemCount ?? rand(1, 3);
    return buildOrder(status, itemCount);
  }

  async delete(_data: Order): Promise<void> {
    // no-op: in-memory generated data, nothing to clean up
  }
}
