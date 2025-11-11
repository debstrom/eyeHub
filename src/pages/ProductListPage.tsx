import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { api } from '@/api/ApiFacade';
import { Product } from '@/models/ProductModel';
import { Filter } from 'lucide-react';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brands: [] as string[],
    shapes: [] as string[],
    frameTypes: [] as string[],
    priceRange: [0, 200]
  });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Apply shape filter
    if (filters.shapes.length > 0) {
      filtered = filtered.filter((p) => filters.shapes.includes(p.shape));
    }

    // Apply frame type filter
    if (filters.frameTypes.length > 0) {
      filtered = filtered.filter((p) => filters.frameTypes.includes(p.frameType));
    }

    // Apply price filter
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Mock implementation - in real app would sort by date
        break;
      default:
        // Featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)));
  const uniqueShapes = Array.from(new Set(products.map((p) => p.shape)));
  const uniqueFrameTypes = Array.from(new Set(products.map((p) => p.frameType)));

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[type] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      return { ...prev, [type]: newArray };
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {filters.category ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1) : 'All Products'}
            </h1>
            <p className="text-muted-foreground">{filteredProducts.length} products found</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Brand</h3>
                <div className="space-y-3">
                  {uniqueBrands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={filters.brands.includes(brand)}
                        onCheckedChange={() => toggleFilter('brands', brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Frame Shape</h3>
                <div className="space-y-3">
                  {uniqueShapes.map((shape) => (
                    <div key={shape} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shape-${shape}`}
                        checked={filters.shapes.includes(shape)}
                        onCheckedChange={() => toggleFilter('shapes', shape)}
                      />
                      <Label htmlFor={`shape-${shape}`} className="text-sm cursor-pointer">
                        {shape}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Frame Type</h3>
                <div className="space-y-3">
                  {uniqueFrameTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.frameTypes.includes(type)}
                        onCheckedChange={() => toggleFilter('frameTypes', type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({
                    category: filters.category,
                    brands: [],
                    shapes: [],
                    frameTypes: [],
                    priceRange: [0, 200]
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 animate-pulse bg-muted rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductListPage;
