# GearGuard - Ultimate Maintenance Tracker

A hackathon-grade maintenance management system that connects equipment, teams, and maintenance requests with intelligent workflows. Built with React, Node.js, Express, and MongoDB.

## 🎯 Project Overview

GearGuard is a comprehensive maintenance tracking system designed for companies to manage equipment maintenance efficiently. It features role-based access control, automated workflows, and smart features that reduce manual data entry and ensure data integrity.

### Key Features

- **Role-Based Access**: Three user types (USER, TECHNICIAN, MANAGER) with distinct permissions
- **Smart Auto-Fill**: Equipment selection automatically populates team and category data
- **Scrap Cascade**: Moving a request to SCRAP automatically updates equipment status
- **Stage Validation**: Enforced workflow transitions (NEW → IN_PROGRESS → REPAIRED/SCRAP)
- **Kanban Board**: Visual drag-and-drop interface for request management
- **Calendar View**: Schedule and track preventive maintenance
- **Overdue Detection**: Automatic flagging of overdue preventive maintenance
- **Team-Based Filtering**: Users only see relevant requests based on their role and team

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication (JWT)
│   │   ├── users/         # User management
│   │   ├── teams/         # Maintenance teams
│   │   ├── equipment/     # Equipment CRUD
│   │   └── requests/      # Maintenance requests (core business logic)
│   ├── middlewares/       # Auth, role-based access, error handling
│   ├── config/            # Database, environment
│   └── utils/             # Constants, helpers
```

**Layered Architecture**: Routes → Controllers → Services → Models

### Frontend (React + Vite + Tailwind CSS)

```
frontend/
├── src/
│   ├── pages/             # Main routes (Dashboard, Kanban, Calendar, etc.)
│   ├── components/        # Reusable UI components
│   ├── contexts/          # Authentication context
│   └── api/               # API client and endpoints
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or  cloud instance)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/gearguard

# Seed demo data
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👥 Demo User Credentials

After running the seed script, use these credentials:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| user@demo.com | password | USER | Create requests, view own requests |
| tech@demo.com | password | TECHNICIAN | Work on team requests, assign to self |
| manager@demo.com | password | MANAGER | Full access, assign anyone, schedule preventive |

## 📊 Core Data Models

### User
- Roles: USER, TECHNICIAN, MANAGER
- Team associations for technicians
- Password encryption with bcryptjs

### MaintenanceTeam
- Groups technicians by specialization
- Examples: Mechanics, IT Support, HVAC

### Equipment
- Tracks company assets
- Status: ACTIVE or SCRAP
- Default maintenance team assignment
- Audit notes for scrap history

### MaintenanceRequest
- Types: CORRECTIVE (unplanned) or PREVENTIVE (scheduled)
- Stages: NEW → IN_PROGRESS → REPAIRED/SCRAP
- Equipment category snapshot (historical consistency)
- Duration tracking on completion

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password, returns JWT

### Equipment
- `GET /api/equipment` - List all equipment (with filters)
- `GET /api/equipment/active` - Get only active equipment for dropdowns
- `GET /api/equipment/:id` - Get equipment details + open request count
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment

### Maintenance Requests
- `POST /api/requests` - Create request (auto-fills team from equipment)
- `GET /api/requests/kanban` - Get Kanban board data (role-filtered)
- `GET /api/requests/calendar` - Get calendar events (preventive only)
- `PUT /api/requests/:id/stage` - Update stage (validates transitions)
- `PUT /api/requests/:id/assign` - Assign to technician
- `PUT /api/requests/:id/complete` - Complete with duration
- `PUT /api/requests/:id/scrap` - Scrap request + cascade to equipment

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team (MANAGER only)

### Reports
- `GET /api/reports/requests-per-team` - Aggregated request counts

## 🎨 Key Business Rules

### Stage Transitions (Enforced)
- NEW → IN_PROGRESS ✅
- IN_PROGRESS → REPAIRED ✅
- IN_PROGRESS → SCRAP ✅
- All other transitions ❌

### Team-Based Access
- **USER**: See only own requests
- **TECHNICIAN**: See only team requests
- **MANAGER**: See all requests

### Scrap Logic (Atomic Operation)
1. Update request stage to SCRAP
2. Update equipment status to SCRAP
3. Append audit note to equipment
4. Prevent future requests for that equipment

### Auto-Fill Intelligence
When creating a request:
- Equipment selected → Team auto-populated from equipment's default team
- Equipment selected → Category captured as snapshot

## 🧪 Testing the Application

### Manual Test Flow

1. **Login** as user@demo.com
2. **Dashboard**: View stats (equipment count, open requests)
3. **Equipment List**: Browse equipment
4. **Create Request**: Select equipment, see team auto-fill
5. **Logout → Login** as tech@demo.com
6. **Kanban**: See only IT Support team requests
7. **Assign to Me**: Take ownership of a request
8. **Drag & Drop**: Move NEW → IN_PROGRESS
9. **Complete**: Move to REPAIRED with duration
10. **Scrap Test**: Create request, move to SCRAP, verify equipment status updates

### Backend API Testing

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@demo.com","password":"password"}'

# Get equipment (with token)
curl http://localhost:5000/api/equipment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Drag & Drop**: @dnd-kit (for Kanban)
- **Calendar**: FullCalendar
- **Charts**: Recharts

## 📁 Project Structure

```
Guardian_Gear/
├── backend/
│   ├── src/
│   │   ├── modules/         # Feature modules (auth, users, teams, equipment, requests)
│   │   ├── config/          # DB and environment config
│   │   ├── middlewares/     # Auth, role, error handling
│   │   ├── utils/           # Constants, helpers
│   │   ├── app.js           # Express app setup
│   │   ├── server.js        # Server entry point
│   │   └── seed.js          # Demo data seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── api/             # API client and endpoints
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── cursor-prompts/          # Project specifications
```

## 🎯 Development Guidelines

### Backend Principles
1. **No business logic in controllers** - All in services
2. **No database queries in routes** - Use service layer
3. **Validate at multiple levels** - Mongoose schema + service logic
4. **Fail-safe defaults** - Equipment starts ACTIVE, requests start NEW
5. **Atomic operations** - Scrap cascade must succeed or rollback

### Frontend Principles
1. **Backend is source of truth** - Never bypass API validation
2. **Role-based UI** - Show/hide features based on user role
3. **Optimistic updates** - For Kanban drag-and-drop
4. **Error boundaries** - Graceful error handling
5. **Clean data** - Store only IDs in localStorage, fetch details via API

## 🚧 Development Roadmap

### Completed ✅
- Backend API with all endpoints
- Authentication and authorization
- Role-based access control
- Stage transition validation
- Scrap cascade logic
- Frontend routing and authentication
- Dashboard
- Login page

### In Progress 🔄
- Kanban board with drag-and-drop
- Equipment list and detail pages
- Calendar view
- Reports page

### Future Enhancements 💡
- Real-time updates with WebSockets
- Mobile responsive design
- File attachments for requests
- Email notifications
- Maintenance history timeline
- Equipment health scoring

## 📝 License

MIT License - feel free to use this project for learning or hackathons!

## 🤝 Contributing

This is a hackathon project built to demonstrate clean architecture and enterprise-grade development practices. Contributions welcome!

---

**Built for hackathons. Designed for production.**
