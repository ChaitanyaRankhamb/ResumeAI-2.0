# ResumeAI 2.0

A full-stack AI-powered resume analysis platform that leverages modern web technologies and artificial intelligence to provide comprehensive resume insights, skills analysis, and interview preparation guidance.

---

## 🎯 Project Overview

**ResumeAI 2.0** is a comprehensive resume analysis platform designed to help users:

- Upload and parse their resumes
- Get AI-powered analysis of their profile
- View detailed reports with multiple perspectives (skills, experience, projects)
- Generate professional PDF reports for download
- Prepare for interviews with personalized recommendations

The platform combines **Next.js 15** for a smooth frontend experience with **Express.js** backend services, powered by **Google's Generative AI** for intelligent resume analysis.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.5.14 with App Router and Server Components
- **Language**: TypeScript
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: React Context API
- **Authentication**: Cookie-based JWT with Next.js middleware
- **HTTP Client**: Fetch API with server-side cookie forwarding
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js with Express.js 5.2
- **Language**: TypeScript
- **Database**: MongoDB 7.1 (Mongoose 9.3)
- **Caching**: Redis 5.11
- **Authentication**: Passport.js with Google OAuth 2.0
- **PDF Generation**: Puppeteer 24.40 (headless Chrome)
- **AI Engine**: Google Generative AI (Gemini API)
- **Email Service**: Resend
- **Resume Parsing**: Mammoth (DOCX), PDF-Parse, Textract
- **File Upload**: Multer

### DevOps & Deployment

- **Containerization**: Docker & Docker Compose
- **Environment**: .env-based configuration
- **Port Configuration**: Backend (5000), Frontend (3000), Redis (6381)

---

## ✨ Features

### Authentication & Authorization

- ✅ Email-based registration with OTP verification
- ✅ Google OAuth 2.0 integration for social login
- ✅ JWT token-based authentication
- ✅ Secure cookie management with HttpOnly and SameSite flags
- ✅ User verification flow with 6-digit OTP codes
- ✅ Resend integration for reliable email delivery

### Resume Upload & Processing

- ✅ Support for multiple formats (PDF, DOCX, TXT)
- ✅ Automatic resume parsing and text extraction
- ✅ Structured data extraction (skills, experience, projects)
- ✅ File validation and size limits
- ✅ MongoDB storage with file metadata
- ✅ Unique file hash for deduplication

### AI-Powered Analysis

- ✅ **Skills Analysis**: Extract and evaluate technical & soft skills
- ✅ **Experience Insights**: Analyze work history and career progression
- ✅ **Projects Review**: Identify and assess project accomplishments
- ✅ **Recommendations**: Get actionable suggestions for improvement
- ✅ **Interview Preparation**: Tailored interview questions and tips
- ✅ Powered by Google's Gemini API with structured JSON responses

### Report Generation

- ✅ **Server-Side Rendering (SSR)**: Ensures reliable PDF capture
- ✅ **Multi-Section Reports**: Skills, Experience, Projects, Recommendations, Interview Prep
- ✅ **PDF Export**: Download reports with professional formatting
- ✅ **Authentication**: Puppeteer-based PDF generation with secure auth flow
- ✅ **Responsive Design**: Reports render beautifully on all screen sizes
- ✅ **Animation Optimization**: Disabled during PDF generation for consistency

### Performance & Caching

- ✅ **Redis Caching**: Cache analysis results to reduce API calls
- ✅ **Smart Cache Strategy**: Fallback from MongoDB to Redis
- ✅ **Cache Control Headers**: No-store headers for analysis routes
- ✅ **Database Optimization**: Indexed MongoDB queries for fast retrieval

### Security Features

- ✅ **Authorization Middleware**: Protect routes with auth checks
- ✅ **File Ownership Validation**: Ensure users can only access their files
- ✅ **CORS Configuration**: Restricted to allowed origins
- ✅ **Cookie Security**: HttpOnly, SameSite, and domain restrictions
- ✅ **Error Handling**: Comprehensive error middleware with appropriate status codes
- ✅ **Input Validation**: Zod-based request/response validation

