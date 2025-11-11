import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2, Circle } from 'lucide-react';
import { api } from '@/api/ApiFacade';
import { useUser } from '@/context/UserContext';
import { Order } from '@/models/OrderModel';
import { toast } from 'sonner';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (searchParams.get('order')) {
      trackOrder(searchParams.get('order')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    try {
      const response = await api.getUserOrders(user.id);
      if (response.success) {
        setUserOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const trackOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await api.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error('Order not found');
        setOrder(null);
      }
    } catch (error) {
      console.error('Failed to track order:', error);
      toast.error('Failed to track order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      trackOrder(orderNumber.trim());
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tracking Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Enter Order Number</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrack} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="ORD123456"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Order Details */}
            {order && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-4">Delivery Status</h3>
                    <div className="space-y-6">
                      {order.timeline.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="relative">
                            {step.completed ? (
                              <CheckCircle2 className="h-8 w-8 text-primary" />
                            ) : (
                              <Circle className="h-8 w-8 text-muted" />
                            )}
                            {index < order.timeline.length - 1 && (
                              <div
                                className={`absolute left-1/2 top-8 w-0.5 h-12 -translate-x-1/2 ${
                                  step.completed ? 'bg-primary' : 'bg-muted'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.step}
                            </p>
                            {step.date && (
                              <p className="text-sm text-muted-foreground">
                                {new Date(step.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                    <p className="text-muted-foreground">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tracking Number</h3>
                    <p className="font-mono text-sm bg-muted px-3 py-2 rounded inline-block">
                      {order.trackingNumber}
                    </p>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Orders Sidebar */}
          {user && userOrders.length > 0 && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userOrders.slice(0, 5).map((userOrder) => (
                    <button
                      key={userOrder.id}
                      onClick={() => trackOrder(userOrder.orderNumber)}
                      className="w-full text-left p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{userOrder.orderNumber}</span>
                        <Badge className={getStatusColor(userOrder.status)} variant="secondary">
                          {userOrder.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(userOrder.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium mt-1">${userOrder.total.toFixed(2)}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
