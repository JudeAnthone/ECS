import { API_URL } from '@/shared/lib/api-config';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userRole: string;
  userDepartment: string;
  action: string;
  actionType: 'submission' | 'approval' | 'upload' | 'other';
  timestamp: Date;
  metadata?: Record<string, any>;
}

class ActivityLogService {
  private storageKey = 'ecs_activity_log';
  private apiEndpoint = `${API_URL}/api/v1/activity-logs`;

  /**
   * Logs an activity to localStorage and backend API
   */
  async logActivity(
    userId: string,
    userName: string,
    userRole: string,
    department: string,
    action: string,
    actionType: string,
    metadata?: any
  ): Promise<void> {
    const activityLog: ActivityLog = {
      id: this.generateId(),
      userId,
      userName,
      userRole,
      userDepartment: department,
      action,
      actionType: actionType as 'submission' | 'approval' | 'upload' | 'other',
      timestamp: new Date(),
      metadata,
    };

    // Store in localStorage (browser only)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const activities = this.getActivitiesFromStorage();
        activities.push(activityLog);
        localStorage.setItem(this.storageKey, JSON.stringify(activities));
      } catch (error) {
        console.error('Failed to store activity in localStorage:', error);
      }
    }

    // Post to backend API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const mergedMetadata = {
        ...(metadata || {}),
        actor_user_name: userName,
        actor_user_role: userRole,
        actor_user_department: department,
      };
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          action_type: actionType,
          metadata: mergedMetadata,
        }),
      });
    } catch (error) {
      console.warn('Failed to log activity to backend API:', error);
      // Gracefully fail - activity is still stored in localStorage
    }
  }

  /**
   * Retrieves recent activities from backend API first, then falls back to localStorage
   */
  async getRecentActivitiesFromAPI(limit: number = 20): Promise<ActivityLog[]> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        return this.getRecentActivities(limit);
      }

      const response = await fetch(`${this.apiEndpoint}?limit=${limit}&offset=0`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return this.getRecentActivities(limit);
      }

      const payload = await response.json();
      const activities = Array.isArray(payload?.activities) ? payload.activities : [];

      return activities.map((activity: any) => ({
        id: String(activity.id || this.generateId()),
        userId: String(activity.user_id || ''),
        userName: String(activity.user_name || 'Unknown User'),
        userAvatarUrl: activity.user_avatar_url ? String(activity.user_avatar_url) : undefined,
        userRole: String(activity.user_role || 'unknown'),
        userDepartment: String(activity.user_department || activity?.metadata?.actor_user_department || 'N/A'),
        action: String(activity.action || ''),
        actionType: (activity.action_type || 'other') as 'submission' | 'approval' | 'upload' | 'other',
        timestamp: new Date(activity.timestamp || new Date().toISOString()),
        metadata: activity.metadata || {},
      }));
    } catch (error) {
      console.warn('Failed to fetch activities from backend API:', error);
      return this.getRecentActivities(limit);
    }
  }

  /**
   * Retrieves recent activities from localStorage
   */
  getRecentActivities(limit: number = 20): ActivityLog[] {
    const activities = this.getActivitiesFromStorage();
    return activities.slice(-limit).reverse();
  }

  /**
   * Formats timestamp as relative time (e.g., "5 minutes ago")
   */
  formatActivityTimestamp(date: Date): string {
    const now = new Date();
    const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsDiff < 60) {
      return 'just now';
    }

    const minutesDiff = Math.floor(secondsDiff / 60);
    if (minutesDiff < 60) {
      return `${minutesDiff}m ago`;
    }

    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) {
      return `${hoursDiff}h ago`;
    }

    const daysDiff = Math.floor(hoursDiff / 24);
    if (daysDiff < 7) {
      return `${daysDiff}d ago`;
    }

    const weeksDiff = Math.floor(daysDiff / 7);
    if (weeksDiff < 4) {
      return `${weeksDiff}w ago`;
    }

    return date.toLocaleDateString();
  }

  /**
   * Clears all activities from localStorage
   */
  clearActivities(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear activities from localStorage:', error);
    }
  }

  /**
   * Helper: Retrieves activities from localStorage
   */
  private getActivitiesFromStorage(): ActivityLog[] {
    // Check if localStorage is available (browser only, not SSR)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }
      const activities = JSON.parse(stored) as ActivityLog[];
      return activities.map((activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
    } catch (error) {
      console.error('Failed to retrieve activities from localStorage:', error);
      return [];
    }
  }

  /**
   * Helper: Generates a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance as default
export default new ActivityLogService();
