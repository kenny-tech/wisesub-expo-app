import { Notification, notificationService, NotificationStats } from '@/src/services/notificationService';
import { useCallback, useState } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await notificationService.getNotifications();

            if (response.success) {
                setNotifications(response.data);
                const stats = notificationService.calculateStats(response.data);
                setStats(stats);
            } else {
                setError(response.message || 'Failed to fetch notifications');
            }
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err);
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationService.markAllAsRead();

            if (response.success) {
                // Update local state - set readAt for notifications with null value
                setNotifications(prev =>
                    prev.map(notification => ({
                        ...notification,
                        readAt: notification.readAt === null ? new Date().toISOString() : notification.readAt
                    }))
                );

                // Update stats - set unread to 0
                setStats(prev => ({
                    total: prev.total,
                    unread: 0,
                    read: prev.total
                }));

                console.log('All notifications marked as read, readAt updated');
            }
        } catch (err: any) {
            console.error('Failed to mark all as read:', err);
            throw err;
        }
    }, []);

    // Mark single as read
    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            const response = await notificationService.markAsRead(notificationId);

            if (response.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, readAt: notification.readAt || new Date().toISOString() }
                            : notification
                    )
                );

                // Update stats
                setStats(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                    read: prev.read + 1
                }));
            }
        } catch (err: any) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    // Refresh notifications
    const refreshNotifications = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        stats,
        loading,
        error,
        fetchNotifications,
        markAllAsRead,
        markAsRead,
        refreshNotifications,
        formatDate: notificationService.formatNotificationDate,
        getIcon: notificationService.getNotificationIcon,
    };
};