import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import { chatValidation } from '../controllers/chat.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI-powered recruiter assistant and recommendations
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the AI recruiter assistant
 *     tags: [Chat]
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
 *                 example: "Who are the top 3 candidates for this role?"
 *               jobId:
 *                 type: string
 *                 description: Optional job context
 *                 example: "507f1f77bcf86cd799439011"
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional candidate context
 *               context:
 *                 type: object
 *                 description: Additional context for the AI
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     response:
 *                       type: string
 *                     context:
 *                       type: object
 *       404:
 *         description: Job not found
 */
router.post('/', chatValidation, chatController.chat);

/**
 * @swagger
 * /api/chat/recommendations:
 *   post:
 *     summary: Get candidate recommendations
 *     tags: [Chat]
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
 *                 example: "507f1f77bcf86cd799439011"
 *               criteria:
 *                 type: string
 *                 description: Recommendation criteria (overall, skills, experience, etc.)
 *                 example: "overall"
 *     responses:
 *       200:
 *         description: Candidate recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     criteria:
 *                       type: string
 *                     recommendation:
 *                       type: string
 *                     topCandidates:
 *                       type: array
 *       404:
 *         description: Job not found or no screened candidates
 */
router.post('/recommendations', chatController.getRecommendations);

/**
 * @swagger
 * /api/chat/explain/{jobId}/{applicantId}:
 *   get:
 *     summary: Get AI explanation for a screening decision
 *     tags: [Chat]
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
 *         description: Detailed explanation of screening decision
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     applicantId:
 *                       type: string
 *                     applicantName:
 *                       type: string
 *                     score:
 *                       type: number
 *                     explanation:
 *                       type: string
 *                     reasoning:
 *                       type: string
 *       404:
 *         description: Job, applicant, or result not found
 */
router.get('/explain/:jobId/:applicantId', chatController.explainDecision);

/**
 * @swagger
 * /api/chat/analyze/{jobId}:
 *   get:
 *     summary: Analyze job description for improvements
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job description analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     analysis:
 *                       type: string
 *       404:
 *         description: Job not found
 */
router.get('/analyze/:jobId', chatController.analyzeJob);

/**
 * @swagger
 * /api/chat/questions/{jobId}/{applicantId}:
 *   get:
 *     summary: Get suggested interview questions
 *     tags: [Chat]
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
 *         description: Suggested interview questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     applicantId:
 *                       type: string
 *                     applicantName:
 *                       type: string
 *                     suggestedQuestions:
 *                       type: string
 *       404:
 *         description: Job or applicant not found
 */
router.get('/questions/:jobId/:applicantId', chatController.suggestInterviewQuestions);

export default router;
