import { Router, Request, Response, NextFunction } from 'express';
import profileController from '../controllers/profile.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import aiService from '../services/ai.service';
import mongoose from 'mongoose';
import TalentProfile from '../models/talentProfile.model';
import InternalApplicant from '../models/internalApplicant.model';
import Job from '../models/job.model';

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a new talent profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TalentProfile'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Profile already exists or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, profileController.createProfile);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user's talent profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/', protect, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update talent profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TalentProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.put('/', protect, profileController.updateProfile);

/**
 * @swagger
 * /api/profile/completion:
 *   get:
 *     summary: Get profile completion percentage
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion data
 *       401:
 *         description: Unauthorized
 */
router.get('/completion', protect, profileController.getProfileCompletion);

/**
 * @swagger
 * /api/profile/apply/{jobId}:
 *   post:
 *     summary: Apply to a job
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to apply to
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Profile not complete or already applied
 *       401:
 *         description: Unauthorized
 */
router.post('/apply/:jobId', protect, profileController.applyToJob);

/**
 * @swagger
 * /api/profile/my-applications:
 *   get:
 *     summary: Get applicant's job applications
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of job applications
 *       401:
 *         description: Unauthorized
 */
router.get('/my-applications', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    console.log('Fetching applications for user:', userId);

    const applications = await InternalApplicant.find({ userId }).sort({ appliedAt: -1 });
    console.log('Found applications (raw):', applications.length);

    const populated = await InternalApplicant.populate(applications, {
      path: 'jobId'
    });
    console.log('Populated successfully');

    res.json({ success: true, data: populated });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: { message: 'Server error: ' + error.message } });
  }
});

/**
 * @swagger
 * /api/profile/recommendations:
 *   get:
 *     summary: Get AI-powered job recommendations based on profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job recommendations
 *       401:
 *         description: Unauthorized
 */
router.get('/recommendations', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, error: { message: 'Profile not found. Please complete your profile first.' } });
      return;
    }

    const jobs = await Job.find({ status: 'published' })
      .select('title description requiredSkills experience location')
      .limit(10);

    if (jobs.length === 0) {
      res.json({ success: true, data: { message: 'No jobs available at the moment', recommendations: [] } });
      return;
    }

    const firstName = profile.basicInfo?.firstName || 'Candidate';
    const lastName = profile.basicInfo?.lastName || '';
    const headline = profile.basicInfo?.headline || 'N/A';
    const skills = profile.skills?.map((s: any) => s.name).join(', ') || 'None listed';
    const education = profile.education?.map((e: any) => `${e.degree} in ${e.fieldOfStudy}`).join(', ') || 'None listed';

    const prompt = `Based on the following candidate profile, recommend the most suitable jobs and explain why:

Candidate Profile:
- Name: ${firstName} ${lastName}
- Headline: ${headline}
- Skills: ${skills}
- Education: ${education}

Available Jobs:
${jobs.map((job: any, i: number) => `${i + 1}. ${job.title} - ${job.location?.city || 'N/A'}
   Required Skills: ${job.requiredSkills?.join(', ') || 'None'}
   Experience: ${job.experience?.minYears || 0}+ years`).join('\n\n')}

Provide job recommendations with matching score and reasoning.`;

    const recommendation = await aiService.generateChatResponse(prompt, {});

    res.json({ success: true, data: { recommendations: recommendation, jobs } });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, error: { message: 'Server error getting recommendations: ' + error.message } });
  }
});

/**
 * @swagger
 * /api/profile/improve-suggestions:
 *   get:
 *     summary: Get AI-powered profile improvement suggestions
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile improvement suggestions
 *       401:
 *         description: Unauthorized
 */
router.get('/improve-suggestions', protect, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
    }

    const prompt = `Analyze this talent profile and provide specific suggestions to improve it for better job matches:

Profile Analysis:
${JSON.stringify(profile, null, 2)}

Provide:
1. Missing sections or incomplete information
2. Skills gaps based on common job market demands
3. Suggestions to make profile more attractive to recruiters
4. Specific improvements for each section (basicInfo, skills, experience, education, etc.)`;

    const suggestions = await aiService.generateChatResponse(prompt, {});

    res.json({ success: true, data: { suggestions, profileCompletion: profile.profileCompletion } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error getting suggestions' } });
  }
});

export default router;