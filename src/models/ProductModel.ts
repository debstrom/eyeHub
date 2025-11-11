export interface Product {
  colorHex: any;
  irisTextureUrl: any;
  id: string;
  name: string;
  category: 'eyeglasses' | 'sunglasses' | 'contacts';
  price: number;
  originalPrice?: number;
  brand: string;
  color: string;
  frameType: string;
  shape: string;
  size: string;
  image: string;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
