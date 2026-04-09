import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import Applicant from '../models/applicant.model';
import parserService from '../services/parser.service';
import aiService from '../services/ai.service';
import { asyncHandler, createError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

// Validation rules for manual applicant creation
export const applicantValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('resumeText').notEmpty().withMessage('Resume text is required')
];

class ApplicantController {
  /**
   * Upload and parse a PDF resume
   */
  uploadResume = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    const { path: filePath, filename, originalname } = req.file;

    logger.info('Processing resume upload', { filename: originalname, filePath });

    try {
      // Read file from disk
      const fs = await import('fs');
      const buffer = fs.readFileSync(filePath);
      
      // Parse the PDF
      const parsedResume = await parserService.parsePDF(buffer);
      
      // Use AI to extract structured data from resume
      const extractedData = await aiService.parseResume(parsedResume.text);

      // Check if applicant already exists
      const existingApplicant = await Applicant.findOne({ email: extractedData.email });
      if (existingApplicant) {
        logger.warn('Applicant with email already exists', { email: extractedData.email });
        return next(createError('An applicant with this email already exists', 409));
      }

      // Create applicant record
      const applicant = await Applicant.create({
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        skills: extractedData.skills,
        experience: extractedData.experience,
        education: extractedData.education,
        resumeText: parsedResume.text,
        resumeFilePath: filePath,
        source: 'pdf'
      });

      logger.info('Resume uploaded and applicant created', { 
        applicantId: applicant._id,
        name: applicant.name 
      });

      res.status(201).json({
        success: true,
        data: {
          applicant,
          extractedData: {
            name: extractedData.name,
            email: extractedData.email,
            skills: extractedData.skills,
            experienceYears: extractedData.experience.years
          }
        }
      });
    } catch (error) {
      logger.error('Error processing resume upload:', error);
      next(error);
    }
  });

  /**
   * Upload and parse CSV file with multiple applicants
   */
  uploadCSV = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    const { path: filePath, originalname } = req.file;

    logger.info('Processing CSV upload', { filename: originalname, filePath });

    try {
      // Read file from disk
      const fs = await import('fs');
      const buffer = fs.readFileSync(filePath);
      
      // Parse the CSV
      const csvResult = parserService.parseCSV(buffer);
      
      const createdApplicants = [];
      const errors = [];

      // Process each record
      for (const record of csvResult.records) {
        try {
          // Check if applicant already exists
          const existingApplicant = await Applicant.findOne({ email: record.email });
          if (existingApplicant) {
            errors.push({
              email: record.email,
              error: 'Applicant with this email already exists'
            });
            continue;
          }

          // Parse skills from string
          const skills = parserService.extractSkillsFromText(record.skills);

          // Create applicant
          const applicant = await Applicant.create({
            name: record.name,
            email: record.email,
            phone: record.phone,
            skills,
            experience: {
              years: parseInt(record.experience, 10) || 0
            },
            resumeText: record.resumeText || `Skills: ${record.skills}. Experience: ${record.experience}. Education: ${record.education}`,
            source: 'csv'
          });

          createdApplicants.push(applicant);
        } catch (err) {
          errors.push({
            email: record.email,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      logger.info('CSV processed', { 
        created: createdApplicants.length,
        errors: errors.length 
      });

      res.status(201).json({
        success: true,
        data: {
          created: createdApplicants.length,
          applicants: createdApplicants,
          errors: errors.length > 0 ? errors : undefined,
          summary: {
            totalInFile: csvResult.totalRows,
            successfullyCreated: createdApplicants.length,
            failed: errors.length
          }
        }
      });
    } catch (error) {
      logger.error('Error processing CSV upload:', error);
      next(error);
    }
  });

  /**
   * List all applicants with pagination and search
   */
  listApplicants = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skill = req.query.skill as string;
    const skip = (page - 1) * limit;

    // Build query
    let query: Record<string, unknown> = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { resumeText: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    const [applicants, total] = await Promise.all([
      Applicant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-resumeText') // Exclude large text field from list view
        .exec(),
      Applicant.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        applicants,
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
   * Get a single applicant by ID
   */
  getApplicantById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const applicant = await Applicant.findById(id);

    if (!applicant) {
      return next(createError('Applicant not found', 404));
    }

    res.status(200).json({
      success: true,
      data: applicant
    });
  });

  /**
   * Create applicant manually
   */
  createApplicant = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400));
    }

    const { name, email, phone, skills, experience, education, resumeText } = req.body;

    // Check if applicant already exists
    const existingApplicant = await Applicant.findOne({ email });
    if (existingApplicant) {
      return next(createError('An applicant with this email already exists', 409));
    }

    const applicant = await Applicant.create({
      name,
      email,
      phone,
      skills: skills || [],
      experience: experience || { years: 0 },
      education: education || [],
      resumeText,
      source: 'manual'
    });

    logger.info('Applicant created manually', { applicantId: applicant._id });

    res.status(201).json({
      success: true,
      data: applicant
    });
  });

  /**
   * Update an applicant
   */
  updateApplicant = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const applicant = await Applicant.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!applicant) {
      return next(createError('Applicant not found', 404));
    }

    logger.info('Applicant updated', { applicantId: id });

    res.status(200).json({
      success: true,
      data: applicant
    });
  });

  /**
   * Delete an applicant
   */
  deleteApplicant = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const applicant = await Applicant.findByIdAndDelete(id);

    if (!applicant) {
      return next(createError('Applicant not found', 404));
    }

    logger.info('Applicant deleted', { applicantId: id });

    res.status(200).json({
      success: true,
      message: 'Applicant deleted successfully'
    });
  });
}

const applicantController = new ApplicantController();
export default applicantController;
