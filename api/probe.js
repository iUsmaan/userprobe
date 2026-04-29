// UserProbe — Serverless API
// Handles 20 platforms in parallel
// Method 1: Public REST/GraphQL APIs  (GitHub, Reddit, Twitch, Bluesky, Truth Social, Mastodon, Dev.to, Medium, Tumblr, Lichess)
// Method 2: Server body text checks   (Telegram, Snapchat, Pinterest, Steam, Xbox, PlayStation, Dribbble, Behance, About.me)
// Method 3: Browser-side             (Facebook, Instagram, TikTok, X, LinkedIn, Discord, Threads) — handled by frontend

const TIMEOUT = 7000;

function signal() {
  return AbortSignal.timeout(TIMEOUT);
}

async function safeFetch(url, opts = {}) {
  try {
    return await fetch(url, { signal: signal(), ...opts });
  } catch {
    return null;
  }
}

// ── Method 1: Public APIs ──────────────────────────────────────────────────

async function checkGitHub(u) {
  const r = await safeFetch(`https://api.github.com/users/${u}`, {
    headers: { 'User-Agent': 'UserProbe/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkReddit(u) {
  const r = await safeFetch(`https://www.reddit.com/user/${u}/about.json`, {
    headers: { 'User-Agent': 'UserProbe/1.0' }
  });
  if (!r) return 'available';
  if (r.status === 404) return 'available';
  if (r.status === 200) {
    try {
      const d = await r.json();
      return d?.data?.name ? 'taken' : 'available';
    } catch { return 'available'; }
  }
  return 'available';
}

async function checkTwitch(u) {
  const r = await safeFetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
    body: JSON.stringify([{
      operationName: 'GetUserID',
      variables: { login: u, lookupType: 'ACTIVE' },
      extensions: { persistedQuery: { version: 1, sha256Hash: 'bf6c594605caa0c63522823d8f5c4736bea1c347f7659f4f7a2ab5e7cd8b0f29' } }
    }])
  });
  if (!r || r.status !== 200) return 'available';
  try {
    const d = await r.json();
    return d?.[0]?.data?.user ? 'taken' : 'available';
  } catch { return 'available'; }
}

async function checkBluesky(u) {
  const r = await safeFetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(u + '.bsky.social')}`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkTruthSocial(u) {
  const r = await safeFetch(
    `https://truthsocial.com/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkMastodon(u) {
  const r = await safeFetch(
    `https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkDevTo(u) {
  const r = await safeFetch(`https://dev.to/${u}`, {
    headers: { 'User-Agent': 'UserProbe/1.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkMedium(u) {
  const r = await safeFetch(`https://medium.com/@${u}`, {
    headers: { 'User-Agent': 'UserProbe/1.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkTumblr(u) {
  const r = await safeFetch(`https://${u}.tumblr.com`, {
    headers: { 'User-Agent': 'UserProbe/1.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkLichess(u) {
  const r = await safeFetch(`https://lichess.org/api/user/${u}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

// ── Method 2: Body text checks ────────────────────────────────────────────

async function bodyCheck(url, notFoundStrings, headers = {}) {
  const r = await safeFetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', ...headers }
  });
  if (!r) return 'available';
  if (r.status === 404) return 'available';
  if (r.status !== 200) return 'available';
  try {
    const text = await r.text();
    for (const str of notFoundStrings) {
      if (text.includes(str)) return 'available';
    }
    return 'taken';
  } catch { return 'available'; }
}

async function checkTelegram(u) {
  return bodyCheck(`https://t.me/${u}`, ['tgme_page_extra', 'If you have Telegram, you can contact']);
  // Telegram returns a page for existing users with their info
  // For non-existent, it shows a generic "open telegram" page without user details
}

async function checkSnapchat(u) {
  return bodyCheck(`https://www.snapchat.com/add/${u}`, ['Sorry, we couldn\'t find', 'pageNotFound', 'not found']);
}

async function checkPinterest(u) {
  return bodyCheck(`https://www.pinterest.com/${u}/`, ["Sorry! We couldn't find that page", "we couldn't find", '404']);
}

async function checkSteam(u) {
  return bodyCheck(`https://steamcommunity.com/id/${u}`, ['The specified profile could not be found', 'profile could not be found']);
}

async function checkXbox(u) {
  // Use xboxgamertag.com which has reliable 404s
  const r = await safeFetch(`https://xboxgamertag.com/search/${encodeURIComponent(u)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  if (!r) return 'available';
  if (r.status === 404) return 'available';
  if (r.status === 200) {
    try {
      const text = await r.text();
      if (text.includes('No gamertag found') || text.includes('not found') || text.includes('0 results')) return 'available';
      return 'taken';
    } catch { return 'available'; }
  }
  return 'available';
}

async function checkPlayStation(u) {
  // psnprofiles.com gives reliable 404 for non-existent PSN usernames
  const r = await safeFetch(`https://psnprofiles.com/${encodeURIComponent(u)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  if (!r) return 'available';
  if (r.status === 404) return 'available';
  if (r.status === 200) {
    try {
      const text = await r.text();
      if (text.includes('PSN user not found') || text.includes('user not found') || text.includes('No user found')) return 'available';
      return 'taken';
    } catch { return 'available'; }
  }
  return 'available';
}

async function checkDribbble(u) {
  const r = await safeFetch(`https://dribbble.com/${u}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkBehance(u) {
  const r = await safeFetch(`https://www.behance.net/${u}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

async function checkAboutMe(u) {
  const r = await safeFetch(`https://about.me/${u}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!r) return 'available';
  return r.status === 200 ? 'taken' : 'available';
}

// ── Main handler ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Missing username' });
  }

  const u = username.trim().toLowerCase();

  // Run all 20 server-side checks in parallel
  const [
    github, reddit, twitch, bluesky, truthsocial,
    mastodon, devto, medium, tumblr, lichess,
    telegram, snapchat, pinterest, steam, xbox,
    playstation, dribbble, behance, aboutme
  ] = await Promise.all([
    checkGitHub(u),
    checkReddit(u),
    checkTwitch(u),
    checkBluesky(u),
    checkTruthSocial(u),
    checkMastodon(u),
    checkDevTo(u),
    checkMedium(u),
    checkTumblr(u),
    checkLichess(u),
    checkTelegram(u),
    checkSnapchat(u),
    checkPinterest(u),
    checkSteam(u),
    checkXbox(u),
    checkPlayStation(u),
    checkDribbble(u),
    checkBehance(u),
    checkAboutMe(u),
  ]);

  return res.status(200).json({
    results: {
      github, reddit, twitch, bluesky, truthsocial,
      mastodon, devto, medium, tumblr, lichess,
      telegram, snapchat, pinterest, steam, xbox,
      playstation, dribbble, behance, aboutme
    }
  });
}
