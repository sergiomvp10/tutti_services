import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart, removeFromCart } = useCart();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    
    if (!user) {
      if (!guestName || !guestPhone || !guestAddress || !paymentMethod) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (user) {
        const orderData = {
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          notes: notes,
        };
        
        const order = await api.createOrder(orderData);
        setOrderId(order.id);
      } else {
        const guestOrderData = {
          guest_name: guestName,
          guest_phone: guestPhone,
          guest_address: guestAddress,
          payment_method: paymentMethod,
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          notes: notes,
        };
        
        const order = await api.guestCreateOrder(guestOrderData);
        setOrderId(order.id);
      }
      
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto bg-green-100 text-green-600 p-6 rounded-full w-32 h-32 flex items-center justify-center mb-6">
              <CheckCircle className="w-20 h-20" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pedido Recibido</h2>
            <p className="text-xl text-green-600 font-semibold mb-4">
              Su pedido ha sido recibido y esta siendo preparado!
            </p>
            <p className="text-gray-500 mb-2">Pedido #{orderId}</p>
            <p className="text-gray-500 mb-8">Pronto nos pondremos en contacto contigo para confirmar tu pedido.</p>
            <div className="space-y-3">
              <Button
                className="w-full text-xl py-6 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/catalog')}
              >
                Seguir Comprando
              </Button>
              {user && (
                <Button
                  variant="outline"
                  className="w-full text-lg py-4"
                  onClick={() => navigate('/orders')}
                >
                  Ver Mis Pedidos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <ShoppingCart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto" />
              <p className="mt-4 text-xl text-gray-600">Tu carrito esta vacio</p>
              <Button
                className="mt-6 text-lg py-4 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/catalog')}
              >
                Ver Catalogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Productos en tu Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{item.product.name}</h4>
                      <p className="text-gray-500">{item.quantity} {item.product.unit}</p>
                      <p className="text-green-600 font-bold text-lg">
                        {formatPrice((item.product.final_price || item.product.price) * item.quantity)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

                        {/* Customer Info */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl">
                              {user ? 'Datos del Cliente' : 'Tus Datos'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {user ? (
                              <>
                                <div className="flex justify-between text-lg">
                                  <span className="text-gray-600">Nombre:</span>
                                  <span className="font-medium">{user?.name}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                  <span className="text-gray-600">Telefono:</span>
                                  <span className="font-medium">{user?.phone || 'No registrado'}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                  <span className="text-gray-600">Direccion:</span>
                                  <span className="font-medium">{user?.address || 'No registrada'}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="guestName" className="text-lg">Nombre *</Label>
                                  <Input
                                    id="guestName"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                    className="text-lg py-6"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="guestPhone" className="text-lg">Telefono *</Label>
                                  <Input
                                    id="guestPhone"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                    placeholder="Tu numero de telefono"
                                    className="text-lg py-6"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="guestAddress" className="text-lg">Direccion *</Label>
                                  <Input
                                    id="guestAddress"
                                    value={guestAddress}
                                    onChange={(e) => setGuestAddress(e.target.value)}
                                    placeholder="Tu direccion de entrega"
                                    className="text-lg py-6"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="paymentMethod" className="text-lg">Forma de Pago *</Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="text-lg py-6">
                                      <SelectValue placeholder="Selecciona forma de pago" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="efectivo">Efectivo</SelectItem>
                                      <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                                      <SelectItem value="nequi">Nequi</SelectItem>
                                      <SelectItem value="daviplata">Daviplata</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notas del Pedido (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escribe aqui cualquier nota o instruccion especial para tu pedido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-lg min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-6">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total a Pagar:</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              className="w-full text-xl py-8 bg-green-600 hover:bg-green-700"
              onClick={handleSubmitOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        )}
      </main>

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
