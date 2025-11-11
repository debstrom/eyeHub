import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Package, Heart, LogOut, Edit } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/api/ApiFacade';
import { Order } from '@/models/OrderModel';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { user, logout, updateProfile } = useUser();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
      country: user?.address?.country || 'USA'
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.getUserOrders(user.id);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
      case 'processing':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {isEditing ? (
                    <div className="space-x-2">
                      <Button size="sm" onClick={handleUpdateProfile}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profileData.address.street}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value }
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.address.city}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: { ...profileData.address, city: e.target.value }
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.address.state}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: { ...profileData.address, state: e.target.value }
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={profileData.address.zip}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: { ...profileData.address, zip: e.target.value }
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: { ...profileData.address, country: e.target.value }
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                    <Button onClick={() => navigate('/products')}>Browse Products</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/track-order?order=${order.orderNumber}`)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex gap-4 mb-4">
                          {order.items.slice(0, 3).map((item) => (
                            <img
                              key={item.productId}
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="h-16 w-16 flex items-center justify-center bg-muted rounded text-sm font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist ({wishlistItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Your wishlist is empty</p>
                    <p className="text-muted-foreground mb-6">Save items you love for later</p>
                    <Button onClick={() => navigate('/products')}>Browse Products</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full aspect-square object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold line-clamp-1 mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                        <p className="text-lg font-bold text-primary">${item.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
