"use client";

import { useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useToast } from './ToastContext';

export const WebSocketNotifications = () => {
  const { notifications } = useWebSocket();
  const { showToast } = useToast();

  useEffect(() => {
    // Show toast for new notifications
    notifications.forEach(notification => {
      showToast(notification.message, notification.type);
    });
  }, [notifications, showToast]);

  // This component doesn't render anything, it just handles side effects
  return null;
};