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
import jobRoutes from './routes/job.routes';
import applicantRoutes from './routes/applicant.routes';
import screeningRoutes from './routes/screening.routes';
import chatRoutes from './routes/chat.routes';

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
      title: 'Recruiter AI Platform API',
      version: '1.0.0',
      description: 'AI-powered Umurava recruitment platform with resume/cv screening, candidate ranking, and bias detection.                                        ',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: 'https://recruiter-ai-platform.onrender.com',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Jobs', description: 'Job posting management and bias detection' },
      { name: 'Applicants', description: 'Candidate management and resume uploads' },
      { name: 'Screening', description: 'AI-powered candidate screening and evaluation' },
      { name: 'Chat', description: 'AI-powered recruiter assistant and recommendations' }
    ],
    components: {
      schemas: {
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            requiredSkills: { type: 'array', items: { type: 'string' } },
            experience: {
              type: 'object',
              properties: {
                minYears: { type: 'number' },
                maxYears: { type: 'number' },
                level: { type: 'string', enum: ['entry', 'mid', 'senior', 'executive'] }
              }
            },
        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              degree: { type: 'string', description: 'Degree requirement (e.g., Bachelor, Master)' },
              field: { type: 'string', description: 'Field of study (e.g., Computer Science, Engineering)' },
              required: { type: 'boolean', description: 'Whether this education is required' }
            }
          }
        }
          }
        },
        Applicant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            experience: {
              type: 'object',
              properties: {
                years: { type: 'number' },
                currentRole: { type: 'string' }
              }
            },
            resumeText: { type: 'string' }
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
              properties: {
                message: { type: 'string' }
              }
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
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/chat', chatRoutes);

// Root endpoint - HTML page
app.get('/', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recruiter AI Platform API</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .container {
      max-width: 1000px;
      width: 100%;
    }
    
    .header {
      text-align: center;
      color: white;
      margin-bottom: 2.5rem;
    }
    
    .header h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    
    .header p {
      opacity: 0.85;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .docs-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      color: #1E40AF;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      margin-bottom: 1.5rem;
    }
    
    .docs-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.2);
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #6EE7B7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    
    .endpoints {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    
    .endpoint {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .endpoint::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #1E40AF);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .endpoint:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    }
    
    .endpoint:hover::before {
      transform: scaleX(1);
    }
    
    .endpoint-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    
    .endpoint h3 {
      color: #1E40AF;
      font-size: 1.125rem;
      font-weight: 700;
    }
    
    .endpoint-tag {
      background: #DBEAFE;
      color: #1E40AF;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .endpoint p {
      color: #6B7280;
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    
    .endpoint-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #9CA3AF;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .endpoint-arrow {
      margin-left: auto;
      color: #3B82F6;
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }
    
    .endpoint:hover .endpoint-arrow {
      transform: translateX(5px);
    }
    
    @media (max-width: 640px) {
      .endpoints {
        grid-template-columns: 1fr;
      }
      
      .header h1 {
        font-size: 1.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="/api-docs" class="docs-btn">
        <span>View API Documentation</span>
        <span style="font-size: 1.1rem;">→</span>
      </a>
      <div class="status">
        <span class="status-dot"></span>
        <span>API RUNNING</span>
      </div>
      <h1>Recruiter AI Platform API</h1>
      <p>AI-powered recruitment with Gemini</p>
    </div>
    
    <div class="endpoints">
      <a href="/api/jobs" class="endpoint">
        <div class="endpoint-header">
          <h3>Jobs API</h3>
          <span class="endpoint-tag">4 Endpoints</span>
        </div>
        <p>Create, manage, and analyze job postings with AI-powered bias detection.</p>
        <div class="endpoint-meta">
          <span>POST /api/jobs</span>
          <span class="endpoint-arrow">→</span>
        </div>
      </a>
      
      <a href="/api/applicants" class="endpoint">
        <div class="endpoint-header">
          <h3>Applicants API</h3>
          <span class="endpoint-tag">5 Endpoints</span>
        </div>
        <p>Upload resumes, manage candidates, and extract structured profile data.</p>
        <div class="endpoint-meta">
          <span>POST /api/applicants</span>
          <span class="endpoint-arrow">→</span>
        </div>
      </a>
      
      <a href="/api/screening/" class="endpoint">
        <div class="endpoint-header">
          <h3>Screening API</h3>
          <span class="endpoint-tag">4 Endpoints</span>
        </div>
        <p>Run AI applicant evaluation, compare rankings, and get recommendations.</p>
        <div class="endpoint-meta">
          <span>POST /api/screening/run</span>
          <span class="endpoint-arrow">→</span>
        </div>
      </a>
      
      <a href="/api/chat" class="endpoint">
        <div class="endpoint-header">
          <h3>Chat API</h3>
          <span class="endpoint-tag">2 Endpoints</span>
        </div>
        <p>AI assistant for recruiters with natural language candidate insights.</p>
        <div class="endpoint-meta">
          <span>POST /api/chat/message</span>
          <span class="endpoint-arrow">→</span>
        </div>
      </a>
    </div>
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
