import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'pendiente': { label: 'Pendiente', color: 'bg-yellow-500', icon: <Clock className="w-5 h-5" /> },
  'confirmado': { label: 'Confirmado', color: 'bg-blue-500', icon: <CheckCircle className="w-5 h-5" /> },
  'en_proceso': { label: 'En Proceso', color: 'bg-purple-500', icon: <Package className="w-5 h-5" /> },
  'enviado': { label: 'Enviado', color: 'bg-indigo-500', icon: <Truck className="w-5 h-5" /> },
  'entregado': { label: 'Entregado', color: 'bg-green-500', icon: <CheckCircle className="w-5 h-5" /> },
  'cancelado': { label: 'Cancelado', color: 'bg-red-500', icon: <XCircle className="w-5 h-5" /> },
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await api.cancelOrder(orderId);
      await loadOrders();
      setCancellingOrder(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-green-700"
              onClick={() => navigate('/catalog')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Mis Pedidos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto" />
              <p className="mt-4 text-xl text-gray-600">No tienes pedidos aun</p>
              <Button
                className="mt-6 text-lg py-4 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/catalog')}
              >
                Ver Catalogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig['pendiente'];
              return (
                <Card 
                  key={order.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">Pedido #{order.id}</span>
                        <Badge className={`${status.color} text-white flex items-center gap-1`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <p className="text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="text-gray-600 mt-2">
                      {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const status = statusConfig[selectedOrder.status] || statusConfig['pendiente'];
                  return (
                    <Badge className={`${status.color} text-white text-lg px-4 py-2 flex items-center gap-2`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  );
                })()}
              </div>
              
              <div className="text-gray-500">
                {formatDate(selectedOrder.created_at)}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-lg mb-3">Productos:</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-500">{item.quantity} unidades</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatPrice(item.subtotal)}</p>
                        {item.discount > 0 && (
                          <p className="text-sm text-red-500">-{item.discount}% desc.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-2">Notas:</h4>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            {selectedOrder && selectedOrder.status === 'pendiente' && (
              <Button
                variant="destructive"
                className="w-full text-lg py-4"
                onClick={() => {
                  setCancellingOrder(selectedOrder.id);
                  setSelectedOrder(null);
                }}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancelar Pedido
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full text-lg py-4"
              onClick={() => setSelectedOrder(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancellingOrder} onOpenChange={() => setCancellingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Cancelar Pedido
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg text-gray-600">
            ¿Estas seguro de que deseas cancelar el pedido #{cancellingOrder}? Esta accion no se puede deshacer.
          </p>
          <DialogFooter className="flex-col gap-2">
            <Button
              variant="destructive"
              className="w-full text-lg py-4"
              onClick={() => cancellingOrder && handleCancelOrder(cancellingOrder)}
            >
              Si, Cancelar Pedido
            </Button>
            <Button
              variant="outline"
              className="w-full text-lg py-4"
              onClick={() => setCancellingOrder(null)}
            >
              No, Mantener Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Button */}
      <a
        href="https://wa.link/ykjebj"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110"
        title="Contactar por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};
