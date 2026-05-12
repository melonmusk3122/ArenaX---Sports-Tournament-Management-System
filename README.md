# ArenaX — Premium Sports Tournament Management System

A full-stack SaaS web application for managing Cricket and Football tournaments with live scoring, team management, and match analytics.

## 🏟️ Features

- **Authentication**: Signup/Login with JWT tokens
- **Team Management**: Create teams with logos, colors, and descriptions
- **Player Management**: Add players with jersey numbers and roles
- **Match Creation**: Multi-step wizard with 11-player-per-team enforcement
- **Cricket Live Scoring**: Ball-by-ball entry, auto-calculated overs, strike rates
- **Football Live Scoring**: Event timeline with goals, cards, substitutions
- **Match History**: Filter by sport and status
- **Premium UI**: Glassmorphism, Framer Motion animations, dark theme

## 📋 System Requirements

- Node.js v16+
- MySQL 8.0+
- npm or yarn

## 🚀 Installation

### 1. Clone and setup database

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm start
```

Backend runs on **http://localhost:5001**

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

## 🔐 Demo Login

- **Email**: demo@arenax.com
- **Password**: Demo@123

> ⚠️ You must first re-hash the demo password. Run this after seeding:
> ```sql
> UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'demo@arenax.com';
> ```
> Or simply create a new account via the Signup page.

## 📁 File Upload

Team logos are stored in `backend/uploads/`

## 🗄️ Database

11 normalized tables: users, teams, players, matches, cricketInnings, cricketBatting, cricketBowling, footballEvents, matchPlayers, playerStats, auditLog

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6, Framer Motion, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, MySQL2, JWT, bcryptjs, Multer
- **Database**: MySQL 8.0+

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/teams | List/Create teams |
| GET/PUT | /api/teams/:id | Get/Update team |
| POST | /api/teams/:teamId/players | Add player |
| GET | /api/teams/:teamId/players | List players |
| GET | /api/players/:id | Player profile |
| GET/POST | /api/matches | List/Create matches |
| GET | /api/matches/:id | Match details |
| PUT | /api/matches/:id/status | Update match status |
| POST | /api/matches/:id/cricket/ball | Record cricket ball |
| POST | /api/matches/:id/football/event | Record football event |
| GET | /api/matches/:id/scorecard | Get scorecard |

## ⚠️ Known Limitations

- No real-time WebSocket updates (polling-based)
- No team deletion endpoint (to preserve match history)
- Demo user password must be manually re-hashed after seeding