import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import Job from '../models/job.model';
import InternalApplicant from '../models/internalApplicant.model';
import ExternalApplicant from '../models/externalApplicant.model';
import Result from '../models/result.model';
import Applicant from '../models/applicant.model';

const router = Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get dashboard analytics (recruiter/admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *         description: Filter by specific job
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter or Admin only
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;

    const jobQuery = jobId ? { _id: new mongoose.Types.ObjectId(jobId as string) } : {};
    const jobs = await Job.find(jobQuery).select('_id title status');

    const jobIds = jobs.map((j: any) => j._id);

    const [
      totalJobs,
      totalInternalApplicants,
      totalExternalApplicants,
      totalScreened,
      statusBreakdown
    ] = await Promise.all([
      Job.countDocuments({}),
      InternalApplicant.countDocuments(jobId ? { jobId: { $in: jobIds } } : {}),
      ExternalApplicant.countDocuments(jobId ? { jobId: { $in: jobIds } } : {}),
      Result.countDocuments(jobId ? { jobId: { $in: jobIds } } : {}),
      Result.aggregate([
        { $match: jobId ? { jobId: { $in: jobIds } } : {} },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const averageScore = await Result.aggregate([
      { $match: jobId ? { jobId: { $in: jobIds } } : {} },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          totalApplicants: totalInternalApplicants + totalExternalApplicants,
          totalInternalApplicants,
          totalExternalApplicants,
          totalScreened
        },
        averageScore: averageScore[0]?.avgScore ? Math.round(averageScore[0].avgScore) : 0,
        statusBreakdown: statusBreakdown.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        jobs: jobs.map((j: any) => ({
          _id: j._id,
          title: j.title,
          status: j.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error fetching analytics' } });
  }
});

/**
 * @swagger
 * /api/analytics/jobs/{jobId}:
 *   get:
 *     summary: Get analytics for specific job
 *     tags: [Analytics]
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
 *         description: Job-specific analytics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:jobId', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid job ID' } });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: { message: 'Job not found' } });
    }

    const [
      internalCount,
      externalCount,
      screeningResults,
      rankedCandidates
    ] = await Promise.all([
      InternalApplicant.countDocuments({ jobId }),
      ExternalApplicant.countDocuments({ jobId }),
      Result.find({ jobId }).sort({ score: -1 }).limit(20),
      Result.find({ jobId, ranking: { $exists: true } }).sort({ ranking: 1 }).limit(10)
    ]);

    const scoreDistribution = await Result.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 25, 50, 75, 100],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        job: { _id: job._id, title: job.title, status: job.status },
        applicants: {
          total: internalCount + externalCount,
          internal: internalCount,
          external: externalCount
        },
        screeningResults,
        rankedCandidates,
        scoreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/analytics/applicants/{applicantId}:
 *   get:
 *     summary: Get applicant screening analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant analytics
 *       401:
 *         description: Unauthorized
 */
router.get('/applicants/:applicantId', protect, async (req: Request, res: Response) => {
  try {
    const { applicantId } = req.params;

    if (!mongoose.isValidObjectId(applicantId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid applicant ID' } });
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant not found' } });
    }

    const results = await Result.find({ applicantId }).populate('jobId', 'title');

    res.json({
      success: true,
      data: {
        applicant: {
          _id: applicant._id,
          name: (applicant as any).name,
          email: (applicant as any).email
        },
        screeningResults: results
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

export default router;