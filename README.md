# NovStore

Full-stack e-commerce application with authentication, product browsing, and shopping cart.

## Architecture

- **Backend**: Node.js + Express + Prisma (PostgreSQL) + JWT authentication
- **Frontend**: React + Vite + Tailwind CSS + React Router

## Quick Start

### Backend
`ash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
`

### Frontend
`ash
cd frontend
npm install
npm run dev
`

## Environment Variables

Backend .env:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Secret for JWT tokens
- PORT — Server port (default 5000)

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Login, sets JWT cookie |
| POST | /api/auth/logout | Clear JWT cookie |
| GET | /api/auth/me | Get current user (auth required) |
| GET | /api/products | List all products |
| GET | /api/products/:id | Get single product |
| GET | /api/health | Health check |

## Project Structure
`
backend/src/
  server.js          — Express app entry point
  routes/            — auth.routes.js, product.routes.js
  controllers/       — auth.controller.js, product.controller.js
  middlewares/       — auth.js (JWT verification)
  utils/             — prisma.js (Prisma client)

frontend/src/
  App.jsx            — Routing, layout, navbar
  main.jsx           — Entry with AuthProvider
  context/           — AuthContext, CartContext
  pages/             — Login, Register, Products
  components/        — CartDrawer
`

## How It Works

1. **Auth**: JWT in HTTP-only cookie; erifyToken middleware protects /api/auth/me; frontend sends cookies via xios.defaults.withCredentials
2. **Products**: Backend seeds 6 items on first request; frontend displays in grid
3. **Cart**: Client-side React Context; add/remove/update quantity
4. **Routing**: Protected / requires login; unauthenticated redirect to /login

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Express, Prisma, bcrypt, jsonwebtoken, cookie-parser, cors |
| Frontend | React 18, Vite, Tailwind CSS, React Router 6, Axios |
| Database | PostgreSQL (via Prisma ORM) |
