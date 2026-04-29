// All 25 platforms
// method: 'server' = checked by /api/probe
// method: 'browser' = checked by the user's browser directly

export const PLATFORMS = [
  // ── Social ──
  { id: 'facebook',    name: 'Facebook',     category: 'Social',       method: 'browser', url: u => `https://facebook.com/${u}`,           accent: '#1877F2', notFoundText: ['login', 'Log in'] },
  { id: 'instagram',   name: 'Instagram',    category: 'Social',       method: 'browser', url: u => `https://instagram.com/${u}`,           accent: '#E1306C', notFoundText: ["Sorry, this page isn't available"] },
  { id: 'tiktok',      name: 'TikTok',       category: 'Social',       method: 'browser', url: u => `https://tiktok.com/@${u}`,             accent: '#00F2EA', notFoundText: ["Couldn't find this account"] },
  { id: 'snapchat',    name: 'Snapchat',     category: 'Social',       method: 'server',  url: u => `https://snapchat.com/add/${u}`,        accent: '#FFFC00' },
  { id: 'pinterest',   name: 'Pinterest',    category: 'Social',       method: 'server',  url: u => `https://pinterest.com/${u}`,           accent: '#E60023' },
  { id: 'reddit',      name: 'Reddit',       category: 'Social',       method: 'server',  url: u => `https://reddit.com/user/${u}`,         accent: '#FF4500' },
  { id: 'threads',     name: 'Threads',      category: 'Social',       method: 'browser', url: u => `https://threads.net/@${u}`,            accent: '#FFFFFF', notFoundText: ["Sorry, this page isn't available"] },
  { id: 'truthsocial', name: 'Truth Social', category: 'Social',       method: 'server',  url: u => `https://truthsocial.com/@${u}`,        accent: '#FF3E00' },
  { id: 'mastodon',    name: 'Mastodon',     category: 'Social',       method: 'server',  url: u => `https://mastodon.social/@${u}`,        accent: '#6364FF' },
  { id: 'bluesky',     name: 'Bluesky',      category: 'Social',       method: 'server',  url: u => `https://bsky.app/profile/${u}`,        accent: '#0085FF' },

  // ── Professional ──
  { id: 'linkedin',    name: 'LinkedIn',     category: 'Professional', method: 'browser', url: u => `https://linkedin.com/in/${u}`,         accent: '#0A66C2', notFoundText: ['unavailable', "Page not found"] },
  { id: 'github',      name: 'GitHub',       category: 'Professional', method: 'server',  url: u => `https://github.com/${u}`,              accent: '#8B949E' },
  { id: 'aboutme',     name: 'About.me',     category: 'Professional', method: 'server',  url: u => `https://about.me/${u}`,                accent: '#00A98F' },

  // ── Video & Streaming ──
  { id: 'twitch',      name: 'Twitch',       category: 'Video',        method: 'server',  url: u => `https://twitch.tv/${u}`,               accent: '#9146FF' },
  { id: 'tumblr',      name: 'Tumblr',       category: 'Video',        method: 'server',  url: u => `https://${u}.tumblr.com`,              accent: '#36465D' },

  // ── Messaging ──
  { id: 'telegram',    name: 'Telegram',     category: 'Messaging',    method: 'server',  url: u => `https://t.me/${u}`,                    accent: '#2AABEE' },
  { id: 'discord',     name: 'Discord',      category: 'Messaging',    method: 'browser', url: u => `https://discord.com`,                  accent: '#5865F2', notFoundText: [] },

  // ── Gaming ──
  { id: 'steam',       name: 'Steam',        category: 'Gaming',       method: 'server',  url: u => `https://steamcommunity.com/id/${u}`,   accent: '#66C0F4' },
  { id: 'xbox',        name: 'Xbox',         category: 'Gaming',       method: 'server',  url: u => `https://xboxgamertag.com/search/${u}`, accent: '#52B043' },
  { id: 'playstation', name: 'PlayStation',  category: 'Gaming',       method: 'server',  url: u => `https://psnprofiles.com/${u}`,         accent: '#003087' },
  { id: 'lichess',     name: 'Lichess',      category: 'Gaming',       method: 'server',  url: u => `https://lichess.org/@/${u}`,           accent: '#FFFFFF' },

  // ── Dev / Creative ──
  { id: 'medium',      name: 'Medium',       category: 'Dev/Creative', method: 'server',  url: u => `https://medium.com/@${u}`,             accent: '#CCCCCC' },
  { id: 'devto',       name: 'Dev.to',       category: 'Dev/Creative', method: 'server',  url: u => `https://dev.to/${u}`,                  accent: '#5865F2' },
  { id: 'dribbble',    name: 'Dribbble',     category: 'Dev/Creative', method: 'server',  url: u => `https://dribbble.com/${u}`,            accent: '#EA4C89' },
  { id: 'behance',     name: 'Behance',      category: 'Dev/Creative', method: 'server',  url: u => `https://behance.net/${u}`,             accent: '#1769FF' },
];

export const CATEGORIES = ['Social', 'Professional', 'Video', 'Messaging', 'Gaming', 'Dev/Creative'];

export const SERVER_PLATFORMS = PLATFORMS.filter(p => p.method === 'server');
export const BROWSER_PLATFORMS = PLATFORMS.filter(p => p.method === 'browser');
