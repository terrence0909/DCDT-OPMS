
<div align="center">
<img width="1200" height="475" alt="DCDT OPMS Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# DCDT Organisational Performance Management System (OPMS)

### A Full-Stack Performance Tracking Application

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🎯 Overview

The DCDT Organisational Performance Management System (OPMS) is a comprehensive full-stack web application designed to streamline departmental performance tracking. It enables organizations to monitor Key Performance Indicators (KPIs), generate reports, and visualize performance trends through an intuitive dashboard interface.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token storage
- Role-based access control (Admin, Manager, Officer, Viewer)
- Password hashing with bcryptjs
- Session management and automatic logout

### 📊 Dashboard & Analytics
- Real-time performance metrics display
- Interactive charts using Recharts
- Performance trend visualization
- Department-level performance overview
- Customizable reporting periods

### 📈 KPI Management
- Complete CRUD operations for KPIs
- Target vs. actual performance tracking
- Variance calculation and alerts
- Status indicators (On Track, At Risk, Pending, Completed)
- Progress tracking with visual indicators

### 👥 User Management
- Multi-role user system
- Profile management
- Department assignment
- Activity logging
- Admin-controlled permissions

### 🎨 User Experience
- Responsive design with Tailwind CSS
- Modern, clean interface
- Form validation and error handling
- Loading states and feedback
- Mobile-friendly layout

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Axios/ Fetch API** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **Sequelize** - Promise-based ORM
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Postman/Insomnia** - API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/terrence0909/DCDT-OPMS.git
   cd DCDT-OPMS
Set up the Backend

bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start backend server
npm start
# Backend runs on http://localhost:5002
Set up the Frontend

bash
cd ../frontend
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
Access the Application

Open browser: http://localhost:3000
Default Login Credentials:

Admin: admin / admin123
Manager: manager / manager123
Officer: officer / officer123
One-Command Setup (Development)

bash
# Terminal 1 - Backend
cd backend && npm install && npm start

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
📚 API Documentation

Base URL

text
http://localhost:5002/api
Authentication Endpoints

Login

http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "System Administrator",
    "email": "admin@dcdt.gov.za",
    "role": "Administrator",
    "department": "ICT"
  }
}
Logout

http
POST /auth/logout
Authorization: Bearer <token>
KPI Endpoints

Get All KPIs

http
GET /kpis
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "KPI-2025-001",
      "name": "Employee Training Completion",
      "description": "Percentage of employees completing training",
      "target_value": 95,
      "current_value": 87.5,
      "achieved_percentage": 92.1,
      "status": "OnTrack",
      "measurement_unit": "%"
    }
  ]
}
Create KPI

http
POST /kpis
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "KPI-2025-001",
  "name": "Employee Training Completion",
  "description": "Percentage of employees completing mandatory training",
  "target_value": 95,
  "measurement_unit": "%",
  "operational_plan_id": "OP-2025-01"
}
Update KPI

http
PUT /kpis/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_value": 90,
  "status": "OnTrack"
}
Dashboard Endpoints

Get Overview

http
GET /dashboard/overview
Authorization: Bearer <token>

Response:
{
  "totalKPIs": 24,
  "completedKPIs": 8,
  "pendingApprovals": 3,
  "departmentPerformance": 78.5,
  "recentActivities": [...]
}
Get Performance Trends

http
GET /dashboard/performance-trends
Authorization: Bearer <token>

Response:
[
  {"month": "Jan", "performance": 65},
  {"month": "Feb", "performance": 72},
  ...
]
User Endpoints

Get All Users

http
GET /users
Authorization: Bearer <token>
Create User

http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "name": "New User",
  "email": "newuser@dcdt.gov.za",
  "department": "ICT",
  "role": "Officer",
  "employee_number": "EMP001"
}
👥 User Roles

Administrator

Permissions: Full system access
Can: Manage all KPIs, users, system settings
Cannot: N/A (full access)
Manager

