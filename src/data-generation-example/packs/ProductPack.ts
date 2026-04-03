import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import type { Product, ProductInput } from '../models/product.js';

const NAMES: Record<Product['category'], string[]> = {
  electronics: ['Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'USB-C Hub', 'Mechanical Keyboard'],
  clothing:    ['Cotton T-Shirt', 'Slim Fit Jeans', 'Running Shoes', 'Wool Sweater', 'Waterproof Jacket'],
  grocery:     ['Organic Oats', 'Almond Milk', 'Whole Wheat Bread', 'Greek Yogurt', 'Cold Brew Coffee'],
  furniture:   ['Ergonomic Chair', 'Standing Desk', 'Bookshelf', 'Bedside Table', 'Sofa Armchair'],
};

const PRICES: Record<Product['category'], [number, number]> = {
  electronics: [29, 499],
  clothing:    [15, 120],
  grocery:     [2, 18],
  furniture:   [80, 800],
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildProduct(category: Product['category']): Product {
  const [min, max] = PRICES[category];
  const name = pick(NAMES[category]);
  return {
    id:       `prod-${uid()}`,
    name,
    sku:      `SKU-${category.slice(0, 3).toUpperCase()}-${rand(1000, 9999)}`,
    price:    rand(min, max),
    category,
    inStock:  Math.random() > 0.2,
  };
}

@Pack({ name: 'product', description: 'Generates product test data with random category, price, and stock status' })
export class ProductPack implements DataGenerationPack<Product, ProductInput> {
  async createDefault(): Promise<Product> {
    const categories: Product['category'][] = ['electronics', 'clothing', 'grocery', 'furniture'];
    return buildProduct(pick(categories));
  }

  async createCustom(input: ProductInput): Promise<Product> {
    return buildProduct(input.category);
  }

  async delete(_data: Product): Promise<void> {
    // no-op: in-memory generated data, nothing to clean up
  }
}
