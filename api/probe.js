// UserProbe v8 — 5 accurate platforms, all via real public APIs
// GitHub   → api.github.com           (no key needed)
// Reddit   → reddit.com JSON API      (no key needed)
// Twitch   → Twitch GraphQL           (no key needed)
// YouTube  → YouTube Data API v3      (needs YOUTUBE_API_KEY)
// Bluesky  → bsky.app public API      (no key needed)

async function checkGitHub(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'UserProbe/8.0', 'Accept': 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200 ? 'taken' : 'available';
  } catch { return 'error'; }
}

async function checkReddit(username) {
  try {
    const res = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: { 'User-Agent': 'UserProbe/8.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return 'available';
    if (res.status === 200) {
      const data = await res.json();
      return data?.data?.name ? 'taken' : 'available';
    }
    return 'error';
  } catch { return 'error'; }
}

async function checkTwitch(username) {
  try {
    const res = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      },
      body: JSON.stringify([{
        operationName: 'GetUserID',
        variables: { login: username, lookupType: 'ACTIVE' },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: 'bf6c594605caa0c63522823d8f5c4736bea1c347f7659f4f7a2ab5e7cd8b0f29',
          },
        },
      }]),
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 200) {
      const data = await res.json();
      return data?.[0]?.data?.user ? 'taken' : 'available';
    }
    return 'error';
  } catch { return 'error'; }
}

async function checkYouTube(username, apiKey) {
  if (!apiKey) return 'no_key';
  try {
    // YouTube Data API v3 — search by handle
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(username)}&key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (res.status === 200) {
      const data = await res.json();
      return data?.pageInfo?.totalResults > 0 ? 'taken' : 'available';
    }
    return 'error';
  } catch { return 'error'; }
}

async function checkBluesky(username) {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(username + '.bsky.social')}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (res.status === 200) return 'taken';
    if (res.status === 400 || res.status === 404) return 'available';
    return 'error';
  } catch { return 'error'; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const name = username.trim().toLowerCase();
  const youtubeKey = process.env.YOUTUBE_API_KEY;

  // Run all checks in parallel
  const [github, reddit, twitch, youtube, bluesky] = await Promise.all([
    checkGitHub(name),
    checkReddit(name),
    checkTwitch(name),
    checkYouTube(name, youtubeKey),
    checkBluesky(name),
  ]);

  return res.status(200).json({
    results: [
      { platform: 'GitHub',  status: github },
      { platform: 'Reddit',  status: reddit },
      { platform: 'Twitch',  status: twitch },
      { platform: 'YouTube', status: youtube },
      { platform: 'Bluesky', status: bluesky },
    ]
  });
}
