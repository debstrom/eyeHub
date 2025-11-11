import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api/ApiFacade';
import { Product } from '@/models/ProductModel';
import { useUser } from './UserContext';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadUserWishlist();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const loadUserWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.getWishlist(user.id);
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (user) {
      setLoading(true);
      try {
        await api.addToWishlist(user.id, product.id);
        setItems(prev => [...prev, product]);
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(prev => {
        if (prev.find(p => p.id === product.id)) return prev;
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user) {
      setLoading(true);
      try {
        await api.removeFromWishlist(user.id, productId);
        setItems(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(prev => prev.filter(p => p.id !== productId));
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
