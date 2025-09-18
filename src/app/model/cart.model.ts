export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string; // Ürün fotoğrafı için eklendi
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

// Elasticsearch'ten gelen cart analizi için
export interface CartAnalytics {
  id: string;
  userId: number;
  userName: string;
  items: CartAnalyticsItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartAnalyticsItem {
  productId: number;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}