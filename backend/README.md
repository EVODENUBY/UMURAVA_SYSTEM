# Recruiter AI Platform - Backend

A complete AI-powered recruitment platform backend built with Node.js, TypeScript, Express, MongoDB, and Google Gemini API.

## Features

- **AI Resume Screening**: Automatically evaluate candidates against job descriptions using Gemini AI
- **Bias Detection**: Identify and flag potential biases in job descriptions and screening processes
- **Resume Parsing**: Extract structured data from PDF resumes using AI
- **CSV Bulk Upload**: Import multiple candidates at once via CSV
- **Candidate Ranking**: Score and rank candidates based on job fit
- **Explainable AI**: Get detailed reasoning for each screening decision
- **Chat Assistant**: AI-powered recruiter assistant for questions and recommendations
- **RESTful API**: Complete CRUD operations for jobs, applicants, and screening results

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI Layer**: Google Gemini API
- **File Parsing**: PDF-parse, CSV-parse
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB instance running
- Google Gemini API key

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```
Edit `.env` and add your:
- `MONGODB_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key

3. **Build the project**:
```bash
npm run build
```

4. **Start the server**:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create a new job |
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get job by ID |
| PUT | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete a job |
| GET | `/api/jobs/:id/bias` | Detect bias in job description |
| GET | `/api/jobs/:id/stats` | Get job screening statistics |

### Applicants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applicants` | Create applicant manually |
| GET | `/api/applicants` | List all applicants |
| GET | `/api/applicants/:id` | Get applicant by ID |
| PUT | `/api/applicants/:id` | Update an applicant |
| DELETE | `/api/applicants/:id` | Delete an applicant |
| POST | `/api/applicants/upload/resume` | Upload PDF resume |
| POST | `/api/applicants/upload/csv` | Upload CSV with multiple applicants |

### Screening
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/screening/run` | Run AI screening for a job |
| GET | `/api/screening/results/:jobId` | Get screening results |
| GET | `/api/screening/result/:jobId/:applicantId` | Get specific candidate result |
| PUT | `/api/screening/status/:jobId/:applicantId` | Update candidate status |
| POST | `/api/screening/compare/:jobId` | Compare multiple candidates |
| GET | `/api/screening/stats/:jobId` | Get screening statistics |
| POST | `/api/screening/rerun/:jobId` | Re-run screening |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |
| POST | `/api/chat/recommendations` | Get candidate recommendations |
| GET | `/api/chat/explain/:jobId/:applicantId` | Explain screening decision |
| GET | `/api/chat/analyze/:jobId` | Analyze job description |
| GET | `/api/chat/questions/:jobId/:applicantId` | Get interview questions |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |
| GET | `/` | API info and available endpoints |

## Request/Response Examples

### Create a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "We are looking for an experienced software engineer...",
    "requiredSkills": ["JavaScript", "Node.js", "MongoDB", "React"],
    "experience": {
      "minYears": 5,
      "maxYears": 10,
      "level": "senior"
    },
    "education": {
      "degree": "Bachelor'\''s Degree",
      "field": "Computer Science",
      "required": true
    }
  }'
```

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/applicants/upload/resume \
  -F "resume=@/path/to/resume.pdf"
```

### Run Screening
```bash
curl -X POST http://localhost:5000/api/screening/run \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_id_here",
    "threshold": 60,
    "autoShortlist": true
  }'
```

### Chat with AI Assistant
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who are the top 3 candidates for this role?",
    "jobId": "job_id_here"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.ts        # MongoDB connection
│   │   └── gemini.ts    # Gemini AI configuration
│   ├── controllers/      # Route controllers
│   │   ├── job.controller.ts
│   │   ├── applicant.controller.ts
│   │   ├── screening.controller.ts
│   │   └── chat.controller.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/           # Mongoose models
│   │   ├── job.model.ts
│   │   ├── applicant.model.ts
│   │   └── result.model.ts
│   ├── routes/           # API routes
│   │   ├── job.routes.ts
│   │   ├── applicant.routes.ts
│   │   ├── screening.routes.ts
│   │   └── chat.routes.ts
│   ├── services/         # Business logic
│   │   ├── ai.service.ts        # Gemini AI integration
│   │   ├── parser.service.ts    # PDF/CSV parsing
│   │   └── scoring.service.ts   # Candidate scoring
│   ├── utils/            # Utility functions
│   │   ├── promptBuilder.ts     # AI prompt builder
│   │   └── logger.ts            # Winston logger
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | required |
| `GEMINI_API_KEY` | Google Gemini API key | required |
| `GEMINI_MODEL` | Gemini model name | gemini-1.5-flash |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max upload file size (bytes) | 10485760 (10MB) |
| `LOG_LEVEL` | Logging level | info |

## AI Features

### Candidate Evaluation
The AI evaluates candidates based on:
- **Skills Match**: Percentage of required skills possessed
- **Experience Match**: Years and relevance of experience
- **Education Match**: Educational qualifications alignment
- **Overall Score**: Weighted combination of all factors

### Bias Detection
Detects potential biases in:
- Gendered language in job descriptions
- Unreasonable experience requirements
- Over-emphasis on formal education
- Exclusionary language

### Explainable Reasoning
Each screening includes:
- Detailed reasoning for the score
- Specific strengths identified
- Gaps or concerns highlighted
- Suggested interview questions

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Logging

Logs are written to:
- Console (development mode)
- `logs/error.log` (error level)
- `logs/combined.log` (all levels)

## License

MIT
