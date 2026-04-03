export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: 'electronics' | 'clothing' | 'grocery' | 'furniture';
  inStock: boolean;
}

export interface ProductInput {
  category: Product['category'];
}
