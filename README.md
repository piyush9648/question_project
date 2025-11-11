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

## Production Deployment

### Frontend Deployment (Vercel)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `frontend/`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-domain.com
     ```
   - Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend API URL (e.g., `https://api.yourdomain.com`)

### Backend Deployment (Railway/Render/Heroku)

1. **Environment Variables** (create `.env` file):
   ```env
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/questions_app?retryWrites=true&w=majority
   JWT_SECRET=your-strong-random-secret-key-here
   CLIENT_URL=https://question-project-pi.vercel.app
   ```

2. **Deploy to Railway/Render**
   - Connect your GitHub repository
   - Set root directory to `backend/`
   - Add all environment variables
   - Deploy

3. **Important Notes:**
   - Make sure your backend URL is accessible (not localhost)
   - Update `CLIENT_URL` to match your frontend URL
   - Use MongoDB Atlas for production database
   - Set a strong `JWT_SECRET` (use a random string generator)
   - The `/uploads` folder needs persistent storage (consider using cloud storage like AWS S3 or Cloudinary for production)

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/questions_app`
4. Add your IP to whitelist (or use 0.0.0.0/0 for all IPs)
5. Update `MONGO_URI` in backend `.env`

### CORS Configuration

The backend is already configured to allow requests from:
- `https://question-project-pi.vercel.app`
- Your `CLIENT_URL` environment variable
- Localhost (for development)

### Image Storage

For production, consider using cloud storage:
- **AWS S3** + Multer-S3
- **Cloudinary** (already has config file)
- **Google Cloud Storage**

Current setup uses local file storage which may not persist on some hosting platforms.

