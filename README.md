# Path360 App

This workspace has been archived and replaced with a fresh React + Vite starter project.

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Supabase setup

Create a `.env` file in the project root with these values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then import `supabase` from `src/lib/supabaseClient.js` in your app.
