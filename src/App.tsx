import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import UserDashboard from "./pages/UserDashboard";
import WishlistPage from "./pages/WishlistPage";
import VirtualTryOnPage from "./pages/VirtualTryOnPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import VirtualTryOnPage2 from "./pages/VirtualTryOnPage.v2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/track-order" element={<OrderTrackingPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/virtual-tryon" element={<VirtualTryOnPage />} />
                <Route path="/virtual-tryon-v2" element={<VirtualTryOnPage2 />} />
                <Route path="/auth" element={<AuthPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
