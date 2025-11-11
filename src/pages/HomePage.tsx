import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Eye, Shield, Truck } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/api/ApiFacade';
import { Product, Category } from '@/models/ProductModel';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getFeaturedProducts(),
        api.getCategories()
      ]);

      if (productsRes.success) setFeaturedProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-accent to-primary/10 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                See the World in{' '}
                <span className="text-primary">Perfect Clarity</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover premium eyewear with virtual try-on technology. Find your perfect frame from our curated collection of designer eyeglasses and sunglasses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/products">
                    Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/virtual-tryon">
                    <Eye className="mr-2 h-5 w-5" />
                    Try Virtual Try-On
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} to={`/products?category=${category.id}`}>
                  <Card className="group hover-lift cursor-pointer">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">Explore our collection</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Button variant="ghost" asChild>
                <Link to="/products">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Virtual Try-On Promo */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-accent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Eye className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Try Before You Buy
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Use our advanced virtual try-on technology to see how frames look on your face. Find the perfect fit from the comfort of your home.
              </p>
              <Button size="lg" asChild>
                <Link to="/virtual-tryon">
                  Start Virtual Try-On <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-muted-foreground">
                  On all orders over $50 with tracking included
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
                <p className="text-muted-foreground">
                  Premium materials with 1-year warranty on all frames
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Care</h3>
                <p className="text-muted-foreground">
                  Professional optical consultations and support
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
