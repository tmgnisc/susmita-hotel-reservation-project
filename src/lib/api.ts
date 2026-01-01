const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  if (!data.success) {
    throw new ApiError(data.message || 'Request failed');
  }

  return data.data as T;
}

export const api = {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await apiRequest<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    // Store token
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  async register(email: string, password: string, name: string, phone?: string) {
    const response = await apiRequest<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone }),
      }
    );
    
    // Store token
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  async getCurrentUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new ApiError('No user ID found', 401);
    }
    return apiRequest<{ user: any }>(`/auth/me?userId=${userId}`);
  },

  async updateProfile(updates: { name?: string; phone?: string; avatar?: string }) {
    return apiRequest<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    if (!data.success) {
      throw new ApiError(data.message || 'Upload failed');
    }

    return data.data;
  },

  // Tables
  async getTables(filters?: { status?: string; minCapacity?: number; maxCapacity?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minCapacity) params.append('minCapacity', filters.minCapacity.toString());
    if (filters?.maxCapacity) params.append('maxCapacity', filters.maxCapacity.toString());
    
    const query = params.toString();
    return apiRequest<{ tables: any[] }>(`/tables${query ? `?${query}` : ''}`);
  },

  async getTable(id: string) {
    return apiRequest<{ table: any }>(`/tables/${id}`);
  },

  async createTable(table: {
    tableNumber: string;
    capacity: number;
    status?: string;
    description?: string;
    location?: string;
  }) {
    return apiRequest<{ table: any }>('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    });
  },

  async updateTable(id: string, table: {
    tableNumber?: string;
    capacity?: number;
    status?: string;
    description?: string;
    location?: string;
  }) {
    return apiRequest<{ table: any }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    });
  },

  async deleteTable(id: string) {
    return apiRequest<{ message: string }>(`/tables/${id}`, {
      method: 'DELETE',
    });
  },

  // Reservations
  async getReservations(filters?: { status?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    
    const query = params.toString();
    return apiRequest<{ reservations: any[] }>(`/reservations${query ? `?${query}` : ''}`);
  },

  async createReservation(reservation: {
    tableId: string;
    reservationDate: string;
    reservationTime: string;
    duration?: number;
    guests: number;
    specialRequests?: string;
  }) {
    return apiRequest<{ reservation: any }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  },

  // Food
  async getFoodItems(filters?: { category?: string; available?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', filters.available.toString());
    
    const query = params.toString();
    return apiRequest<{ items: any[] }>(`/food/items${query ? `?${query}` : ''}`);
  },

  async getFoodItem(id: string) {
    return apiRequest<{ item: any }>(`/food/items/${id}`);
  },

  async createFoodItem(item: {
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    available?: boolean;
    preparationTime?: number;
  }) {
    return apiRequest<{ item: any }>('/food/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateFoodItem(id: string, item: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    available?: boolean;
    preparationTime?: number;
  }) {
    return apiRequest<{ item: any }>(`/food/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async deleteFoodItem(id: string) {
    return apiRequest<{ message: string }>(`/food/items/${id}`, {
      method: 'DELETE',
    });
  },

  async getFoodOrders() {
    return apiRequest<{ orders: any[] }>('/food/orders');
  },

  async createFoodOrder(order: {
    items: { foodItemId: string; quantity: number }[];
    roomNumber?: string;
    userId?: string;
  }) {
    return apiRequest<{ order: any }>('/food/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  // Staff Management (Admin only)
  async getStaff(filters?: { department?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiRequest<{ staff: any[] }>(`/staff${query ? `?${query}` : ''}`);
  },

  async getStaffMember(id: string) {
    return apiRequest<{ staffMember: any }>(`/staff/${id}`);
  },

  async createStaff(staff: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    phone?: string;
    avatar?: string;
    status?: string;
    hireDate: string;
  }) {
    return apiRequest<{ staffMember: any; loginCredentials: { email: string; password: string } }>('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  },

  async updateStaff(id: string, updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    department?: string;
    phone?: string;
    avatar?: string;
    status?: string;
    hireDate?: string;
  }) {
    return apiRequest<{ staffMember: any }>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteStaff(id: string) {
    return apiRequest<{ message: string }>(`/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Payments
  async createPaymentIntent(data: {
    amount: number;
    currency?: string;
    reservationId?: string;
    orderId?: string;
    metadata?: Record<string, string>;
  }) {
    return apiRequest<{
      paymentIntent: { clientSecret: string; id: string };
      paymentId: string;
    }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async confirmPayment(data: {
    paymentIntentId: string;
    paymentId?: string;
  }) {
    return apiRequest<{ message: string }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPayments() {
    return apiRequest<{ payments: any[] }>('/payments');
  },
};

export { ApiError };

