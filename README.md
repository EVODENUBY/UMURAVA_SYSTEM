# Umurava AI Recruitment Platform

An AI-powered recruitment platform that leverages Google's Gemini API to automate candidate screening, profiling, and matching. The system supports both internal and external applicants with intelligent chatbot assistance for recruiters.

## 🎯 Project Overview

**Umurava AI** is a comprehensive recruitment solution featuring:

- **AI-Powered Candidate Screening** - Automated evaluation using Gemini API
- **Talent Profiling** - Intelligent candidate profile creation and completion
- **Job Bias Detection** - Identify and minimize biased language in job postings
- **Smart Matching** - Recommend candidates based on job requirements
- **Applicant Portal** - Self-serve platform for job applicants
- **Recruiter Dashboard** - Manage jobs, candidates, and screening results
- **AI Chatbot** - Interactive assistant for recruiters and applicants
- **Admin Panel** - User and system management
- **Real-time Updates** - WebSocket support for live notifications

## 📁 Project Structure

```
UMURAVA_SYSTEM/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # MongoDB schemas (User, Job, Applicant, etc.)
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic & AI integration
│   │   ├── middlewares/        # Auth, validation, error handling
│   │   ├── config/             # Database & environment setup
│   │   ├── utils/              # Helpers & logger
│   │   ├── scripts/            # Utility scripts (seed-admin)
│   │   ├── app.ts              # Express app configuration
│   │   └── server.ts           # Server entry point
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   └── README.md               # Backend development rules
│
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── app/                # Next.js app router pages
│   │   │   ├── (auth)/         # Auth pages (login, register)
│   │   │   └── (dashboard)/    # Dashboard layouts & pages
│   │   │       ├── recruiter/  # Recruiter interface
│   │   │       ├── applicant/  # Applicant interface
│   │   │       └── admin/      # Admin panel
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utilities & helpers
│   │   ├── types/              # TypeScript type definitions
│   │   └── assets/             # Images, fonts, etc.
│   ├── public/                 # Static files
│   ├── package.json            # Frontend dependencies
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.cjs      # Tailwind CSS setup
│   └── README.md               # Frontend development rules
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
└── .git/                       # Git repository
```

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js v20.12.0
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ORM**: Mongoose
- **AI Integration**: Google Generative AI (Gemini API)
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **File Processing**: PDF-parse, xlsx, csv-parse
- **Logging**: Winston
- **Security**: Helmet, CORS

### Frontend
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: Lucide React, Heroicons, React Icons
- **Animation**: Framer Motion
- **HTTP Client**: Integrated fetch API

## 🔑 Key Features

### For Recruiters
- Create and manage job postings
- Detect bias in job descriptions
- Upload candidates (CSV, PDF, Excel)
- Run AI-powered screening on applicant pools
- View ranked candidate lists and detailed comparisons
- Chat with AI assistant for candidate explanations
- Access recruitment analytics and statistics
- Manage shortlisted candidates

### For Applicants
- User registration and profile creation
- AI-powered profile recommendations
- Browse and apply for jobs
- Track application status
- View personalized job recommendations
- Chat with AI assistant for career guidance
- Update profile information

### For Admins
- User and role management
- System configuration
- Access to all platform features
- Analytics and reporting

## 📋 Core Models

- **User** - Recruiter, Applicant, Admin accounts with roles
- **Job** - Job postings with descriptions and requirements
- **Applicant** - Candidate profiles (internal & external)
- **TalentProfile** - Enriched candidate profiles with skills and experience
- **Result** - Screening results and AI evaluation scores
- **Chat** - Conversation history between users and AI
- **Message** - Individual chat messages
- **Shortlist** - Shortlisted candidates for specific jobs

## 🔌 API Endpoints Overview

The API follows RESTful conventions and includes:

- **Auth** - Login, Register, JWT token management
- **Jobs** - CRUD operations, bias detection
- **Profile** - Talent profile management and AI recommendations
- **Applicants** - Internal and external applicant management
- **Screening** - Run AI screening, view results, get rankings
- **Shortlist** - Manage shortlisted candidates
- **Chat** - AI chatbot interactions and recommendations
- **Analytics** - Dashboard statistics
- **Admin** - User management

**API Documentation**: Available at `/api-docs` (Swagger UI)

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v20.12.0
- MongoDB instance (local or cloud)
- Google Gemini API key
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install


# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed admin user
npm run seed:admin
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
# Required: NEXT_PUBLIC_API_URL (backend API URL)

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Backend linting
npm run lint

# Frontend linting
cd frontend
npm run lint
```

## 🏗️ Development Workflow

## 📊 API Documentation

Interactive Swagger documentation is available at:
- **Development**: `http://localhost:5000/api-docs`
- **Production**: Check deployment URL

## 🤝 Contributing

1. Follow the development guidelines in backend/README.md and frontend/README.md
2. Create feature branches (never push to main)
3. Write clean, readable code
4. Test thoroughly before submitting PR
5. Ensure no breaking changes
6. Keep documentation updated

## 📝 License

MIT License - See LICENSE file for details

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Status**: Active Development
