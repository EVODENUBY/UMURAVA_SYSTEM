import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { protect, authorize } from '../middlewares/auth.middleware';
import ExternalApplicant from '../models/externalApplicant.model';
import uploadMiddleware from '../middlewares/upload.middleware';
import parserService from '../services/parser.service';
import aiService from '../services/ai.service';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import fs from 'fs';
import * as XLSX from 'xlsx';

const router = Router();

/**
 * @swagger
 * /api/applicants/external:
 *   get:
 *     summary: Get all external applicants (recruiter/admin only)
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [screening, interview, offer, hired, rejected]
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of external applicants
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, jobId, search, skill } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (skill) query.skills = { $in: [skill] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const applicants = await ExternalApplicant.find(query)
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await ExternalApplicant.countDocuments(query);

    res.json({
      success: true,
      data: {
        applicants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching applicants:', error);
    res.status(500).json({ success: false, error: { message: 'Server error fetching applicants' } });
  }
});

/**
 * @swagger
 * /api/applicants/external:
 *   post:
 *     summary: Create external applicant manually
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               jobId:
 *                 type: string
 *               resumeLink:
 *                 type: string
 *     responses:
 *       201:
 *         description: External applicant created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, skills, experience, education, resumeText, jobId, resumeLink } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: { message: 'Name and email are required' } });
    }

    const existing = await ExternalApplicant.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: 'Applicant with this email already exists' } });
    }

    const applicant = await ExternalApplicant.create({
      name,
      email,
      phone,
      skills: skills || [],
      experience: experience || { years: 0 },
      education: education || [],
      resumeText: resumeText || '',
      resumeLink: resumeLink || undefined,
      source: 'manual',
      jobId: jobId ? new mongoose.Types.ObjectId(jobId) : undefined,
      status: 'screening'
    });

    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error creating applicant:', error);
    res.status(500).json({ success: false, error: { message: 'Server error creating applicant' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/{id}:
 *   get:
 *     summary: Get external applicant by ID
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.get('/:id', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const applicant = await ExternalApplicant.findById(id).populate('jobId');

    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant not found' } });
    }

    res.json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error fetching applicant:', error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/{id}:
 *   put:
 *     summary: Update external applicant
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Applicant updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.put('/:id', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const applicant = await ExternalApplicant.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant not found' } });
    }

    res.json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error updating applicant:', error);
    res.status(500).json({ success: false, error: { message: 'Server error updating applicant' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/{id}:
 *   delete:
 *     summary: Delete external applicant
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.delete('/:id', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const applicant = await ExternalApplicant.findByIdAndDelete(id);

    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant not found' } });
    }

    res.json({ success: true, message: 'Applicant deleted successfully' });
  } catch (error) {
    logger.error('Error deleting applicant:', error);
    res.status(500).json({ success: false, error: { message: 'Server error deleting applicant' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/bulk-delete:
 *   post:
 *     summary: Delete multiple external applicants
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of applicant IDs to delete
 *               deleteAll:
 *                 type: boolean
 *                 description: If true, delete all applicants
 *     responses:
 *       200:
 *         description: Applicants deleted
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk-delete', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { ids, deleteAll } = req.body;

    if (deleteAll) {
      const result = await ExternalApplicant.deleteMany({});
      return res.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} applicants` 
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Please provide array of IDs or set deleteAll to true' } });
    }

    const validIds = ids.filter(id => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No valid IDs provided' } });
    }

    const result = await ExternalApplicant.deleteMany({ _id: { $in: validIds } });

    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} applicants`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    logger.error('Error bulk deleting applicants:', error);
    res.status(500).json({ success: false, error: { message: 'Server error deleting applicants' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/{id}/status:
 *   put:
 *     summary: Update external applicant status
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [screening, interview, offer, hired, rejected]
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.put('/:id/status', protect, authorize('recruiter', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid ID' } });
    }

    const validStatuses = ['screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    const applicant = await ExternalApplicant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant not found' } });
    }

    res.json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({ success: false, error: { message: 'Server error updating status' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/template:
 *   get:
 *     summary: Download Excel template for bulk applicant upload
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *       401:
 *         description: Unauthorized
 */
