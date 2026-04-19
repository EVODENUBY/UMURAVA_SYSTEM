import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import aiService from '../services/ai.service';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler, createError } from '../middlewares/error.middleware';
import logger from '../utils/logger';
import InternalApplicant from '../models/internalApplicant.model';
import TalentProfile from '../models/talentProfile.model';

const router = Router();

const chatValidation = [
  body('message').notEmpty().withMessage('Message is required'),
];

const rolePrompts = {
  applicant: `You are Umurava AI Career Assistant. You help job seekers with finding jobs, resumes, interviews, and career guidance.`,
  recruiter: `You are Umurava AI Recruitment Assistant. You help recruiters with screening candidates, job descriptions, and hiring.`,
  admin: `You are Umurava AI Admin Assistant. You help administrators with platform management and analytics.`
};

const quickActions = {
  applicant: [
    { label: 'Find Jobs', prompt: 'Show me available jobs' },
    { label: 'My Applications', prompt: 'Check my application status' },
    { label: 'Resume Tips', prompt: 'How to improve my resume' },
    { label: 'Interview Tips', prompt: 'Give me interview tips' }
  ],
  recruiter: [
    { label: 'Screen Candidates', prompt: 'Help screen candidates' },
    { label: 'Write JD', prompt: 'Help write job description' },
    { label: 'Interview Qs', prompt: 'Suggest interview questions' }
  ],
  admin: [
    { label: 'Platform Stats', prompt: 'Show platform analytics' },
    { label: 'User Mgmt', prompt: 'Help manage users' }
  ]
};

/**
 * @swagger
 * /api/ai/assistant:
 *   post:
 *     summary: Chat with AI assistant (authenticated users)
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message to send to AI assistant
 *               quickAction:
 *                 type: string
 *                 description: Optional quick action prompt
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/assistant', protect, chatValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { message, quickAction } = req.body;
  const userId = (req as any).user?.id;
  const role = (req as any).user?.role || 'applicant';

  logger.info('AI Assistant request', { userId, role, messageLength: message?.length });

  // Build user context
  let userContext = '';
  
  if (role === 'applicant') {
    const profile: any = await TalentProfile.findOne({ userId });
    if (profile) {
      const firstName = profile.personalInfo?.firstName || profile.firstName || '';
      const lastName = profile.personalInfo?.lastName || profile.lastName || '';
      const skills = profile.skills?.join(', ') || 'Not listed';
      const expYears = profile.experience?.years || profile.experience?.length || 0;
      const education = profile.education?.[0]?.degree || 'Not listed';
      const city = profile.personalInfo?.location?.city || profile.city || '';
      const country = profile.personalInfo?.location?.country || profile.country || '';
      
      userContext = `
User Profile:
- Name: ${firstName} ${lastName}
- Skills: ${skills}
- Experience: ${expYears} years
- Education: ${education}
- Location: ${city}, ${country}
`;
    }

    const applications: any[] = await InternalApplicant.find({ userId }).populate('jobId', 'title company status');
    if (applications.length > 0) {
      const applied = applications.filter(a => a.status === 'applied').length;
      const interview = applications.filter(a => a.status === 'interview').length;
      const offer = applications.filter(a => a.status === 'offer').length;
      const hired = applications.filter(a => a.status === 'hired').length;
      userContext += `
Applications Status:
- Applied: ${applied}
- Interview: ${interview}
- Offer: ${offer}
- Hired: ${hired}
`;
    }
  }

  const prompt = quickAction || message;
  const systemPrompt = `${rolePrompts[role as keyof typeof rolePrompts] || rolePrompts.applicant}

${userContext}

If the user asks about their applications, profile, or specific data, provide accurate information based on the context above.

Respond in a helpful, concise manner.`;

  const response = await aiService.generateChatResponse(prompt, {
    job: undefined,
    candidates: undefined,
    results: undefined
  });

  const actions = quickActions[role as keyof typeof quickActions] || quickActions.applicant;

  res.status(200).json({
    success: true,
    data: {
      response,
      role,
      quickActions: actions,
      userName: (req as any).user?.name || (req as any).user?.firstName || 'User'
    }
  });
}));

// Guest chat endpoint - no authentication required
/**
 * @swagger
 * /api/ai/guest:
 *   post:
 *     summary: Chat with AI assistant (guest/unregistered users)
 *     tags: [AI Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message to send to AI assistant
 *               name:
 *                 type: string
 *                 description: Guest user's name (optional)
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Validation error
 */
router.post('/guest', chatValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { message, name } = req.body;

  logger.info('AI Guest chat request', { name, messageLength: message?.length });

  const userName = name || 'Guest';
  const prompt = `${rolePrompts.applicant}

Current User: ${userName} (Guest - not logged in)

Please provide helpful career guidance and job search advice. Ask for more details if needed.`;

  const response = await aiService.generateChatResponse(prompt, {
    job: undefined,
    candidates: undefined,
    results: undefined
  });

  res.status(200).json({
    success: true,
    data: {
      response,
      role: 'guest',
      quickActions: [
        { label: 'Find Jobs', prompt: 'Show me available jobs' },
        { label: 'Resume Tips', prompt: 'Give me resume writing tips' },
        { label: 'Interview Prep', prompt: 'How to prepare for interviews' },
        { label: 'Career Advice', prompt: 'Give me career guidance' }
      ],
      userName
    }
  });
}));

export default router;