Permissions: Department-level management
Can: Create/update KPIs, view all reports in department
Cannot: Manage users, change system settings
Officer

Permissions: Limited operational access
Can: Update assigned KPIs, submit progress reports
Cannot: Create new KPIs, view other departments' data
Viewer

Permissions: Read-only access
Can: View dashboards and reports
Cannot: Make any changes, submit data
🚢 Deployment

Backend Deployment (Render/Fly.io/Railway)

Create a new Web Service
Connect your GitHub repository
Configure environment variables:

env
NODE_ENV=production
PORT=5002
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
Build command:

bash
npm install
Start command:

bash
npm start
Frontend Deployment (Vercel/Netlify)

Import your repository
Configure build settings:

Build Command: npm run build
Output Directory: dist
Environment Variables:

env
VITE_API_URL=https://your-backend-url.com
Deploy
Docker Deployment

Dockerfile (Backend):

dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 5002
CMD ["npm", "start"]
Dockerfile (Frontend):

dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
docker-compose.yml:

yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/data/database.sqlite
    volumes:
      - ./data:/data

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
🐛 Troubleshooting

Common Issues and Solutions

1. Port Already in Use

bash
# Find and kill processes using ports
lsof -ti:5002 | xargs kill -9  # Backend port
lsof -ti:3000 | xargs kill -9  # Frontend port
lsof -ti:3001 | xargs kill -9  # Alternative frontend port
2. Database Connection Errors

bash
cd backend
# Recreate database
rm -f database.sqlite
npm start
# Or reset with sample data
npm run db:reset
3. Dependency Conflicts

bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
4. TypeScript Compilation Errors

bash
# Check for TypeScript errors
npx tsc --noEmit
# Install missing types
npm install --save-dev @types/node @types/react @types/react-dom
5. CORS Issues

Ensure backend CORS is configured correctly
Check that frontend API base URL matches backend
Verify proxy settings in vite.config.ts
6. Authentication Issues

Clear browser localStorage
Check JWT token expiration
Verify backend JWT_SECRET is set
Development Tools

Database Inspection

bash
# SQLite command line
sqlite3 backend/database.sqlite
.tables
SELECT * FROM users;
.schema users
API Testing with curl

bash
# Test backend health
curl http://localhost:5002/health

# Test login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test authenticated endpoint
curl http://localhost:5002/api/kpis \
  -H "Authorization: Bearer YOUR_TOKEN"
Frontend Debugging

Browser Developer Tools: F12 for Console, Network, Application tabs
React DevTools: Install Chrome/Firefox extension
Redux DevTools: For state management inspection
🤝 Contributing

We welcome contributions! Please follow these steps:

Development Workflow

Fork the Repository
Create a Feature Branch

bash
git checkout -b feature/amazing-feature
Make Your Changes
Commit Your Changes

bash
git commit -m 'Add amazing feature'
Push to Your Branch

bash
git push origin feature/amazing-feature
Open a Pull Request
Coding Standards

Follow existing code style and patterns
Write meaningful commit messages
Add tests for new functionality
Update documentation as needed
Ensure no linting errors
Issue Reporting

When reporting issues, include:

Steps to reproduce
Expected vs actual behavior
Screenshots if applicable
Environment details (OS, Node version, etc.)
📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

text
MIT License

Copyright (c) 2024 Terrence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
📞 Contact & Support

Author

Terrence - @terrence0909

Support Channels

GitHub Issues: Report a bug or request a feature
Email: [Your professional email]
LinkedIn: [Your LinkedIn profile]
Project Links

Repository: https://github.com/terrence0909/DCDT-OPMS
Live Demo: [Add your deployed URL here]
Documentation: This README
<div align="center">
🌟 Show Your Support

If you find this project useful, please give it a ⭐ on GitHub!

Built with dedication for the developer community 💻

</div> ```