router.get('/template', protect, authorize('recruiter', 'admin'), async (_req: Request, res: Response) => {
  try {
    const templateData = [
      {
        // Basic Info
        FirstName: 'Evode',
        LastName: 'muyisingize',
        Email: 'evode.muyisingize@gmail.com',
        Phone: '+250788305305',
        Headline: 'Senior Software Engineer',
        Bio: 'Experienced software engineer with 5+ years in full-stack development',
        Location: 'Kigali, Rwanda',
        
        // Skills (comma-separated)
        Skills: 'JavaScript, React, Node.js, TypeScript, PostgreSQL',
        SkillLevels: 'Expert, Expert, Advanced, Intermediate',
        SkillYears: '5, 4, 3, 2',
        
        // Languages
        Languages: 'English, Kinyarwanda',
        LanguageProficiency: 'Fluent, Native',
        
        // Experience (comma-separated for multiple)
        ExperienceCompany: 'Tech Corp, Startup Inc',
        ExperienceRole: 'Senior Developer, Junior Developer',
        ExperienceStartDate: '2020-01, 2018-01',
        ExperienceEndDate: 'Present, 2019-12',
        ExperienceDescription: 'Led development of main platform, Built REST APIs',
        ExperienceTechnologies: 'React, Node.js, Python, Django',
        IsCurrentJob: 'Yes, No',
        
        // Education (comma-separated)
        EducationInstitution: 'MIT, Harvard',
        EducationDegree: 'BS Computer Science, MS Data Science',
        EducationField: 'Computer Science, Data Science',
        EducationStartYear: '2014, 2018',
        EducationEndYear: '2018, 2020',
        
        // Certifications (comma-separated)
        Certifications: 'AWS Solutions Architect, Google Cloud Developer',
        CertificationIssuer: 'Amazon, Google',
        CertificationDate: '2021-06, 2020-03',
        
        // Projects (comma-separated)
        ProjectName: 'Portfolio Site, E-commerce App',
        ProjectDescription: 'Personal portfolio website, Full-stack e-commerce',
        ProjectTechnologies: 'React, Node.js',
        ProjectRole: 'Lead Developer, Full Developer',
        ProjectLink: 'https://johndoe.dev, https://shop.example.com',
        ProjectStartDate: '2021-01, 2020-06',
        ProjectEndDate: '2021-03, 2020-09',
        
        // Availability
        AvailabilityStatus: 'Open to Opportunities',
        AvailabilityType: 'Full-time',
        AvailabilityStartDate: '2024-01-01',
        
        // Social Links
        LinkedIn: 'https://linkedin.com/in/johndoe',
        GitHub: 'https://github.com/johndoe',
        Portfolio: 'https://johndoe.dev',
        
        // Resume Link (optional)
        ResumeLink: 'https://linkedin.com/in/evode-muyisingizemwese',
        
        // Company & Date (for tracking)
        ApplicationCompany: 'Umurava',
        ApplicationDate: '2024-04-01',
        Source: 'LinkedIn'
      },
      {
        FirstName: 'Sandra',
        LastName: ' Smith',
        Email: 'jane.smith@example.com',
        Phone: '+0987654321',
        Headline: 'Full Stack Developer',
        Bio: 'Passionate about building scalable web applications',
        Location: 'Nairobi, Kenya',
        
        Skills: 'Python, Django, React, PostgreSQL, Docker',
        SkillLevels: 'Expert, Advanced, Advanced, Intermediate, Beginner',
        SkillYears: '4, 3, 3, 2, 1',
        
        Languages: 'English, Swahili',
        LanguageProficiency: 'Fluent, Native',
        
        ExperienceCompany: 'Google, Microsoft',
        ExperienceRole: 'Software Engineer, Intern',
        ExperienceStartDate: '2021-06, 2020-05',
        ExperienceEndDate: 'Present, 2020-08',
        ExperienceDescription: 'Worked on cloud infrastructure, Assisted in Azure development',
        ExperienceTechnologies: 'Go, Kubernetes, C#',
        IsCurrentJob: 'Yes, No',
        
        EducationInstitution: 'Stanford, UC Berkeley',
        EducationDegree: 'BS Software Engineering, High School',
        EducationField: 'Software Engineering, Science',
        EducationStartYear: '2017, 2013',
        EducationEndYear: '2021, 2017',
        
        Certifications: 'Python Certified',
        CertificationIssuer: 'Python Institute',
        CertificationDate: '2022-01',
        
        ProjectName: 'AI Chatbot',
        ProjectDescription: 'AI-powered customer support chatbot',
        ProjectTechnologies: 'Python, TensorFlow',
        ProjectRole: 'Lead Developer',
        ProjectLink: 'https://chatbot.example.com',
        ProjectStartDate: '2022-01',
        ProjectEndDate: '2022-06',
        
        AvailabilityStatus: 'Available',
        AvailabilityType: 'Full-time',
        AvailabilityStartDate: '2024-02-01',
        
        LinkedIn: 'https://linkedin.com/in/janesmith',
        GitHub: 'https://github.com/janesmith',
        Portfolio: 'https://janesmith.dev',
        
        ResumeLink: 'https://linkedin.com/in/janesmith',
        
        ApplicationCompany: 'Umurava',
        ApplicationDate: '2024-04-02',
        Source: 'Referral'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants Template');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applicants_template.xlsx');

    res.send(buffer);
  } catch (error) {
    logger.error('Error generating template:', error);
    res.status(500).json({ success: false, error: { message: 'Error generating template' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/upload-resume:
 *   post:
 *     summary: Upload single resume for external applicant (PDF)
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF resume file to upload (use file picker or drag and drop)
 *               jobId:
 *                 type: string
 *                 description: Job ID to associate with applicant
 *               resumeLink:
 *                 type: string
 *                 description: External resume link (LinkedIn, etc.)
 *     responses:
 *       201:
 *         description: Applicant uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 */
router.post('/upload-resume', protect, authorize('recruiter', 'admin'), uploadMiddleware.uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded. Please select a PDF file to upload.' } });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const { jobId, resumeLink } = req.body;
    const absoluteFilePath = path.resolve(filePath);

    logger.info('Processing resume upload', { filename: originalname, filePath: absoluteFilePath, mimetype, resumeLink });

    if (!filePath || !fs.existsSync(absoluteFilePath)) {
      return res.status(400).json({ success: false, error: { message: 'File not found on server' } });
    }

    const buffer = fs.readFileSync(absoluteFilePath);
    
    let parsedResume;
    try {
      parsedResume = await parserService.parsePDF(buffer);
    } catch (parseError) {
      logger.error('PDF parsing error:', parseError);
      return res.status(400).json({ success: false, error: { message: 'Failed to parse PDF. Please ensure the file is a valid PDF.' } });
    }

    if (!parsedResume.text || parsedResume.text.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'PDF appears to be empty or has no extractable text.' } });
    }

    let extractedData = null;
    let aiFailed = false;
    
    try {
      extractedData = await aiService.parseResume(parsedResume.text);
    } catch (aiError) {
      logger.warn('AI extraction failed, using fallback:', aiError);
      aiFailed = true;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    let extractedEmail = extractedData?.email?.trim() || '';
    let extractedName = extractedData?.name || '';
    let extractedPhone = extractedData?.phone || '';
    
    if (aiFailed || !extractedEmail || !emailRegex.test(extractedEmail)) {
      const emailMatch = parsedResume.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = parsedResume.text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const lines = parsedResume.text.split('\n').filter(l => l.trim());
      
      if (emailMatch) extractedEmail = emailMatch[0];
      if (phoneMatch) extractedPhone = phoneMatch[0];
      if (!extractedName && lines.length > 0) extractedName = lines[0].substring(0, 100);
      
      logger.info('Using fallback extraction', { extractedEmail, extractedName, extractedPhone });
    }
    
    if (!extractedEmail || !emailRegex.test(extractedEmail)) {
      const placeholderEmail = `resume-${Date.now()}@pending.com`;
      
      const applicant = await ExternalApplicant.create({
        name: extractedName || 'Unknown',
        email: placeholderEmail,
        phone: extractedPhone,
        skills: [],
        experience: { years: 0 },
        education: [],
        resumeText: parsedResume.text,
        resumeFilePath: absoluteFilePath,
        resumeLink: resumeLink || undefined,
        source: 'pdf',
        jobId: jobId ? new mongoose.Types.ObjectId(jobId) : undefined,
        status: 'screening'
      });

      return res.status(201).json({
        success: true,
        message: 'Resume uploaded. Please update email manually as no email was detected.',
        data: { applicant, needsManualUpdate: true }
      });
    }

    const existingApplicant = await ExternalApplicant.findOne({ email: extractedEmail });
    if (existingApplicant) {
      return res.status(409).json({ success: false, error: { message: 'An applicant with this email already exists' } });
    }

    const applicant = await ExternalApplicant.create({
      name: extractedName || extractedData?.name || 'Unknown',
      email: extractedEmail,
      phone: extractedPhone || extractedData?.phone,
      skills: extractedData?.skills || [],
      experience: extractedData?.experience || { years: 0 },
      education: extractedData?.education || [],
      resumeText: parsedResume.text,
      resumeFilePath: absoluteFilePath,
      resumeLink: resumeLink || undefined,
      source: 'pdf',
      jobId: jobId ? new mongoose.Types.ObjectId(jobId) : undefined,
      status: 'screening'
    });

    logger.info('Resume uploaded successfully', { 
      applicantId: applicant._id,
      name: applicant.name 
    });

    res.status(201).json({
      success: true,
      message: 'Applicant uploaded successfully',
      data: {
        applicant,
        extractedData: {
          name: extractedData.name,
          email: extractedData.email,
          skills: extractedData.skills,
          experienceYears: extractedData.experience?.years || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error processing resume upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message: `Error processing resume upload: ${errorMessage}` } });
  }
});

/**
 * @swagger
 * /api/applicants/external/preview:
 *   post:
 *     summary: Preview bulk upload data before importing
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file to upload (use file picker or drag and drop)
 *     responses:
 *       200:
 *         description: Preview data
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 */
router.post('/preview', protect, authorize('recruiter', 'admin'), uploadMiddleware.uploadAny, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No file provided. Please select a CSV or Excel file to upload.' } });
    }

    const file = files[0];
    const { path: filePath, originalname } = file;

    logger.info('Processing preview', { filename: originalname, filePath });

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ success: false, error: { message: 'File not found on server' } });
    }

    const buffer = fs.readFileSync(filePath);
    const ext = originalname.toLowerCase().split('.').pop();

    let parsedData;
    if (ext === 'xlsx' || ext === 'xls') {
      parsedData = parserService.parseExcel(buffer);
    } else {
      parsedData = parserService.parseCSV(buffer);
    }

    const preview = parsedData.records.slice(0, 10);
    const validationErrors: Array<{ row: number; email: string; error: string }> = [];

    for (let i = 0; i < parsedData.records.length; i++) {
      const record = parsedData.records[i];
      const emailRegex = /^\S+@\S+\.\S+$/;
      
      if (!record.name) {
        validationErrors.push({ row: i + 2, email: record.email || '', error: 'Name is required' });
      }
      if (!record.email || !emailRegex.test(record.email)) {
        validationErrors.push({ row: i + 2, email: record.email || '', error: 'Valid email is required' });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        preview,
        totalRows: parsedData.totalRows,
        validationErrors: validationErrors.slice(0, 20),
        hasValidationErrors: validationErrors.length > 0
      }
    });
  } catch (error) {
    logger.error('Error processing preview:', error);
    res.status(500).json({ success: false, error: { message: 'Error processing file' } });
  }
});

