import { Router, Request, Response, NextFunction } from 'express';
import chatController from '../controllers/chat.controller';
import { chatValidation } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send message to AI chatbot
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message to send to AI
 *               jobId:
 *                 type: string
 *                 description: Optional job context
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional candidate IDs for context
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/message', protect, chatValidation, chatController.chat);

/**
 * @swagger
 * /api/chat/recommendations:
 *   post:
 *     summary: Get candidate recommendations for a job
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *               criteria:
 *                 type: string
 *                 description: Recommendation criteria (overall, skills, experience)
 *     responses:
 *       200:
 *         description: Candidate recommendations
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job or candidates not found
 */
router.post('/recommendations', protect, chatController.getRecommendations);

/**
 * @swagger
 * /api/chat/explain/{jobId}/{applicantId}:
 *   get:
 *     summary: Get AI explanation for screening decision
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed explanation
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/explain/:jobId/:applicantId', protect, chatController.explainDecision);

/**
 * @swagger
 * /api/chat/analyze/{jobId}:
 *   get:
 *     summary: Analyze job description for improvements
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job analysis
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get('/analyze/:jobId', protect, chatController.analyzeJob);

/**
 * @swagger
 * /api/chat/questions/{jobId}/{applicantId}:
 *   get:
 *     summary: Get suggested interview questions
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview questions
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/questions/:jobId/:applicantId', protect, chatController.suggestInterviewQuestions);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get all chat sessions for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat sessions
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, chatController.getChats);

/**
 * @swagger
 * /api/chat/{chatId}:
 *   get:
 *     summary: Get specific chat with messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat with messages
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.get('/:chatId', protect, chatController.getChatById);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Create new chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, chatController.createChat);

/**
 * @swagger
 * /api/chat/{chatId}:
 *   delete:
 *     summary: Delete chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.delete('/:chatId', protect, chatController.deleteChat);

export default router;