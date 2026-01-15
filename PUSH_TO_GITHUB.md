# Quick Guide: Push to GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Repository name: **`Visier`** (or any name you like)
4. Make it **Public** ✅ (required for free GitHub Pages)
5. **DO NOT** check "Add a README file" or any other options
6. Click **"Create repository"**

## Step 2: Copy the Repository URL

After creating, GitHub will show you a page with commands. You'll see a URL like:
- `https://github.com/YOUR_USERNAME/Visier.git`

**Copy this URL** - you'll need it in the next step!

## Step 3: Run These Commands

Open your terminal in this project folder and run:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/Visier.git

# Push your code
git branch -M main
git push -u origin main
```

**Example:**
If your username is `johnsmith`, the command would be:
```bash
git remote add origin https://github.com/johnsmith/Visier.git
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go back to your GitHub repository page
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Select: **"GitHub Actions"**
5. Click **Save**

## Step 5: Wait for Deployment

1. Click the **Actions** tab in your repository
2. You should see a workflow running
3. Wait 2-3 minutes for it to complete
4. Once done, your app will be live at:
   - `https://YOUR_USERNAME.github.io/Visier/`

## That's It! 🎉

Your app is now live and shareable!

---

## Need Help?

If you get errors:
- **"remote origin already exists"**: Run `git remote remove origin` first, then add it again
- **Authentication error**: You may need to set up a Personal Access Token
- **Permission denied**: Make sure the repository name matches exactly


