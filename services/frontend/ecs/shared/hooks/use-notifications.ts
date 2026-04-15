"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationService, type NotificationItem } from '@/shared/lib/notification-service';

export function useNotifications(pollingIntervalMs = 25000) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [items, count] = await Promise.all([
        notificationService.list(token, { limit: 20, offset: 0 }),
        notificationService.unreadCount(token),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationID: string) => {
    if (!token) return;
    try {
      await notificationService.markRead(token, notificationID);
      let wasUnread = false;
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id !== notificationID) return n;
          if (!n.is_read) wasUnread = true;
          return n.is_read ? n : { ...n, is_read: true };
        })
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.markAllRead(token);
      setNotifications((prev) => prev.map((n) => (n.is_read ? n : { ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [token]);

  const deleteNotification = useCallback(async (notificationID: string) => {
    if (!token) return;
    try {
      await notificationService.remove(token, notificationID);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationID);
        if (target && !target.is_read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationID);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => window.clearInterval(interval);
  }, [load, token, pollingIntervalMs]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
