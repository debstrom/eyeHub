// Mock data for the e-commerce application
import { Product, Category } from '@/models/ProductModel';
import { Order, OrderStatus } from '@/models/OrderModel';

export const mockCategories: Category[] = [
  { id: 'eyeglasses', name: 'Eyeglasses', icon: '👓' },
  { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️' },
  { id: 'contacts', name: 'Contact Lenses', icon: '👁️' }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Classic Aviator',
    category: 'sunglasses',
    price: 129.99,
    originalPrice: 159.99,
    brand: 'VisionHub',
    color: 'Gold/Black',
    frameType: 'Metal',
    shape: 'Aviator',
    size: 'Medium',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'
    ],
    description: 'Timeless aviator design with premium metal frame and UV400 protection.',
    features: ['UV400 Protection', 'Anti-Glare Coating', 'Scratch Resistant', 'Lightweight'],
    rating: 4.8,
    reviews: 124,
    inStock: true
  },
  {
    id: 'p2',
    name: 'Modern Rectangle',
    category: 'eyeglasses',
    price: 89.99,
    brand: 'VisionHub Pro',
    color: 'Tortoise',
    frameType: 'Acetate',
    shape: 'Rectangle',
    size: 'Large',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800',
      'https://images.unsplash.com/photo-1580836022787-e17ee9d42c55?w=800'
    ],
    description: 'Contemporary rectangle frames perfect for everyday wear.',
    features: ['Blue Light Blocking', 'Spring Hinges', 'Adjustable Nose Pads'],
    rating: 4.6,
    reviews: 89,
    inStock: true
  },
  {
    id: 'p3',
    name: 'Round Vintage',
    category: 'eyeglasses',
    price: 79.99,
    brand: 'Retro Vision',
    color: 'Black',
    frameType: 'Metal',
    shape: 'Round',
    size: 'Small',
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400',
    images: [
      'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800'
    ],
    description: 'Vintage-inspired round frames with modern comfort.',
    features: ['Lightweight Metal', 'Adjustable', 'Durable'],
    rating: 4.7,
    reviews: 67,
    inStock: true
  },
  {
    id: 'p4',
    name: 'Sport Wrap',
    category: 'sunglasses',
    price: 149.99,
    brand: 'ActiveVision',
    color: 'Matte Black',
    frameType: 'TR90',
    shape: 'Wrap',
    size: 'Large',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
    images: [
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800'
    ],
    description: 'Performance sunglasses designed for athletes and outdoor enthusiasts.',
    features: ['Polarized', 'Impact Resistant', 'Non-Slip', 'UV400'],
    rating: 4.9,
    reviews: 156,
    inStock: true
  },
  {
    id: 'p5',
    name: 'Cat Eye Chic',
    category: 'sunglasses',
    price: 99.99,
    brand: 'Femme Fatale',
    color: 'Rose Gold',
    frameType: 'Acetate',
    shape: 'Cat Eye',
    size: 'Medium',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400',
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800'
    ],
    description: 'Elegant cat-eye design for a sophisticated look.',
    features: ['Gradient Lenses', 'UV Protection', 'Comfortable Fit'],
    rating: 4.5,
    reviews: 92,
    inStock: true
  },
  {
    id: 'p6',
    name: 'Blue Light Blocker',
    category: 'eyeglasses',
    price: 69.99,
    brand: 'ScreenShield',
    color: 'Clear',
    frameType: 'TR90',
    shape: 'Square',
    size: 'Medium',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
    ],
    description: 'Essential protection from digital eye strain with 100% blue light blocking.',
    features: ['Blue Light Filter', 'Anti-Reflective', 'Lightweight', 'Flexible'],
    rating: 4.8,
    reviews: 203,
    inStock: true
  }
];

export const mockUsers = [
  {
    id: 'u1',
    email: 'demo@visionhub.com',
    password: 'demo123',
    name: 'John Doe',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    wishlist: ['p1', 'p3'],
    orders: ['o1', 'o2']
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    userId: 'u1',
    orderNumber: 'ORD123456',
    date: '2025-10-20',
    total: 219.98,
    status: 'delivered' as OrderStatus,
    items: [
      {
        productId: 'p1',
        name: 'Classic Aviator',
        price: 129.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200'
      },
      {
        productId: 'p2',
        name: 'Modern Rectangle',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    timeline: [
      { step: 'Order Placed', date: '2025-10-20', completed: true },
      { step: 'Processing', date: '2025-10-21', completed: true },
      { step: 'Shipped', date: '2025-10-22', completed: true },
      { step: 'Out for Delivery', date: '2025-10-24', completed: true },
      { step: 'Delivered', date: '2025-10-25', completed: true }
    ],
    estimatedDelivery: '2025-10-25',
    trackingNumber: 'TRK789012345'
  },
  {
    id: 'o2',
    userId: 'u1',
    orderNumber: 'ORD123457',
    date: '2025-10-28',
    total: 149.99,
    status: 'shipped' as OrderStatus,
    items: [
      {
        productId: 'p4',
        name: 'Sport Wrap',
        price: 149.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=200'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    timeline: [
      { step: 'Order Placed', date: '2025-10-28', completed: true },
      { step: 'Processing', date: '2025-10-29', completed: true },
      { step: 'Shipped', date: '2025-10-30', completed: true },
      { step: 'Out for Delivery', date: '2025-11-01', completed: false },
      { step: 'Delivered', date: '2025-11-02', completed: false }
    ],
    estimatedDelivery: '2025-11-02',
    trackingNumber: 'TRK789012346'
  }
];