---

## 📁 Project Structure

```
ResumeAI 2.0/
├── Backend/
│   ├── src/
│   │   ├── app.ts                    # Express app setup
│   │   ├── config/
│   │   │   ├── mongo.connection.ts   # MongoDB connection
│   │   │   ├── redis.connection.ts   # Redis connection
│   │   │   └── passport.config.ts    # OAuth configuration
│   │   ├── modules/
│   │   │   ├── user/                 # User auth routes & controllers
│   │   │   ├── verify/               # Email verification
│   │   │   ├── resume/               # Resume upload & analysis
│   │   │   │   ├── controllers/      # Business logic
│   │   │   │   ├── services/         # AI analysis services
│   │   │   │   └── routes.ts         # API endpoints
│   │   │   └── checkUsername/        # Username availability check
│   │   ├── entities/
│   │   │   ├── user/                 # User domain model
│   │   │   └── files/                # File domain model
│   │   ├── database/
│   │   │   └── mongo/                # MongoDB repositories
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── errorHandling.middleware.ts
│   │   │   └── upload.resume.middleware.ts
│   │   ├── routes/
│   │   │   └── reportPdf.ts          # PDF generation (Puppeteer)
│   │   ├── prompts/                  # System prompts for Gemini AI
│   │   ├── validations/              # Zod schemas
│   │   └── utils/                    # Helper functions
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── login/page.tsx        # Login page
│   │   │   ├── register/page.tsx     # Registration page
│   │   │   ├── verify/page.tsx       # Email verification
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       └── report/page.tsx   # SSR Report page
│   │   ├── components/
│   │   │   ├── report/               # Report sections (client & server)
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   ├── layout/               # Layout components
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   └── api/                  # API integration
│   │   ├── context/
│   │   │   └── UserContext.tsx       # Global user state
│   │   ├── hooks/
│   │   │   └── use-mobile.ts         # Mobile detection hook
│   │   ├── lib/
│   │   │   ├── utils.ts              # Utility functions
│   │   │   └── refresh-user.ts       # User refresh logic
│   │   └── styles/
│   │       └── globals.css           # Global styles
│   ├── package.json
│   └── Dockerfile
│
├── types/
│   └── resumeUploadResponse.d.ts     # Global TypeScript types
│
├── docker-compose.yml                # Container orchestration
└── .env                              # Environment variables

```

---

## 🔄 Data Flow Architecture

### Resume Upload & Analysis Flow

1. **User Upload** → Frontend sends resume file with multipart form-data
2. **File Processing** → Backend validates file type, size, and format
3. **Text Extraction** → Parse DOCX/PDF/TXT using Mammoth, PDF-Parse, Textract
4. **Structured Parsing** → Extract key information (skills, experience, projects)
5. **AI Analysis** → Send to Gemini API with system prompt for structured response
6. **Caching** → Store result in Redis (fast retrieval) and MongoDB (persistence)
7. **Report Generation** → User views analysis report on SSR page

### Report PDF Generation Flow

1. **Request PDF** → User clicks download from report page
2. **Puppeteer Launch** → Start headless Chrome instance
3. **Cookie Injection** → Inject JWT accessToken into browser session
4. **Page Navigation** → Navigate to SSR report page (`/dashboard/report?fileId=...`)
5. **Wait for Content** → Poll DOM until report container is fully rendered
6. **PDF Capture** → Generate PDF with A4 formatting
7. **Browser Cleanup** → Close page and browser instances
8. **Download** → Send PDF to user with proper headers

---

## 🚀 API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/register` → Register with email & password
- `POST /auth/login` → Login with email & password
- `GET /auth/google/callback` → Google OAuth callback
- `GET /auth/logout` → Logout and clear tokens

### Verification Routes (`/verify`)

