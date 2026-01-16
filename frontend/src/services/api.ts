import { User, Category, Product, Promotion, Order, LoginResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesion');
    }
    return response.json();
  },

  async register(data: { email: string; password: string; name: string; phone?: string; address?: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al registrarse');
    }
    return response.json();
  },

  async getMe(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  },

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Error al obtener categorias');
    return response.json();
  },

  async createCategory(data: { name: string; description?: string; image_url?: string }): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear categoria');
    return response.json();
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar categoria');
    return response.json();
  },

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al eliminar categoria');
  },

  async getProducts(params?: { category_id?: number; search?: string; active_only?: boolean }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.append('category_id', params.category_id.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    
    const url = `${API_URL}/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Error al obtener producto');
    return response.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
  },

  async getPromotions(activeOnly = true): Promise<Promotion[]> {
    const url = activeOnly ? `${API_URL}/promotions` : `${API_URL}/promotions/all`;
    const response = await fetch(url, {
      headers: activeOnly ? getHeaders() : getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al obtener promociones');
    return response.json();
  },

  async createPromotion(data: Partial<Promotion>): Promise<Promotion> {
    const response = await fetch(`${API_URL}/promotions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear promocion');
    return response.json();
  },

  async updatePromotion(id: number, data: Partial<Promotion>): Promise<Promotion> {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar promocion');
    return response.json();
  },

  async deletePromotion(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al eliminar promocion');
  },

  async getOrders(status?: string): Promise<Order[]> {
    const url = status ? `${API_URL}/orders?status_filter=${status}` : `${API_URL}/orders`;
    const response = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al obtener pedidos');
    return response.json();
  },

  async createOrder(data: { items: { product_id: number; quantity: number }[]; notes?: string }): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear pedido');
    }
    return response.json();
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Error al actualizar estado del pedido');
    return response.json();
  },

    async cancelOrder(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Error al cancelar pedido');
    },

    async deleteOrder(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/orders/${id}/permanent`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Error al eliminar pedido');
    },

        async adminCreateOrder(data: { user_id: number; items: { product_id: number; quantity: number }[]; notes?: string }): Promise<Order> {
          const response = await fetch(`${API_URL}/orders/admin`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al crear pedido');
          }
          return response.json();
        },

        async guestCreateOrder(data: { 
          guest_name: string; 
          guest_phone: string; 
          guest_address: string; 
          payment_method: string; 
          items: { product_id: number; quantity: number }[]; 
          notes?: string 
        }): Promise<Order> {
          const response = await fetch(`${API_URL}/orders/guest`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al crear pedido');
          }
          return response.json();
        },

        async getUsers(role?: string): Promise<User[]> {
    const url = role ? `${API_URL}/users?role=${role}` : `${API_URL}/users`;
    const response = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  async createUser(data: { email: string; password: string; name: string; phone?: string; address?: string; city?: string; purchase_volume?: string; role?: string }): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear usuario');
    }
    return response.json();
  },

  async updateUser(id: number, data: { name?: string; phone?: string; address?: string; city?: string; purchase_volume?: string; is_active?: boolean }): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al cambiar contraseña');
    }
  },

  async uploadFile(file: File): Promise<{ filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al subir archivo');
    }
    return response.json();
  },

  getUploadUrl(filename: string): string {
    return `${API_URL}/uploads/${filename}`;
  },
};
