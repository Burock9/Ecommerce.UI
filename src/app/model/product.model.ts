export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category: Category;
}

export interface ProductIndex {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number; 
    categoryId: string;
    categoryName: string;
    imageUrl?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}