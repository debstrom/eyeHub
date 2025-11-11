// API Facade - Central interface for all API calls
// Switch between mock and real APIs by changing the import

import { mockApi } from './mock/mockApi';

// In the future, you can switch to real APIs:
// import { realApi } from './real/productApi';

const USE_MOCK = true; // Toggle this to switch between mock and real APIs

class ApiFacade {
  private api = USE_MOCK ? mockApi : mockApi; // Change second mockApi to realApi when ready

  // Products
  getProducts(filters?: any) {
    return this.api.getProducts(filters);
  }

  getProductById(id: string) {
    return this.api.getProductById(id);
  }

  getCategories() {
    return this.api.getCategories();
  }

  getFeaturedProducts() {
    return this.api.getFeaturedProducts();
  }

  // Authentication
  loginUser(email: string, password: string) {
    return this.api.loginUser(email, password);
  }

  createUser(userData: any) {
    return this.api.createUser(userData);
  }

  getUserProfile(id: string) {
    return this.api.getUserProfile(id);
  }

  updateUserProfile(id: string, updates: any) {
    return this.api.updateUserProfile(id, updates);
  }

  // Orders
  placeOrder(orderData: any) {
    return this.api.placeOrder(orderData);
  }

  getOrderById(orderId: string) {
    return this.api.getOrderById(orderId);
  }

  getUserOrders(userId: string) {
    return this.api.getUserOrders(userId);
  }

  getOrderStatus(orderNumber: string) {
    return this.api.getOrderStatus(orderNumber);
  }

  // Wishlist
  getWishlist(userId: string) {
    return this.api.getWishlist(userId);
  }

  addToWishlist(userId: string, productId: string) {
    return this.api.addToWishlist(userId, productId);
  }

  removeFromWishlist(userId: string, productId: string) {
    return this.api.removeFromWishlist(userId, productId);
  }
}

export const api = new ApiFacade();
