# Level 2 – Task 2: Authentication and Authorization (JWT)

## Overview
A Node.js/Express backend implementing user authentication with bcrypt password hashing and JWT (JSON Web Tokens). Includes role-based access control to protect routes.

## Features
- User **signup** with hashed passwords (bcrypt, salt rounds: 12)
- User **login** with JWT token response
- **Protected routes** using JWT middleware
- **Role-based access control** (user / admin roles)
- Password never returned in API responses (`select: false`)
- Centralized error handling

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# 3. Start the server
npm run dev    # development (with nodemon)
npm start      # production
```

## API Endpoints

| Method | Endpoint         | Access    | Description                        |
|--------|------------------|-----------|------------------------------------|
| POST   | /api/auth/signup | Public    | Register a new user                |
| POST   | /api/auth/login  | Public    | Login and receive a JWT token      |
| GET    | /api/auth/me     | Protected | Get the logged-in user's profile   |
| GET    | /api/auth/admin  | Admin only| Example of role-restricted route   |

## Testing with Postman

**Signup:**
```json
POST /api/auth/signup
Body: { "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

**Login:**
```json
POST /api/auth/login
Body: { "email": "alice@example.com", "password": "secret123" }
```

**Access protected route:**
```
GET /api/auth/me
Headers: Authorization: Bearer <your_token_here>
```

## Security Highlights
- Passwords hashed with **bcryptjs** (12 salt rounds) before saving
- JWT signed with a secret key and has an expiry (`JWT_EXPIRES_IN`)
- `select: false` on password field prevents accidental exposure
- `restrictTo()` middleware enforces role-based access
