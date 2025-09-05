export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: Category;
    categoryId?: number;
}

export interface ProductIndex {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number; // Backend'de 'stock' olarak tanımlı
    categoryId: string;
    categoryName: string;
    imageUrl?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}