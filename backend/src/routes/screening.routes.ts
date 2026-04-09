import { Router } from 'express';
import screeningController from '../controllers/screening.controller';
import { screeningValidation } from '../controllers/screening.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Screening
 *   description: AI-powered candidate screening and evaluation
 */

/**
 * @swagger
 * /api/screening/run:
 *   post:
 *     summary: Run AI screening for a job
 *     tags: [Screening]
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
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional list of applicant IDs to screen (screens all if not provided)
 *               threshold:
 *                 type: number
 *                 default: 50
 *                 description: Minimum score threshold
 *               autoShortlist:
 *                 type: boolean
 *                 default: true
 *                 description: Automatically shortlist high-scoring candidates
 *     responses:
 *       200:
 *         description: Screening completed successfully
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
 *                     summary:
 *                       type: string
 *                     topCandidates:
 *                       type: array
 *                     biasAlerts:
 *                       type: array
 *                     statistics:
 *                       type: object
 *       404:
 *         description: Job not found
 *       400:
 *         description: No applicants found to screen
 */
router.post('/run', screeningValidation, screeningController.runScreening);

/**
 * @swagger
 * /api/screening/results/{jobId}:
 *   get:
 *     summary: Get screening results for a job
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shortlisted, rejected, interview]
 *     responses:
 *       200:
 *         description: Screening results
 *       404:
 *         description: Job not found
 */
router.get('/results/:jobId', screeningController.getScreeningResults);

/**
 * @swagger
 * /api/screening/result/{jobId}/{applicantId}:
 *   get:
 *     summary: Get detailed result for a specific candidate
 *     tags: [Screening]
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
 *         description: Candidate screening result with percentile
 *       404:
 *         description: Result not found
 */
router.get('/result/:jobId/:applicantId', screeningController.getCandidateResult);

/**
 * @swagger
 * /api/screening/status/{jobId}/{applicantId}:
 *   put:
 *     summary: Update candidate status
 *     tags: [Screening]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shortlisted, rejected, interview]
 *                 example: shortlisted
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Result not found
 */
router.put('/status/:jobId/:applicantId', screeningController.updateStatus);

/**
 * @swagger
 * /api/screening/compare/{jobId}:
 *   post:
 *     summary: Compare multiple candidates
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicantIds
 *             properties:
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 2
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Comparison results
 *       400:
 *         description: Need at least 2 applicant IDs
 *       404:
 *         description: No results found
 */
router.post('/compare/:jobId', screeningController.compareCandidates);

/**
 * @swagger
 * /api/screening/stats/{jobId}:
 *   get:
 *     summary: Get screening statistics
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCandidates:
 *                   type: number
 *                 averageScore:
 *                   type: number
 *                 highestScore:
 *                   type: number
 *                 lowestScore:
 *                   type: number
 *                 shortlistedCount:
 *                   type: number
 *                 rejectedCount:
 *                   type: number
 *                 biasAlertCount:
 *                   type: number
 *       404:
 *         description: Job not found
 */
router.get('/stats/:jobId', screeningController.getStatistics);

/**
 * @swagger
 * /api/screening/rerun/{jobId}:
 *   post:
 *     summary: Re-run screening for a job
 *     tags: [Screening]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening re-run successfully
 *       400:
 *         description: No applicants found
 *       404:
 *         description: Job not found
 */
router.post('/rerun/:jobId', screeningController.reRunScreening);

export default router;
