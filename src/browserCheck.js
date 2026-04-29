// Browser-side checks
// These run from the USER'S browser (residential IP) — not our server
// Platforms like Instagram/TikTok/X block datacenter IPs but not real browsers

// Discord has a special public API endpoint for username checking
async function checkDiscord(username) {
  try {
    const res = await fetch(`https://discord.com/api/v9/unique-username/username-attempt-unauthed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (res.status === 200) {
      const data = await res.json();
      // taken: false means available, taken: true means taken
      return data.taken === true ? 'taken' : 'available';
    }
    return 'available';
  } catch {
    return 'available';
  }
}

// For platforms that return readable HTML from the browser
async function checkBrowserPlatform(platform, username) {
  if (platform.id === 'discord') {
    return checkDiscord(username);
  }

  const url = platform.url(username);

  try {
    // Try a regular fetch first (works if CORS allows)
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
    });

    if (res.status === 404) return 'available';

    if (res.status === 200) {
      // If we have error text to look for, check the body
      if (platform.notFoundText && platform.notFoundText.length > 0) {
        try {
          const text = await res.text();
          for (const str of platform.notFoundText) {
            if (text.includes(str)) return 'available';
          }
        } catch { /* ignore */ }
      }
      return 'taken';
    }

    // For other status codes, try no-cors fallback
    return 'available';
  } catch {
    // CORS error means the server responded (profile exists) — try no-cors
    try {
      const res2 = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
      });
      // opaque response = server replied = likely taken
      if (res2.type === 'opaque') return 'taken';
      return 'available';
    } catch {
      return 'available';
    }
  }
}

export async function runBrowserChecks(browserPlatforms, username) {
  const results = {};

  await Promise.all(
    browserPlatforms.map(async (platform) => {
      results[platform.id] = await checkBrowserPlatform(platform, username);
    })
  );

  return results;
}
