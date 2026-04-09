import { Router } from 'express';
import jobController from '../controllers/job.controller';
import { jobValidation } from '../controllers/job.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting management and bias detection
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - requiredSkills
 *               - experience
 *               - education
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced software engineer..."
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Node.js", "MongoDB"]
 *               experience:
 *                 type: object
 *                 properties:
 *                   minYears:
 *                     type: number
 *                     example: 5
 *                   maxYears:
 *                     type: number
 *                     example: 10
 *                   level:
 *                     type: string
 *                     enum: [entry, mid, senior, executive]
 *                     example: senior
 *               education:
 *                 type: array
 *                 description: Array of education requirements (allows multiple degrees/fields)
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                       example: "Bachelor's Degree"
 *                     field:
 *                       type: string
 *                       example: "Computer Science"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                 example:
 *                   - degree: "Bachelor's Degree"
 *                     field: "Computer Science"
 *                     required: true
 *                   - degree: "Bachelor's Degree"
 *                     field: "Software Engineering"
 *                     required: true
 *                   - degree: "Master's Degree"
 *                     field: "Information Technology"
 *                     required: false
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 100000
 *                   max:
 *                     type: number
 *                     example: 150000
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', jobValidation, jobController.createJob);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with pagination and search
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', jobController.listJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job found
 *       404:
 *         description: Job not found
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: object
 *               education:
 *                 type: object
 *     responses:
 *       200:
 *         description: Job updated
 *       404:
 *         description: Job not found
 */
router.put('/:id', jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted
 *       404:
 *         description: Job not found
 */
router.delete('/:id', jobController.deleteJob);

/**
 * @swagger
 * /api/jobs/{id}/bias:
 *   get:
 *     summary: Detect bias in job description
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Bias analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 biasAlerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       severity:
 *                         type: string
 *                       description:
 *                         type: string
 *                       suggestion:
 *                         type: string
 *       404:
 *         description: Job not found
 */
router.get('/:id/bias', jobController.detectBias);

/**
 * @swagger
 * /api/jobs/{id}/stats:
 *   get:
 *     summary: Get job screening statistics
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
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
 *                 shortlistedCount:
 *                   type: number
 *       404:
 *         description: Job not found
 */
router.get('/:id/stats', jobController.getJobStats);

export default router;
