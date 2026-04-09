import { Router } from 'express';
import applicantController from '../controllers/applicant.controller';
import { applicantValidation } from '../controllers/applicant.controller';
import { uploadSingle, uploadCSV } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Applicants
 *   description: Candidate management and resume uploads
 */

/**
 * @swagger
 * /api/applicants/upload/resume:
 *   post:
 *     summary: Upload a PDF resume
 *     tags: [Applicants]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF resume file (max 10MB)
 *     responses:
 *       201:
 *         description: Resume uploaded and parsed successfully
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
 *                     applicant:
 *                       type: object
 *                     extractedData:
 *                       type: object
 *       400:
 *         description: No file uploaded
 *       409:
 *         description: Applicant with email already exists
 */
router.post(
  '/upload/resume',
  uploadSingle,
  applicantController.uploadResume
);

/**
 * @swagger
 * /api/applicants/upload/csv:
 *   post:
 *     summary: Upload a CSV file with multiple applicants
 *     tags: [Applicants]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csv:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with applicant data
 *     responses:
 *       201:
 *         description: CSV processed successfully
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
 *                     created:
 *                       type: number
 *                     applicants:
 *                       type: array
 *                     summary:
 *                       type: object
 *       400:
 *         description: No file uploaded
 */
router.post(
  '/upload/csv',
  uploadCSV,
  applicantController.uploadCSV
);

/**
 * @swagger
 * /api/applicants:
 *   get:
 *     summary: Get all applicants with pagination and search
 *     tags: [Applicants]
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
 *         description: Search in name, email, or resume text
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by skill
 *     responses:
 *       200:
 *         description: List of applicants
 */
router.get('/', applicantController.listApplicants);

/**
 * @swagger
 * /api/applicants/{id}:
 *   get:
 *     summary: Get applicant by ID
 *     tags: [Applicants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant found
 *       404:
 *         description: Applicant not found
 */
router.get('/:id', applicantController.getApplicantById);

/**
 * @swagger
 * /api/applicants:
 *   post:
 *     summary: Create applicant manually
 *     tags: [Applicants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - resumeText
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1 234 567 890"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js"]
 *               experience:
 *                 type: object
 *                 properties:
 *                   years:
 *                     type: number
 *                     example: 5
 *                   currentRole:
 *                     type: string
 *                     example: "Senior Developer"
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *               resumeText:
 *                 type: string
 *                 example: "Experienced software developer with 5 years..."
 *     responses:
 *       201:
 *         description: Applicant created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/', applicantValidation, applicantController.createApplicant);

/**
 * @swagger
 * /api/applicants/{id}:
 *   put:
 *     summary: Update an applicant
 *     tags: [Applicants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: object
 *               education:
 *                 type: array
 *     responses:
 *       200:
 *         description: Applicant updated
 *       404:
 *         description: Applicant not found
 */
router.put('/:id', applicantController.updateApplicant);

/**
 * @swagger
 * /api/applicants/{id}:
 *   delete:
 *     summary: Delete an applicant
 *     tags: [Applicants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant deleted
 *       404:
 *         description: Applicant not found
 */
router.delete('/:id', applicantController.deleteApplicant);

export default router;
