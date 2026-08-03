# PATH360 App Recovery Guide

This bundle contains the current app source, assets, and setup instructions so you can restore or move the project to another computer.

## What is included
- Complete app source code under the project root
- Project configuration files such as package.json, Vite config, and Vercel config
- Public assets and app UI source files
- A template environment file for required runtime variables

## Recommended backup steps
1. Keep this folder in a safe location.
2. Keep a copy of the archive in cloud storage or an external drive.
3. Keep your Supabase, Gemini, Stripe, and Posthog credentials somewhere safe.

## Restore on another computer
1. Install Node.js 20+ and npm.
2. Copy this project folder or unzip the backup archive.
3. Open the project folder in a terminal.
4. Install dependencies:
   - npm install
5. Create your environment file:
   - Copy .env.example to .env
   - Fill in the required values
6. Start the app:
   - npm run dev

## Build for production
- npm run build

## Deploy to Vercel
If you want the same live deployment:
1. Install the Vercel CLI if needed.
2. Run:
   - vercel --prod

## Important notes
- This archive intentionally excludes large generated folders such as node_modules and dist.
- You will need to provide your own environment values for services such as Supabase and Gemini.
- If the app depends on a live backend or database, make sure those services are still available.

## Files to keep safe
- The full project folder or backup archive
- Your .env file with real secrets
- Any Supabase project credentials and API keys
