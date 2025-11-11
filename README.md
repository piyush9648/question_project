# Questions App (React + Express + MongoDB)

A full-stack app with JWT auth, admin-managed question uploads with images, and a questions browser for users.

## Tech Stack
- Frontend: React (Vite) + TailwindCSS + React Router
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT
- Uploads: Multer

## Project Structure
```
backend/
  server.js
  env.example
  package.json
  src/
    config/db.js
    controllers/
    middleware/
    models/
    routes/
  uploads/            # created automatically
frontend/
  index.html
  env.example
  package.json
  src/
    App.jsx, main.jsx, pages/, components/, state/, lib/
```

## Setup

### 1) Backend
1. Open a terminal in `backend/`
2. Copy env template and fill values
   - Windows PowerShell:
     ```powershell
     Copy-Item env.example .env
     ```
3. Install and run
   ```bash
   npm install
   npm run dev
   ```
   - Server runs at `http://localhost:5000`

Environment variables (in `.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/questions_app
JWT_SECRET=supersecretjwtkey
CLIENT_URL=http://localhost:5173
```

### 2) Frontend
1. Open a new terminal in `frontend/`
2. Copy env template
   - Windows PowerShell:
     ```powershell
     Copy-Item env.example .env
     ```
3. Install and run
   ```bash
   npm install
   npm run dev
   ```
   - App runs at `http://localhost:5173`

Optional `.env` for frontend:
```
VITE_API_URL=http://localhost:5000
```

## Default Routes
- Frontend
  - `/` Home
  - `/register` Register
  - `/login` Login
  - `/questions` Questions (protected)
  - `/admin` Admin Add Question (admin-only)

- Backend APIs
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET  /api/questions?company=xyz`
  - `POST /api/admin/questions` (admin-only, multipart/form-data: image)
  - `GET  /api/admin/check` (admin-only)

## Notes
- Images are saved to `backend/uploads` and served from `/uploads/...` on the backend host.
- After login, JWT is stored in `localStorage` and attached as `Authorization: Bearer <token>` for API calls.
- Create at least one admin user by manually updating the user in MongoDB (set `role: "admin"`).

## Creating an Admin User
Run in Mongo shell or your GUI:
```js
// Example with MongoDB shell
use questions_app
// find user by email and set role to admin
// db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Production
- Serve frontend separately (e.g., Netlify/Vercel) and point `VITE_API_URL` to your backend.
- Set secure JWT secret and use a managed MongoDB (e.g., Atlas).

