"use client";

import { useState, useCallback, useRef } from 'react';
import { Notification, NotificationType } from '@/app/types/places';

/**
 * Custom hook for managing notifications/toast messages
 * @returns Object with notifications array and helper functions
 */
export function useNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    /**
     * Remove a notification by ID
     */
    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Clear timeout if exists
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }
    }, []);

    /**
     * Add a new notification
     */
    const addNotification = useCallback((
        type: NotificationType,
        message: string,
        duration: number = 5000
    ): string => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        setNotifications((prev) => [...prev, { id, type, message, duration }]);

        // Auto-remove notification after duration
        if (duration > 0) {
            const timeout = setTimeout(() => {
                removeNotification(id);
            }, duration);
            timeoutsRef.current.set(id, timeout);
        }

        return id;
    }, [removeNotification]);

    /**
     * Show a success notification
     */
    const success = useCallback((message: string, duration?: number) => {
        return addNotification('success', message, duration);
    }, [addNotification]);

    /**
     * Show an error notification
     */
    const error = useCallback((message: string, duration?: number) => {
        return addNotification('error', message, duration);
    }, [addNotification]);

    /**
     * Show an info notification
     */
    const info = useCallback((message: string, duration?: number) => {
        return addNotification('info', message, duration);
    }, [addNotification]);

    /**
     * Show a warning notification
     */
    const warning = useCallback((message: string, duration?: number) => {
        return addNotification('warning', message, duration);
    }, [addNotification]);

    /**
     * Clear all notifications
     */
    const clearAll = useCallback(() => {
        // Clear all timeouts
        timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
        timeoutsRef.current.clear();
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
        clearAll,
    };
}
