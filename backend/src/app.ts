import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// environment variables
dotenv.config();

//routes
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicantRoutes from './routes/applicant.routes';
import screeningRoutes from './routes/screening.routes';
import chatRoutes from './routes/chat.routes';
import profileRoutes from './routes/profile.routes';
import internalRoutes from './routes/internal.routes';
import externalRoutes from './routes/external.routes';
import analyticsRoutes from './routes/analytics.routes';
import shortlistRoutes from './routes/shortlist.routes';
import adminRoutes from './routes/admin.routes';
import systemRoutes from './routes/system.routes';
import testRoutes from './routes/test.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Import config
import logger from './utils/logger';

const app: Application = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Umurava AI Recruitment Platform API',
      version: '2.0.0',
      description: 'AI-powered recruitment platform with Gemini API. Supports Applicant Portal and Recruiter Dashboard.',
      contact: { name: 'API Support' }
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}`, description: 'Development server' },
      { url: 'https://recruiter-ai-platform.onrender.com', description: 'Production server' }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication - Register, Login, Get Me' },
      { name: 'Jobs', description: 'Job postings - Create, Read, Update, Delete, Bias Detection' },
      { name: 'Profile', description: 'Talent Profile - Create, Update, Get, Completion, Recommendations, Improve Suggestions' },
      { name: 'Internal Applicants', description: 'Internal applicants - Apply to jobs, List, Update status' },
      { name: 'External Applicants', description: 'External applicants - Create, List, Update, Delete, Upload (CSV, PDF, Excel)' },
      { name: 'Screening', description: 'AI-powered candidate screening, trigger, results, rankings' },
      { name: 'Shortlist', description: 'Shortlisted candidates - List, Compare, Explain decisions' },
      { name: 'Chat', description: 'AI chatbot - Send message, Recommendations, Explain decision, Analyze job, Interview questions, Chat history' },
      { name: 'Analytics', description: 'Dashboard analytics and statistics' },
      { name: 'Admin', description: 'Admin operations - Create users, Manage users' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['applicant', 'recruiter', 'admin'] }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string' }
              }
            }
          }
        },
        TalentProfile: {
          type: 'object',
          properties: {
            basicInfo: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                headline: { type: 'string' },
                bio: { type: 'string' },
                location: { type: 'string' },
                phone: { type: 'string' }
              }
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
                  yearsOfExperience: { type: 'number' }
                }
              }
            },
            languages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  proficiency: { type: 'string', enum: ['Basic', 'Conversational', 'Fluent', 'Native'] }
                }
              }
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  role: { type: 'string' },
                  startDate: { type: 'string' },
                  endDate: { type: 'string' },
                  description: { type: 'string' },
                  technologies: { type: 'array', items: { type: 'string' } },
                  isCurrent: { type: 'boolean' }
                }
              }
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  institution: { type: 'string' },
                  degree: { type: 'string' },
                  fieldOfStudy: { type: 'string' },
                  startYear: { type: 'number' },
                  endYear: { type: 'number' }
                }
              }
            },
            certifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  issuer: { type: 'string' },
                  issueDate: { type: 'string' }
                }
              }
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  technologies: { type: 'array', items: { type: 'string' } },
                  role: { type: 'string' },
                  link: { type: 'string' },
                  startDate: { type: 'string' },
                  endDate: { type: 'string' }
                }
              }
            },
            availability: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['Available', 'Open to Opportunities', 'Not Available'] },
                type: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract'] },
                startDate: { type: 'string' }
              }
            },
            socialLinks: {
              type: 'object',
              properties: {
                linkedin: { type: 'string' },
                github: { type: 'string' },
                portfolio: { type: 'string' }
              }
            }
          }
        },
        ProfileCompletion: {
          type: 'object',
          properties: {
            basicInfo: { type: 'number' },
            skills: { type: 'number' },
            languages: { type: 'number' },
            experience: { type: 'number' },
            education: { type: 'number' },
            certifications: { type: 'number' },
            projects: { type: 'number' },
            availability: { type: 'number' },
            socialLinks: { type: 'number' },
            overall: { type: 'number' }
          }
        },
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            employmentType: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] },
            jobLevel: { type: 'string', enum: ['entry', 'mid', 'senior', 'lead', 'executive'] },
            requiredSkills: { type: 'array', items: { type: 'string' } },
            responsibilities: { type: 'array', items: { type: 'string' } },
            experience: { type: 'string' },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string' },
                  field: { type: 'string' },
                  required: { type: 'boolean' }
                }
              }
            },
            certifications: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                city: { type: 'string' },
                country: { type: 'string' },
                remote: { type: 'boolean' }
              }
            },
            salary: {
              type: 'object',
              nullable: true,
              properties: { min: { type: 'number' }, max: { type: 'number' }, currency: { type: 'string' } }
            },
            benefits: { type: 'array', items: { type: 'string' } },
            applicationProcess: {
              type: 'object',
              properties: { steps: { type: 'array', items: { type: 'string' } } }
            },
            tags: { type: 'array', items: { type: 'string' } },
            createdBy: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'closed', 'archived'] },
            applicationDeadline: { type: 'string', format: 'date' },
            expirationDate: { type: 'string', format: 'date' },
            postedDate: { type: 'string', format: 'date-time' },
            analytics: {
              type: 'object',
              properties: {
                applications: { type: 'number' },
                shortlisted: { type: 'number' }
              }
            },
            countdown: {
              type: 'object',
              properties: {
                expired: { type: 'boolean' },
                daysRemaining: { type: 'number' },
                hoursRemaining: { type: 'number' },
                endDate: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        InternalApplicant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            talentProfileId: { type: 'string' },
            jobId: { type: 'string' },
            status: { type: 'string', enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] },
            appliedAt: { type: 'string', format: 'date-time' }
          }
        },
        ExternalApplicant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            experience: { type: 'object' },
            education: { type: 'array' },
            resumeText: { type: 'string' },
            source: { type: 'string', enum: ['pdf', 'csv', 'excel', 'link', 'manual'] },
            status: { type: 'string', enum: ['screening', 'interview', 'offer', 'hired', 'rejected'] }
          }
        },
        ScreeningResult: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            applicantId: { type: 'string' },
            score: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            gaps: { type: 'array', items: { type: 'string' } },
            reasoning: { type: 'string' },
            ranking: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'shortlisted', 'rejected', 'interview'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: { message: { type: 'string' } }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://umuravarecruit-system.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static content
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Evode | Recruiter API Documentation'
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/applicants/internal', internalRoutes);
app.use('/api/applicants/external', externalRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/test', testRoutes);

// Serve test.html as static file
app.get('/test', (_req, res) => {
  res.sendFile(__dirname + '/test.html');
});

// Root endpoint - HTML page
app.get('/', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Umurava AI Recruitment Platform</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css">
  <style>
    :root {
      --primary: #4F46E5;
      --primary-dark: #4338CA;
      --secondary: #06B6D4;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --dark: #0F172A;
      --gray: #64748B;
      --light: #F8FAFC;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: var(--dark);
      min-height: 100vh;
      color: white;
      overflow-x: hidden;
    }
    
    .bg-pattern {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: 
        radial-gradient(ellipse at 20% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
      position: relative;
      z-index: 1;
    }
    
    .header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      -webkit-text-fill-color: white;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      color: #6EE7B7;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.8125rem;
      font-weight: 500;
      border: 1px solid rgba(16, 185, 129, 0.3);
      margin-bottom: 1.5rem;
    }
    
    .badge-dot {
      width: 8px; height: 8px;
      background: #10B981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }
    
    .header h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #fff, #CBD5E1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header p {
      font-size: 1.25rem;
      color: var(--gray);
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.6;
    }
    
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
    }
    
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
    }
    
    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1.25rem;
    }
    
    .endpoints {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .endpoint {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .endpoint::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .endpoint:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(79, 70, 229, 0.3);
      transform: translateY(-3px);
    }
    
    .endpoint:hover::before {
      transform: scaleX(1);
    }
    
    .endpoint-icon {
      width: 40px;
      height: 40px;
      background: rgba(79, 70, 229, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      color: var(--primary);
    }
    
    .endpoint-icon.green { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .endpoint-icon.cyan { background: rgba(6, 182, 212, 0.15); color: var(--secondary); }
    .endpoint-icon.yellow { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
    .endpoint-icon.red { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
    
    .endpoint h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .endpoint p {
      font-size: 0.8125rem;
      color: var(--gray);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }
    
    .endpoint-method {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--gray);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .method-get { color: var(--success); }
    .method-post { color: var(--warning); }
    .method-put { color: var(--secondary); }
    .method-delete { color: var(--danger); }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 3rem;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--gray);
      margin-top: 0.25rem;
    }
    
    .footer {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--gray);
      font-size: 0.875rem;
    }
    
    .footer a {
      color: var(--primary);
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 900px) {
      .endpoints { grid-template-columns: repeat(2, 1fr); }
      .stats { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media (max-width: 640px) {
      .endpoints, .stats { grid-template-columns: 1fr; }
      .header h1 { font-size: 2.25rem; }
      .container { padding: 2rem 1rem; }
    }
  </style>
</head>
<body>
  <div class="bg-pattern"></div>
  <div class="container">
    <header class="header">
      <div class="logo">
        <div class="logo-icon"><i class="fas fa-robot"></i></div>
        <span>Umurava AI</span>
      </div>
      <div class="badge">
        <span class="badge-dot"></span>
        <span>API Running</span>
      </div>
      <h1>AI Recruitment Platform</h1>
      <p>Power your hiring process with AI-powered screening, bias detection, candidate matching, and intelligent chat.</p>
      <a href="/api-docs" class="cta-btn">
        <span>Explore API Docs</span>
        <i class="fas fa-arrow-right"></i>
      </a>
    </header>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">10+</div>
        <div class="stat-label">API Endpoints</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">3</div>
        <div class="stat-label">User Roles</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">5</div>
        <div class="stat-label">AI Modules</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">100%</div>
        <div class="stat-label">AI Powered</div>
      </div>
    </div>
    
    <p class="section-title">Authentication & Users</p>
    <div class="endpoints">
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon"><i class="fas fa-user-plus"></i></div>
        <h3>Auth API</h3>
        <p>Register, login, JWT authentication</p>
        <span class="endpoint-method method-post">POST /auth/register</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon green"><i class="fas fa-user-shield"></i></div>
        <h3>Admin API</h3>
        <p>User management, create recruiters</p>
        <span class="endpoint-method method-post">POST /api/admin/create-user</span>
      </a>
    </div>
    
    <p class="section-title">Jobs & Applications</p>
    <div class="endpoints">
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon"><i class="fas fa-briefcase"></i></div>
        <h3>Jobs API</h3>
        <p>Create, manage job postings with bias detection</p>
        <span class="endpoint-method method-post">POST /api/jobs</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon green"><i class="fas fa-users"></i></div>
        <h3>Internal Applicants</h3>
        <p>Apply to jobs, track applications</p>
        <span class="endpoint-method method-post">POST /api/applicants/internal</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon cyan"><i class="fas fa-user-plus"></i></div>
        <h3>External Applicants</h3>
        <p>Upload resumes (CSV, PDF, Excel)</p>
        <span class="endpoint-method method-post">POST /api/applicants/external</span>
      </a>
    </div>
    
    <p class="section-title">AI Features</p>
    <div class="endpoints">
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon yellow"><i class="fas fa-robot"></i></div>
        <h3>Screening API</h3>
        <p>AI candidate evaluation & ranking</p>
        <span class="endpoint-method method-post">POST /api/screening/run</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon red"><i class="fas fa-list-check"></i></div>
        <h3>Shortlist API</h3>
        <p>Shortlisted candidates with explanations</p>
        <span class="endpoint-method method-get">GET /api/shortlist</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon"><i class="fas fa-comments"></i></div>
        <h3>Chat API</h3>
        <p>AI assistant for recruiters</p>
        <span class="endpoint-method method-post">POST /api/chat/message</span>
      </a>
    </div>
    
    <p class="section-title">Analytics & Profile</p>
    <div class="endpoints">
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon cyan"><i class="fas fa-chart-line"></i></div>
        <h3>Analytics API</h3>
        <p>Dashboard statistics & insights</p>
        <span class="endpoint-method method-get">GET /api/analytics</span>
      </a>
      <a href="/api-docs" class="endpoint">
        <div class="endpoint-icon green"><i class="fas fa-user"></i></div>
        <h3>Profile API</h3>
        <p>Talent profile management</p>
        <span class="endpoint-method method-get">GET /api/profile</span>
      </a>
    </div>
    
    <footer class="footer">
      <p>Built with <i class="fas fa-heart" style="color: #EF4444;"></i> by Umurava AI</p>
      <p style="margin-top: 0.5rem;">Powered by <a href="#">Gemini AI</a> &bull; Documentation at <a href="/api-docs">/api-docs</a></p>
    </footer>
  </div>
</body>
</html>
  `);
});

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
