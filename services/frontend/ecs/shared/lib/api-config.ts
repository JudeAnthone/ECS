// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/v1/auth/login`,
    register: `${API_URL}/api/v1/auth/register`,
  },
  users: {
    me: `${API_URL}/api/v1/users/me`,
    updateMe: `${API_URL}/api/v1/users/me`,
    avatar: `${API_URL}/api/v1/users/me/avatar`,
  },
  notifications: {
    list: `${API_URL}/api/v1/notifications`,
    unreadCount: `${API_URL}/api/v1/notifications/unread-count`,
    markAllRead: `${API_URL}/api/v1/notifications/read-all`,
    markRead: (id: string) => `${API_URL}/api/v1/notifications/${id}/read`,
    delete: (id: string) => `${API_URL}/api/v1/notifications/${id}`,
  },
};
