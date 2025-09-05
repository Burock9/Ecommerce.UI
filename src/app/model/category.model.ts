export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CategoryIndex {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}
