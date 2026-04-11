import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Job from '../models/job.model';
import Applicant from '../models/applicant.model';
import Result from '../models/result.model';
import Chat from '../models/chat.model';
import Message from '../models/message.model';
import aiService from '../services/ai.service';
import { asyncHandler, createError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

// Validation rules
export const chatValidation = [
  body('message').notEmpty().withMessage('Message is required'),
  body('jobId').optional().isString(),
  body('applicantIds').optional().isArray()
];

class ChatController {
  /**
   * Process chat message and return AI response
   */
  chat = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400));
    }

    const { message, jobId, applicantIds, context } = req.body;

    logger.info('Processing chat message', { 
      messageLength: message.length,
      hasJobId: !!jobId,
      hasApplicantIds: !!applicantIds?.length
    });

    // Build context for AI
    const chatContext: {
      job?: any;
      candidates?: any[];
      results?: any[];
    } = {};

    // Fetch job details if provided
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        return next(createError('Job not found', 404));
      }
      chatContext.job = job;
    }

    // Fetch candidate details if provided
    if (applicantIds && applicantIds.length > 0) {
      const candidates = await Applicant.find({
        _id: { $in: applicantIds }
      });
      chatContext.candidates = candidates;

      // If job is also provided, fetch screening results
      if (jobId) {
        const results = await Result.find({
          jobId,
          applicantId: { $in: applicantIds }
        }).populate('applicantId', 'name');

        chatContext.results = results.map(r => ({
          candidateId: (r.applicantId as any)._id.toString(),
          candidateName: (r.applicantId as any).name,
          score: r.score,
          strengths: r.strengths,
          gaps: r.gaps,
          reasoning: r.reasoning,
          matchDetails: r.matchDetails,
          ranking: r.ranking,
          status: r.status
        }));
      }
    }

    // Generate AI response
    const response = await aiService.generateChatResponse(message, chatContext);

    logger.debug('Chat response generated', { responseLength: response.length });

    res.status(200).json({
      success: true,
      data: {
        message,
        response,
        context: {
          jobId: chatContext.job?._id,
          jobTitle: chatContext.job?.title,
          candidateCount: chatContext.candidates?.length
        }
      }
    });
  });

  /**
   * Get candidate recommendations based on query
   */
  getRecommendations = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId, criteria } = req.body;

    if (!jobId) {
      return next(createError('Job ID is required', 400));
    }

    // Validate jobId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(jobId)) {
      return next(createError(`Invalid Job ID format: "${jobId}". Please provide a valid MongoDB ObjectId (24 characters hex string)`, 400));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    // Get screened candidates for this job
    const results = await Result.find({ jobId })
      .sort({ score: -1 })
      .populate('applicantId', 'name email skills experience education')
      .limit(10);

    if (results.length === 0) {
      return next(createError('No screened candidates found for this job. Run screening first.', 404));
    }

    // Build recommendation prompt
    const recommendationPrompt = `Based on the following job and candidates, recommend the best ${criteria || 'overall'} match and explain why.

Job: ${job.title}
Required Skills: ${job.requiredSkills.join(', ')}
Experience: ${job.experience || 'Not specified'}

Top Candidates:
${results.map((r, i) => `
${i + 1}. ${(r.applicantId as any).name}
   Score: ${r.score}/100
   Skills Match: ${r.matchDetails.skillsMatch}%
   Experience Match: ${r.matchDetails.experienceMatch}%
   Education Match: ${r.matchDetails.educationMatch}%
   Strengths: ${r.strengths.join(', ')}
