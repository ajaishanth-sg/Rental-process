# Deployment Guide

This guide will help you deploy your ERP Scaffolding application to production.

## 🚀 Deployment Options

### Option 1: Render (Recommended for Full-Stack)

#### Backend Deployment

1. **Create a new Web Service on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service:**
   - **Name:** `erp-backend`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables:**
   - `MONGODB_URI`: Your MongoDB connection string (e.g., MongoDB Atlas)
   - `SECRET_KEY`: Generate a secure secret key (use Render's generate feature)
   - `ENVIRONMENT`: `production`
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://erp-frontend.onrender.com`)

4. **Health Check Path:** `/health`

#### Frontend Deployment

1. **Create a new Static Site or Web Service**
   - Click "New +" → "Static Site" (or Web Service)

2. **Configure Frontend Service:**
   - **Name:** `erp-frontend`
   - **Environment:** `Node`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Publish Directory:** `dist`

3. **Environment Variables:**
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://erp-backend.onrender.com`)

---

### Option 2: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Environment Variables:**
   - `VITE_API_BASE_URL`: Your backend URL

4. **Or use GitHub Integration:**
   - Connect your repo at https://vercel.com
   - It will auto-detect Vite configuration
   - Set environment variables in dashboard

#### Backend on Render
   - Follow Backend Deployment steps from Option 1

---

### Option 3: Railway (Full-Stack)

1. **Connect GitHub repository**
2. **Create two services:**
   - Backend: Python service
   - Frontend: Node service
3. **Set environment variables** for each service

---

## 📋 Pre-Deployment Checklist

### Backend Checklist
- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Secret key generated for JWT tokens
- [ ] Environment variables configured
- [ ] CORS settings updated for production
- [ ] Health check endpoint working (`/health`)

### Frontend Checklist
- [ ] API configuration updated to use environment variables
- [ ] Build command tested locally (`npm run build`)
- [ ] Environment variables set in deployment platform
- [ ] All hardcoded URLs replaced with config

---

## 🔧 MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:** Choose free tier (M0)
3. **Database Access:** Create a user with read/write permissions
4. **Network Access:** Add `0.0.0.0/0` to allow all IPs (or specific Render IPs)
5. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
   ```

---

## 🌐 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `SECRET_KEY` | JWT secret key | `your-secret-key` |
| `ENVIRONMENT` | Environment name | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://backend.onrender.com` |

---

## 🧪 Testing Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Check browser console for errors
   - Test login functionality

---

## 🔄 CI/CD Setup

### Render Auto-Deploy
- Enable auto-deploy on push to `main` branch
- Enable PR previews for testing

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for automated deployments

---

## 📝 Post-Deployment

1. **Update DNS** (if using custom domain)
2. **Monitor Logs** for errors
3. **Test All Features:**
   - User authentication
   - Data CRUD operations
   - File uploads
   - API endpoints

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check `FRONTEND_URL` in backend environment variables
   - Ensure frontend URL matches exactly

2. **Database Connection Errors:**
   - Verify MongoDB connection string
   - Check network access settings in MongoDB Atlas

3. **Build Failures:**
   - Check build logs in Render/Vercel dashboard
   - Ensure all dependencies are in `package.json` or `requirements.txt`

4. **Environment Variables Not Working:**
   - Restart service after adding variables
   - Check variable names match exactly (case-sensitive)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

