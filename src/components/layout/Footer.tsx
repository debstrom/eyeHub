import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <span className="text-2xl">👓</span>
              </div>
              <span className="text-xl font-bold">VisionHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium eyewear solutions with virtual try-on technology and expert care.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=eyeglasses" className="text-muted-foreground hover:text-primary transition-colors">
                  Eyeglasses
                </Link>
              </li>
              <li>
                <Link to="/products?category=sunglasses" className="text-muted-foreground hover:text-primary transition-colors">
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link to="/products?category=contacts" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Lenses
                </Link>
              </li>
              <li>
                <Link to="/virtual-tryon" className="text-muted-foreground hover:text-primary transition-colors">
                  Virtual Try-On
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Secure Payments</p>
              <div className="flex space-x-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 border rounded">Visa</span>
                <span className="px-2 py-1 border rounded">Mastercard</span>
                <span className="px-2 py-1 border rounded">PayPal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VisionHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
