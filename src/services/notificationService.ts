import { api } from './api';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'transaction' | 'system' | 'promotion' | 'alert';
    data?: {
        transaction_id?: string;
        amount?: string;
        status?: string;
        [key: string]: any;
    };
    readAt: string | null;
    created_at: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: Notification[];
    message?: string;
}

export interface MarkAsReadResponse {
    success: boolean;
    message?: string;
}

export interface NotificationStats {
    total: number;
    unread: number;
    read: number;
}

class NotificationService {
    // Get notifications with pagination
    async getNotifications(limit?: number, page?: number): Promise<NotificationsResponse> {
        try {
            const response = await api.get<NotificationsResponse>('user/get-notification', {
                params: {
                    limit: limit || 20,
                    page: page || 1,
                },
            });
            return response.data;
        } catch (error: any) {
            return this.handleApiError(error);
        }
    }

    // Mark all notifications as read (using your READ_NOTIFICATION route)
    async markAllAsRead(): Promise<MarkAsReadResponse> {
        try {
            const response = await api.put<MarkAsReadResponse>('user/read-notification', {});
            return response.data;
        } catch (error: any) {
            return this.handleApiError(error);
        }
    }

    // Mark single notification as read
    async markAsRead(notificationId: number): Promise<MarkAsReadResponse> {
        try {
            const response = await api.put<MarkAsReadResponse>(`user/read-notification`, {
                notification_id: notificationId
            });
            return response.data;
        } catch (error: any) {
            return this.handleApiError(error);
        }
    }

    // Calculate notification stats
    calculateStats(notifications: Notification[]): NotificationStats {
        const total = notifications.length;
        // Count notifications where readAt is null (unread)
        const unread = notifications.filter(n => n.readAt === null).length;
        // Count notifications where readAt is not null (read)
        const read = notifications.filter(n => n.readAt !== null).length;

        console.log('Notification stats calculated:', { total, unread, read });

        return { total, unread, read };
    }

    // Check if any notifications are unread (readAt === null)
    hasUnreadNotifications(notifications: Notification[]): boolean {
        return notifications.some(notification => notification.readAt === null);
    }

    // Get unread notifications count
    getUnreadCount(notifications: Notification[]): number {
        return notifications.filter(notification => notification.readAt === null).length;
    }

    // Format notification date
    formatNotificationDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined,
            });
        } catch (error) {
            return 'Recent';
        }
    }

    // Get notification icon based on type
    getNotificationIcon(type: string): { icon: string; color: string; bgColor: string } {
        const icons = {
            transaction: { icon: 'receipt', color: '#1F54DD', bgColor: '#E0E7FF' },
            system: { icon: 'information-circle', color: '#10B981', bgColor: '#ECFDF5' },
            promotion: { icon: 'gift', color: '#8B5CF6', bgColor: '#F5F3FF' },
            alert: { icon: 'alert-circle', color: '#EF4444', bgColor: '#FEF2F2' },
            default: { icon: 'notifications', color: '#64748B', bgColor: '#F1F5F9' },
        };

        return icons[type as keyof typeof icons] || icons.default;
    }

    private handleApiError(error: any): never {
        if (error.response) {
            const apiError = error.response.data;
            throw apiError;
        } else if (error.request) {
            throw { message: 'Network error. Please check your connection.' };
        } else {
            throw { message: 'An unexpected error occurred.' };
        }
    }
}

export const notificationService = new NotificationService();