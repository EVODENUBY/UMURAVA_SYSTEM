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
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill is required')
];

class JobController {
  /**
   * Create a new job posting (recruiter/admin only)
   */
  createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400));
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    const {
      title,
      description,
      requiredSkills,
      experience,
      status,
      applicationDeadline,
      expirationDate
    } = req.body;

    logger.info('Creating new job', { title });

    const jobStatus = status || 'draft';
    const postedDate = jobStatus === 'published' ? new Date() : undefined;

    const job = await Job.create({
      title,
      description,
      employmentType: req.body.employmentType,
      jobLevel: req.body.jobLevel,
      requiredSkills,
      responsibilities: req.body.responsibilities,
      experience,
      education: req.body.education || [],
      certifications: req.body.certifications || [],
      languages: req.body.languages || [],
      location: req.body.location,
      salary: req.body.salary ?? null,
      benefits: req.body.benefits || [],
      applicationProcess: req.body.applicationProcess,
      tags: req.body.tags || [],
      createdBy: userId,
      status: jobStatus,
      applicationDeadline,
      expirationDate,
      postedDate
    });

    logger.info('Job created successfully', { jobId: job._id });

    res.status(201).json({
      success: true,
      data: job
    });
  });

  /**
   * Get all published jobs with pagination and search (public - no auth required)
   */
  listJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Only show published jobs to public (exclude analytics)
    const query: Record<string, unknown> = { status: 'published' };
    if (search) {
      query.$and = [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select('-analytics')
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
   * Get all jobs for recruiter/admin (includes drafts)
   */
  listAllJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query)
    ]);

    // Add fullName to populated createdBy
    const jobsWithFullName = jobs.map((job: any) => {
      if (job.createdBy && typeof job.createdBy === 'object') {
        job.createdBy.fullName = `${job.createdBy.firstName || ''} ${job.createdBy.lastName || ''}`.trim();
      }
      return job;
    });

    res.status(200).json({
      success: true,
      data: {
        jobs: jobsWithFullName,
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
   * Get a single job by ID (public - exclude analytics)
   */
  getJobById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const job = await Job.findById(id).select('-analytics');

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
    const { status, ...updateData } = req.body;

    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return next(createError('Job not found', 404));
    }

    const updateFields: Record<string, unknown> = { ...updateData };
    
    if (status === 'published' && existingJob.status !== 'published') {
      updateFields.postedDate = new Date();
    }

    const job = await Job.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

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
