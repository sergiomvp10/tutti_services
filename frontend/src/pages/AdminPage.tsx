import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, Category, Promotion, Order, User } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  ShoppingBag,
  Tag,
  Users,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Search,
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Upload,
  X,
  Settings,
  Key,
  UserPlus,
  Home
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'pending': { label: 'Pendiente', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
  'confirmed': { label: 'Confirmado', color: 'bg-blue-500', icon: <CheckCircle className="w-4 h-4" /> },
  'preparing': { label: 'En Proceso', color: 'bg-purple-500', icon: <Package className="w-4 h-4" /> },
  'ready': { label: 'Listo', color: 'bg-indigo-500', icon: <Truck className="w-4 h-4" /> },
  'delivered': { label: 'Entregado', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
  'cancelled': { label: 'Cancelado', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', unit: 'kg', category_id: '',
    image_url: '', image_url_2: '', stock: '', min_order: '1'
  });
  
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' });
  
  const [promotionForm, setPromotionForm] = useState({
    name: '', description: '', discount_percent: '', product_id: '', category_id: '',
    start_date: '', end_date: '', is_active: true
  });

  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', city: '', purchase_volume: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

    const [landingConfig, setLandingConfig] = useState(() => {
      const saved = localStorage.getItem('landingConfig');
      return saved ? JSON.parse(saved) : {
        mainMessage: 'Los productos más frescos y al mejor precio de Cartagena',
        subtitle: 'Distribuidora de Frutas y Verduras para mayoristas',
        whatsappLink: 'https://wa.link/ykjebj',
        backgroundImage: ''
      };
    });
    const [uploadingLandingImage, setUploadingLandingImage] = useState(false);

    const [uploadingImage1, setUploadingImage1] = useState(false);
    const [uploadingImage2, setUploadingImage2] = useState(false);
    const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);

    const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
    const [newOrderForm, setNewOrderForm] = useState<{
      user_id: string;
      items: { product_id: number; product_name: string; quantity: number; price: number }[];
      notes: string;
    }>({ user_id: '', items: [], notes: '' });
    const [selectedProductForOrder, setSelectedProductForOrder] = useState('');
    const [quantityForOrder, setQuantityForOrder] = useState('1');

  const handleImageUpload = async (file: File, imageField: 'image_url' | 'image_url_2') => {
    const setUploading = imageField === 'image_url' ? setUploadingImage1 : setUploadingImage2;
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      const fullUrl = api.getUploadUrl(result.filename);
      setProductForm(prev => ({ ...prev, [imageField]: fullUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

    const handleCategoryImageUpload = async (file: File) => {
      setUploadingCategoryImage(true);
      try {
        const result = await api.uploadFile(file);
        const fullUrl = api.getUploadUrl(result.filename);
        setCategoryForm(prev => ({ ...prev, image_url: fullUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen');
      } finally {
        setUploadingCategoryImage(false);
      }
    };

    const handleLandingImageUpload = async (file: File) => {
      setUploadingLandingImage(true);
      try {
        const result = await api.uploadFile(file);
        const fullUrl = api.getUploadUrl(result.filename);
        setLandingConfig((prev: typeof landingConfig) => ({ ...prev, backgroundImage: fullUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen');
      } finally {
        setUploadingLandingImage(false);
      }
    };

    useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/catalog');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, promotionsData, ordersData, usersData] = await Promise.all([
        api.getProducts({ active_only: false }),
        api.getCategories(),
        api.getPromotions(false),
        api.getOrders(),
        api.getUsers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setPromotions(promotionsData);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
        image_url: productForm.image_url,
        image_url_2: productForm.image_url_2,
        stock: parseFloat(productForm.stock) || 0,
        min_order: parseFloat(productForm.min_order) || 1,
      };
      
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data);
      } else {
        await api.createProduct(data);
      }
      
      await loadData();
      setShowProductDialog(false);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('¿Estas seguro de eliminar este producto?')) {
      try {
        await api.deleteProduct(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
      } else {
        await api.createCategory(categoryForm);
      }
      await loadData();
      setShowCategoryDialog(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('¿Estas seguro de eliminar esta categoria?')) {
      try {
        await api.deleteCategory(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSavePromotion = async () => {
    try {
      const data = {
        name: promotionForm.name,
        description: promotionForm.description,
        discount_percent: parseFloat(promotionForm.discount_percent),
        product_id: promotionForm.product_id ? parseInt(promotionForm.product_id) : null,
        category_id: promotionForm.category_id ? parseInt(promotionForm.category_id) : null,
        start_date: promotionForm.start_date,
        end_date: promotionForm.end_date,
        is_active: promotionForm.is_active,
      };
      
      if (editingPromotion) {
        await api.updatePromotion(editingPromotion.id, data);
      } else {
        await api.createPromotion(data);
      }
      
      await loadData();
      setShowPromotionDialog(false);
      resetPromotionForm();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDeletePromotion = async (id: number) => {
    if (confirm('¿Estas seguro de eliminar esta promocion?')) {
      try {
        await api.deletePromotion(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadData();
      setShowOrderDialog(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (confirm('¿Estás seguro de eliminar este pedido permanentemente?')) {
      try {
        await api.deleteOrder(orderId);
        await loadData();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', unit: 'kg', category_id: '', image_url: '', image_url_2: '', stock: '', min_order: '1' });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image_url: '' });
    setEditingCategory(null);
  };

  const resetPromotionForm = () => {
    setPromotionForm({ name: '', description: '', discount_percent: '', product_id: '', category_id: '', start_date: '', end_date: '', is_active: true });
    setEditingPromotion(null);
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', password: '', phone: '', address: '', city: '', purchase_volume: '' });
  };

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Contraseña actualizada exitosamente');
      resetPasswordForm();
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
    }
  };

  const handleSaveUser = async () => {
    try {
      await api.createUser({
        email: userForm.email,
        password: userForm.password,
        name: userForm.name,
        phone: userForm.phone,
        address: userForm.address,
        city: userForm.city,
        purchase_volume: userForm.purchase_volume,
        role: 'buyer'
      });
      setShowUserDialog(false);
      resetUserForm();
      loadData();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear el cliente');
    }
  };

    const handleSaveLandingConfig = () => {
      localStorage.setItem('landingConfig', JSON.stringify(landingConfig));
      alert('Configuración de landing page guardada exitosamente');
    };

    const resetNewOrderForm = () => {
      setNewOrderForm({ user_id: '', items: [], notes: '' });
      setSelectedProductForOrder('');
      setQuantityForOrder('1');
    };

    const addProductToOrder = () => {
      if (!selectedProductForOrder || !quantityForOrder) return;
      const product = products.find(p => p.id.toString() === selectedProductForOrder);
      if (!product) return;
    
      const existingIndex = newOrderForm.items.findIndex(i => i.product_id === product.id);
      if (existingIndex >= 0) {
        const updatedItems = [...newOrderForm.items];
        updatedItems[existingIndex].quantity += parseFloat(quantityForOrder);
        setNewOrderForm({ ...newOrderForm, items: updatedItems });
      } else {
        setNewOrderForm({
          ...newOrderForm,
          items: [...newOrderForm.items, {
            product_id: product.id,
            product_name: product.name,
            quantity: parseFloat(quantityForOrder),
            price: product.price
          }]
        });
      }
      setSelectedProductForOrder('');
      setQuantityForOrder('1');
    };

    const removeProductFromOrder = (productId: number) => {
      setNewOrderForm({
        ...newOrderForm,
        items: newOrderForm.items.filter(i => i.product_id !== productId)
      });
    };

    const calculateOrderTotal = () => {
      return newOrderForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleCreateAdminOrder = async () => {
      if (!newOrderForm.user_id || newOrderForm.items.length === 0) {
        alert('Selecciona un cliente y agrega al menos un producto');
        return;
      }
      try {
        await api.adminCreateOrder({
          user_id: parseInt(newOrderForm.user_id),
          items: newOrderForm.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
          notes: newOrderForm.notes
        });
        setShowCreateOrderDialog(false);
        resetNewOrderForm();
        loadData();
        alert('Pedido creado exitosamente');
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Error al crear el pedido');
      }
    };

    const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      unit: product.unit,
      category_id: product.category_id?.toString() || '',
      image_url: product.image_url || '',
      image_url_2: product.image_url_2 || '',
      stock: product.stock.toString(),
      min_order: product.min_order.toString(),
    });
    setShowProductDialog(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setShowCategoryDialog(true);
  };

  const openEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setPromotionForm({
      name: promotion.name,
      description: promotion.description || '',
      discount_percent: promotion.discount_percent.toString(),
      product_id: promotion.product_id?.toString() || '',
      category_id: promotion.category_id?.toString() || '',
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date.split('T')[0],
      is_active: promotion.is_active,
    });
    setShowPromotionDialog(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchQuery) || 
    (o.user_name || o.guest_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/tutti_logo.png" alt="Tutti Services" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Panel de Administracion</h1>
                <p className="text-green-200 text-xs sm:text-sm">Tutti Services</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-green-200 text-sm hidden sm:inline">{user?.name}</span>
              <Button variant="ghost" className="text-white hover:bg-green-800 p-2" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex overflow-x-auto mb-6 h-auto p-1 gap-1">
            <TabsTrigger value="products" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Package className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <FolderOpen className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Tag className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Promos</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <ShoppingBag className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Users className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Settings className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl">Productos ({products.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-48"
                    />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-sm" onClick={() => { resetProductForm(); setShowProductDialog(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> Nuevo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Producto</th>
                        <th className="text-left p-3">Categoria</th>
                        <th className="text-right p-3">Precio</th>
                        <th className="text-right p-3">Stock</th>
                        <th className="text-center p-3">Estado</th>
                        <th className="text-center p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{product.category_name || '-'}</td>
                          <td className="p-3 text-right font-medium">{formatPrice(product.price)}</td>
                          <td className="p-3 text-right">{product.stock}</td>
                          <td className="p-3 text-center">
                            <Badge className={product.is_active ? 'bg-green-500' : 'bg-gray-400'}>
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categorias ({categories.length})</CardTitle>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { resetCategoryForm(); setShowCategoryDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Nueva Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                      <div className="h-32 bg-gray-200">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-gray-500 text-sm">{category.description || 'Sin descripcion'}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => openEditCategory(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Promociones ({promotions.length})</CardTitle>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { resetPromotionForm(); setShowPromotionDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Nueva Promocion
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Promocion</th>
                        <th className="text-left p-3">Aplica a</th>
                        <th className="text-center p-3">Descuento</th>
                        <th className="text-left p-3">Vigencia</th>
                        <th className="text-center p-3">Estado</th>
                        <th className="text-center p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map((promo) => (
                        <tr key={promo.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium">{promo.name}</p>
                            <p className="text-sm text-gray-500">{promo.description}</p>
                          </td>
                          <td className="p-3">
                            {promo.product_name || promo.category_name || 'General'}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-red-500 text-white text-lg">-{promo.discount_percent}%</Badge>
                          </td>
                          <td className="p-3">
                            {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={promo.is_active ? 'bg-green-500' : 'bg-gray-400'}>
                              {promo.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" onClick={() => openEditPromotion(promo)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeletePromotion(promo.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                          <CardTitle>Pedidos ({orders.length})</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                placeholder="Buscar por # o cliente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64"
                              />
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => { resetNewOrderForm(); setShowCreateOrderDialog(true); }}>
                              <Plus className="w-4 h-4 mr-2" /> Nuevo Pedido
                            </Button>
                          </div>
                        </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3"># Pedido</th>
                        <th className="text-left p-3">Cliente</th>
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-center p-3">Estado</th>
                        <th className="text-center p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig['pending'];
                        return (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-bold">#{order.id}</td>
                            <td className="p-3">
                              <p className="font-medium">{order.user_name}</p>
                              <p className="text-sm text-gray-500">{order.user_phone}</p>
                            </td>
                            <td className="p-3">{formatDate(order.created_at)}</td>
                            <td className="p-3 text-right font-bold text-green-600">{formatPrice(order.total)}</td>
                            <td className="p-3 text-center">
                              <Badge className={`${status.color} text-white flex items-center gap-1 justify-center`}>
                                {status.icon} {status.label}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true); }}>
                                  Ver Detalles
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteOrder(order.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clientes ({users.filter(u => u.role === 'buyer').length})</CardTitle>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { resetUserForm(); setShowUserDialog(true); }}>
                  <UserPlus className="w-4 h-4 mr-2" /> Nuevo Cliente
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Telefono</th>
                        <th className="text-left p-3">Ciudad</th>
                        <th className="text-left p-3">Direccion</th>
                        <th className="text-left p-3">Vol. Compra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'buyer').map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">{u.phone || '-'}</td>
                          <td className="p-3">{u.city || '-'}</td>
                          <td className="p-3">{u.address || '-'}</td>
                          <td className="p-3">{u.purchase_volume || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Change Password Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" /> Cambiar Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                    <Input 
                      type="password" 
                      value={passwordForm.currentPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                    <Input 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                    <Input 
                      type="password" 
                      value={passwordForm.confirmPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                    />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleChangePassword}>
                    Actualizar Contraseña
                  </Button>
                </CardContent>
              </Card>

              {/* Create User Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Crear Nuevo Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña *</label>
                    <Input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <Input value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ciudad</label>
                      <Input value={userForm.city} onChange={(e) => setUserForm({...userForm, city: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dirección</label>
                    <Input value={userForm.address} onChange={(e) => setUserForm({...userForm, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Volumen de Compra</label>
                    <Input value={userForm.purchase_volume} onChange={(e) => setUserForm({...userForm, purchase_volume: e.target.value})} placeholder="Ej: Alto, Medio, Bajo" />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSaveUser}>
                    Crear Cliente
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Landing Page Settings Card - Full Width */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" /> Configuración de Landing Page
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mensaje Principal</label>
                  <Textarea 
                    value={landingConfig.mainMessage} 
                    onChange={(e) => setLandingConfig({...landingConfig, mainMessage: e.target.value})}
                    placeholder="Los productos más frescos y al mejor precio de Cartagena"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtítulo</label>
                  <Input 
                    value={landingConfig.subtitle} 
                    onChange={(e) => setLandingConfig({...landingConfig, subtitle: e.target.value})}
                    placeholder="Distribuidora de Frutas y Verduras para mayoristas"
                  />
                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Link de WhatsApp</label>
                                  <Input 
                                    value={landingConfig.whatsappLink} 
                                    onChange={(e) => setLandingConfig({...landingConfig, whatsappLink: e.target.value})}
                                    placeholder="https://wa.link/ykjebj"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Imagen de Fondo</label>
                                  <div className="flex gap-2 items-center">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleLandingImageUpload(file);
                                      }}
                                      className="flex-1"
                                      disabled={uploadingLandingImage}
                                    />
                                    {uploadingLandingImage && <span className="text-sm text-gray-500">Subiendo...</span>}
                                  </div>
                                  {landingConfig.backgroundImage && (
                                    <div className="mt-2">
                                      <img 
                                        src={landingConfig.backgroundImage} 
                                        alt="Preview" 
                                        className="w-full h-32 object-cover rounded-lg"
                                      />
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 mt-1"
                                        onClick={() => setLandingConfig({...landingConfig, backgroundImage: ''})}
                                      >
                                        <X className="w-4 h-4 mr-1" /> Eliminar imagen
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSaveLandingConfig}>
                                  Guardar Configuración
                                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripcion</label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <Input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidad</label>
                <Select value={productForm.unit} onValueChange={(v) => setProductForm({...productForm, unit: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                    <SelectItem value="lb">Libra (lb)</SelectItem>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="bulto">Bulto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Select value={productForm.category_id} onValueChange={(v) => setProductForm({...productForm, category_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pedido Minimo</label>
                <Input type="number" value={productForm.min_order} onChange={(e) => setProductForm({...productForm, min_order: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagen 1</label>
              <div className="space-y-2">
                {productForm.image_url && (
                  <div className="relative w-32 h-32">
                    <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setProductForm({...productForm, image_url: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer w-fit">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingImage1 ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage1}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'image_url');
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagen 2 (opcional)</label>
              <div className="space-y-2">
                {productForm.image_url_2 && (
                  <div className="relative w-32 h-32">
                    <img src={productForm.image_url_2} alt="Preview 2" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setProductForm({...productForm, image_url_2: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer w-fit">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingImage2 ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage2}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'image_url_2');
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveProduct}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripcion</label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <div className="space-y-2">
                {categoryForm.image_url && (
                  <div className="relative w-32 h-32">
                    <img src={categoryForm.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setCategoryForm({...categoryForm, image_url: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer w-fit">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingCategoryImage ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCategoryImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCategoryImageUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveCategory}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Editar Promocion' : 'Nueva Promocion'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input value={promotionForm.name} onChange={(e) => setPromotionForm({...promotionForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripcion</label>
              <Textarea value={promotionForm.description} onChange={(e) => setPromotionForm({...promotionForm, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Porcentaje de Descuento *</label>
              <Input type="number" value={promotionForm.discount_percent} onChange={(e) => setPromotionForm({...promotionForm, discount_percent: e.target.value})} placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aplicar a Producto (opcional)</label>
              <Select value={promotionForm.product_id} onValueChange={(v) => setPromotionForm({...promotionForm, product_id: v, category_id: ''})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">O Aplicar a Categoria (opcional)</label>
              <Select value={promotionForm.category_id} onValueChange={(v) => setPromotionForm({...promotionForm, category_id: v, product_id: ''})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Inicio *</label>
                <Input type="date" value={promotionForm.start_date} onChange={(e) => setPromotionForm({...promotionForm, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Fin *</label>
                <Input type="date" value={promotionForm.end_date} onChange={(e) => setPromotionForm({...promotionForm, end_date: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromotionDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSavePromotion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Cliente:</h4>
                <p>{selectedOrder.user_name || selectedOrder.guest_name}</p>
                <p className="text-gray-500">{selectedOrder.user_phone || selectedOrder.guest_phone}</p>
                {(selectedOrder.guest_address || selectedOrder.user_address) && (
                  <p className="text-gray-500 mt-1">
                    <span className="font-medium">Dirección:</span> {selectedOrder.guest_address || selectedOrder.user_address}
                  </p>
                )}
                {selectedOrder.payment_method && (
                  <p className="text-gray-500 mt-1">
                    <span className="font-medium">Forma de Pago:</span> {selectedOrder.payment_method}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Productos:</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between p-2 border-b">
                    <div>
                      <p>{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} unidades</p>
                    </div>
                    <p className="font-bold">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Notas:</h4>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold border-t pt-4">
                <span>Total:</span>
                <span className="text-green-600">{formatPrice(selectedOrder.total)}</span>
              </div>

              <div>
                <h4 className="font-bold mb-2">Cambiar Estado:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedOrder.status === key ? "default" : "outline"}
                      className={selectedOrder.status === key ? config.color : ''}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, key)}
                    >
                      {config.icon}
                      <span className="ml-2">{config.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    const clientName = selectedOrder.user_name || selectedOrder.guest_name || 'Cliente';
                    const clientPhone = selectedOrder.user_phone || selectedOrder.guest_phone || '';
                    const address = selectedOrder.guest_address || '';
                    const paymentMethod = selectedOrder.payment_method || '';
                    const items = selectedOrder.items.map(item => 
                      `- ${item.product_name}: ${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'} - ${formatPrice(item.subtotal)}`
                    ).join('\n');
                    const message = `*Pedido #${selectedOrder.id} Confirmado*\n\n` +
                      `*Cliente:* ${clientName}\n` +
                      (clientPhone ? `*Teléfono:* ${clientPhone}\n` : '') +
                      (address ? `*Dirección:* ${address}\n` : '') +
                      (paymentMethod ? `*Forma de Pago:* ${paymentMethod}\n` : '') +
                      `\n*Productos:*\n${items}\n\n` +
                      `*Total:* ${formatPrice(selectedOrder.total)}\n\n` +
                      (selectedOrder.notes ? `*Notas:* ${selectedOrder.notes}` : '');
                    const adminPhone = '573208206918';
                    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar a WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña *</label>
              <Input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <Input value={userForm.city} onChange={(e) => setUserForm({...userForm, city: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <Input value={userForm.address} onChange={(e) => setUserForm({...userForm, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Volumen de Compra</label>
              <Input value={userForm.purchase_volume} onChange={(e) => setUserForm({...userForm, purchase_volume: e.target.value})} placeholder="Ej: Alto, Medio, Bajo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveUser}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <Select value={newOrderForm.user_id} onValueChange={(value) => setNewOrderForm({...newOrderForm, user_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'buyer').map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name} - {u.phone || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Agregar Productos</h4>
              <div className="flex gap-2 mb-4">
                <Select value={selectedProductForOrder} onValueChange={setSelectedProductForOrder}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.is_active).map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name} - {formatPrice(p.price)}/{p.unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  value={quantityForOrder} 
                  onChange={(e) => setQuantityForOrder(e.target.value)}
                  placeholder="Cantidad"
                  className="w-24"
                  min="0.1"
                  step="0.1"
                />
                <Button onClick={addProductToOrder} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {newOrderForm.items.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-600">Productos en el pedido:</h5>
                  {newOrderForm.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.product_name}</span>
                        <span className="text-gray-500 ml-2">x {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">{formatPrice(item.quantity * item.price)}</span>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeProductFromOrder(item.product_id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <Textarea 
                value={newOrderForm.notes} 
                onChange={(e) => setNewOrderForm({...newOrderForm, notes: e.target.value})}
                placeholder="Notas adicionales para el pedido"
                rows={2}
              />
            </div>

            <div className="flex justify-between text-xl font-bold border-t pt-4">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(calculateOrderTotal())}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateAdminOrder}>Crear Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
