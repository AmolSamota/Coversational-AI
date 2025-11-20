# Deployment Guide

This app is ready to be deployed as a shareable web application. Here are the deployment options:

## Option 1: Vercel (Recommended - Easiest)

### Steps:
1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from command line**:
   ```bash
   vercel
   ```
   - Follow the prompts to link your project
   - The app will be deployed and you'll get a shareable URL

3. **Or deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

### Configuration:
- The `vercel.json` file is already configured
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

## Option 2: Netlify

### Steps:
1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Or via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag and drop the `dist` folder, or
   - Connect your Git repository

### Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Option 3: GitHub Pages

### Steps:
1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages** in repository settings

## Quick Deploy with Vercel (Recommended)

The easiest way is to use Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

After deployment, you'll get a shareable URL like:
- `https://your-app-name.vercel.app`

## Features After Deployment:
- ✅ Fully functional web app
- ✅ Shareable URL
- ✅ HTTPS enabled
- ✅ Fast CDN delivery
- ✅ Automatic deployments on Git push (if connected to Git)

## Notes:
- The app uses React Router, so all routes need to redirect to `index.html` (already configured in `vercel.json`)
- No backend required - this is a static site
- All data is client-side (sample data in `insightsData.ts`)

