# Deployment Configuration Files

## Files Created

1. **`src/config/api.ts`** - Centralized API configuration using environment variables
2. **`render.yaml`** - Render deployment configuration
3. **`vercel.json`** - Vercel deployment configuration
4. **`DEPLOYMENT.md`** - Comprehensive deployment guide
5. **`QUICK_DEPLOY.md`** - Quick start deployment guide

## Next Steps

1. **Set Environment Variables:**
   - Frontend: `VITE_API_BASE_URL`
   - Backend: `MONGODB_URI`, `SECRET_KEY`, `ENVIRONMENT`, `FRONTEND_URL`

2. **Deploy Backend First:**
   - Deploy backend to Render
   - Get backend URL
   - Use it in frontend `VITE_API_BASE_URL`

3. **Deploy Frontend:**
   - Set `VITE_API_BASE_URL` to backend URL
   - Deploy frontend
   - Update backend `FRONTEND_URL` with frontend URL

## Environment Variables Needed

### Backend (.env or Render Environment Variables)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (Render/Vercel Environment Variables)
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Notes

- All hardcoded `localhost:8000` URLs have been replaced with `API_CONFIG`
- CORS automatically configured based on environment
- Production builds will use environment variables
- Development still uses localhost for local testing

