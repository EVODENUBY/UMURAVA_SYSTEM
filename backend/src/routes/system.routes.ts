import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import systemController from '../controllers/system.controller';

const router = Router();

/**
 * @swagger
 * /api/system/ws-info:
 *   get:
 *     summary: Get WebSocket connection info
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebSocket info
 */
router.get('/ws-info', protect, systemController.getWsInfo);

/**
 * @swagger
 * /api/system/test-notification:
 *   post:
 *     summary: Send test notification
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post('/test-notification', protect, authorize('admin', 'recruiter'), systemController.sendTestNotification);

/**
 * @swagger
 * /api/system/test-activity:
 *   post:
 *     summary: Broadcast test system activity
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity broadcasted
 */
router.post('/test-activity', protect, authorize('admin'), systemController.broadcastTestActivity);

/**
 * @swagger
 * /api/system/test-screening:
 *   post:
 *     summary: Test screening complete notification
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post('/test-screening', protect, authorize('admin'), systemController.testScreeningComplete);

export default router;