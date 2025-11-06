# Quick Deployment Steps

## Render Deployment (Recommended)

### 1. Backend Deployment

1. Sign up at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `erp-backend`
   - **Environment:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `SECRET_KEY`: Generate a random secret key
   - `ENVIRONMENT`: `production`
   - `FRONTEND_URL`: Your frontend URL (will set after deploying frontend)
6. Click "Create Web Service"

### 2. Frontend Deployment

1. Click "New +" → "Static Site" (or Web Service)
2. Connect same GitHub repository
3. Configure:
   - **Name:** `erp-frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://erp-backend.onrender.com`)
5. Update Backend `FRONTEND_URL` with your frontend URL

### 3. MongoDB Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP `0.0.0.0/0` (or Render IPs)
5. Copy connection string and use as `MONGODB_URI`

## Your URLs

- **Backend:** `https://erp-backend.onrender.com`
- **Frontend:** `https://erp-frontend.onrender.com`

## Test Deployment

```bash
# Test backend
curl https://erp-backend.onrender.com/health

# Should return: {"status":"healthy"}
```

## Next Steps

1. Visit your frontend URL
2. Test login functionality
3. Monitor logs for any errors
4. Update DNS if using custom domain

