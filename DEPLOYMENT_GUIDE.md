# Vercel Deployment Guide - PATH360-APP V2

## Overview
Your app is now ready for deployment to Vercel. This is the most stable and easiest option for your Vite + React application.

## Why Vercel?
✅ Zero-config deployment for Vite apps
✅ Automatic builds & deployments on git push
✅ Free tier with generous limits
✅ Fast CDN globally
✅ Environment variables securely managed
✅ Automatic HTTPS/SSL
✅ Easy rollback to previous versions

## Step-by-Step Deployment

### 1. Connect Your Repository
- Go to [vercel.com](https://vercel.com)
- Sign up or log in with GitHub, GitLab, or Bitbucket
- Click "Add New..." → "Project"
- Import your repository (PATH360-APP V2)
- Vercel will automatically detect it's a Vite project

### 2. Configure Environment Variables
In your Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://urxfhycsrtoztqxtwdap.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_BASE_URL=https://your-api-domain.com  (Update if needed)
VITE_POSTHOG_KEY=YOUR_POSTHOG_KEY
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 3. Update API Base URL
⚠️ **IMPORTANT**: Before deployment, update `VITE_API_BASE_URL` in your environment variables. Currently it points to `http://localhost:8000`.

Determine your backend API URL:
- If using Supabase functions: Set to your Supabase project URL
- If using a deployed backend: Set to your production API URL
- Check your [api.js](src/lib/api.js) to understand your API calls

### 4. Deploy
- Click "Deploy" in Vercel
- Wait for automatic build (usually 2-3 minutes)
- Your app will be live at: `your-project.vercel.app`

### 5. Set Custom Domain (Optional)
- In Vercel dashboard, go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

## Important Notes

### Supabase Configuration
Your app uses Supabase for:
- Authentication (`@supabase/auth-helpers-react`)
- Database & functions (`@supabase/supabase-js`)

**Verify Supabase settings**:
- Check allowed redirect URLs include: `https://your-domain.vercel.app/`
- Update in Supabase dashboard: Authentication → URL Configuration

### API Backend
Your app makes requests to `VITE_API_BASE_URL`. Make sure:
- Backend is deployed and accessible
- CORS is configured correctly
- API endpoints match your code

### Stripe Integration
If using Stripe:
- Update Stripe publishable key for production
- Configure webhook URLs in Stripe dashboard

### PostHog Analytics
- Set `VITE_POSTHOG_KEY` for analytics tracking
- Update PostHog configuration for production URL

## Rollback & Backup

**If something goes wrong:**
1. Vercel keeps deployment history
2. Go to Deployments tab and click "Rollback"
3. Your backup copy is at: `/Users/emmahkwamboka/PATH360-APP V2-BACKUP`

## Testing Before Going Live

### 1. Build Locally
```bash
npm run build
npm run preview
```
This simulates the production build.

### 2. Test All Features
- User authentication
- API calls
- Supabase integration
- Stripe payments (if applicable)
- Document generation
- Reports generation

### 3. Environment Variables
Verify all env vars are set correctly in Vercel dashboard.

## Monitoring After Deployment

1. **Check Vercel Analytics**
   - Performance metrics
   - Error tracking
   - Build logs

2. **Monitor your backend**
   - API response times
   - Database queries
   - Error logs

3. **Test from different devices**
   - Mobile browsers
   - Desktop browsers
   - Different networks

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/
- **Your backup**: `/Users/emmahkwamboka/PATH360-APP V2-BACKUP`

## Quick Checklist

- [ ] Git repository created/connected
- [ ] Environment variables configured in Vercel
- [ ] Supabase redirect URLs updated
- [ ] API base URL configured
- [ ] Build tested locally (`npm run build`)
- [ ] Preview tested locally (`npm run preview`)
- [ ] Deployed to Vercel
- [ ] Domain configured (if custom domain)
- [ ] All features tested on live site
- [ ] Analytics/monitoring set up
