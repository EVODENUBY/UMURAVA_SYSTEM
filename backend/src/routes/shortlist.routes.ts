import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import Result from '../models/result.model';
import InternalApplicant from '../models/internalApplicant.model';
import ExternalApplicant from '../models/externalApplicant.model';
import Job from '../models/job.model';

interface ApplicantInfo {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  skills: string[];
  experience?: any;
  education?: any[];
}

async function getApplicantInfo(applicantId: mongoose.Types.ObjectId): Promise<ApplicantInfo | null> {
  const externalApp = await ExternalApplicant.findById(applicantId).select('name email skills experience education');
  if (externalApp) {
    return {
      _id: externalApp._id,
      name: externalApp.name || 'Unknown',
      email: externalApp.email || '',
      skills: externalApp.skills || [],
      experience: externalApp.experience,
      education: externalApp.education
    };
  }

  const internalApp = await InternalApplicant.findById(applicantId)
    .populate('userId', 'firstName lastName email')
    .populate('talentProfileId', 'skills experience education');
  if (internalApp) {
    const user = (internalApp as any).userId;
    const talentProfile = (internalApp as any).talentProfileId;
    return {
      _id: internalApp._id,
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
      email: user?.email || '',
      skills: talentProfile?.skills || [],
      experience: talentProfile?.experience,
      education: talentProfile?.education
    };
  }

  return null;
}

const router = Router();

/**
 * @swagger
 * /api/shortlist:
 *   get:
 *     summary: Get all shortlisted candidates across all jobs with explanations
 *     tags: [Shortlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *         description: Filter by specific job
 *       - in: query
 *         name: includeReasons
 *         schema:
 *           type: boolean
 *         description: Include detailed reasons for shortlisting, defaults to true
 *     responses:
 *       200:
 *         description: List of shortlisted candidates
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter or Admin only
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { jobId, includeReasons } = req.query;
    const showReasons = includeReasons !== 'false';

    const query: any = {};
    if (jobId && mongoose.isValidObjectId(jobId)) {
      query.jobId = jobId;
      query.status = { $in: ['shortlisted', 'interview', 'offer'] };
    }

    const results = await Result.find(query)
      .populate('jobId', 'title requiredSkills experience')
      .sort({ score: -1, ranking: 1 });

    const allCandidates = await Promise.all(results.map(async (r, idx: number) => {
      const job = r.jobId as any;
      const applicantInfo = await getApplicantInfo(r.applicantId as mongoose.Types.ObjectId);

      return {
        _id: r._id,
        jobId: job?._id,
        jobTitle: job?.title,
        applicantId: r.applicantId,
        applicantName: applicantInfo?.name || 'Unknown',
        applicantEmail: applicantInfo?.email || '',
        applicantSkills: (applicantInfo?.skills || []).map((s: any) => s.name || s),
        score: r.score,
        ranking: idx + 1,
        status: r.status,
        matchDetails: r.matchDetails,
        strengths: showReasons ? r.strengths : undefined,
        gaps: showReasons ? r.gaps : undefined,
        reasoning: showReasons ? r.reasoning : undefined,
        biasAlerts: showReasons ? r.biasAlerts : undefined,
        createdAt: r.createdAt
      };
    }));

    const scores = allCandidates.map(c => c.score);
    const stats = {
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      total: allCandidates.length
    };

    res.json({ success: true, data: allCandidates, statistics: stats });
  } catch (error: any) {
    const errorMessage = error?.message || '';
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too many requests') || errorMessage.includes('quota')) {
      res.status(429).json({ success: false, error: { message: 'Model is busy due to high demand. Please try again in a few moments.' } });
    } else {
      res.status(500).json({ success: false, error: { message: 'Server error. Please try again.' } });
    }
  }
});
 

/**
 * @swagger
 * /api/shortlist/jobs/{jobId}:
 *   get:
 *     summary: Get shortlisted candidates for a specific job with detailed reasons
 *     tags: [Shortlist]
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
 *         description: Shortlisted candidates for the job
 *       401:
 *         description: Unauthorized
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

    const results = await Result.find({ jobId })
      .populate('jobId', 'title')
      .sort({ score: -1, ranking: 1 });

    const shortlistedCandidates: any[] = [];
    const nonShortlistedCandidates: any[] = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const applicantInfo = await getApplicantInfo(r.applicantId as mongoose.Types.ObjectId);

      const candidateData = {
        _id: r._id,
        applicantId: r.applicantId,
        applicantName: applicantInfo?.name || 'Unknown',
        applicantEmail: applicantInfo?.email || '',
        applicantSkills: (applicantInfo?.skills || []).map((s: any) => s.name || s),
        jobId: r.jobId,
        jobTitle: job.title,
        score: r.score,
        ranking: i + 1,
        status: r.status,
        strengths: r.strengths,
        gaps: r.gaps,
        reasoning: r.reasoning,
        matchDetails: r.matchDetails,
        recommendation: r.score >= 80 ? 'Strong Hire' : r.score >= 60 ? 'Consider' : 'Borderline',
        createdAt: r.createdAt
      };

      if (['shortlisted', 'interview', 'offer'].includes(r.status)) {
        shortlistedCandidates.push(candidateData);
      } else {
        nonShortlistedCandidates.push(candidateData);
      }
    }

    const allCandidates = [...shortlistedCandidates, ...nonShortlistedCandidates];
    const scores = results.map(r => r.score);

    res.json({
      success: true,
      data: {
        job: { _id: job._id, title: job.title },
        shortlisted: shortlistedCandidates,
        nonShortlisted: nonShortlistedCandidates,
        allCandidates,
        total: allCandidates.length,
        statistics: {
          highestScore: scores.length > 0 ? Math.max(...scores) : 0,
          lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
          averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          total: allCandidates.length,
          shortlistedCount: shortlistedCandidates.length,
          nonShortlistedCount: nonShortlistedCandidates.length
        }
      }
    });
  } catch (error: any) {
    const errorMessage = error?.message || '';
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too many requests') || errorMessage.includes('quota')) {
      res.status(429).json({ 
        success: false, 
        error: { message: 'Model is busy due to high demand. Please try again in a few moments.' } 
      });
    } else {
      res.status(500).json({ success: false, error: { message: 'Server error. Please try again.' } });
    }
  }
});

/**
 * @swagger
 * /api/shortlist/compare:
 *   post:
 *     summary: Compare multiple candidates side-by-side
 *     tags: [Shortlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comparison matrix
 *       401:
 *         description: Unauthorized
 */
