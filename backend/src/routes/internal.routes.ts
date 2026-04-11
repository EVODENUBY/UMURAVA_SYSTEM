import { Router, Request, Response, NextFunction } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import InternalApplicant from '../models/internalApplicant.model';
import TalentProfile from '../models/talentProfile.model';
import uploadMiddleware from '../middlewares/upload.middleware';
import parserService from '../services/parser.service';
import aiService from '../services/ai.service';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import fs from 'fs';

const router = Router();

/**
 * @swagger
 * /api/applicants/internal:
 *   post:
 *     summary: Apply to a job (internal applicant)
 *     tags: [Internal Applicants]
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
 *                 description: ID of the job to apply to
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Profile not complete or already applied
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { jobId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please create a complete profile first before applying to jobs' }
      });
    }

    if (!profile.profileCompletion || profile.profileCompletion.overall < 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Your profile must be at least 50% complete to apply to jobs' }
      });
    }

    const existingApplication = await InternalApplicant.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: { message: 'You have already applied to this job' }
      });
    }

    const application = await InternalApplicant.create({
      userId,
      talentProfileId: profile._id,
      jobId: jobId ? new mongoose.Types.ObjectId(jobId) : undefined,
      status: 'applied',
      appliedAt: new Date()
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error applying to job' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal:
 *   get:
 *     summary: Get all internal applicants (recruiter/admin only)
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [applied, screening, interview, offer, hired, rejected]
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of internal applicants
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter or Admin only
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, jobId } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    const applications = await InternalApplicant.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('talentProfileId')
      .populate('jobId', 'title')
      .sort({ appliedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await InternalApplicant.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error fetching applicants' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal/my-applications:
 *   get:
 *     summary: Get current user's job applications
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's applications
 *       401:
 *         description: Unauthorized
 */
router.get('/my-applications', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const applications = await InternalApplicant.find({ userId })
      .populate('jobId', 'title location status')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal/{id}:
 *   get:
 *     summary: Get internal applicant by ID
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.get('/:id', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const application = await InternalApplicant.findById(id)
      .populate('userId', 'email firstName lastName phone')
      .populate('talentProfileId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 enum: [applied, screening, interview, offer, hired, rejected]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.put('/:id/status', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    const application = await InternalApplicant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'email firstName lastName');

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error updating status' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal/upload-resume:
 *   post:
 *     summary: Upload CV/Resume for current user (internal applicant)
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
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
 *                 description: CV/Resume file to upload (use file picker or drag and drop)
 *               jobId:
 *                 type: string
 *                 description: Optional job ID to associate with the application
 *     responses:
 *       201:
 *         description: CV uploaded and application created successfully
 *       400:
 *         description: No file uploaded or profile incomplete
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/applicants/internal/{id}/cv:
 *   get:
 *     summary: View/Download CV of an internal applicant (recruiter/admin only)
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: CV file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Application or CV not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/cv', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const application = await InternalApplicant.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    if (!application.resumeFilePath) {
      return res.status(404).json({ success: false, error: { message: 'No CV uploaded for this application' } });
    }

    if (!fs.existsSync(application.resumeFilePath)) {
      return res.status(404).json({ success: false, error: { message: 'CV file not found on server' } });
    }

    const fileName = `cv-${application._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(application.resumeFilePath);
  } catch (error) {
    logger.error('Error retrieving CV:', error);
    res.status(500).json({ success: false, error: { message: 'Error retrieving CV' } });
  }
});

/**
 * @swagger
 * /api/applicants/internal/my-cv:
 *   get:
 *     summary: View/Download current user's CV
 *     tags: [Internal Applicants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No CV uploaded
 *       401:
 *         description: Unauthorized
 */
router.get('/my-cv', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const application = await InternalApplicant.findOne({ 
      userId, 
      resumeFilePath: { $exists: true, $ne: null } 
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'No CV uploaded yet' } });
    }

    if (!fs.existsSync(application.resumeFilePath!)) {
      return res.status(404).json({ success: false, error: { message: 'CV file not found on server' } });
    }

    const fileName = `my-cv-${application._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(application.resumeFilePath!);
  } catch (error) {
    logger.error('Error retrieving CV:', error);
    res.status(500).json({ success: false, error: { message: 'Error retrieving CV' } });
  }
});
router.post('/upload-resume', protect, uploadMiddleware.uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded. Please select a PDF file to upload.' } });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const { jobId } = req.body;

    logger.info('Processing resume upload', { filename: originalname, filePath, mimetype });

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ success: false, error: { message: 'File not found on server' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please create a complete profile first before uploading your CV' }
      });
    }

    const buffer = fs.readFileSync(filePath);
    
    let parsedResume;
    try {
      parsedResume = await parserService.parsePDF(buffer);
    } catch (parseError) {
      logger.error('PDF parsing error:', parseError);
      return res.status(400).json({ success: false, error: { message: 'Failed to parse PDF. Please ensure the file is a valid PDF.' } });
    }

    if (!parsedResume.text || parsedResume.text.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'PDF appears to be empty or has no extractable text.' } });
    }

    let extractedData;
    try {
      extractedData = await aiService.parseResume(parsedResume.text);
    } catch (aiError) {
      logger.error('AI extraction error:', aiError);
      return res.status(500).json({ success: false, error: { message: 'Failed to extract data from resume using AI.' } });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const extractedEmail = extractedData?.email?.trim() || '';

    if (!extractedData || !extractedEmail || !emailRegex.test(extractedEmail)) {
      logger.warn('AI did not extract valid email from resume', { extractedData, extractedEmail });
      return res.status(400).json({
        success: false,
        error: {
          message: 'Could not extract a valid email from resume. Please ensure the resume has valid contact information with a proper email address.'
        }
      });
    }

    let application;
    if (jobId && mongoose.isValidObjectId(jobId)) {
      const existingApplication = await InternalApplicant.findOne({ userId, jobId });
      if (existingApplication) {
        existingApplication.resumeText = parsedResume.text;
        existingApplication.resumeFilePath = filePath;
        await existingApplication.save();
        application = existingApplication;
      } else {
        application = await InternalApplicant.create({
          userId,
          talentProfileId: profile._id,
          jobId: new mongoose.Types.ObjectId(jobId),
          resumeText: parsedResume.text,
          resumeFilePath: filePath,
          status: 'applied',
          appliedAt: new Date(),
          source: 'portal'
        });
      }
    } else {
      application = await InternalApplicant.create({
        userId,
        talentProfileId: profile._id,
        resumeText: parsedResume.text,
        resumeFilePath: filePath,
        source: 'portal'
      });
    }

    logger.info('Resume uploaded successfully', {
      userId,
      applicationId: application._id,
      name: extractedData.name
    });

    res.status(201).json({
      success: true,
      message: jobId ? 'CV uploaded and application submitted successfully' : 'CV uploaded successfully',
      data: {
        application,
        extractedData: {
          name: extractedData.name,
          email: extractedData.email,
          skills: extractedData.skills,
          experienceYears: extractedData.experience?.years || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error processing resume upload:', error);
    res.status(500).json({ success: false, error: { message: 'Error processing resume upload' } });
  }
});

export default router;