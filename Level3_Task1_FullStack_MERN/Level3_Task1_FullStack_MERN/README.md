# Level 3 – Task 1: Full-Stack MERN Application (Task Manager)

## Overview
A complete full-stack task management app built with the MERN stack (MongoDB, Express, React, Node.js). Features JWT authentication, role-based access, and full CRUD on a task resource — all integrated end-to-end.

## Features
- User signup and login with JWT authentication
- Passwords hashed with bcrypt
- Create, read, update (toggle complete), and delete tasks
- Task priority levels (low / medium / high)
- Filter tasks by status (all / active / done)
- Role-based middleware (user / admin)
- Token stored in localStorage; protected API routes

## Project Structure

```
Level3_Task1_FullStack_MERN/
├── backend/
│   ├── models/        User.js, Task.js
│   ├── routes/        auth.js, tasks.js
│   ├── middleware/    auth.js (JWT protect + restrictTo)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx    Auth screen + Dashboard + components
    │   └── App.css
    └── public/
```

## Setup & Run

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## API Endpoints

| Method | Endpoint           | Auth?     | Description           |
|--------|--------------------|-----------|-----------------------|
| POST   | /api/auth/signup   | No        | Register user         |
| POST   | /api/auth/login    | No        | Login, get token      |
| GET    | /api/auth/me       | Yes       | Get current user      |
| GET    | /api/tasks         | Yes       | List user's tasks     |
| POST   | /api/tasks         | Yes       | Create task           |
| PUT    | /api/tasks/:id     | Yes       | Update task           |
| DELETE | /api/tasks/:id     | Yes       | Delete task           |

## Technologies
- **MongoDB + Mongoose** – NoSQL database and ODM
- **Express.js** – REST API framework
- **React 18** – Component-based frontend with hooks
- **Node.js** – JavaScript runtime
- **JWT** – Stateless authentication
- **bcryptjs** – Password hashing
- **Axios** – HTTP client in React
