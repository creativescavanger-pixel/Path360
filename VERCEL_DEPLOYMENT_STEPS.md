# Complete Step-by-Step Guide to Deploy PATH360-APP V2 on Vercel

## PART 1: PREPARE YOUR CODE FOR GIT
Follow these steps exactly in order.

### Step 1.1: Open Terminal
- Open your Mac Terminal (or use VS Code Terminal)
- Run this command:
```bash
cd "/Users/emmahkwamboka/PATH360-APP V2"
```
You should see: `emmahkwamboka@... PATH360-APP V2 %`

### Step 1.2: Initialize Git Repository
This creates a `.git` folder that tracks your code changes.

Run:
```bash
git init
```

You should see:
```
Initialized empty Git repository in /Users/emmahkwamboka/PATH360-APP V2/.git/
```

### Step 1.3: Configure Git (First Time Only)
If you haven't used Git before, run these:
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Replace:
- `Your Name` - your actual name (e.g., "Emma Kwamboka")
- `your-email@example.com` - your actual email

### Step 1.4: Add All Your Files to Git
Run:
```bash
git add .
```

This stages all your code files. You'll see no output if successful.

### Step 1.5: Create Your First Commit
Run:
```bash
git commit -m "Initial commit - PATH360 App V2 ready for deployment"
```

You should see something like:
```
[master (root-commit) abc1234] Initial commit - PATH360 App V2 ready for deployment
 47 files changed, 1000 insertions(+)
```

---

## PART 2: CREATE GITHUB ACCOUNT & REPOSITORY

### Step 2.1: Create GitHub Account
1. Go to https://github.com
2. Click **"Sign up"** button (top right)
3. Enter your **email address**
4. Create a **password** (remember this!)
5. Choose a **username** (e.g., "emmahkwamboka")
6. Click **"Create account"**
7. **Verify your email** - GitHub will send you an email, click the link

### Step 2.2: Create a New Repository on GitHub
1. After you're logged into GitHub, click the **+** icon (top right)
2. Select **"New repository"**
3. Fill in these fields:

**Repository name**: `PATH360-APP-V2`

**Description** (optional): `PATH360 Application - Funding & Strategy Tool`

**Public/Private**: Select **Public** (so Vercel can access it)

**Initialize repository**: Leave all boxes UNCHECKED

4. Click **"Create repository"** button

### Step 2.3: You'll See Instructions
GitHub shows you commands to run. Ignore those - follow my instructions instead.

---

## PART 3: UPLOAD YOUR CODE TO GITHUB

### Step 3.1: Get Your Repository URL
On the GitHub page you just created:
1. Look for a green button that says **"Code"**
2. Click it
3. Make sure **"HTTPS"** is selected (should be highlighted)
4. Copy the link (it looks like: `https://github.com/YOUR-USERNAME/PATH360-APP-V2.git`)

**Example**: `https://github.com/emmahkwamboka/PATH360-APP-V2.git`

### Step 3.2: Add Remote Repository
In your Terminal, run:
```bash
git remote add origin https://github.com/YOUR-USERNAME/PATH360-APP-V2.git
```

Replace `YOUR-USERNAME` with your actual GitHub username.

**Example**: 
```bash
git remote add origin https://github.com/emmahkwamboka/PATH360-APP-V2.git
```

### Step 3.3: Push Your Code to GitHub
Run:
```bash
git branch -M main
git push -u origin main
```

This uploads your code to GitHub. You might be asked to login with your GitHub credentials. Enter them.

You should see:
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
...
To https://github.com/emmahkwamboka/PATH360-APP-V2.git
 * [new branch]      main -> main
```

**✅ Your code is now on GitHub!**

---

## PART 4: DEPLOY ON VERCEL

### Step 4.1: Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"** (top right)
3. Click **"Continue with GitHub"** (easiest option)
4. GitHub might ask permission - click **"Authorize vercel"**
5. Fill in your details and click **"Continue"**

### Step 4.2: Import Your Repository
You should see a page asking to import a project.

**If you don't see it**, go to your Vercel dashboard:
1. Click your profile icon (top right)
2. Click **"Add New"**
3. Select **"Project"**

### Step 4.3: Find Your Repository
You'll see a search box that says "Search for a repository..."

1. Type: `PATH360-APP-V2`
2. Your repository should appear
3. Click the **"Import"** button next to it

### Step 4.4: Configure Your Project
A page opens with settings. **Leave most things as default**, but verify:

- **Project Name**: `PATH360-APP-V2` ✅
- **Framework Preset**: Should say **"Vite"** ✅
- **Root Directory**: Leave blank (it's already correct)
- **Build Command**: Should show `npm run build` ✅
- **Output Directory**: Should show `dist` ✅

**Don't change anything** - just scroll down.

### Step 4.5: Add Environment Variables
This is important! Scroll down to **"Environment Variables"** section.

You'll see input fields. Add each variable like this:

**Variable 1:**
- **Name field**: `VITE_SUPABASE_URL`
- **Value field**: `https://urxfhycsrtoztqxtwdap.supabase.co`
- Click **"Add"**

