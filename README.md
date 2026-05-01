# 🎓 Smart Internship Finder & Tracker — Backend API

A **production-ready** Node.js + Express + MongoDB backend for discovering and tracking internship applications, with AI-powered resume matching via **Groq LLaMA3**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT access + refresh token rotation, bcrypt hashing |
| 👤 Users | Profile management, resume upload (Cloudinary) |
| 📋 Internships | CRUD, full-text search, multi-filter, pagination |
| 📊 Tracker | Apply, track status, notes, status history |
| 🤖 AI Matching | Groq LLaMA3-70b resume ↔ JD analysis |
| 🔔 Notifications | In-app notifications with 90-day TTL auto-expiry |
| 📈 Analytics | Dashboard, weekly/monthly trends, admin stats |
| 🛡️ Admin | User ban/promote, internship moderation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7+ (or Docker)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start development server
```bash
npm run dev
```

### 4. Or use Docker
```bash
docker-compose up -d
```

---

## 📚 API Documentation

Once running, visit: **http://localhost:5000/api/v1/docs**

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints Overview

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Auth | Logout |
| GET | `/auth/me` | Auth | Get current user |
| GET | `/users/profile` | Auth | Get profile |
| PATCH | `/users/profile` | Auth | Update profile |
| POST | `/users/resume` | Auth | Upload resume |
| DELETE | `/users/resume` | Auth | Delete resume |
| GET | `/internships` | Public | List + filter internships |
| POST | `/internships` | Auth | Create internship |
| GET | `/internships/:id` | Public | Get internship |
| PUT | `/internships/:id` | Auth | Update internship |
| DELETE | `/internships/:id` | Auth | Soft-delete internship |
| GET | `/internships/my` | Auth | My posted internships |
| POST | `/applications/:internshipId` | Auth | Apply to internship |
| GET | `/applications` | Auth | My applications |
| GET | `/applications/:id` | Auth | Get application |
| PATCH | `/applications/:id/status` | Auth | Update status |
| POST | `/applications/:id/notes` | Auth | Add note |
| DELETE | `/applications/:id` | Auth | Withdraw |
| POST | `/ai/match` | Auth | AI resume match |
| GET | `/ai/match/:applicationId` | Auth | Get match result |
| GET | `/notifications` | Auth | Get notifications |
| PATCH | `/notifications/read-all` | Auth | Mark all read |
| PATCH | `/notifications/:id/read` | Auth | Mark one read |
| GET | `/analytics/dashboard` | Auth | Dashboard stats |
| GET | `/analytics/weekly` | Auth | Weekly trend |
| GET | `/analytics/monthly` | Auth | Monthly trend |
| GET | `/analytics/admin` | Admin | Platform stats |
| GET | `/admin/users` | Admin | List all users |
| PATCH | `/admin/users/:id/toggle` | Admin | Ban/unban user |
| PATCH | `/admin/users/:id/promote` | Admin | Promote to admin |
| GET | `/admin/internships` | Admin | All internships |
| DELETE | `/admin/internships/:id` | Admin | Hard delete |

---

## 🏗️ Project Structure

```
src/
├── config/         # DB, Cloudinary, Swagger
├── controllers/    # Request handlers
├── middleware/     # Auth, error, validation, rate-limit
├── models/         # Mongoose schemas (User, Internship, Application, Notification)
├── routes/         # Express routers (/api/v1/)
├── services/       # AI (Groq), Cloudinary, Email, Notifications, Tokens
├── utils/          # Logger, ApiError, ApiResponse, asyncHandler, paginate
└── app.js          # Express app bootstrap
```

---

## 🔒 Security

- `helmet` — HTTP security headers  
- `cors` — Configurable origin whitelist  
- `express-rate-limit` — Auth: 10/15min, AI: 20/hr, Global: 100/15min  
- `express-mongo-sanitize` — NoSQL injection prevention  
- `xss-clean` — XSS prevention  
- `bcryptjs` — Password hashing (cost 12)  
- Refresh token rotation with hashed storage  

---

## 🤖 AI Resume Matching

Uses **Groq LLaMA3-70b** (ultra-fast inference) to analyze your resume against a job description:

```json
POST /api/v1/ai/match
{
  "jobDescription": "We are looking for a React developer...",
  "applicationId": "optional-id-to-save-result"
}
```

**Response:**
```json
{
  "matchResult": {
    "score": 78,
    "missingSkills": ["TypeScript", "Docker"],
    "suggestions": ["Add TypeScript projects to your GitHub"],
    "strengths": ["Strong React experience", "Good CSS skills"]
  }
}
```

---

## 🏥 Health Check

```
GET /health
```