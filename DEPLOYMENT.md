# Deployment Checklist

## Frontend (Vercel) - https://question-project-pi.vercel.app/

### ✅ Pre-Deployment
- [ ] Code is pushed to GitHub
- [ ] All environment variables are documented
- [ ] Build works locally (`npm run build`)

### ✅ Vercel Configuration
- [ ] Root directory set to `frontend/`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added: `VITE_API_URL`

### ✅ Environment Variables
```env
VITE_API_URL=https://your-backend-api-url.com
```

## Backend Deployment

### ✅ Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database connection string ready
- [ ] Strong JWT_SECRET generated
- [ ] All environment variables documented

### ✅ Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/questions_app?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-key-min-32-chars
CLIENT_URL=https://question-project-pi.vercel.app
```

### ✅ Platform-Specific Notes

#### Railway
- Root directory: `backend/`
- Start command: `npm start`
- Add all environment variables in dashboard

#### Render
- Root directory: `backend/`
- Build command: `npm install`
- Start command: `npm start`
- Add all environment variables in dashboard

#### Heroku
- Root directory: `backend/`
- Procfile: `web: node server.js`
- Add all environment variables: `heroku config:set KEY=value`

## Post-Deployment Testing

### ✅ Frontend
- [ ] Home page loads
- [ ] Search functionality works
- [ ] Images load correctly
- [ ] Login/Register works
- [ ] Protected routes redirect properly

### ✅ Backend
- [ ] API endpoints respond
- [ ] CORS allows frontend requests
- [ ] Database connection works
- [ ] File uploads work
- [ ] JWT authentication works

## Troubleshooting

### Images not loading
- Check `VITE_API_URL` is set correctly
- Verify backend `/uploads` route is accessible
- Check CORS configuration

### CORS errors
- Verify `CLIENT_URL` matches frontend URL exactly
- Check backend CORS configuration in `server.js`

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check connection string format
- Verify database user has correct permissions

### Authentication fails
- Check JWT_SECRET is set and consistent
- Verify token is being sent in Authorization header
- Check token expiration settings

