// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/v1/auth/login`,
    register: `${API_URL}/api/v1/auth/register`,
  },
};
