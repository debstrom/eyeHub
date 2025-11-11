export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  wishlist: string[];
  orders: string[];
}
