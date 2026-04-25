import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';

interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  role?: string;
  createdAt: Date;
  read?: boolean;
}

interface SystemActivityPayload {
  id: string;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface ApplicantUpdatePayload {
  applicantId: string;
  action: 'created' | 'updated' | 'deleted' | 'screened';
  data: Record<string, unknown>;
  jobId?: string;
}

interface ScreeningCompletePayload {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  screenedCandidates: number;
  completedAt: Date;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationPayload[];
  activities: SystemActivityPayload[];
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  subscribeJob: (jobId: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  token?: string;
  userId?: string;
  role?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  token,
  userId,
  role
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [activities, setActivities] = useState<SystemActivityPayload[]>([]);

  useEffect(() => {
    if (!token || !userId) return;

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: {
        token,
        userId,
        role
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Notification events
    newSocket.on('notification', (data: NotificationPayload) => {
      console.log('Received notification:', data);
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications

      // Show toast notification - we need to get showToast from context
      try {
        // We'll handle this in a different way since useToast isn't available here
        // The notifications are stored and can be displayed by components that use this context
      } catch (error) {
        console.warn('Could not show toast notification:', error);
      }
    });

    // Activity events
    newSocket.on('systemActivity', (data: SystemActivityPayload) => {
      console.log('Received activity:', data);
      setActivities(prev => [data, ...prev].slice(0, 100)); // Keep last 100 activities
    });

    // Applicant update events
    newSocket.on('applicantUpdate', (data: ApplicantUpdatePayload) => {
      console.log('Applicant update:', data);
      // Handle applicant updates (could trigger refetch or UI updates)
    });

    // Screening completion events
    newSocket.on('screeningComplete', (data: ScreeningCompletePayload) => {
      console.log('Screening completed:', data);
      try {
        // We'll handle toast notifications in components that consume this context
      } catch (error) {
        console.warn('Could not show screening completion toast:', error);
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [token, userId, role]);

  const joinRoom = (room: string) => {
    socket?.emit('joinRoom', { room });
  };

  const leaveRoom = (room: string) => {
    socket?.emit('leaveRoom', { room });
  };

  const subscribeJob = (jobId: string) => {
    socket?.emit('subscribeJob', { jobId });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    activities,
    joinRoom,
    leaveRoom,
    subscribeJob,
    clearNotifications,
    markNotificationRead
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};