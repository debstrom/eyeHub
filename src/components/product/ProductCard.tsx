import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/models/ProductModel';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart');
  };

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      await addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  return (
    <Card className="group overflow-hidden hover-lift border-border">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {product.originalPrice && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              Save ${(product.originalPrice - product.price).toFixed(2)}
            </Badge>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                handleWishlistToggle();
              }}
              className="h-9 w-9"
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="h-9 w-9"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews})</span>
            </div>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