router.post('/compare', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { applicantIds, jobId } = req.body;

    if (!applicantIds || !Array.isArray(applicantIds) || applicantIds.length < 2) {
      return res.status(400).json({ success: false, error: { message: 'Provide at least 2 applicant IDs' } });
    }

    const query: any = { applicantId: { $in: applicantIds } };
    if (jobId) query.jobId = jobId;

    const results = await Result.find(query)
      .populate('applicantId', 'name email skills experience education')
      .populate('jobId', 'title');

    const comparison = results.map(r => ({
      _id: r._id,
      name: (r.applicantId as any)?.name,
      email: (r.applicantId as any)?.email,
      skills: (r.applicantId as any)?.skills,
      experience: (r.applicantId as any)?.experience,
      score: r.score,
      ranking: r.ranking,
      skillsMatch: r.matchDetails?.skillsMatch,
      experienceMatch: r.matchDetails?.experienceMatch,
      educationMatch: r.matchDetails?.educationMatch,
      overallMatch: r.matchDetails?.overallMatch,
      strengths: r.strengths,
      gaps: r.gaps,
      status: r.status
    }));

    const scores = comparison.map(c => c.score);
    const maxScore = Math.max(...scores);
    const normalized = comparison.map(c => ({
      ...c,
      normalizedScore: Math.round((c.score / maxScore) * 100)
    }));

    res.json({ success: true, data: normalized });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error comparing candidates' } });
  }
});

/**
 * @swagger
 * /api/shortlist/explain/{resultId}:
 *   get:
 *     summary: Get detailed explanation for why a candidate was shortlisted
 *     tags: [Shortlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed shortlisting explanation
 *       401:
 *         description: Unauthorized
 */
router.get('/explain/:resultId', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { resultId } = req.params;

    if (!mongoose.isValidObjectId(resultId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid result ID' } });
    }

    const result = await Result.findById(resultId)
      .populate('jobId', 'title description requiredSkills experience education')
      .populate('applicantId', 'name email skills experience education');

    if (!result) {
      return res.status(404).json({ success: false, error: { message: 'Result not found' } });
    }

    const applicant = result.applicantId as any;
    const job = result.jobId as any;

    res.json({
      success: true,
      data: {
        candidate: {
          id: applicant?._id,
          name: applicant?.name,
          email: applicant?.email,
          skills: applicant?.skills,
          experience: applicant?.experience
        },
        job: {
          id: job?._id,
          title: job?.title
        },
        score: result.score,
        ranking: result.ranking,
        status: result.status,
        matchDetails: result.matchDetails,
        strengths: result.strengths,
        gaps: result.gaps,
        reasoning: result.reasoning,
        biasAlerts: result.biasAlerts,
        recommendation: result.score >= 80 ? 'Strong Hire' : result.score >= 60 ? 'Consider' : 'Borderline',
        confidenceLevel: result.score >= 80 ? 'High' : result.score >= 60 ? 'Medium' : 'Low'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

export default router;