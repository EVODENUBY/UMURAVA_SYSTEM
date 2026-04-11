import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export interface ServerToClientEvents {
  notification: (data: NotificationPayload) => void;
  systemActivity: (data: SystemActivityPayload) => void;
  applicantUpdate: (data: ApplicantUpdatePayload) => void;
  screeningComplete: (data: ScreeningCompletePayload) => void;
  chatMessage: (data: ChatMessagePayload) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { room: string }) => void;
  leaveRoom: (data: { room: string }) => void;
  subscribeJob: (data: { jobId: string }) => void;
}

export interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  role?: string;
  createdAt: Date;
}

export interface SystemActivityPayload {
  id: string;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ApplicantUpdatePayload {
  applicantId: string;
  action: 'created' | 'updated' | 'deleted' | 'screened';
  data: Record<string, unknown>;
  jobId?: string;
  createdAt: Date;
}

export interface ScreeningCompletePayload {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  shortlistedCount: number;
  completedAt: Date;
}

export interface ChatMessagePayload {
  chatId: string;
  message: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private rooms: Map<string, Set<string>> = new Map();

  initialize(httpServer: HttpServer): void {
    if (this.io) {
      logger.warn('WebSocket server already initialized');
      return;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      path: '/socket.io',
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    logger.info('WebSocket server initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
        
        (socket as AuthenticatedSocket).userId = decoded.id;
        (socket as AuthenticatedSocket).role = decoded.role;
        
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      logger.info(`Client connected: ${socket.id}, User: ${authSocket.userId}, Role: ${authSocket.role}`);

      // Join role-based room
      if (authSocket.role) {
        socket.join(`role:${authSocket.role}`);
        this.addToRoom(`role:${authSocket.role}`, socket.id);
      }

      // Join user-specific room
      if (authSocket.userId) {
        socket.join(`user:${authSocket.userId}`);
        this.addToRoom(`user:${authSocket.userId}`, socket.id);
      }

      // Handle joining custom rooms
      socket.on('joinRoom', ({ room }: { room: string }) => {
        socket.join(room);
        this.addToRoom(room, socket.id);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      });

      // Handle leaving rooms
      socket.on('leaveRoom', ({ room }: { room: string }) => {
        socket.leave(room);
        this.removeFromRoom(room, socket.id);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      });

      // Subscribe to job notifications
      socket.on('subscribeJob', ({ jobId }: { jobId: string }) => {
        socket.join(`job:${jobId}`);
        logger.info(`Socket ${socket.id} subscribed to job: ${jobId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.removeFromAllRooms(socket.id);
      });
    });
  }

  private addToRoom(room: string, socketId: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)?.add(socketId);
  }

  private removeFromRoom(room: string, socketId: string): void {
    this.rooms.get(room)?.delete(socketId);
  }

  private removeFromAllRooms(socketId: string): void {
    for (const [room, sockets] of this.rooms.entries()) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: Omit<NotificationPayload, 'createdAt'>): void {
    if (!this.io) return;
    
    const payload: NotificationPayload = {
      ...notification,
      createdAt: new Date()
    };
    
    this.io.to(`user:${userId}`).emit('notification', payload);
    logger.info(`Notification sent to user ${userId}: ${notification.title}`);
  }

  // Send notification to all users with specific role
  sendRoleNotification(role: string, notification: Omit<NotificationPayload, 'createdAt'>): void {
    if (!this.io) return;
    
    const payload: NotificationPayload = {
      ...notification,
      createdAt: new Date()
    };
    
    this.io.to(`role:${role}`).emit('notification', payload);
    logger.info(`Notification sent to role ${role}: ${notification.title}`);
  }

  // Broadcast system activity to admins
  broadcastSystemActivity(activity: Omit<SystemActivityPayload, 'createdAt'>): void {
    if (!this.io) return;
    
    const payload: SystemActivityPayload = {
      ...activity,
      createdAt: new Date()
    };
    
    this.io.to('role:admin').emit('systemActivity', payload);
    logger.info(`System activity broadcast: ${activity.action}`);
  }

  // Notify about applicant changes
  notifyApplicantUpdate(jobId: string, update: Omit<ApplicantUpdatePayload, 'createdAt'>): void {
    if (!this.io) return;
    
    const payload: ApplicantUpdatePayload = {
      ...update,
      createdAt: new Date()
    };
    
    // Notify recruiters
    this.io.to('role:recruiter').emit('applicantUpdate', payload);
    this.io.to('role:admin').emit('applicantUpdate', payload);
    
    // Notify specific job room
    this.io.to(`job:${jobId}`).emit('applicantUpdate', payload);
    
    logger.info(`Applicant ${update.action} notification broadcasted for job ${jobId}`);
  }

  // Notify when screening is complete
  notifyScreeningComplete(jobId: string, result: Omit<ScreeningCompletePayload, 'completedAt'>): void {
    if (!this.io) return;
    
    const payload: ScreeningCompletePayload = {
      ...result,
      completedAt: new Date()
    };
    
    this.io.to('role:recruiter').emit('screeningComplete', payload);
    this.io.to('role:admin').emit('screeningComplete', payload);
    this.io.to(`job:${jobId}`).emit('screeningComplete', payload);
    
    logger.info(`Screening complete for job ${jobId}: ${result.shortlistedCount} shortlisted`);
  }

  // Send real-time chat message
  sendChatMessage(chatId: string, message: ChatMessagePayload): void {
    if (!this.io) return;
    
    this.io.to(`chat:${chatId}`).emit('chatMessage', message);
  }

  // Get connected users count
  getConnectedUsers(): number {
    if (!this.io) return 0;
    return this.io.sockets.sockets.size;
  }

  // Get room subscribers count
  getRoomSubscribers(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default new WebSocketService();