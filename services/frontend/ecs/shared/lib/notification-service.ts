import { API_ENDPOINTS } from './api-config';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationListResponse {
  notifications: NotificationItem[];
}

interface UnreadCountResponse {
  unread_count: number;
}

function withAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parseError(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data.error || data.message || fallback;
    } catch {
      return fallback;
    }
  }
  const text = await response.text();
  return text || fallback;
}

export const notificationService = {
  async list(token: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<NotificationItem[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.unreadOnly) params.set('unread_only', 'true');

    const query = params.toString();
    const url = query ? `${API_ENDPOINTS.notifications.list}?${query}` : API_ENDPOINTS.notifications.list;
    const response = await fetch(url, { method: 'GET', headers: withAuthHeaders(token) });

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to fetch notifications'));
    }

    const payload = (await response.json()) as NotificationListResponse;
    return payload.notifications || [];
  },

  async unreadCount(token: string): Promise<number> {
    const response = await fetch(API_ENDPOINTS.notifications.unreadCount, {
      method: 'GET',
      headers: withAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to fetch unread notification count'));
    }

    const payload = (await response.json()) as UnreadCountResponse;
    return payload.unread_count || 0;
  },

  async markRead(token: string, notificationID: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.notifications.markRead(notificationID), {
      method: 'PATCH',
      headers: withAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to mark notification as read'));
    }
  },

  async markAllRead(token: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.notifications.markAllRead, {
      method: 'PATCH',
      headers: withAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to mark all notifications as read'));
    }
  },

  async remove(token: string, notificationID: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.notifications.delete(notificationID), {
      method: 'DELETE',
      headers: withAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to delete notification'));
    }
  },
};
