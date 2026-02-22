const API_URL = 'http://localhost:8081/api/v1';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  section?: string;
  account_status: string;
  avatar_url?: string;
  created_at: string;
}

export interface UsersResponse {
  users: User[];
}

export const userService = {
  async getAllUsers(token: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data: UsersResponse = await response.json();
    return data.users || [];
  },

  async approveUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve user');
    }
  },

  async rejectUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject user');
    }
  },

  async deleteUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },
};
