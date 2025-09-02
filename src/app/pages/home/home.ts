import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  categories = [
    { 
      id: 1,
      icon: '�', 
      name: 'Elektronik', 
      description: 'Son teknoloji ürünler',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      itemCount: '2.1k ürün'
    },
    { 
      id: 2,
      icon: '�👕', 
      name: 'Giyim & Moda', 
      description: 'Trendy kıyafetler ve aksesuar',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      itemCount: '1.8k ürün'
    },
    { 
      id: 3,
      icon: '🏠', 
      name: 'Ev & Yaşam', 
      description: 'Ev dekorasyonu ve mobilya',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      itemCount: '950 ürün'
    },
    { 
      id: 4,
      icon: '🎮', 
      name: 'Oyun & Hobi', 
      description: 'Eğlence ve hobi ürünleri',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      itemCount: '720 ürün'
    },
    { 
      id: 5,
      icon: '📚', 
      name: 'Kitap & Kırtasiye', 
      description: 'Eğitim ve kırtasiye malzemeleri',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      itemCount: '1.2k ürün'
    },
    { 
      id: 6,
      icon: '�‍♂️', 
      name: 'Spor & Outdoor', 
      description: 'Spor ve açık hava aktiviteleri',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      itemCount: '640 ürün'
    }
  ];

  featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      description: 'En yeni Apple teknolojisi',
      price: 45999,
      originalPrice: 49999,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      badge: 'YENİ',
      badgeColor: 'success',
      rating: 4.8,
      reviewCount: 128
    },
    {
      id: 2,
      name: 'Nike Air Max 270',
      description: 'Konforlu ve şık spor ayakkabı',
      price: 1299,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      badge: 'İNDİRİM',
      badgeColor: 'danger',
      rating: 4.6,
      reviewCount: 89
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      description: 'Güçlü performans, hafif tasarım',
      price: 24999,
      originalPrice: 26999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      badge: 'POPÜLER',
      badgeColor: 'warning',
      rating: 4.9,
      reviewCount: 245
    },
    {
      id: 4,
      name: 'Sony WH-1000XM4',
      description: 'Noise cancelling kulaklık',
      price: 2499,
      originalPrice: 2899,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
      badge: 'EN ÇOK SATAN',
      badgeColor: 'primary',
      rating: 4.7,
      reviewCount: 167
    }
  ];
}
