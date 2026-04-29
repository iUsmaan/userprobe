# UserProbe v2

**Probe your name across the web.** Check username availability across 25 platforms instantly.

## What's New in v2

- **25 platforms** — up from 16
- **Direct HTTP checks** — no more "uncertain" results. Every platform returns Available or Taken.
- **Public APIs** for GitHub, Reddit, Bluesky, Mastodon, and Lichess
- **AI web search** only for Spotify (the one platform without public profiles)
- **Dark blue UI** — clean, modern design
- **Much faster** — parallel HTTP checks complete in seconds

## How It Works

| Method | Platforms | How |
|--------|-----------|-----|
| HTTP profile check | Facebook, YouTube, Instagram, TikTok, LinkedIn, X, Snapchat, Pinterest, Threads, Twitch, Tumblr, Medium, Dribbble, Behance, Steam, Kick, Vimeo, dev.to | Hits the profile URL, checks if 200 (taken) or 404 (available) |
| Public API | GitHub, Reddit, Bluesky, Mastodon, Lichess | Calls the platform's public REST/JSON API |
| AI web search | Spotify | Uses Claude with web search as fallback |
| Skipped | Discord | No public profiles — usernames are private |

## Deploy (Browser Only — No Installs Needed)

### 1. Create accounts (all free)
- [GitHub](https://github.com) — sign up with email
- [Vercel](https://vercel.com) — sign up with GitHub
- [Anthropic](https://console.anthropic.com) — get an API key

### 2. Create a GitHub repo
- Go to https://github.com/new
- Name it `userprobe`, check "Add a README", click Create
- Click "Add file" → "Upload files"
- Drag ALL files from this zip into the upload area
- Click "Commit changes"

### 3. Deploy on Vercel
- Go to https://vercel.com/new
- Import your `userprobe` repo
- Click Deploy — wait 1-2 minutes

### 4. Add API key
- Vercel dashboard → your project → Settings → Environment Variables
- Key: `ANTHROPIC_API_KEY` — Value: your key
- Check all boxes → Save
- Go to Deployments → Redeploy

Your app is live!

## Project Structure

```
userprobe/
├── api/probe.js        # Serverless function (HTTP checks + APIs)
├── src/App.jsx         # React frontend (dark blue theme)
├── src/main.jsx        # Entry point
├── public/favicon.svg  # App icon
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

## Coming Soon
- Email address checker
- Domain name checker
- Memorable password generator

Built with React, Vite, and Claude AI.
