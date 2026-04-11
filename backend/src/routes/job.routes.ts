import { Router } from 'express';
import jobController from '../controllers/job.controller';
import { jobValidation } from '../controllers/job.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all published jobs (public - no auth required)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of published jobs
 */
router.get('/', jobController.listJobs);

/**
 * @swagger
 * /api/jobs/all:
 *   get:
 *     summary: Get all jobs including drafts (recruiter/admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed, archived]
 *     responses:
 *       200:
 *         description: List of all jobs
 *       401:
 *         description: Unauthorized
 */
router.get('/all', protect, authorize('recruiter', 'admin'), jobController.listAllJobs);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting (recruiter/admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced software engineer..."
 *               employmentType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, freelance]
 *                 default: full-time
 *               jobLevel:
 *                 type: string
 *                 enum: [entry, mid, senior, lead, executive]
 *                 default: mid
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Node.js", "MongoDB"]
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Design scalable systems", "Mentor junior devs"]
 *               experience:
 *                 type: string
 *                 example: "5+ years"
 *               education:
 *                 type: array
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
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   address: { type: string }
 *                   city: { type: string }
 *                   country: { type: string }
 *                   remote: { type: boolean }
 *               salary:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicationProcess:
 *                 type: object
 *                 properties:
 *                   steps:
 *                     type: array
 *                     items:
 *                       type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [draft, published, closed, archived]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter or Admin only
 */
router.post('/', protect, authorize('recruiter', 'admin'), jobValidation, jobController.createJob);

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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.put('/:id', protect, authorize('recruiter', 'admin'), jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.delete('/:id', protect, authorize('recruiter', 'admin'), jobController.deleteJob);

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
