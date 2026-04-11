import { Request, Response } from 'express';
import websocketService from '../services/websocket.service';
import logger from '../utils/logger';

class SystemController {
  /**
   * Get WebSocket connection info
   */
  getWsInfo = (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        connectedUsers: websocketService.getConnectedUsers(),
        wsPath: '/socket.io',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
      }
    });
  };

  /**
   * Send test notification to current user
   */
  sendTestNotification = async (req: Request, res: Response) => {
    const { userId, title, message, type } = req.body;
    const currentUserId = (req as any).user?.id;
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: { message: 'User ID required' } });
    }

    websocketService.sendNotification(targetUserId, {
      id: `test-${Date.now()}`,
      type: type || 'info',
      title: title || 'Test Notification',
      message: message || 'This is a test notification'
    });

    res.json({ success: true, message: 'Notification sent' });
  };

  /**
   * Broadcast test system activity
   */
  broadcastTestActivity = async (req: Request, res: Response) => {
    const { action, description } = req.body;
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.firstName || 'Admin';

    websocketService.broadcastSystemActivity({
      id: `activity-${Date.now()}`,
      action: action || 'test_action',
      description: description || 'Test system activity',
      userId,
      userName
    });

    res.json({ success: true, message: 'Activity broadcasted' });
  };

  /**
   * Test screening complete notification
   */
  testScreeningComplete = async (req: Request, res: Response) => {
    const { jobId, jobTitle, totalCandidates, shortlistedCount } = req.body;

    websocketService.notifyScreeningComplete(jobId, {
      jobId,
      jobTitle: jobTitle || 'Test Job',
      totalCandidates: totalCandidates || 10,
      shortlistedCount: shortlistedCount || 3
    });

    res.json({ success: true, message: 'Screening notification broadcasted' });
  };
}

export default new SystemController();