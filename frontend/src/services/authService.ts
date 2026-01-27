import { API_BASE_URL } from '@/config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  message: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const result = await response.json();
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      return result;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      return result;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      console.log('📦 Current user from localStorage:', user);
      return user;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔑 Token from localStorage:', token ? 'exists' : 'null');
    return token;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('❌ Not authenticated: No token');
      return false;
    }

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        console.log('❌ Token expired');
        this.logout();
        return false;
      }

      console.log('✅ Authenticated: Token valid');
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      this.logout();
      return false;
    }
  },

  logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
