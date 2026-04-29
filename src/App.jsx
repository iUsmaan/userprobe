import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Checked platforms (real APIs, server-side) ───────────────────────────
const API_PLATFORMS = [
  { name: 'GitHub',   url: u => `https://github.com/${u}`,                          accent: '#8B949E', icon: '⌘' },
  { name: 'Reddit',   url: u => `https://reddit.com/user/${u}`,                     accent: '#FF4500', icon: '◉' },
  { name: 'Twitch',   url: u => `https://twitch.tv/${u}`,                           accent: '#9146FF', icon: '◈' },
  { name: 'YouTube',  url: u => `https://youtube.com/@${u}`,                        accent: '#FF0000', icon: '▶' },
  { name: 'Bluesky',  url: u => `https://bsky.app/profile/${u}.bsky.social`,        accent: '#0085FF', icon: '☁' },
];

// ─── Manual-check platforms (no reliable public API) ─────────────────────
const MANUAL_PLATFORMS = [
  { name: 'Instagram', url: u => `https://instagram.com/${u}`,                accent: '#E1306C', icon: '◐' },
  { name: 'TikTok',    url: u => `https://tiktok.com/@${u}`,                  accent: '#00F2EA', icon: '♬' },
  { name: 'X/Twitter', url: u => `https://x.com/${u}`,                        accent: '#8ECDF8', icon: '𝕏' },
  { name: 'LinkedIn',  url: u => `https://linkedin.com/in/${u}`,              accent: '#0A66C2', icon: 'in' },
  { name: 'Pinterest', url: u => `https://pinterest.com/${u}`,                accent: '#E60023', icon: 'P'  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'checking') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #2A3A5C', borderTopColor: '#60A5FA', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
    );
  }
  const map = {
    available: { label: 'AVAILABLE', color: '#34D399' },
    taken:     { label: 'TAKEN',     color: '#F87171' },
    no_key:    { label: 'NO API KEY', color: '#FBBF24' },
    error:     { label: 'ERROR',     color: '#64748B' },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: cfg.color, letterSpacing: '0.05em' }}>{cfg.label}</span>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 7px ${cfg.color}88` }} />
    </div>
  );
}

// ─── API Platform Row ─────────────────────────────────────────────────────
function ApiRow({ platform, username, status }) {
  const link = username ? platform.url(username) : null;
  const resolved = ['available', 'taken', 'no_key', 'error'].includes(status);
  const bg     = status === 'available' ? '#0D2818' : status === 'taken' ? '#2A1015' : status === 'no_key' ? '#1C1508' : '#0F1729';
  const border = status === 'available' ? '#166534' : status === 'taken' ? '#7F1D1D55' : status === 'no_key' ? '#92400E55' : '#1E293B';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, background: bg, border: `1px solid ${border}`, transition: 'all 0.3s ease' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: `${platform.accent}18`, border: `1px solid ${platform.accent}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: platform.icon.length > 1 ? 12 : 17, fontWeight: 700, color: platform.accent,
        fontFamily: "'Outfit', sans-serif",
      }}>{platform.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', fontFamily: "'Outfit', sans-serif" }}>{platform.name}</div>
        <div style={{ fontSize: 9.5, color: '#334155', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>⚡ API check</div>
      </div>

      {resolved && status !== 'error' && status !== 'no_key' && link && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{
          fontSize: 10, color: '#60A5FA', textDecoration: 'none',
          padding: '4px 10px', borderRadius: 6, background: '#60A5FA12',
          border: '1px solid #60A5FA25', fontWeight: 500, flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
        }}>Visit ↗</a>
      )}

      <StatusBadge status={status} />
    </div>
  );
}

