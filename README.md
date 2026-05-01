ere is a detailed breakdown of the backend structure and API details that your friend can use to build the frontend.

🚀 Backend Overview
Base URL: http://localhost:5000/api/v1 (Default development port)
API Documentation: http://localhost:5000/api/v1/docs (Interactive Swagger UI)
Tech Stack: Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary (for uploads), Groq AI (for resume analysis).
📂 Project Structure
text
backend/
├── src/
│   ├── app.js            # App config & route mounting
│   ├── config/           # Database, Cloudinary, Swagger configs
│   ├── controllers/      # Business logic for each route
│   ├── middleware/       # Auth, Error handling, Rate limiting
│   ├── models/           # MongoDB Schemas (User, Internship, etc.)
│   ├── routes/           # API Endpoint definitions
│   ├── services/         # AI, Email, Token, Notification logic
│   └── utils/            # Helper classes (ApiResponse, ApiError)
├── server.js             # Server entry point
└── .env                  # Environment variables
🔑 Authentication Flow
Type: JWT (JSON Web Token)
Storage: Cookies or Bearer Token (Headers).
Required Header: Authorization: Bearer <token>
Roles: candidate, employer, admin.
🛣️ Primary API Endpoints
Category	Endpoint	Method	Description
Auth	/auth/register	POST	Create a new account
/auth/login	POST	Login & get token
/auth/logout	POST	Clear session
User	/users/profile	GET/PUT	Get or update current user profile
Internships	/internships	GET	List/Filter all internships
/internships	POST	Create internship (Employer only)
/internships/:id	GET	Get details of one internship
Applications	/application/apply/:id	POST	Apply for an internship
/application/my	GET	List current user's applications
AI Features	/ai/analyze-resume	POST	Analyze resume vs job description
Notifications	/notifications	GET	Get user notifications
📦 Key Data Models (What to expect in JSON)
1. Internship Object:

json
{
  "_id": "64...",
  "title": "Frontend Developer Intern",
  "company": "Tech Corp",
  "location": "Remote",
  "requirements": ["React", "CSS", "JavaScript"],
  "stipend": "5000",
  "deadline": "2024-12-31"
}
2. Application Object:

json
{
  "_id": "89...",
  "internshipId": "64...",
  "status": "pending", // pending, accepted, rejected
  "appliedAt": "2024-05-01"
}
💡 Tips for Frontend Development:
Swagger: Tell your friend to open /api/v1/docs in their browser while the server is running. It shows every single endpoint, what parameters to send, and what the response looks like.
Error Handling: The backend returns errors in this format:
json
{ "success": false, "message": "Error message here" }
CORS: If your friend gets a CORS error, they need to check the CORS_ORIGIN in the .env file to match their frontend URL (e.g., http://localhost:3000).