**Variable 2:**
- **Name field**: `VITE_SUPABASE_ANON_KEY`
- **Value field**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeGZoeWNzcnRvenRxeHR3ZGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTkyNTksImV4cCI6MjA5NDIzNTI1OX0.L5ie2B11nIDRAD3qqP_1dbKMji5PuIYCqPTzYIQceKg`
- Click **"Add"**

**Variable 3:**
- **Name field**: `VITE_API_BASE_URL`
- **Value field**: `http://localhost:8000`
- Click **"Add"**
- ⚠️ **NOTE**: You'll update this later to your production URL

**Variable 4:**
- **Name field**: `VITE_POSTHOG_KEY`
- **Value field**: (Leave blank if you don't have one)
- Click **"Add"**

**Variable 5:**
- **Name field**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value field**: (Leave blank if you don't have one)
- Click **"Add"**

**Variable 6:**
- **Name field**: `VITE_GEMINI_API_KEY`
- **Value field**: `YOUR_GEMINI_API_KEY`
- Click **"Add"**

### Step 4.6: Deploy!
Scroll down and click the **"Deploy"** button.

Vercel will:
1. Build your app (takes 2-3 minutes)
2. Show a spinning icon
3. Eventually show ✅ **"Congratulations! Your project has been successfully deployed"**

---

## PART 5: YOUR APP IS LIVE!

### Step 5.1: Get Your Live URL
On the success page, you'll see:
- A link like: `https://path360-app-v2.vercel.app`
- This is your live app URL!

### Step 5.2: Test Your App
1. Click the link or copy it into your browser
2. Your app should load
3. Try clicking around to make sure everything works

### Step 5.3: Share Your Link
You can now share `https://path360-app-v2.vercel.app` with anyone to test your app!

---

## PART 6: IF SOMETHING GOES WRONG

### Option A: Rollback on Vercel (Easiest)
1. Go to https://vercel.com
2. Click on your project name: `PATH360-APP-V2`
3. Click the **"Deployments"** tab
4. Find the previous deployment (green checkmark)
5. Click the **"..."** menu
6. Click **"Promote to Production"**
7. Done! Your app reverts to the previous version

### Option B: Use Your Backup Folder
Your backup is at: `/Users/emmahkwamboka/PATH360-APP V2-BACKUP`

If you need to completely start over:
1. Copy files from the BACKUP folder
2. Push to GitHub again
3. Redeploy on Vercel

---

## PART 7: UPDATE LATER

### When You Make Changes
1. Make changes in your code
2. In Terminal, run:
```bash
git add .
git commit -m "Your change description"
git push
```
3. Vercel automatically rebuilds and deploys! (takes 2-3 minutes)
4. Your live app updates automatically

---

## QUICK REFERENCE CHECKLIST

- [ ] Git initialized in your project folder
- [ ] Code committed to Git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported on Vercel
- [ ] Environment variables added
- [ ] Deployment completed (green checkmark)
- [ ] App is live and working
- [ ] Backup folder exists at: `PATH360-APP V2-BACKUP`

---

## TROUBLESHOOTING

### Problem: "Repository not found"
- **Solution**: Make sure you:
  1. Committed your code with `git commit`
  2. Pushed to GitHub with `git push`
  3. Your GitHub repository is set to PUBLIC

### Problem: "Build failed"
- **Solution**: 
  1. Check Vercel's build logs (click on the failed deployment)
  2. Scroll down to see what went wrong
  3. Common fix: Missing environment variable

### Problem: "App loads but nothing works"
- **Solution**: 
  1. Check your `VITE_API_BASE_URL` - it's probably pointing to `localhost:8000`
  2. Update it to your production API URL
  3. Go to Vercel dashboard → Settings → Environment Variables
  4. Update the value and redeploy

### Problem: "Environment variables not showing"
- **Solution**:
  1. Go to Vercel dashboard
  2. Click your project
  3. Click **"Settings"** tab
  4. Click **"Environment Variables"** on left
  5. Add them there if missing

---

## NEED HELP?

**Vercel Support**: https://vercel.com/support
**GitHub Help**: https://docs.github.com/
**Your Backup**: `/Users/emmahkwamboka/PATH360-APP V2-BACKUP`

**Restore Original**:
```bash
rm -rf "/Users/emmahkwamboka/PATH360-APP V2"
cp -r "/Users/emmahkwamboka/PATH360-APP V2-BACKUP" "/Users/emmahkwamboka/PATH360-APP V2"
```

---

You're all set! Follow these steps in order and your app will be live in about 15 minutes. 🚀
