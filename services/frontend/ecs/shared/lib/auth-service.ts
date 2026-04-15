import { API_ENDPOINTS, API_URL } from '../lib/api-config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  role?: string;
  department?: string;
  contact_number?: string;
}

export interface UserDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: string;
  department?: string;
  assigned_program_chair_id?: string;
  contact_number?: string;
  account_status: string;
  avatar_url?: string;
  last_active?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: UserDTO;
  expires_in: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  code?: number;
}

export class AuthService {
  private static hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  static setUser(user: UserDTO): void {
    if (!this.hasStorage()) return;
    localStorage.setItem('user', JSON.stringify(user));
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('ecs-login-redirecting') !== '1') {
      window.dispatchEvent(new CustomEvent('ecs:user-updated', { detail: user }));
    }
  }

  static resolveAvatarUrl(raw?: string | null): string {
    const value = String(raw || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
    if (normalized.startsWith('uploads/')) {
      return `${API_URL}/${normalized}`;
    }
    return `${API_URL}/uploads/${normalized}`;
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Login failed';
      if (contentType && contentType.includes('application/json')) {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: AuthResponse = await response.json();
    
    // Store token in localStorage
    if (result.token && this.hasStorage()) {
      localStorage.setItem('auth_token', result.token);
      this.setUser(result.user);
    }

    return result;
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.auth.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Registration failed';
      if (contentType && contentType.includes('application/json')) {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: AuthResponse = await response.json();

    // Store token if provided (user might need approval first)
    if (result.token && this.hasStorage()) {
      localStorage.setItem('auth_token', result.token);
      this.setUser(result.user);
    }

    return result;
  }

  static logout(): void {
    if (this.hasStorage()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    
    // Redirect to landing page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  static getToken(): string | null {
    if (!this.hasStorage()) return null;
    return localStorage.getItem('auth_token');
  }

  static getUser(): UserDTO | null {
    if (!this.hasStorage()) return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserDTO;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static requireAuth(): boolean {
    if (!this.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }
    return true;
  }
}
