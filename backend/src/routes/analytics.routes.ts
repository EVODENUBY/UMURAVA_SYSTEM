import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import Job from '../models/job.model';
import InternalApplicant from '../models/internalApplicant.model';
import ExternalApplicant from '../models/externalApplicant.model';
import Result from '../models/result.model';
import mongoose from 'mongoose';

const router = Router();

router.get('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const jobs = await Job.find({}).select('_id title status');
    const jobIds = jobs.map((j: any) => j._id);
    
    let jobQuery: any = {};
    let specificJobQuery: any = {};
    
    if (jobId && mongoose.isValidObjectId(jobId as string)) {
      jobQuery = { jobId: new mongoose.Types.ObjectId(jobId as string) };
      specificJobQuery = { _id: new mongoose.Types.ObjectId(jobId as string) };
    } else {
      jobQuery = jobIds.length > 0 ? { jobId: { $in: jobIds } } : {};
    }

    const [internalStatusAgg, externalStatusAgg, jobsWithApplicantsAgg] = await Promise.all([
      InternalApplicant.aggregate([
        { $match: jobQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ExternalApplicant.aggregate([
        { $match: jobQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $match: specificJobQuery._id ? specificJobQuery : { _id: { $in: jobIds } } },
        {
          $lookup: {
            from: 'externalapplicants',
            localField: '_id',
            foreignField: 'jobId',
            as: 'externalApps'
          }
        },
        {
          $lookup: {
            from: 'internalapplicants',
            localField: '_id',
            foreignField: 'jobId',
            as: 'internalApps'
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            totalApplicants: { $add: [{ $size: '$externalApps' }, { $size: '$internalApps' }] },
            externalCount: { $size: '$externalApps' },
            internalCount: { $size: '$internalApps' }
          }
        },
        { $sort: { totalApplicants: -1 } }
      ])
    ]);

    const internalCounts: Record<string, number> = {};
    const externalCounts: Record<string, number> = {};
    
    internalStatusAgg.forEach((item: any) => {
      internalCounts[item._id] = item.count;
    });
externalStatusAgg.forEach((item: any) => {
      externalCounts[item._id] = item.count;
    });
    
    const totalJobs = await Job.countDocuments(specificJobQuery._id ? specificJobQuery : {});
    const totalInternalApplicants = await InternalApplicant.countDocuments(jobQuery);
    const totalExternalApplicants = await ExternalApplicant.countDocuments(jobQuery);
    const totalScreened = await Result.countDocuments(jobQuery);

    // Get real counts from Result model (after screening)
    const resultStatusAgg = await Result.aggregate([
      { $match: jobQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const resultCounts: Record<string, number> = {};
    resultStatusAgg.forEach((item: any) => {
      resultCounts[item._id] = item.count;
    });

    // Shortlisted = Result with status 'shortlisted' or 'interview' or 'offer'
    const shortlistedFromResults = (resultCounts['shortlisted'] || 0) + (resultCounts['interview'] || 0) + (resultCounts['offer'] || 0);

    console.log('[Analytics] jobId:', jobId, 'jobQuery:', JSON.stringify(jobQuery), 'specificJobQuery:', JSON.stringify(specificJobQuery));
    console.log('[Analytics] totalInternal:', totalInternalApplicants, 'totalExternal:', totalExternalApplicants, 'internalCounts:', JSON.stringify(internalCounts), 'externalCounts:', JSON.stringify(externalCounts));
    console.log('[Analytics] resultCounts:', JSON.stringify(resultCounts), 'shortlistedFromResults:', shortlistedFromResults);
    console.log('[Analytics] jobsWithApplicantsAgg:', JSON.stringify(jobsWithApplicantsAgg.map((j: any) => ({ _id: String(j._id), title: j.title, total: j.totalApplicants }))));

    let overviewTotalApplicants = totalInternalApplicants + totalExternalApplicants;
    let overviewTotalInternal = totalInternalApplicants;
    let overviewTotalExternal = totalExternalApplicants;
    let fullStatusBreakdown: Record<string, number> = {};
    
    if (specificJobQuery._id && jobsWithApplicantsAgg.length > 0) {
      const selectedJobData = jobsWithApplicantsAgg[0];
      overviewTotalApplicants = selectedJobData.totalApplicants || 0;
      overviewTotalInternal = selectedJobData.internalCount || 0;
      overviewTotalExternal = selectedJobData.externalCount || 0;
      
fullStatusBreakdown = {
        applied: overviewTotalApplicants,
        pending: resultCounts['pending'] || 0,
        screening: resultCounts['screening'] || 0,
        shortlisted: shortlistedFromResults,
        interview: resultCounts['interview'] || 0,
        offer: resultCounts['offer'] || 0,
        hired: resultCounts['hired'] || 0,
        rejected: resultCounts['rejected'] || 0
      };
    } else {
      fullStatusBreakdown = {
        applied: overviewTotalApplicants,
        pending: resultCounts['pending'] || 0,
        screening: resultCounts['screening'] || 0,
        shortlisted: shortlistedFromResults,
        interview: resultCounts['interview'] || 0,
        offer: resultCounts['offer'] || 0,
        hired: resultCounts['hired'] || 0,
        rejected: resultCounts['rejected'] || 0
      };
    }

    const totalHired = fullStatusBreakdown.hired || 0;

    const averageScoreResult = await Result.aggregate([
      { $match: jobQuery },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const averageScore = averageScoreResult[0]?.avgScore ? Math.round(averageScoreResult[0].avgScore) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          totalApplicants: overviewTotalApplicants,
          totalInternalApplicants: overviewTotalInternal,
          totalExternalApplicants: overviewTotalExternal,
          totalScreened,
          totalShortlisted: shortlistedFromResults,
          totalHired
        },
        averageScore,
        statusBreakdown: fullStatusBreakdown,
        jobs: jobs.map((j: any) => ({
          _id: String(j._id),
          title: j.title,
          status: j.status
        })),
        jobsWithApplicants: jobsWithApplicantsAgg.map((j: any) => ({
          _id: String(j._id),
          title: j.title,
          status: j.status,
          totalApplicants: j.totalApplicants || 0,
          externalCount: j.externalCount || 0,
          internalCount: j.internalCount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: { message: 'Server error fetching analytics' } });
  }
});

export default router;