// Vercel Serverless Function — proxies requests to Anthropic API
// Your ANTHROPIC_API_KEY is set in Vercel Environment Variables (never exposed to the browser)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel Environment Variables.' });
  }

  try {
    const { username, platforms } = req.body;

    if (!username || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Missing username or platforms array' });
    }

    const profileUrls = platforms
      .filter(p => p.profileUrl)
      .map(p => `${p.name}: ${p.profileUrl}`)
      .join('\n');

    const platformNames = platforms.map(p => p.name).join(', ');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `Check if the username "${username}" is taken on these platforms: ${platformNames}.

Profile URLs to check:
${profileUrls}

Search the web for information about this username on each platform. Look for active profiles, social media accounts, or any evidence the username is in use.

Respond ONLY with a JSON array (no markdown, no backticks, no explanation). Each entry:
[
  {"platform": "PlatformName", "status": "likely_taken" | "likely_available" | "uncertain", "detail": "brief reason, e.g. 'Active profile found with 5k followers' or 'No profile found'"}
]

Be honest — if you can't determine, say "uncertain".`
          }
        ]
      })
    });

    const data = await response.json();

    // Extract text content from Claude's response
    const textContent = data.content
      ?.filter(c => c.type === 'text')
      .map(c => c.text)
      .join('')
      .trim();

    if (!textContent) {
      return res.status(200).json({ results: platforms.map(p => ({ platform: p.name, status: 'uncertain', detail: 'No clear result' })) });
    }

    try {
      const cleaned = textContent.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({ results: Array.isArray(parsed) ? parsed : [] });
    } catch {
      return res.status(200).json({ results: platforms.map(p => ({ platform: p.name, status: 'uncertain', detail: 'Could not parse result' })) });
    }
  } catch (error) {
    console.error('Probe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
