========================================================================
🚀 TEAM TASK MANAGER - FULL STACK (MERN)
========================================================================

A robust, team-oriented task management web application built with a 
modern tech stack. It features role-based access control, real-time 
status tracking, and a premium dark-mode dashboard.

------------------------------------------------------------------------
✨ KEY FEATURES
------------------------------------------------------------------------
1. AUTHENTICATION: 
   - Secure Signup and Login with JWT (JSON Web Tokens).
   - Password hashing using bcrypt.

2. PROJECT MANAGEMENT:
   - Create projects (creator automatically becomes Admin).
   - Add members to projects by email lookup.
   - List all projects user is a member of.

3. TASK TRACKING (Kanban Style):
   - Create tasks within projects (Admin only).
   - Assign tasks to specific team members.
   - Update task status (Pending, In-Progress, Done).
   - Automated "Overdue" status detection based on due dates.

4. PREMIUM UI/UX:
   - Responsive dark-themed dashboard.
   - Glassmorphism effects and modern typography.
   - Dynamic Kanban board with status indicators.

------------------------------------------------------------------------
🛠️ TECHNOLOGY STACK
------------------------------------------------------------------------
FRONTEND:
- React.js (Vite)
- Custom CSS3 (Premium Dark Theme)
- Axios (with JWT Interceptors)
- React Router DOM

BACKEND:
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL)
- JWT (Authentication)
- CORS (Cross-Origin Resource Sharing)

------------------------------------------------------------------------
⚙️ LOCAL SETUP INSTRUCTIONS
------------------------------------------------------------------------

1. PREREQUISITES:
   - Node.js installed.
   - MongoDB Atlas account (or local MongoDB).

2. BACKEND SETUP:
   - Navigate to /backend
   - Run: npm install
   - Create a .env file with:
     PORT=5000
     MONGO_URI=your_mongodb_atlas_url
     JWT_SECRET=your_secret_key
     JWT_EXPIRE=7d
   - Run: npm run dev

3. FRONTEND SETUP:
   - Navigate to /frontend
   - Run: npm install
   - Run: npm run dev

4. ACCESS:
   - Open http://localhost:5173

------------------------------------------------------------------------
🌐 DEPLOYMENT (RAILWAY)
------------------------------------------------------------------------

BACKEND VARIABLES:
- MONGO_URI: (Your Atlas Connection String)
- JWT_SECRET: (Your Secret)
- FRONTEND_URL: (Your Hosted Frontend URL)

FRONTEND VARIABLES:
- VITE_API_URL: (Your Hosted Backend URL + /api)

------------------------------------------------------------------------
Aman Shrivastav - EtharaAI Assignment
------------------------------------------------------------------------
