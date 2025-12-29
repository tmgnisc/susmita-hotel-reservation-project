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
    return apiRequest<{ user: any }>('/auth/me');
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

  // Rooms
  async getRooms(filters?: { type?: string; status?: string; minPrice?: number; maxPrice?: number }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    const query = params.toString();
    return apiRequest<{ rooms: any[] }>(`/rooms${query ? `?${query}` : ''}`);
  },

  async getRoom(id: string) {
    return apiRequest<{ room: any }>(`/rooms/${id}`);
  },

  // Bookings
  async getBookings() {
    return apiRequest<{ bookings: any[] }>('/bookings');
  },

  async createBooking(booking: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    specialRequests?: string;
  }) {
    return apiRequest<{ booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
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

  async createFoodOrder(order: {
    items: { foodItemId: string; quantity: number }[];
    roomNumber?: string;
  }) {
    return apiRequest<{ order: any }>('/food/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
};

export { ApiError };

