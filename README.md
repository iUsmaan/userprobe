# UserProbe

Check username availability across 25 platforms instantly.

**No API keys needed. No AI. No guessing. Free to run.**

## How it works

- **20 platforms** checked server-side in parallel (real public APIs + body text checks)
- **5 platforms** checked browser-side using your residential IP
- All checks fire simultaneously — results in 3–5 seconds
- Every result is strictly Available or Taken

## Platforms

| Category | Platforms |
|---|---|
| Social | Facebook, Instagram, TikTok, Snapchat, Pinterest, Reddit, Threads, Truth Social, Mastodon, Bluesky |
| Professional | LinkedIn, GitHub, About.me |
| Video | Twitch, Tumblr |
| Messaging | Telegram, Discord |
| Gaming | Steam, Xbox, PlayStation, Lichess |
| Dev/Creative | Medium, Dev.to, Dribbble, Behance |

## Deploy to Vercel (browser only, no installs)

1. Create a GitHub account at github.com
2. Create a new repo called `userprobe`
3. Upload all files from this zip (drag & drop in GitHub)
4. Create a Vercel account at vercel.com (sign up with GitHub)
5. Go to vercel.com/new → import your `userprobe` repo → Deploy
6. Done — your app is live!

## Tech

- React + Vite (frontend)
- Vercel serverless function (backend)
- Zero external dependencies beyond React
