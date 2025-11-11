import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Eye, Star, Truck, Shield, ArrowLeft } from 'lucide-react';
import { api } from '@/api/ApiFacade';
import { Product } from '@/models/ProductModel';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.getProductById(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('Added to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      await addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-6 bg-muted rounded w-24" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.brand}</Badge>
                {product.inStock ? (
                  <Badge className="bg-green-500">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Color:</span>
                <p className="font-medium">{product.color}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <p className="font-medium">{product.size}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Frame Type:</span>
                <p className="font-medium">{product.frameType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Shape:</span>
                <p className="font-medium">{product.shape}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleAddToCart} size="lg" className="w-full" disabled={!product.inStock}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" onClick={handleWishlistToggle}>
                  <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  Wishlist
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/virtual-tryon')}>
                  <Eye className="mr-2 h-5 w-5" />
                  Try On
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>1 year warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="features" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specs" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Frame Type</span>
                <span className="font-medium">{product.frameType}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Shape</span>
                <span className="font-medium">{product.shape}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{product.size}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Color</span>
                <span className="font-medium">{product.color}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Customer reviews coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
