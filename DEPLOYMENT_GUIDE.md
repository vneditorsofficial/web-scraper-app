# 🚀 DEPLOYMENT GUIDE - Web Scraper Application

## ⚠️ Important Note About Vercel

**Vercel is NOT recommended for this application** because:
1. Puppeteer requires a Chrome browser which exceeds Vercel's 50MB function size limit
2. Your scraping operations take 30-90+ seconds, but Vercel serverless functions timeout after 10-15 seconds
3. Vercel functions are stateless and don't support long-running processes

**Recommended platforms:** Railway, Render, DigitalOcean App Platform, or any VPS

---

## 📋 Prerequisites

Before deploying, you need:
- A GitHub account
- An account on your chosen hosting platform (Railway or Render - both have free tiers)

---

## 🐙 Step 1: Create GitHub Repository

### Option A: Using GitHub Website

1. **Go to GitHub**
   - Open https://github.com
   - Sign in to your account

2. **Create New Repository**
   - Click the **"+"** button in the top right
   - Select **"New repository"**

3. **Repository Settings**
   - **Repository name:** `web-scraper-app`
   - **Description:** `Web-based scraper with UI - Puppeteer & Express`
   - **Visibility:** Public (required for free tier on most platforms)
   - **DO NOT** check "Add a README file" (we have our own)
   - Click **"Create repository"**

4. **You'll see instructions - keep this page open!**

### Option B: Using Git Command Line

```bash
# Create new repository on GitHub first, then:
git init
git add .
git commit -m "Initial commit: Web Scraper Application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/web-scraper-app.git
git push -u origin main
```

---

## 📁 Step 2: Upload Files to GitHub

### Method 1: GitHub Web Interface (Easiest)

1. **On your new repository page**, click **"uploading an existing file"**

2. **Drag and drop ALL these files:**
   ```
   server.js
   package.json
   Dockerfile
   railway.json
   render.yaml
   .gitignore
   README.md
   QUICKSTART.txt
   VISUAL_GUIDE.md
   public/
     ├── index.html
     ├── app.js
     └── styles.css
   ```

3. **Add commit message:** `Initial commit: Web Scraper App`

4. **Click "Commit changes"**

### Method 2: Git Command Line

```bash
# Navigate to your project folder
cd web-scraper-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Web Scraper Application"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/web-scraper-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 Step 3: Deploy to Railway (Recommended - Free Tier)

### Why Railway?
- ✅ Free tier: 500 hours/month ($5 credit)
- ✅ Supports Docker and Puppeteer
- ✅ No timeout limits
- ✅ Automatic deploys from GitHub
- ✅ Easy to use

### Deployment Steps:

1. **Go to Railway**
   - Open https://railway.app
   - Click **"Login"** → Sign in with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

3. **Connect Repository**
   - Find and select **`web-scraper-app`**
   - Click **"Deploy Now"**

4. **Wait for Build**
   - Railway will automatically detect the Dockerfile
   - Build takes 3-5 minutes (Puppeteer is large)
   - Watch the build logs for any issues

5. **Generate Domain**
   - Once deployed, click on your service
   - Go to **"Settings"** tab
   - Scroll to **"Networking"**
   - Click **"Generate Domain"**
   - You'll get a URL like: `web-scraper-app-production.up.railway.app`

6. **🎉 Done!**
   - Open your Railway URL
   - Your web scraper is now live!

### Railway Environment Variables (Optional)
```
NODE_ENV=production
```

---

## 🎨 Step 4: Deploy to Render (Alternative - Free Tier)

### Why Render?
- ✅ Free tier available
- ✅ Docker support
- ✅ Auto-deploy from GitHub
- ⚠️ Free tier spins down after 15 minutes of inactivity

### Deployment Steps:

1. **Go to Render**
   - Open https://render.com
   - Click **"Get Started"** → Sign up with GitHub

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account if prompted

3. **Select Repository**
   - Find and select **`web-scraper-app`**
   - Click **"Connect"**

4. **Configure Service**
   - **Name:** `web-scraper-app`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** `Starter` (free)

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait for build (5-10 minutes)

6. **Access Your App**
   - Render provides URL like: `web-scraper-app.onrender.com`
   - Click the URL to access your scraper

---

## 🔧 Troubleshooting

### Build Fails with "Chrome not found"
- Make sure you're using the Dockerfile (not Nixpacks)
- The Dockerfile includes Chrome/Chromium

### "Function timeout" or "504 Gateway Timeout"
- This is why Vercel doesn't work well
- Railway and Render don't have this issue

### Screenshots not saving
- The cloud container has temporary storage
- Screenshots are stored in memory during the session
- For persistent storage, consider adding a cloud storage service (S3, Cloudflare R2)

### App is slow to start
- Free tier services may "sleep" after inactivity
- First request after sleep takes 30-60 seconds
- Subsequent requests are fast

### Memory errors
- Puppeteer is memory-intensive
- If you see memory errors, reduce:
  - Number of images to click
  - Page load delays
  - Concurrent operations

---

## 📊 Platform Comparison

| Feature | Railway | Render | Vercel |
|---------|---------|--------|--------|
| Puppeteer Support | ✅ Yes | ✅ Yes | ❌ Limited |
| Long-running tasks | ✅ Yes | ✅ Yes | ❌ No (10s limit) |
| Free Tier | $5/month credit | Yes (sleeps) | Yes |
| Docker Support | ✅ Yes | ✅ Yes | ❌ No |
| Auto Deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔐 Security Notes

1. **Don't store sensitive data in screenshots folder**
2. **Consider adding authentication** for production use
3. **Be respectful when scraping** - follow robots.txt
4. **Add rate limiting** to prevent abuse

---

## 🎯 Quick Reference Commands

### Check deployment status:
```bash
# Railway CLI
railway status

# Or check dashboard
```

### View logs:
```bash
# Railway CLI
railway logs
```

### Redeploy after changes:
```bash
git add .
git commit -m "Update description"
git push origin main
# Auto-deploys on Railway/Render!
```

---

## 💡 Tips for Success

1. **Start with Railway** - easiest setup for Puppeteer apps
2. **Test locally first** - make sure app works before deploying
3. **Watch build logs** - they show exactly what's happening
4. **Use reasonable delays** - 5-10 seconds is usually enough
5. **Monitor usage** - free tiers have limits

---

## 🆘 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Puppeteer Docs:** https://pptr.dev

---

**Happy Scraping! 🚀**