// ─── Manual Platform Row ──────────────────────────────────────────────────
function ManualRow({ platform, username }) {
  const link = username ? platform.url(username) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, background: '#0C1525', border: '1px solid #1E293B' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: `${platform.accent}10`, border: `1px solid ${platform.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: platform.icon.length > 1 ? 12 : 17, fontWeight: 700,
        color: `${platform.accent}88`, fontFamily: "'Outfit', sans-serif",
      }}>{platform.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#64748B', fontFamily: "'Outfit', sans-serif" }}>{platform.name}</div>
        <div style={{ fontSize: 9.5, color: '#1E3A5F', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>No public API — check manually</div>
      </div>

      {link && username && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{
          fontSize: 10, color: platform.accent, textDecoration: 'none',
          padding: '5px 12px', borderRadius: 6,
          background: `${platform.accent}12`, border: `1px solid ${platform.accent}25`,
          fontWeight: 600, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.03em',
        }}>Check ↗</a>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const probe = useCallback(async () => {
    const name = username.trim().toLowerCase();
    if (!name || isChecking) return;

    setIsChecking(true);
    setHasSearched(true);

    // Set API platforms to checking
    const init = {};
    API_PLATFORMS.forEach(p => { init[p.name] = 'checking'; });
    setResults(init);

    try {
      const res = await fetch('/api/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();

      if (data.results) {
        const next = {};
        data.results.forEach(r => { next[r.platform] = r.status; });
        setResults(next);
      }
    } catch {
      const err = {};
      API_PLATFORMS.forEach(p => { err[p.name] = 'error'; });
      setResults(err);
    }

    setIsChecking(false);
  }, [username, isChecking]);

  const counts = Object.values(results).reduce((a, s) => {
    if (s === 'available') a.available++;
    else if (s === 'taken') a.taken++;
    return a;
  }, { available: 0, taken: 0 });

  const allDone = hasSearched && !isChecking;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(170deg, #0B1120 0%, #0F172A 50%, #111827 100%)',
      fontFamily: "'Outfit', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 16px 60px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.15; } }
        input::placeholder { color: #475569; }
        input:focus { outline: none; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0B1120; }
        a:hover { opacity: 0.75; }
      `}</style>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#E2E8F0', fontSize: 18, fontWeight: 700,
          boxShadow: '0 0 20px #2563EB33',
        }}>U</div>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#E2E8F0', letterSpacing: '-0.02em' }}>UserProbe</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, maxWidth: 480 }}>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 300,
          color: '#E2E8F0', lineHeight: 1.15, letterSpacing: '-0.03em',
        }}>
          Probe your name<br />
          <span style={{ fontWeight: 700, color: '#60A5FA' }}>across the web.</span>
        </h1>
        <p style={{
          fontSize: 13, color: '#64748B', lineHeight: 1.6, marginTop: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {API_PLATFORMS.length} accurate API checks · {MANUAL_PLATFORMS.length} manual links
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        width: '100%', maxWidth: 500,
        background: '#0F172A', borderRadius: 14,
        border: '1.5px solid #1E293B',
        padding: '5px 5px 5px 20px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        marginBottom: isChecking ? 12 : 32,
      }}>
        <span style={{ fontSize: 17, color: '#334155', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, userSelect: 'none' }}>@</span>
        <input
          ref={inputRef} type="text" placeholder="enter username…"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
          onKeyDown={e => e.key === 'Enter' && probe()}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 16, fontFamily: "'Outfit', sans-serif",
            color: '#E2E8F0', fontWeight: 400, padding: '13px 0',
          }}
        />
        <button onClick={probe} disabled={!username.trim() || isChecking} style={{
          padding: '12px 28px', borderRadius: 10,
          background: !username.trim() || isChecking ? '#1E293B' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: !username.trim() || isChecking ? '#475569' : '#FFFFFF',
          border: 'none',
          cursor: !username.trim() || isChecking ? 'default' : 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.04em', transition: 'all 0.25s ease',
          boxShadow: !username.trim() || isChecking ? 'none' : '0 0 20px #2563EB44',
          whiteSpace: 'nowrap',
        }}>
          {isChecking ? '...' : 'PROBE'}
        </button>
      </div>

      {/* Progress bar while checking */}
      {isChecking && (
        <div style={{ width: '100%', maxWidth: 500, height: 2, background: '#1E293B', borderRadius: 1, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '100%',
            background: 'linear-gradient(90deg, #1E293B, #2563EB, #60A5FA, #2563EB, #1E293B)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
            borderRadius: 1,
          }} />
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0D2818', border: '1px solid #166534', padding: '8px 16px', borderRadius: 8 }}>
            <span style={{ color: '#34D399', fontWeight: 700, fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>{counts.available}</span>
            <span style={{ fontSize: 12, color: '#34D399', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2A1015', border: '1px solid #7F1D1D', padding: '8px 16px', borderRadius: 8 }}>
            <span style={{ color: '#F87171', fontWeight: 700, fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>{counts.taken}</span>
            <span style={{ fontSize: 12, color: '#F87171', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>taken</span>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* API Checked section */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              ⚡ API Verified
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {API_PLATFORMS.map(p => (
                <ApiRow key={p.name} platform={p} username={username.trim().toLowerCase()} status={results[p.name] || 'checking'} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ border: 'none', borderTop: '1px solid #1E293B', margin: '4px 0' }} />

          {/* Manual check section */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#1E3A5F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              🌐 Check Manually
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MANUAL_PLATFORMS.map(p => (
                <ManualRow key={p.name} platform={p} username={username.trim().toLowerCase()} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.2, color: '#60A5FA', animation: 'pulse 4s ease infinite' }}>⊙</div>
          <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#334155', letterSpacing: '0.06em', lineHeight: 1.8 }}>
            Type a username and hit PROBE<br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>5 platforms checked via real APIs</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 40, maxWidth: 480, textAlign: 'center',
        fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        color: '#1E293B', letterSpacing: '0.04em', lineHeight: 1.8,
      }}>
        GitHub · Reddit · Twitch — no key needed<br />
        YouTube — requires Google API key (free)<br />
        Bluesky — no key needed
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
