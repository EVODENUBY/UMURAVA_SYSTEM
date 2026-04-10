import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import Job from '../models/job.model';
import aiService from '../services/ai.service';
import scoringService from '../services/scoring.service';
import { asyncHandler, createError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

// Validation rules
export const jobValidation = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('experience.minYears').isInt({ min: 0 }).withMessage('Minimum years must be a non-negative integer'),
  body('experience.level').isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('education').isArray({ min: 1 }).withMessage('At least one education requirement is required'),
  body('education.*.degree').notEmpty().withMessage('Education degree is required')
];

class JobController {
  /**
   * Create a new job posting
   */
  createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400));
    }

    const {
      title,
      description,
      requiredSkills,
      experience,
      education,
      location,
      salary
    } = req.body;

    logger.info('Creating new job', { title });

    const job = await Job.create({
      title,
      description,
      requiredSkills,
      experience,
      education,
      location,
      salary
    });

    logger.info('Job created successfully', { jobId: job._id });

    res.status(201).json({
      success: true,
      data: job
    });
  });

  /**
   * Get all jobs with pagination and search
   */
  listJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  });

  /**
   * Get a single job by ID
   */
  getJobById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return next(createError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  });

  /**
   * Update a job
   */
  updateJob = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const job = await Job.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return next(createError('Job not found', 404));
    }

    logger.info('Job updated', { jobId: id });

    res.status(200).json({
      success: true,
      data: job
    });
  });

  /**
   * Delete a job
   */
  deleteJob = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return next(createError('Job not found', 404));
    }

    logger.info('Job deleted', { jobId: id });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  });

  /**
   * Detect bias in job description
   */
  detectBias = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return next(createError('Job not found', 404));
    }

    logger.info('Running bias detection for job', { jobId: id });

    const biasAlerts = await aiService.detectBiasInJob(job);

    res.status(200).json({
      success: true,
      data: {
        jobId: job._id,
        title: job.title,
        biasAlerts,
        alertCount: biasAlerts.length,
        hasHighSeverity: biasAlerts.some(a => a.severity === 'high')
      }
    });
  });

  /**
   * Get job statistics
   */
  getJobStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const jobId = id as string;

    const job = await Job.findById(jobId);

    if (!job) {
      return next(createError('Job not found', 404));
    }

    // Use scoring service
    const stats = await scoringService.getJobStatistics(jobId);

    res.status(200).json({
      success: true,
      data: {
        jobId: job._id,
        title: job.title,
        statistics: stats
      }
    });
  });
}

const jobController = new JobController();
export default jobController;
