export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: Category;
    imageUrl?: string;
}

export interface ProductIndex {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: string;
    categoryName: string;
    imageUrl?: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}