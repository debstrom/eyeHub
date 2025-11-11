// Mock API with Promise-based responses simulating network latency

import { mockProducts, mockUsers, mockOrders, mockCategories } from './mockData';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Products
  async getProducts(filters?: any) {
    await delay();
    let products = [...mockProducts];
    
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters?.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    if (filters?.minPrice) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }
    if (filters?.shape) {
      products = products.filter(p => p.shape === filters.shape);
    }
    if (filters?.frameType) {
      products = products.filter(p => p.frameType === filters.frameType);
    }
    
    return { success: true, data: products };
  },

  async getProductById(id: string) {
    await delay();
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    return { success: true, data: product };
  },

  async getCategories() {
    await delay(200);
    return { success: true, data: mockCategories };
  },

  async getFeaturedProducts() {
    await delay(300);
    return { success: true, data: mockProducts.slice(0, 4) };
  },

  // Authentication
  async loginUser(email: string, password: string) {
    await delay(800);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword };
  },

  async createUser(userData: any) {
    await delay(1000);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    const newUser = {
      id: `u${mockUsers.length + 1}`,
      ...userData,
      wishlist: [],
      orders: []
    };
    mockUsers.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, data: userWithoutPassword };
  },

  async getUserProfile(id: string) {
    await delay(400);
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword };
  },

  async updateUserProfile(id: string, updates: any) {
    await delay(600);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
    return { success: true, data: userWithoutPassword };
  },

  // Orders
  async placeOrder(orderData: any) {
    await delay(1000);
    const newOrder = {
      id: `o${mockOrders.length + 1}`,
      orderNumber: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      timeline: [
        { step: 'Order Placed', date: new Date().toISOString().split('T')[0], completed: true },
        { step: 'Processing', date: '', completed: false },
        { step: 'Shipped', date: '', completed: false },
        { step: 'Out for Delivery', date: '', completed: false },
        { step: 'Delivered', date: '', completed: false }
      ],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: `TRK${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      ...orderData
    };
    mockOrders.push(newOrder);
    return { success: true, data: newOrder };
  },

  async getOrderById(orderId: string) {
    await delay(400);
    const order = mockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, data: order };
  },

  async getUserOrders(userId: string) {
    await delay(500);
    const orders = mockOrders.filter(o => o.userId === userId);
    return { success: true, data: orders };
  },

  async getOrderStatus(orderNumber: string) {
    await delay(400);
    const order = mockOrders.find(o => o.orderNumber === orderNumber);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { 
      success: true, 
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        timeline: order.timeline,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber
      }
    };
  },

  // Wishlist
  async getWishlist(userId: string) {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    const wishlistProducts = mockProducts.filter(p => user.wishlist.includes(p.id));
    return { success: true, data: wishlistProducts };
  },

  async addToWishlist(userId: string, productId: string) {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }
    return { success: true, data: user.wishlist };
  },

  async removeFromWishlist(userId: string, productId: string) {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    user.wishlist = user.wishlist.filter(id => id !== productId);
    return { success: true, data: user.wishlist };
  }
};
