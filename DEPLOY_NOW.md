# 🚀 ONE-CLICK DEPLOYMENT CHECKLIST

Follow these steps to deploy your website. After completion, you'll get your live website URL!

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] Code is pushed to GitHub
- [x] Deployment config files created
- [x] Environment variables configured
- [ ] MongoDB Atlas account created
- [ ] Render account created

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Set Up MongoDB Atlas (5 minutes)

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (free account)
3. **Create Free Cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select region (closest to you)
   - Click "Create"
   - Wait 3-5 minutes for cluster creation

4. **Create Database User:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Authentication: "Password"
   - Username: `erpadmin`
   - Password: Click "Autogenerate Secure Password" → **COPY AND SAVE THIS PASSWORD**
   - User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Whitelist IP Address:**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" button
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Driver: "Python" → Version: "3.6 or later"
   - **Copy the connection string**
   - Replace `<password>` with your saved password
   - Replace `<dbname>` with `erp_scaffolding`
   - **Example:** `mongodb+srv://erpadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/erp_scaffolding?retryWrites=true&w=majority`
   - **SAVE THIS STRING** - You'll need it!

---

### STEP 2: Deploy Backend to Render (10 minutes)

1. **Go to:** https://render.com
2. **Sign up** → Click "Get Started for Free"
3. **Sign in with GitHub** (recommended)
4. **Authorize Render** to access your GitHub

5. **Create Backend Service:**
   - Click "New +" → "Web Service"
   - Connect Repository: Search for `Rental-process` or `ERP_Scaffolding-construction`
   - Click "Connect"

6. **Configure Service:**
   ```
   Name: erp-backend
   Region: Oregon (or closest)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

7. **Add Environment Variables:**
   Scroll down to "Environment Variables" → Click "Add Environment Variable"
   
   Add these 4 variables:
   ```
   Key: MONGODB_URI
   Value: [Paste your MongoDB connection string from Step 1]
   
   Key: SECRET_KEY
   Value: [Click "Generate" button - it will auto-generate]
   
   Key: ENVIRONMENT
   Value: production
   
   Key: FRONTEND_URL
   Value: [Leave empty for now - will update after frontend deploy]
   ```

8. **Click "Create Web Service"**
   - Wait 5-10 minutes for first deployment
   - Watch the logs - it will show build progress
   - When you see "Your service is live" → **Copy the URL**
   - **Example:** `https://erp-backend.onrender.com`
   - Test it: Visit `https://your-backend-url.onrender.com/health`
   - Should see: `{"status":"healthy"}`

---

### STEP 3: Deploy Frontend to Render (10 minutes)

1. **Still on Render Dashboard:**
   - Click "New +" → "Web Service" (or "Static Site" if available)

2. **Connect Same Repository:**
   - Select: `Rental-process` or `ERP_Scaffolding-construction`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: erp-frontend
   Region: Same as backend (Oregon)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variable:**
   ```
   Key: VITE_API_BASE_URL
   Value: https://erp-backend.onrender.com
   ```
   (Use your actual backend URL from Step 2)

5. **Click "Create Web Service"**
   - Wait 5-10 minutes for deployment
   - When live → **Copy the frontend URL**
   - **Example:** `https://erp-frontend.onrender.com`

---

### STEP 4: Link Backend and Frontend (2 minutes)

1. **Go back to Backend Service** on Render
2. **Settings** → **Environment**
3. **Edit `FRONTEND_URL`:**
   - Set value to: Your frontend URL (e.g., `https://erp-frontend.onrender.com`)
4. **Save Changes** → Render will auto-restart backend

---

### STEP 5: Test Your Website! 🎉

1. **Visit your frontend URL**
2. **Test the homepage** - should load
3. **Try to login** (if you have admin credentials)
4. **Check browser console** (F12) for any errors

---

## 🌐 YOUR WEBSITE LINKS

After deployment, you'll have:

- **🌍 Frontend (Your Website):** `https://erp-frontend.onrender.com`
- **🔧 Backend API:** `https://erp-backend.onrender.com`

---

## ⚠️ IMPORTANT NOTES

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading for production use

2. **MongoDB Atlas Free Tier:**
   - 512MB storage
   - Shared resources
   - Perfect for development/testing

3. **Environment Variables:**
   - Keep MongoDB password secure
   - Never commit secrets to GitHub
   - Use Render's environment variables

---

## 🆘 TROUBLESHOOTING

### Backend won't start:
- Check Render logs (click on service → "Logs" tab)
- Verify MongoDB connection string format
- Ensure SECRET_KEY is set

### Frontend shows blank page:
- Check browser console (F12)
- Verify VITE_API_BASE_URL is correct
- Check Render build logs

### CORS errors:
- Verify FRONTEND_URL in backend matches frontend URL exactly
- Check backend logs for CORS messages

### Database connection fails:
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string has correct password
- Verify database name in connection string

---

## 📞 NEED HELP?

If you get stuck:
1. Check Render logs (most helpful!)
2. Check MongoDB Atlas connection status
3. Verify all environment variables are set correctly
4. Test backend health endpoint first

---

## 🎯 QUICK REFERENCE

**MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
**Render Dashboard:** https://dashboard.render.com
**Your Backend:** `https://erp-backend.onrender.com`
**Your Frontend:** `https://erp-frontend.onrender.com`

---

**Once deployed, share your frontend URL and I can help test it!** 🚀