/**
 * @swagger
 * /api/applicants/external/upload-bulk:
 *   post:
 *     summary: Upload bulk applicants from CSV/Excel
 *     tags: [External Applicants]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file to upload (use file picker or drag and drop)
 *               jobId:
 *                 type: string
 *                 description: Job ID to associate with applicants
 *               excludeRows:
 *                 type: string
 *                 description: Comma-separated row numbers to exclude
 *     responses:
 *       201:
 *         description: Applicants imported
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-bulk', protect, authorize('recruiter', 'admin'), uploadMiddleware.uploadAny, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No file provided. Please select a CSV or Excel file to upload.' } });
    }

    const file = files[0];
    const { path: filePath, originalname } = file;
const { jobId, excludeRows } = req.body;

    let validJobId = null;
    if (jobId && mongoose.isValidObjectId(jobId)) {
      validJobId = new mongoose.Types.ObjectId(jobId);
    }

    const excludedRowsArray: number[] = excludeRows
      ? String(excludeRows).split(',').map((r: string) => parseInt(r.trim(), 10)).filter((n: number) => !isNaN(n))
      : [];

    logger.info('Processing bulk upload', { filename: originalname, filePath, excludedRows: excludedRowsArray.length });

    const buffer = fs.readFileSync(filePath);
    const ext = originalname.toLowerCase().split('.').pop();

    let parsedData;
    if (ext === 'xlsx' || ext === 'xls') {
      parsedData = parserService.parseExcel(buffer);
    } else {
      parsedData = parserService.parseCSV(buffer);
    }

    logger.info('Parsed data from file', { 
      totalRows: parsedData.totalRows, 
      recordsCount: parsedData.records.length,
      firstRecord: parsedData.records[0] ? JSON.stringify(parsedData.records[0]).substring(0, 500) : 'empty'
    });

    const createdApplicants = [];
    const errors = [];
    const skipped: number[] = [];

    for (let i = 0; i < parsedData.records.length; i++) {
      const record = parsedData.records[i];

      if (excludedRowsArray.includes(i + 2)) {
        skipped.push(i + 2);
        continue;
      }

      const recordEmail = record.email?.trim();
      const recordName = record.name?.trim();
      const emailRegex = /^\S+@\S+\.\S+$/;

      if (!recordEmail || !emailRegex.test(recordEmail)) {
        errors.push({
          row: i + 2,
          email: recordEmail || '',
          error: 'Valid email is required'
        });
        continue;
      }

      if (!recordName) {
        errors.push({
          row: i + 2,
          email: recordEmail,
          error: 'Name is required'
        });
        continue;
      }

      try {
        const existingApplicant = await ExternalApplicant.findOne({ email: recordEmail });
        if (existingApplicant) {
          errors.push({
            row: i + 2,
            email: recordEmail,
            error: 'Applicant with this email already exists'
          });
          continue;
        }

        const skills = parserService.extractSkillsFromText(record.skills || '');
        
        // Combine skills with levels from comma-separated strings
        const skillLevelsStr = (record as unknown as { SkillLevels?: string }).SkillLevels || (record as unknown as { skilllevels?: string }).skilllevels || '';
        const skillYearsStr = (record as unknown as { SkillYears?: string }).SkillYears || (record as unknown as { skillyears?: string }).skillyears || '';
        
        let skillsArray: Array<{ name: string; level: string; yearsOfExperience: number }> = [];
        if (skillLevelsStr || skillYearsStr) {
          const names = skills;
          const levels = skillLevelsStr.split(',').map(s => s.trim());
          const years = skillYearsStr.split(',').map(y => parseInt(y.trim(), 10) || 0);
          names.forEach((name, i) => {
            if (name) {
              skillsArray.push({
                name,
                level: levels[i] || 'Intermediate',
                yearsOfExperience: years[i] || 0
              });
            }
          });
        } else {
          skillsArray = skills.map(skill => ({ name: skill, level: 'Intermediate', yearsOfExperience: 0 }));
        }

        const resumeLink = record.resumeLink || undefined;

        const firstName = (record as unknown as { FirstName?: string }).FirstName || record.name?.split(' ')[0] || '';
        const lastName = (record as unknown as { LastName?: string }).LastName || record.name?.split(' ').slice(1).join(' ') || '';

        // Extract education from Excel columns
        const educationDegree = (record as unknown as { EducationDegree?: string }).EducationDegree || (record as unknown as { educationdegree?: string }).educationdegree;
        const educationInstitution = (record as unknown as { Institution?: string }).Institution || (record as unknown as { educationinstitution?: string }).educationinstitution;
        const educationField = (record as unknown as { EducationField?: string }).EducationField || (record as unknown as { educationfield?: string }).educationfield;
        const educationStartYear = (record as unknown as { EducationStartYear?: string }).EducationStartYear || (record as unknown as { educationstartyear?: string }).educationstartyear;
        const educationEndYear = (record as unknown as { EducationEndYear?: string }).EducationEndYear || (record as unknown as { educationendyear?: string }).educationendyear;
        
        let educationArray = [];
        if (educationDegree || educationInstitution) {
          educationArray.push({
            degree: educationDegree || '',
            institution: educationInstitution || '',
            year: parseInt(educationEndYear || '0', 10) || 0,
            field: educationField || ''
          });
        }

        // Extract experience years from various possible columns
        const experienceYears = parseInt(
          record.experience || 
          (record as unknown as { ExperienceYears?: string }).ExperienceYears ||
          (record as unknown as { experiencetype?: string })?.experiencetype || 
          '0', 
          10
        ) || 0;

        // Extract languages
        const languagesStr = (record as unknown as { Languages?: string }).Languages || (record as unknown as { languages?: string }).languages || '';
        const langProficiencyStr = (record as unknown as { LanguageProficiency?: string }).LanguageProficiency || (record as unknown as { languageproficiency?: string }).languageproficiency || '';
        
        let languagesArray: Array<{ name: string; proficiency: string }> = [];
        if (languagesStr) {
          const langNames = languagesStr.split(',').map(l => l.trim());
          const proficiencies = langProficiencyStr.split(',').map(p => p.trim());
          langNames.forEach((name, i) => {
            if (name) {
              languagesArray.push({
                name,
                proficiency: proficiencies[i] || 'Fluent'
              });
            }
          });
        }

        const applicant = await ExternalApplicant.create({
          name: record.name || `${firstName} ${lastName}`.trim(),
          email: recordEmail,
          phone: record.phone,
          skills: skillsArray.map(s => s.name),
          skillDetails: skillsArray,
          experience: {
            years: experienceYears,
            currentRole: (record as unknown as { CurrentRole?: string }).CurrentRole || (record as unknown as { experiencerole?: string }).experiencerole
          },
          education: educationArray,
          languages: languagesArray,
          resumeText: record.resumeText || `Skills: ${record.skills}. Experience: ${record.experience}`,
          resumeLink,
          resumeFilePath: undefined,
          source: ext === 'xlsx' || ext === 'xls' ? 'excel' : 'csv',
          jobId: validJobId,
          status: 'screening'
        });

        createdApplicants.push(applicant);
      } catch (err) {
        errors.push({
          row: i + 2,
          email: record.email,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    logger.info('Bulk upload processed', { 
      created: createdApplicants.length,
      errors: errors.length,
      skipped: skipped.length
    });

    res.status(201).json({
      success: true,
      message: `${createdApplicants.length} applicants imported successfully`,
      data: {
        created: createdApplicants.length,
        applicants: createdApplicants,
        errors: errors.length > 0 ? errors : undefined,
        skipped: skipped.length > 0 ? skipped : undefined,
        debug: {
          rawRecords: parsedData.records.slice(0, 2).map(r => ({
            name: r.name,
            email: r.email,
            phone: r.phone,
            skills: r.skills,
            keys: Object.keys(r)
          })),
          parseErrors: parsedData.errors,
          totalParsed: parsedData.records.length
        },
        summary: {
          totalInFile: parsedData.totalRows,
          successfullyCreated: createdApplicants.length,
          failed: errors.length,
          skipped: skipped.length
        }
      }
    });
  } catch (error) {
    logger.error('Error processing bulk upload:', error);
    res.status(500).json({ success: false, error: { message: 'Error processing bulk upload' } });
  }
});

export default router;