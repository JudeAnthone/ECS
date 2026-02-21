import { API_ENDPOINTS } from '../lib/api-config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role?: string;
  section?: string;
}

export interface UserDTO {
  id: string;
  full_name: string;
  email: string;
  role: string;
  section?: string;
  account_status: string;
  avatar_url?: string;
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
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    
    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
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
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const result: AuthResponse = await response.json();

    // Store token if provided (user might need approval first)
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  }

  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static getUser(): UserDTO | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