- `POST /verify/code` → Verify email with OTP
- `POST /verify/resend` → Resend verification OTP

### Resume Routes (`/upload-resume`, `/resume`)

- `POST /upload-resume` → Upload resume file (multipart/form-data)
- `GET /resume/analysis/:fileId` → Get analysis for file (SSR use)
- `GET /resume/progress/:fileId` → Get processing status (if applicable)

### Utility Routes

- `GET /check-username/:username` → Check username availability

### PDF Generation Routes (`/report`)

- `GET /report/download/:fileId` → Download PDF report (Puppeteer-based)

---

## 🔐 Authentication Architecture

### JWT + Cookie Strategy

- **Access Token**: Stored in secure HTTPOnly cookie, sent automatically with requests
- **JWT Payload**: Contains `userId` and `email`
- **Token Expiry**: Configured in environment variables
- **Refresh Flow**: Server validates token during protected route access
- **CORS**: Credentials included to send cookies across frontend-backend boundary

### Middleware Chain

1. **CORS Middleware** → Allow cross-origin requests with credentials
2. **Auth Middleware** → Extract and validate JWT from cookies
3. **Authorization Check** → Verify user owns the resource
4. **Error Handler** → Catch and format errors consistently

---

## 📊 Data Models

### User

```javascript
{
  id: ObjectId,
  email: String (unique),
  username: String (optional),
  avatar: String (optional),
  emailVerified: Boolean,
  isActive: Boolean,
  providers: [{ type: GOOGLE|EMAIL, providerId: String }],
  verificationCode: Number (for email verification),
  verificationExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### File

```javascript
{
  id: ObjectId,
  userId: ObjectId (foreign key),
  name: String,
  originalName: String,
  path: String (file system path),
  size: Number,
  hash: String (for deduplication),
  format: String (pdf|docx|txt),
  parseText: String (extracted text),
  structuredData: Object (parsed resume structure),
  analyzedData: Object (AI analysis result, nested),
  uploadedAt: Date
}
```

### Resume Analysis Result

```javascript
{
  skillInsights: {
    allSkills: [{ skill: String, proficiency: String, category: String }],
    strengths: String,
    gaps: String,
    recommendations: String
  },
  experienceInsights: {
    careerProgression: String,
    strengths: String,
    areasForImprovement: String
  },
  projectsAnalysis: {
    summary: String,
    strengths: String,
    improvements: String
  },
  recommendations: String,
  interviewPrep: {
    questions: [String],
    tips: [String],
    strengths: String,
    areasOfConcern: String
  }
}
```

---

## 🎨 Server-Side Rendering Implementation

### Why SSR for Reports?

- **Reliability**: Ensures all content is rendered before PDF capture
- **No Timing Issues**: Eliminates race conditions with client-side rendering
- **Server Cookies**: Auth cookies are forwarded server-to-server for Puppeteer
- **Consistent Output**: Same data fetch ensures PDF matches displayed report

### Implementation Details

- **Report Page** (`frontend/src/app/dashboard/report/page.tsx`):
  - Server Component (no `'use client'`)
  - Fetches analysis data server-side with `await cookies()`
  - Renders all report sections within `#report-container` div
  - Passes static data to child components

- **PDF Route** (`backend/src/routes/reportPdf.ts`):
  - Puppeteer launches headless Chrome
  - Injects access token cookie into browser session
  - Navigates to Next.js SSR page with `fileId` param
  - Waits for `#report-container` to have 1000+ characters
  - Captures and returns PDF with A4 formatting

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

### Installation

