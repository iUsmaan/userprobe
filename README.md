# UserProbe

**Probe your name across the web.** AI-powered username availability checker across 16+ platforms.

UserProbe uses Claude AI with web search to find real profile data across GitHub, X/Twitter, Instagram, TikTok, YouTube, Reddit, Twitch, LinkedIn, Pinterest, Dribbble, Medium, Steam, Spotify, Discord, Snapchat, and Behance.

---

## Quick Deploy to Vercel — Windows Guide (5 minutes)

### Prerequisites
- A [Vercel](https://vercel.com) account (free — sign up with GitHub)
- An [Anthropic API key](https://console.anthropic.com/)
- [Node.js](https://nodejs.org/) 18+ (download the Windows LTS installer)
- [Git for Windows](https://git-scm.com/download/win) (optional but recommended)

### Steps

**1. Extract the zip file**
Right-click `userprobe.zip` → Extract All → pick a folder (e.g. your Desktop).

**2. Open a terminal in the project folder**
Open the extracted `userprobe` folder in File Explorer, then:
- Click the address bar, type `cmd`, and hit Enter
- OR right-click → "Open in Terminal" (Windows 11)
- OR open PowerShell/Command Prompt and run:
```
cd C:\Users\YourName\Desktop\userprobe
```

**3. Install dependencies**
```
npm install
```

**4. Test locally (optional)**
Create a file called `.env.local` in the project root with this content:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Then run:
```
npm run dev
```
Open `http://localhost:5173` in your browser.

**5. Deploy to Vercel**
```
npx vercel
```
- It will ask you to log in (opens browser) — log in with your Vercel account
- When asked "Set up and deploy?", press Enter (Yes)
- When asked about settings, accept all defaults (just keep pressing Enter)
- Wait for it to finish — it will give you a URL like `userprobe-xxxx.vercel.app`

**6. Add your API key in Vercel**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click your `userprobe` project
- Go to **Settings** → **Environment Variables**
- Add a new variable:
  - Name: `ANTHROPIC_API_KEY`
  - Value: `sk-ant-your-key-here` (paste your real key)
  - Environment: Check all boxes (Production, Preview, Development)
- Click **Save**

**7. Redeploy with the key active**
Back in your terminal:
```
npx vercel --prod
```

That's it! Your app is live at `your-project.vercel.app` 🎉

### Troubleshooting on Windows
- **"npm is not recognized"** → Restart your terminal after installing Node.js
- **"npx vercel" hangs** → Try running PowerShell as Administrator
- **Build errors** → Make sure you're inside the `userprobe` folder (not a parent folder)
- **API returns errors after deploy** → Double-check the env variable name is exactly `ANTHROPIC_API_KEY`

---

## Project Structure

```
userprobe/
├── api/
│   └── probe.js          # Vercel serverless function (API proxy)
├── public/
│   └── favicon.svg       # App icon
├── src/
│   ├── App.jsx           # Main React application
│   └── main.jsx          # React entry point
├── index.html            # HTML entry
├── package.json
├── vite.config.js        # Vite bundler config
├── vercel.json           # Vercel deployment config
├── .env.example          # Environment variable template
└── .gitignore
```

## How It Works

1. User enters a username
2. Frontend sends batched requests to `/api/probe`
3. Serverless function calls Claude API with web search enabled
4. Claude searches the web for each platform profile
5. Results stream back: likely_taken / likely_available / uncertain
6. User can click "Visit ↗" to verify directly

## Security

- Your Anthropic API key is **never exposed** to the browser
- It lives only in Vercel's environment variables
- The serverless function acts as a secure proxy

---

## Coming Soon

- Email address availability checker
- Domain name checker
- Memorable password generator
- More platforms

---

Built with React, Vite, and Claude AI.
