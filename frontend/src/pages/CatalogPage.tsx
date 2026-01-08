import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  LogOut, 
  Package,
  Apple,
  Carrot,
  Droplets,
  MoreHorizontal,
  User
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Frutas': <Apple className="w-6 h-6" />,
  'Verduras': <Carrot className="w-6 h-6" />,
  'Pulpas': <Droplets className="w-6 h-6" />,
  'Otros': <MoreHorizontal className="w-6 h-6" />,
};

export const CatalogPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, addToCart, total, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts({ 
          category_id: selectedCategory || undefined, 
          search: searchQuery || undefined 
        }),
        api.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">Tutti Services</h1>
                <p className="text-green-100 text-sm">Catalogo de Productos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-green-700 relative"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-8 h-8" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-lg px-2">
                    {itemCount}
                  </Badge>
                )}
              </Button>
              <div className="hidden md:flex items-center gap-2 text-green-100">
                <User className="w-5 h-5" />
                <span>{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                className="text-white hover:bg-green-700"
                onClick={logout}
              >
                <LogOut className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-md py-4 sticky top-[72px] z-30">
        <div className="container mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 text-xl py-6 w-full"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b py-4 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className={`text-lg py-6 px-6 whitespace-nowrap ${selectedCategory === null ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`text-lg py-6 px-6 whitespace-nowrap flex items-center gap-2 ${selectedCategory === category.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {categoryIcons[category.name] || <Package className="w-6 h-6" />}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto" />
            <p className="mt-4 text-xl text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-200 rounded-xl relative group"
              >
                <div 
                  className="aspect-square bg-white p-2 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(product.min_order);
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {product.discount_percent && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5">
                      -{product.discount_percent}%
                    </Badge>
                  )}
                </div>
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, product.min_order);
                  }}
                >
                  <Plus className="w-5 h-5" />
                </button>
                <CardContent 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(product.min_order);
                  }}
                >
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {formatPrice(product.final_price || product.price)}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    ({formatPrice(product.final_price || product.price)}/{product.unit})
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-400">1 {product.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
              {selectedProduct.image_url_2 && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image_url_2}
                    alt={`${selectedProduct.name} - imagen 2`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-gray-600 text-lg">{selectedProduct.description || 'Sin descripcion'}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(selectedProduct.final_price || selectedProduct.price)}
                </span>
                <span className="text-gray-500 text-lg">/ {selectedProduct.unit}</span>
              </div>
              {selectedProduct.discount_percent && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">-{selectedProduct.discount_percent}% DESCUENTO</Badge>
                  <span className="text-gray-400 line-through">{formatPrice(selectedProduct.price)}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setQuantity(Math.max(selectedProduct.min_order, quantity - 1))}
                  >
                    <Minus className="w-6 h-6" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(selectedProduct.min_order, Number(e.target.value)))}
                    className="w-24 text-center text-xl py-6"
                    min={selectedProduct.min_order}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
                <span className="text-gray-500">{selectedProduct.unit}</span>
              </div>
              <p className="text-sm text-gray-500">Pedido minimo: {selectedProduct.min_order} {selectedProduct.unit}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full text-xl py-6 bg-green-600 hover:bg-green-700"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-6 h-6 mr-2" />
              Agregar al Carrito - {formatPrice((selectedProduct?.final_price || selectedProduct?.price || 0) * quantity)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              Mi Carrito
            </DialogTitle>
          </DialogHeader>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto" />
              <p className="mt-4 text-xl text-gray-600">Tu carrito esta vacio</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    <p className="text-green-600 font-bold">
                      {formatPrice((item.product.final_price || item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            {items.length > 0 && (
              <Button
                className="w-full text-xl py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowCart(false);
                  window.location.href = '/checkout';
                }}
              >
                Realizar Pedido
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full text-lg py-4"
              onClick={() => setShowCart(false)}
            >
              Seguir Comprando
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button (Mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-8 h-8" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-lg px-2">
              {itemCount}
            </Badge>
          </Button>
        </div>
      )}

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
