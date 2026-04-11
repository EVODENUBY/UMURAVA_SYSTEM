import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/job.model';
import ExternalApplicant from '../models/externalApplicant.model';
import InternalApplicant from '../models/internalApplicant.model';
import Applicant from '../models/applicant.model';
import Result from '../models/result.model';
import aiService from '../services/ai.service';
import scoringService from '../services/scoring.service';
import { asyncHandler, createError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

// Validation rules
export const screeningValidation = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('threshold').optional().isInt({ min: 0, max: 100 }).withMessage('Threshold must be between 0 and 100')
];

class ScreeningController {
  /**
   * Run AI screening for a job
   */
  runScreening = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400));
    }

    const { jobId, threshold = 0, autoShortlist = true } = req.body;

    logger.info('Starting screening process', { jobId });

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    // Get ALL applicants who applied to this job (external + internal)
    const [externalApplicants, internalApplicants] = await Promise.all([
      ExternalApplicant.find({ jobId }),
      InternalApplicant.find({ jobId })
    ]);

    // Convert to Applicant format for screening
    const combinedApplicants = [
      ...externalApplicants.map(ext => ({
        _id: ext._id,
        name: ext.name,
        email: ext.email,
        phone: ext.phone,
        skills: ext.skills,
        experience: ext.experience,
        education: ext.education,
        resumeText: ext.resumeText,
          resumeFilePath: ext.resumeFilePath,
          source: ext.source
        })),
        ...internalApplicants.map(int => ({
          _id: int._id,
          name: 'Internal Applicant',
          email: 'internal@example.com',
          phone: int.userId?.toString(),
          skills: [],
          experience: { years: 0 },
          education: [],
          resumeText: int.resumeText || '',
          resumeFilePath: int.resumeFilePath,
          source: 'manual' as const
        }))
      ];

      logger.info(`Found ${externalApplicants.length} external + ${internalApplicants.length} internal applicants for job ${jobId}`);

    if (combinedApplicants.length === 0) {
      return next(createError('No applicants found for this job', 400));
    }

    logger.info(`Screening ${combinedApplicants.length} applicants for job ${jobId}`);

    // Run AI screening (cast to any to avoid type issues with combined format)
    const screeningResult = await aiService.screenCandidates(job, combinedApplicants as any);

    // Rank candidates
    const rankedCandidates = scoringService.rankCandidates(
      screeningResult.evaluations,
      {
        threshold,
        autoShortlist,
        shortlistThreshold: 75
      }
    );

    // Save results to database
    const savedResults = await scoringService.saveResults(
      jobId,
      rankedCandidates,
      screeningResult.biasAlerts
    );

    // Get top 20 candidates with full details including strengths, gaps, reasoning
    const topCandidates = await Promise.all(
      rankedCandidates.slice(0, 20).map(async (candidate) => {
        // Try to find in external applicants first, then internal
        let externalApp = await ExternalApplicant.findById(candidate.candidateId)
          .select('name email phone skills skillDetails experience education languages resumeText resumeLink');
        
        let applicantData: any = null;
        
        if (externalApp) {
          applicantData = {
            name: externalApp.name,
            email: externalApp.email,
            phone: externalApp.phone,
            skills: externalApp.skills || [],
            skillDetails: (externalApp as any).skillDetails || [],
            experience: externalApp.experience,
            education: externalApp.education || [],
            languages: (externalApp as any).languages || [],
            resumeText: (externalApp as any).resumeText,
            resumeLink: (externalApp as any).resumeLink
          };
        } else {
          const internalApp = await InternalApplicant.findById(candidate.candidateId)
            .populate('userId', 'firstName lastName email');
          if (internalApp) {
            applicantData = {
              name: (internalApp as any).userId?.firstName + ' ' + (internalApp as any).userId?.lastName,
              email: (internalApp as any).userId?.email,
              phone: '',
              skills: [],
              experience: { years: 0 },
              education: [],
              languages: [],
              resumeText: (internalApp as any).resumeText,
              resumeLink: ''
            };
          }
        }
        
        return {
          candidateId: candidate.candidateId,
          score: candidate.score,
          strengths: candidate.strengths || [],
          gaps: candidate.gaps || [],
          reasoning: candidate.reasoning || '',
          matchDetails: candidate.matchDetails || {},
          ranking: candidate.ranking,
          status: candidate.status,
          recommendation: candidate.score >= 75 ? 'Strong Hire' : candidate.score >= 60 ? 'Consider' : 'Pass',
          applicant: applicantData
        };
      })
    );

    // Build detailed rankings with full candidate info
    const allRankingsWithDetails = await Promise.all(
      rankedCandidates.slice(0, 50).map(async (candidate) => {
        let externalApp = await ExternalApplicant.findById(candidate.candidateId)
          .select('name email phone skills experience education');
        
        let name = 'Unknown';
        let email = '';
        
        if (externalApp) {
          name = externalApp.name || 'Unknown';
          email = externalApp.email || '';
        } else {
          const internalApp = await InternalApplicant.findById(candidate.candidateId)
            .populate('userId', 'firstName lastName email');
          if (internalApp) {
            name = (internalApp as any).userId?.firstName + ' ' + (internalApp as any).userId?.lastName || 'Unknown';
            email = (internalApp as any).userId?.email || '';
          }
        }
        
        return {
          candidateId: candidate.candidateId,
          name,
          email,
          score: candidate.score,
          ranking: candidate.ranking,
          status: candidate.status,
          recommendation: candidate.score >= 75 ? 'Strong Hire' : candidate.score >= 60 ? 'Consider' : 'Pass',
          strengths: candidate.strengths || [],
          gaps: candidate.gaps || [],
          reasoning: candidate.reasoning || '',
          matchDetails: candidate.matchDetails || {}
        };
      })
    );

    logger.info('Screening completed successfully', { 
      jobId,
      evaluated: rankedCandidates.length,
      saved: savedResults.length
    });

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        summary: screeningResult.summary,
        topCandidates,
        allRankings: allRankingsWithDetails,
        shortlistedCandidates: rankedCandidates.filter(c => c.status === 'shortlisted' || c.status === 'interview').map(c => ({
          candidateId: c.candidateId,
          score: c.score,
          ranking: c.ranking,
          status: c.status
        })),
        totalEvaluated: rankedCandidates.length,
        biasAlerts: screeningResult.biasAlerts,
        biasAlertCount: screeningResult.biasAlerts.length,
        statistics: {
          averageScore: Math.round(
            rankedCandidates.reduce((sum, c) => sum + c.score, 0) / rankedCandidates.length
          ),
          highestScore: Math.max(...rankedCandidates.map(c => c.score)),
          lowestScore: Math.min(...rankedCandidates.map(c => c.score)),
          shortlisted: rankedCandidates.filter(c => c.status === 'shortlisted').length,
          rejected: rankedCandidates.filter(c => c.status === 'rejected').length,
          pending: rankedCandidates.filter(c => c.status === 'pending').length,
          interview: rankedCandidates.filter(c => c.status === 'interview').length
        }
      }
    });
  });

  /**
   * Get screening results for a job
   */
  getScreeningResults = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    // Build query
    let query: Record<string, unknown> = { jobId };
    if (status) {
      query.status = status;
    }

    const [results, total] = await Promise.all([
      Result.find(query)
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .populate('applicantId', 'name email skills experience education')
        .exec(),
      Result.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        results,
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
   * Get shortlisted candidates for a job
   */
  getShortlistedCandidates = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    const [results, total] = await Promise.all([
      Result.find({ jobId, status: { $in: ['shortlisted', 'interview'] } })
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .populate('applicantId', 'name email skills experience education')
        .exec(),
      Result.countDocuments({ jobId, status: { $in: ['shortlisted', 'interview'] } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        shortlistedCount: total,
        results,
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
   * Get detailed result for a specific candidate
   */
  getCandidateResult = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId, applicantId } = req.params;

    const result = await Result.findOne({ jobId, applicantId })
      .populate('applicantId', 'name email phone skills experience education resumeText')
      .populate('jobId', 'title description requiredSkills experience education');

    if (!result) {
      return next(createError('Screening result not found', 404));
    }

    // Calculate percentile
    const allScores = await Result.find({ jobId }).select('score');
    const scores = allScores.map((r: any) => r.score);
    const percentile = scoringService.calculatePercentile(result.score, scores);

    res.status(200).json({
      success: true,
      data: {
        result,
        percentile,
        totalCandidates: scores.length
      }
    });
  });

  /**
   * Update candidate status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId, applicantId } = req.params;
    const jId = jobId as string;
    const aId = applicantId as string;
    const { status } = req.body;

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'interview'];
    if (!validStatuses.includes(status)) {
      return next(createError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const result = await scoringService.updateCandidateStatus(jId, aId, status);

    if (!result) {
      return next(createError('Screening result not found', 404));
    }

    logger.info('Candidate status updated', { jobId, applicantId, status });

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Compare multiple candidates
   */
  compareCandidates = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;
    const { applicantIds } = req.body;

    if (!applicantIds || !Array.isArray(applicantIds) || applicantIds.length < 2) {
      return next(createError('At least 2 applicant IDs are required for comparison', 400));
    }

    // Get results for specified applicants
    const results = await Result.find({
      jobId,
      applicantId: { $in: applicantIds }
    }).populate('applicantId', 'name email skills');

    if (results.length === 0) {
      return next(createError('No screening results found for the specified applicants', 404));
    }

    // Transform to evaluation format for comparison
    const evaluations = results.map((r: any) => ({
      candidateId: r.applicantId._id.toString(),
      score: r.score,
      strengths: r.strengths,
      gaps: r.gaps,
      reasoning: r.reasoning,
      matchDetails: r.matchDetails
    }));

    const comparison = scoringService.compareCandidates(evaluations);

    res.status(200).json({
      success: true,
      data: {
        jobId,
        comparison: comparison.comparison,
        bestOverall: comparison.bestOverall,
        bestSkills: comparison.bestSkills,
        bestExperience: comparison.bestExperience,
        bestEducation: comparison.bestEducation,
        detailedResults: results
      }
    });
  });

  /**
   * Get screening statistics
   */
  getStatistics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;
    const jId = jobId as string;

    const job = await Job.findById(jId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    const stats = await scoringService.getJobStatistics(jId);

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        statistics: stats
      }
    });
  });

  /**
   * Re-run screening for a job
   */
  reRunScreening = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;
    const jId = jobId as string;

    const job = await Job.findById(jId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    // Get all applicants that have results for this job
    const existingResults = await Result.find({ jobId: jId });
    const applicantIds = existingResults.map((r: any) => r.applicantId.toString());

    // Get fresh applicant data
    const applicants = await Applicant.find({
      _id: { $in: applicantIds }
    });

    if (applicants.length === 0) {
      return next(createError('No applicants found to re-screen', 400));
    }

    logger.info(`Re-running screening for job ${jId} with ${applicants.length} candidates`);

    // Clear existing results
    await Result.deleteMany({ jobId: jId });

    // Run new screening
    const screeningResult = await aiService.screenCandidates(job, applicants);

    // Rank and save
    const rankedCandidates = scoringService.rankCandidates(
      screeningResult.evaluations,
      { autoShortlist: true }
    );

    await scoringService.saveResults(jId, rankedCandidates, screeningResult.biasAlerts);

    res.status(200).json({
      success: true,
      message: 'Screening re-run successfully',
      data: {
        jobId,
        totalEvaluated: rankedCandidates.length,
        biasAlerts: screeningResult.biasAlerts
      }
    });
  });
}

const screeningController = new ScreeningController();
export default screeningController;