1. **Clone & Install Dependencies**

   ```bash
   cd Backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   Create `.env` file in root:

   ```
   # MongoDB
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=password
   MONGO_DATABASE=resumeai
   MONGO_URI=mongodb://admin:password@localhost:27017/resumeai

   # Redis
   REDIS_PASSWORD=redis_password
   REDIS_URL=redis://:redis_password@localhost:6379

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Resend Email
   RESEND_API_KEY=your_resend_api_key

   # Ports
   BACKEND_PORT=5000
   FRONTEND_PORT=3000
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Or Run Locally**

   ```bash
   # Terminal 1: Backend
   cd Backend && npm start

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Redis UI: http://localhost:8002

---

## 🔑 Environment Variables Reference

| Variable               | Required | Description                  |
| ---------------------- | -------- | ---------------------------- |
| `MONGO_URI`            | Yes      | MongoDB connection string    |
| `REDIS_URL`            | Yes      | Redis connection URL         |
| `JWT_SECRET`           | Yes      | Secret for JWT signing       |
| `GOOGLE_CLIENT_ID`     | Yes      | Google OAuth 2.0 credentials |
| `GOOGLE_CLIENT_SECRET` | Yes      | Google OAuth secret          |
| `GEMINI_API_KEY`       | Yes      | Google Generative AI API key |
| `RESEND_API_KEY`       | Yes      | Resend email service API key |
| `PORT`                 | No       | Backend port (default: 5000) |
| `NODE_ENV`             | No       | development/production       |

---

## 🎯 Key Design Decisions

### 1. **Server-Side Rendering for Reports**

- **Why**: Ensures consistent PDF output, eliminates timing issues, centralizes auth
- **Implementation**: Next.js 15 Server Components with SSR

### 2. **Redis Caching Layer**

- **Why**: Reduce API calls to Gemini, improve response times
- **Strategy**: Cache by file hash, fallback to MongoDB on miss

### 3. **Puppeteer for PDFs**

- **Why**: Generates pixel-perfect PDFs matching browser rendering
- **Advantage**: No additional PDF libraries needed, uses existing HTML/CSS

### 4. **Google OAuth + Email Auth**

- **Why**: Flexible authentication, social login convenience
- **Implementation**: Passport.js with multiple strategies

### 5. **MongoDB + Domain Models**

- **Why**: Schema flexibility + domain-driven design
- **Benefit**: Type-safe entities, business logic encapsulation

### 6. **Monorepo Structure**

- **Why**: Shared types, easier local development
- **Note**: Backend and Frontend are independent services

---

## 📈 Performance Optimizations

- **Redis Caching**: Analyzed results cached from first request
- **File Hashing**: Duplicate resumes reuse existing analysis
- **Database Indexes**: Optimized queries on userId and fileId
- **NextJS 15**: Optimized builds, streaming responses
- **Puppeteer Pooling**: Reuse browser instances (room for improvement)
- **Animation Disabling**: Removed during PDF generation for consistency

---

## 🐛 Known Issues & Improvements

### Current State

- PDF generation with Puppeteer is reliable with SSR
- Auth flow works with cookie injection
- Caching strategy prevents unnecessary API calls
- Error handling provides meaningful feedback

### Future Enhancements

- Browser instance pooling for PDF generation
- Webhook support for async analysis
- Export to multiple formats (JSON, CSV)
- Resume comparison feature
- Advanced skill marketplace integration
- Mobile app (React Native)

---

## 🤝 Contributing

When working on this project:

1. Keep Backend and Frontend TypeScript strict
2. Use Zod for input validation
3. Implement error handling with AppError
4. Cache expensive operations in Redis
5. Test auth flows end-to-end
6. Document API changes

---

## 📝 License

ISC License - See LICENSE file for details

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Redis Documentation](https://redis.io/docs/)
- [Google Generative AI](https://ai.google.dev/)
- [Puppeteer API](https://pptr.dev/)

---

## 🎓 Project Summary

**ResumeAI 2.0** demonstrates a modern full-stack application combining:

- **TypeScript** throughout for type safety
- **Server-Side Rendering** for reliable PDF generation
- **AI Integration** for intelligent resume analysis
- **Caching Strategies** for performance
- **Secure Authentication** with OAuth and JWT
- **Cloud-Ready Architecture** with Docker support