`).join('\n')}

Provide a specific recommendation with clear reasoning.`;

    const recommendation = await aiService.generateChatResponse(recommendationPrompt, {
      job,
      candidates: results.map(r => r.applicantId as any)
    });

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        criteria: criteria || 'overall',
        recommendation,
        topCandidates: results
      }
    });
  });

  /**
   * Explain AI decision for a specific candidate
   */
  explainDecision = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId, applicantId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return next(createError('Applicant not found', 404));
    }

    const result = await Result.findOne({ jobId, applicantId });
    if (!result) {
      return next(createError('Screening result not found', 404));
    }

    const explainPrompt = `Explain the AI screening decision for this candidate in simple terms that a non-technical recruiter can understand.

Job: ${job.title}
Candidate: ${applicant.name}
Score: ${result.score}/100

Skills Match: ${result.matchDetails.skillsMatch}%
Experience Match: ${result.matchDetails.experienceMatch}%
Education Match: ${result.matchDetails.educationMatch}%

Strengths: ${result.strengths.join(', ')}
Gaps: ${result.gaps.join(', ')}

Original Reasoning: ${result.reasoning}

Provide a clear, conversational explanation covering:
1. Why the candidate received this score
2. Their key strengths for this role
3. Any concerns or gaps
4. Overall recommendation (shortlist/interview/pass)
5. Questions to ask in an interview`;

    const explanation = await aiService.generateChatResponse(explainPrompt, {
      job,
      candidates: [applicant]
    });

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        applicantId,
        applicantName: applicant.name,
        score: result.score,
        explanation,
        reasoning: result.reasoning
      }
    });
  });

  /**
   * Analyze job description for improvements
   */
  analyzeJob = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId } = req.params;

    // Validate jobId format
    if (!mongoose.isValidObjectId(jobId)) {
      return next(createError(`Invalid Job ID format: "${jobId}"`, 400));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    const analysisPrompt = `Analyze this job description and provide recommendations to:
1. Make it more inclusive and attract diverse candidates
2. Improve clarity and attract better matches
3. Identify any potentially biased or exclusionary language
4. Suggest better ways to describe requirements

Job Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}
Experience: ${job.experience || 'Not specified'}
Education: ${job.education.map(e => `${e.degree}${e.field ? ` in ${e.field}` : ''}`).join(', ')}

Provide specific, actionable suggestions.`;

    const analysis = await aiService.generateChatResponse(analysisPrompt, { job });

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        analysis
      }
    });
  });

  /**
   * Suggest interview questions based on candidate profile
   */
  suggestInterviewQuestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jobId, applicantId } = req.params;

    // Validate IDs format
    if (!mongoose.isValidObjectId(jobId)) {
      return next(createError(`Invalid Job ID format: "${jobId}"`, 400));
    }
    if (!mongoose.isValidObjectId(applicantId)) {
      return next(createError(`Invalid Applicant ID format: "${applicantId}"`, 400));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError('Job not found', 404));
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return next(createError('Applicant not found', 404));
    }

    const result = await Result.findOne({ jobId, applicantId });

    const questionsPrompt = `Suggest tailored interview questions for this candidate based on their profile and the job requirements.

Job: ${job.title}
Required Skills: ${job.requiredSkills.join(', ')}

Candidate: ${applicant.name}
Skills: ${applicant.skills.join(', ')}
Experience: ${applicant.experience.years} years${applicant.experience.currentRole ? `, Current: ${applicant.experience.currentRole}` : ''}

${result ? `
Screening Score: ${result.score}/100
Strengths: ${result.strengths.join(', ')}
Gaps: ${result.gaps.join(', ')}
` : ''}

Provide:
1. 3-5 technical questions specific to the role and their background
2. 2-3 behavioral questions
3. 2-3 questions to probe their gaps or concerns
4. Suggested follow-up questions based on potential answers`;

    const questions = await aiService.generateChatResponse(questionsPrompt, {
      job,
      candidates: [applicant]
    });

    res.status(200).json({
      success: true,
      data: {
        jobId,
        jobTitle: job.title,
        applicantId,
        applicantName: applicant.name,
        suggestedQuestions: questions
      }
    });
  });

  getChats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    const chats = await Chat.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .populate('jobId', 'title');

    res.status(200).json({
      success: true,
      data: chats
    });
  });

  getChatById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { chatId } = req.params;
    const userId = (req as any).user?.id;

    if (!mongoose.isValidObjectId(chatId)) {
      return next(createError('Invalid chat ID', 400));
    }

    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true })
      .populate('jobId', 'title');

    if (!chat) {
      return next(createError('Chat not found', 404));
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { chat, messages }
    });
  });

  createChat = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(createError('Unauthorized', 401));
    }

    const { title, jobId } = req.body;

    const chat = await Chat.create({
      userId,
      title: title || 'New Conversation',
      jobId
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  });

  deleteChat = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { chatId } = req.params;
    const userId = (req as any).user?.id;

    if (!mongoose.isValidObjectId(chatId)) {
      return next(createError('Invalid chat ID', 400));
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return next(createError('Chat not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  });
}

const chatController = new ChatController();
export default chatController;
