import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CategoryService } from '../../service/category.service';
import { ProductIndex } from '../../model/product.model';
import { CategoryIndex } from '../../model/category.model';
import { Page } from '../../model/response.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  // Backend'den gelecek ürünler
  products: ProductIndex[] = [];
  loading = false;
  error: string | null = null;

  // Backend'den gelecek kategoriler
  categories: CategoryIndex[] = [];
  categoriesLoading = false;
  categoriesError: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.productService.getAllProducts(0, 8).subscribe({
      next: (response: Page<ProductIndex>) => {
        this.products = response.content;
        console.log('🔍 Backend\'ten gelen ürünler:', this.products);
        console.log('🖼️ İlk ürünün imageUrl\'si:', this.products[0]?.imageUrl);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ürünler yüklenirken hata oluştu';
        this.loading = false;
        console.error('Error loading products:', error);
        // Hata durumunda mockData'yı kullan
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    // Backend bağlantısı olmadığında mock data kullan
    this.featuredProducts = this.featuredProducts; // Mevcut mock data
    this.loading = false;
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = null;
    
    this.categoryService.getAllCategories(0, 10).subscribe({
      next: (response: Page<CategoryIndex>) => {
        this.categories = response.content;
        console.log('🏷️ Backend\'ten gelen kategoriler:', this.categories);
        this.categoriesLoading = false;
      },
      error: (error) => {
        this.categoriesError = 'Kategoriler yüklenirken hata oluştu';
        this.categoriesLoading = false;
        console.error('Error loading categories:', error);
        // Hata durumunda mock kategoriler kullan
        this.loadMockCategories();
      }
    });
  }

  private loadMockCategories(): void {
    // Backend bağlantısı olmadığında mock kategoriler
    this.categories = [
      { id: '1', name: 'Elektronik', description: 'Son teknoloji ürünler' },
      { id: '2', name: 'Giyim', description: 'Trendy kıyafetler' },
      { id: '3', name: 'Ev Aletleri', description: 'Ev dekorasyonu' },
      { id: '4', name: 'Spor', description: 'Spor ürünleri' },
      { id: '5', name: 'Kitap', description: 'Kitaplar' },
      { id: '6', name: 'Oyun', description: 'Oyun ürünleri' }
    ];
    this.categoriesLoading = false;
  }

  // Kategori kartına tıklandığında çalışacak fonksiyon
  onCategoryClick(category: CategoryIndex): void {
    this.router.navigate(['/categories', category.id]);
  }

  // Kategori ikonunu dinamik olarak getir
  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Elektronik': '📱',
      'Giyim': '👕',
      'Ev Aletleri': '🏠',
      'Spor': '🏃‍♂️',
      'Kitap': '📚',
      'Oyun': '🎮',
      'Kozmetik': '💄',
      'Otomotiv': '🚗',
      'Teknoloji': '💻',
      'Bakım Ürünleri': '🪒',
      'Müzik': '🎵',
      'Sağlık': '💊'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '🏷️'; // Default icon
  }

  // Kategori rengini dinamik olarak getir
  getCategoryColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #e862ecff 0%, #8485d1ff 100%)'

    ];
    
    return colors[index % colors.length];
  }

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

  // Carousel variables
  currentSlide = 1;
  totalSlides = 3;
  autoSlideInterval: any;
  progressInterval: any;
  slideTimingMs = 5000; // 5 saniye - CSS ile senkron
  progressStartTime = 0;

  // Dynamic category carousel methods
  getCarouselCategories(): CategoryIndex[] {
    // İlk 5 kategoriyi carousel için kullan (çok fazla slide olmasın)
    return this.categories.slice(0, 5);
  }

  getCategoryEmoji(categoryName: string): string {
    const emojiMap: { [key: string]: string } = {
      'Elektronik': '📱',
      'Teknoloji': '💻', 
      'Telefon': '📱',
      'Laptop': '💻',
      'Moda': '👗',
      'Giyim': '👕',
      'Ayakkabı': '👟',
      'Ev': '🏠',
      'Mobilya': '🪑',
      'Kitap': '📚',
      'Spor': '⚽',
      'Oyun': '🎮',
      'Müzik': '🎵',
      'Sağlık': '💊',
      'Kozmetik': '💄',
      'Otomotiv': '🚗',
      'Bahçe': '🌱',
      'Bebek': '👶',
      'Pet Shop': '🐕',
      'Yemek': '🍕'
    };
    
    // Kategori isminde geçen anahtar kelimeleri ara
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    
    return '🛍️'; // Default emoji
  }

  getCategorySlideTitle(categoryName: string): string {
    const titleMap: { [key: string]: string } = {
      'Teknoloji': 'Teknolojinin En Yenisi',
      'Elektronik': 'Elektronik Dünyaya Adım',
      'Telefon': 'İletişimin Zirvesi',
      'Laptop': 'Mobil Güç Merkezi',
      'Oyun Konsolları': 'Gerçek Oyun Deneyimi',
      'Moda': 'Stilin Adresi',
      'Bakım Ürünleri': 'Kendine İyi Bak',
      'Giyim': 'Tarzını Keşfet',
      'Ayakkabı': 'Her Adımda Stil',
      'Ev': 'Yaşam Alanın',
      'Mobilya': 'Evinizi Yenileyin',
      'Kitap': 'Bilginin Hazinesi',
      'Spor': 'Sağlıklı Yaşam',
      'Oyun': 'Eğlencenin Merkezi',
      'Müzik': 'Melodilerin Dünyası',
      'Sağlık': 'Sağlığınız Öncelik',
      'Kozmetik': 'Güzelliğin Sırrı',
      'Otomotiv': 'Yolların Efendisi',
      'Bahçe': 'Doğayla Buluşma',
      'Bebek': 'Minik Kalpler İçin',
      'Pet Shop': 'Dost Dostları İçin',
      'Yemek': 'Lezzetin Adresi'
    };
    
    for (const [key, title] of Object.entries(titleMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return title;
      }
    }
    
    return `${categoryName} Dünyası`;
  }

  getCategorySlideSubtitle(categoryName: string): string {
    const subtitleMap: { [key: string]: string } = {
      'Elektronik': 'Hayatını Kolaylaştır',
      'Teknoloji': 'En Yenisi',
      'Telefon': 'Her An Bağlantıda',
      'Laptop': 'Özgürce Çalış',
      'Oyun Konsolları': 'Burada Başlıyor',
      'Moda': 'Kendini İfade Et',
      'Bakım Ürünleri': 'Farkı Hisset',
      'Giyim': 'Konforlu Zarafet',
      'Ayakkabı': 'Konfor ve Şıklık',
      'Ev': 'Konforun Merkezi',
      'Mobilya': 'Yaşam Kalitesi',
      'Kitap': 'Hayal Gücünü Besle',
      'Spor': 'Formda Kal',
      'Oyun': 'Macera Seni Bekliyor',
      'Müzik': 'Ruhunu Besle',
      'Sağlık': 'İyiliğin Kaynağı',
      'Kozmetik': 'İçindeki Güzelliği Ortaya Çıkar',
      'Otomotiv': 'Güvenli Yolculuklar',
      'Bahçe': 'Yeşil Yaşam',
      'Bebek': 'Mutlu Büyüme',
      'Pet Shop': 'Mutlu Dostlar',
      'Yemek': 'Damak Zevki'
    };
    
    for (const [key, subtitle] of Object.entries(subtitleMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return subtitle;
      }
    }
    
    return 'Premium Kalite';
  }

  getCategorySlideDescription(categoryName: string): string {
    const descMap: { [key: string]: string } = {
      'Elektronik': 'En yeni akıllı cihazlar, yüksek performanslı bilgisayarlar ve hayatını kolaylaştıran elektronik ürünler seni bekliyor.',
      'Oyun Konsolları': 'En popüler konsollar, güçlü aksesuarlar ve sınırsız eğlence için ihtiyacın olan her şey burada.',
      'Bilgisayar': 'Güçlü işlemciler, yüksek performans ve son teknoloji özellikler ile çalışma deneyiminizi üst seviyeye taşıyın.',
      'Teknoloji': 'Geleceğin teknolojilerini bugünden deneyimle. Akıllı cihazlar, yenilikçi çözümler ve daha fazlası senin için seçildi.',
      'Moda': 'En trend parçalar, dünya markalarından seçkin koleksiyonlar ve zamansız şıklık bir arada.',
      'Bakım Ürünleri': 'Kişisel bakım ürünleri, sağlık çözümleri ve günlük ihtiyaçların için en güvenilir markalar bir arada.',
      'Ev': 'Evinizi daha konforlu, daha şık ve daha fonksiyonel hale getiren özel ürünler.',
      'Spor': 'Sağlıklı yaşam için gereken tüm spor ekipmanları ve fitness ürünleri burada.'
    };
    
    for (const [key, desc] of Object.entries(descMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return desc;
      }
    }
    
    return `${categoryName} kategorisinde en kaliteli ürünler, uygun fiyatlar ve hızlı teslimat ile mükemmel alışveriş deneyimi.`;
  }
  /*
  const featureMap: { [key: string]: string[] } = {
      'Elektronik': [
        'Son teknoloji ürünler',
        'Resmi distribütör garantisi', 
        'Ücretsiz kurulum desteği'
      ],
      'Bilgisayar': [
        'Yüksek performans garantisi',
        'Uzman teknik destek',
        'Ücretsiz yazılım kurulumu'
      ],
      'Teknoloji': [
        'Orijinal ürün garantisi',
        'Ekran koruma hediyesi',
        'Ücretsiz kargo ve kurulum'
      ],
      'Moda': [
        'Dünya markalarından seçimler',
        'Memnun kalmazsan iade et',
        'Trend danışmanlığı'
      ],
      'Ev': [
        'Kalite garantisi',
        'Profesyonel montaj hizmeti',
        'Ücretsiz değişim hakkı'
      ],
      'Spor': [
        'Uzman spor danışmanlığı',
        'Antrenman programları',
        'Kalite garantisi'
      ]
    };
    
    for (const [key, features] of Object.entries(featureMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return features;
      }
    }
    
    return [
      'Premium kalite garantisi',
      'Hızlı ve güvenli teslimat',
      'Müşteri memnuniyeti öncelik'
    ];

    getCategoryFeatures(categoryName: string): string[] {
    
  }
  */
  

  getCategorySlideImage(categoryName: string): string {
    const imageMap: { [key: string]: string } = {
      'Elektronik': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
      'Teknoloji': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
      'Telefon': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop',
      'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop',
      'Bakım Ürünleri': 'https://www.makyajtrendi.com/Content/ContentImage/637617671050461671-2456491_810x458.jpg',
      'Giyim': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
      'Ayakkabı': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
      'Ev': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
      'Mobilya': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
      'Kitap': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'Spor': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'Oyun': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop',
      'Müzik': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
      'Sağlık': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
      'Kozmetik': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop',
      'Otomotiv': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop',
      'Bahçe': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'Bebek': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
      'Pet Shop': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop',
      'Yemek': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop'
    };
    
    for (const [key, image] of Object.entries(imageMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return image;
      }
    }
    
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'; // Default image
  }

  ngAfterViewInit(): void {
    // Kategoriler yüklendikten sonra carousel'ı başlat
    setTimeout(() => {
      if (this.getCarouselCategories().length > 1) {
        this.totalSlides = this.getCarouselCategories().length;
        this.startAutoSlide();
      }
    }, 1000);
  }

  // Carousel methods
  changeSlide(direction: number): void {
    const totalSlides = this.getCarouselCategories().length;
    if (totalSlides <= 1) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active class from current slide
    slides[this.currentSlide - 1]?.classList.remove('active');
    indicators[this.currentSlide - 1]?.classList.remove('active');
    
    // Calculate next slide
    this.currentSlide += direction;
    
    if (this.currentSlide > totalSlides) {
      this.currentSlide = 1;
    } else if (this.currentSlide < 1) {
      this.currentSlide = totalSlides;
    }
    
    // Add active class to new slide
    slides[this.currentSlide - 1]?.classList.add('active');
    indicators[this.currentSlide - 1]?.classList.add('active');
    
    this.resetAutoSlide();
  }

  goToSlide(slideNumber: number): void {
    const totalSlides = this.getCarouselCategories().length;
    if (totalSlides <= 1) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active class from current slide
    slides[this.currentSlide - 1]?.classList.remove('active');
    indicators[this.currentSlide - 1]?.classList.remove('active');
    
    // Set new slide
    this.currentSlide = slideNumber;
    
    // Add active class to new slide
    slides[this.currentSlide - 1]?.classList.add('active');
    indicators[this.currentSlide - 1]?.classList.add('active');
    
    this.resetAutoSlide();
  }

  startAutoSlide(): void {
    if (this.getCarouselCategories().length <= 1) return;
    
    this.autoSlideInterval = setInterval(() => {
      this.changeSlide(1);
    }, this.slideTimingMs);
    
    this.startProgressBar();
  }

  resetAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.startAutoSlide();
  }

  startProgressBar(): void {
    this.progressStartTime = Date.now();
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    
    if (progressFill) {
      progressFill.style.width = '0%';
      
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - this.progressStartTime;
        const progress = (elapsed / this.slideTimingMs) * 100;
        
        if (progress >= 100) {
          progressFill.style.width = '100%';
          clearInterval(this.progressInterval);
        } else {
          progressFill.style.width = progress + '%';
        }
      }, 50); // Her 50ms'de güncelle (smooth animation)
    }
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
