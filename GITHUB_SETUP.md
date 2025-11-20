# GitHub Pages Deployment Guide

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `Visier` (or any name you prefer)
5. Make it **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Visier.git

# Push your code
git branch -M main
git push -u origin main
```

**OR** if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/Visier.git
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)` or `/docs` if you want to use docs folder
5. Click **Save**

## Step 4: Deploy Using GitHub Actions (Recommended)

I've set up the deployment script. After pushing your code:

1. Go to your repository
2. Click on **Actions** tab
3. You should see a workflow run (or you can trigger it manually)
4. Wait for it to complete
5. Your app will be available at: `https://YOUR_USERNAME.github.io/Visier/`

## Alternative: Manual Deploy

If you prefer to deploy manually:

```bash
npm run deploy
```

This will:
1. Build your app
2. Push the `dist` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve it

## Important Notes:

- **Repository name matters**: The `base` in `vite.config.ts` must match your repository name
- If your repo is named differently, update `vite.config.ts`:
  ```ts
  base: '/YOUR_REPO_NAME/',
  ```
- The first deployment may take a few minutes
- After deployment, your app will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

## Troubleshooting:

- **404 errors**: Make sure the `base` path in `vite.config.ts` matches your repository name
- **Routes not working**: The `vercel.json` redirects won't work on GitHub Pages. We need to handle this differently.
- **Build fails**: Check the Actions tab for error messages

