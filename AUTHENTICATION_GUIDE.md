# GitHub Authentication Guide

The push failed because GitHub needs authentication. Here are two ways to fix this:

## Option 1: Use Personal Access Token (Easiest)

### Step 1: Create a Personal Access Token
1. Go to GitHub.com → Click your profile picture (top right) → **Settings**
2. Scroll down to **Developer settings** (bottom left)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Give it a name: "Visier Deployment"
6. Select scopes:
   - ✅ **repo** (full control of private repositories)
   - ✅ **workflow** (update GitHub Action workflows)
7. Click **Generate token**
8. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push Using Token
Run this command (replace YOUR_TOKEN with the token you copied):

```bash
git push -u https://YOUR_TOKEN@github.com/amitsrivastava-gif/Coversational-AI.git main
```

**OR** you can set it up to remember:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/amitsrivastava-gif/Coversational-AI.git
git push -u origin main
```

---

## Option 2: Use GitHub CLI (Recommended for future)

### Install GitHub CLI:
```bash
brew install gh
```

### Authenticate:
```bash
gh auth login
```

Follow the prompts, then:
```bash
git push -u origin main
```

---

## Option 3: Use SSH (If you have SSH keys set up)

### Change remote to SSH:
```bash
git remote set-url origin git@github.com:amitsrivastava-gif/Coversational-AI.git
git push -u origin main
```

---

## After Successful Push:

1. Go to your repository: https://github.com/amitsrivastava-gif/Coversational-AI
2. Click **Settings** → **Pages**
3. Under "Source", select **"GitHub Actions"**
4. Click **Save**
5. Go to **Actions** tab - you should see a workflow running
6. Wait 2-3 minutes
7. Your app will be live at: **https://amitsrivastava-gif.github.io/Coversational-AI/**

---

## Quick Command (if you have token ready):

```bash
# Replace YOUR_TOKEN with your actual token
git remote set-url origin https://YOUR_TOKEN@github.com/amitsrivastava-gif/Coversational-AI.git
git push -u origin main
```


