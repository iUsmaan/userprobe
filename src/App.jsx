import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Platform Registry ─── */
const PLATFORMS = [
  { name: 'GitHub', url: u => `https://github.com/${u}`, icon: '⌘', accent: '#24292F', bg: '#F6F8FA' },
  { name: 'X / Twitter', url: u => `https://x.com/${u}`, icon: '𝕏', accent: '#0F1419', bg: '#F7F9F9' },
  { name: 'Instagram', url: u => `https://instagram.com/${u}`, icon: '◐', accent: '#E1306C', bg: '#FDF2F6' },
  { name: 'TikTok', url: u => `https://tiktok.com/@${u}`, icon: '♬', accent: '#010101', bg: '#F0FAF5' },
  { name: 'YouTube', url: u => `https://youtube.com/@${u}`, icon: '▷', accent: '#FF0000', bg: '#FFF5F5' },
  { name: 'Reddit', url: u => `https://reddit.com/user/${u}`, icon: '◉', accent: '#FF4500', bg: '#FFF7F2' },
  { name: 'Twitch', url: u => `https://twitch.tv/${u}`, icon: '◈', accent: '#9146FF', bg: '#F8F0FF' },
  { name: 'LinkedIn', url: u => `https://linkedin.com/in/${u}`, icon: '∎', accent: '#0A66C2', bg: '#F0F6FC' },
  { name: 'Pinterest', url: u => `https://pinterest.com/${u}`, icon: '⊕', accent: '#E60023', bg: '#FFF0F2' },
  { name: 'Dribbble', url: u => `https://dribbble.com/${u}`, icon: '●', accent: '#EA4C89', bg: '#FEF0F5' },
  { name: 'Medium', url: u => `https://medium.com/@${u}`, icon: 'M', accent: '#000000', bg: '#F5F5F5' },
  { name: 'Steam', url: u => `https://steamcommunity.com/id/${u}`, icon: '◇', accent: '#1B2838', bg: '#EDF1F5' },
  { name: 'Spotify', url: u => `https://open.spotify.com/user/${u}`, icon: '◎', accent: '#1DB954', bg: '#EEFBF2' },
  { name: 'Discord', url: null, icon: '◆', accent: '#5865F2', bg: '#F0F1FE' },
  { name: 'Snapchat', url: u => `https://snapchat.com/add/${u}`, icon: '◪', accent: '#FFFC00', bg: '#FFFDE0' },
  { name: 'Behance', url: u => `https://behance.net/${u}`, icon: 'Bē', accent: '#1769FF', bg: '#EEF3FF' },
];

const STATUS = {
  idle:             { color: '#999',    bg: 'transparent' },
  searching:        { color: '#8B7355', bg: '#FDF8F3' },
  likely_taken:     { color: '#C0392B', bg: '#FDF2F2' },
  likely_available: { color: '#27AE60', bg: '#F0FDF4' },
  uncertain:        { color: '#B8860B', bg: '#FFFBEB' },
  error:            { color: '#888',    bg: '#F9F9F9' },
};

/* ─── Tiny Components ─── */
function Spinner() {
  return <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #D4C5B0', borderTopColor: '#8B7355', animation: 'spin 0.7s linear infinite' }} />;
}

function StatusIcon({ status }) {
  if (status === 'searching') return <Spinner />;
  if (status === 'likely_taken') return <span style={{ fontSize: 15, color: '#C0392B', fontWeight: 700 }}>✕</span>;
  if (status === 'likely_available') return <span style={{ fontSize: 15, color: '#27AE60', fontWeight: 700 }}>✓</span>;
  if (status === 'uncertain') return <span style={{ fontSize: 13, color: '#B8860B', fontWeight: 700 }}>?</span>;
  if (status === 'error') return <span style={{ fontSize: 13, color: '#888' }}>—</span>;
  return <span style={{ fontSize: 13, color: '#CCC' }}>○</span>;
}

function PlatformRow({ platform, username, status, detail, idx }) {
  const cfg = STATUS[status] || STATUS.idle;
  const link = platform.url ? platform.url(username) : null;
  const resolved = status === 'likely_taken' || status === 'likely_available' || status === 'uncertain' || status === 'error';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 16px', borderRadius: 12,
      background: status !== 'idle' ? cfg.bg : '#FAFAF7',
      border: `1px solid ${status !== 'idle' ? cfg.color + '22' : '#EDEBE6'}`,
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      animation: status === 'searching' ? 'fadeSlideIn 0.3s ease forwards' : undefined,
      animationDelay: `${idx * 25}ms`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: platform.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: platform.icon.length > 1 ? 13 : 18, fontWeight: 800,
        color: platform.accent, flexShrink: 0,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}>{platform.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2C2416', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{platform.name}</div>
        {detail && <div style={{ fontSize: 10.5, color: '#8A7A6A', marginTop: 2, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{detail}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {resolved && link && (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: platform.accent,
            textDecoration: 'none', padding: '4px 10px', borderRadius: 6,
            background: platform.accent + '10', border: `1px solid ${platform.accent}20`,
            fontWeight: 500, transition: 'opacity 0.2s',
          }}>Visit ↗</a>
        )}
        <StatusIcon status={status} />
      </div>
    </div>
  );
}

function SummaryPill({ count, label, color, bg, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: bg, border: `1.5px solid ${border}`, padding: '6px 14px', borderRadius: 8 }}>
      <span style={{ color, fontWeight: 700, fontSize: 16, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
      <span style={{ fontSize: 11.5, color, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const probe = useCallback(async () => {
    const name = username.trim();
    if (!name || isChecking) return;

    setIsChecking(true);
    setHasSearched(true);
    setProgress(0);

    const init = {};
    PLATFORMS.forEach(p => { init[p.name] = { status: 'searching', detail: '' }; });
    setResults(init);

    // Batch into groups of 4
    const batchSize = 4;
    const batches = [];
    for (let i = 0; i < PLATFORMS.length; i += batchSize) {
      batches.push(PLATFORMS.slice(i, i + batchSize));
    }

    let completed = 0;

    for (const batch of batches) {
      const payload = batch.map(p => ({
        name: p.name,
        profileUrl: p.url ? p.url(name) : null,
      }));

      try {
        const res = await fetch('/api/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, platforms: payload }),
        });

        const data = await res.json();

        if (data.results && Array.isArray(data.results)) {
          setResults(prev => {
            const next = { ...prev };
            data.results.forEach(item => {
              if (item.platform && item.status) {
                const valid = ['likely_taken', 'likely_available', 'uncertain'];
                next[item.platform] = {
                  status: valid.includes(item.status) ? item.status : 'uncertain',
                  detail: item.detail || '',
                };
              }
            });
            return next;
          });
        } else {
          batch.forEach(p => {
            setResults(prev => ({ ...prev, [p.name]: { status: 'error', detail: data.error || 'Request failed' } }));
          });
        }
      } catch {
        batch.forEach(p => {
          setResults(prev => ({ ...prev, [p.name]: { status: 'error', detail: 'Network error' } }));
        });
      }

      completed += batch.length;
      setProgress(Math.round((completed / PLATFORMS.length) * 100));
    }

    setIsChecking(false);
  }, [username, isChecking]);

  const counts = Object.values(results).reduce((a, r) => {
    if (r.status === 'likely_taken') a.taken++;
    else if (r.status === 'likely_available') a.available++;
    else if (r.status === 'uncertain') a.uncertain++;
    return a;
  }, { taken: 0, available: 0, uncertain: 0 });

  const allDone = hasSearched && !isChecking;

  return (
    <div style={{
      minHeight: '100vh', width: '100%', background: '#F9F7F3',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '36px 16px 60px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.15; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        input::placeholder { color: #C4B8A8; }
        input:focus { outline: none; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F9F7F3; }
      `}</style>

      {/* ── Logo & Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#1E1B15', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F9F7F3', fontSize: 20, fontWeight: 700,
            fontFamily: "'Cormorant Garamond', serif",
            boxShadow: '0 2px 8px rgba(30,27,21,0.2)',
          }}>U</div>
          <span style={{
            fontSize: 22, fontWeight: 700, color: '#1E1B15',
            fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.02em',
          }}>UserProbe</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 400,
          color: '#1E1B15', lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>
          Probe your name<br />
          <span style={{ fontWeight: 700, fontStyle: 'italic' }}>across the web.</span>
        </h1>
        <p style={{
          fontSize: 14, color: '#8A7A6A', lineHeight: 1.6,
          marginTop: 10, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400, maxWidth: 440, margin: '10px auto 0',
        }}>
          AI-powered username search across {PLATFORMS.length} platforms.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div style={{
        width: '100%', maxWidth: 500, background: '#FFFFFF', borderRadius: 16,
        border: '1.5px solid #E4DED4', padding: '5px 5px 5px 20px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 2px 20px rgba(30,27,21,0.04)',
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18, color: '#C4B8A8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, userSelect: 'none' }}>@</span>
        <input
          ref={inputRef} type="text" placeholder="enter username…"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
          onKeyDown={e => e.key === 'Enter' && probe()}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 16, fontFamily: "'Cormorant Garamond', serif",
            color: '#1E1B15', fontWeight: 400, padding: '13px 0',
          }}
        />
        <button onClick={probe} disabled={!username.trim() || isChecking} style={{
          padding: '12px 26px', borderRadius: 12,
          background: !username.trim() || isChecking ? '#D8D0C4' : '#1E1B15',
          color: '#F9F7F3', border: 'none',
          cursor: !username.trim() || isChecking ? 'default' : 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.03em', transition: 'all 0.25s ease',
        }}>
          {isChecking ? `${progress}%` : 'Probe'}
        </button>
      </div>

      {/* ── Progress Bar ── */}
      {isChecking && (
        <div style={{ width: '100%', maxWidth: 500, height: 3, background: '#EDE8E0', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #8B7355, #6B5B45)',
            borderRadius: 2, transition: 'width 0.5s ease',
          }} />
        </div>
      )}
      {!isChecking && hasSearched && <div style={{ height: 16 }} />}

      {/* ── Summary Pills ── */}
      {allDone && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeSlideIn 0.4s ease' }}>
          <SummaryPill count={counts.available} label="available" color="#27AE60" bg="#F0FDF4" border="#BBF7D0" />
          <SummaryPill count={counts.taken} label="taken" color="#C0392B" bg="#FDF2F2" border="#FECACA" />
          <SummaryPill count={counts.uncertain} label="uncertain" color="#B8860B" bg="#FFFBEB" border="#FDE68A" />
        </div>
      )}

      {/* ── Results ── */}
      {hasSearched && (
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLATFORMS.map((p, i) => {
            const r = results[p.name] || { status: 'idle', detail: '' };
            return <PlatformRow key={p.name} platform={p} username={username.trim()} status={r.status} detail={r.detail} idx={i} />;
          })}
        </div>
      )}

      {/* ── Empty State ── */}
      {!hasSearched && (
        <div style={{ marginTop: 48, textAlign: 'center', color: '#C4B8A8' }}>
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.35, animation: 'breathe 4s ease infinite' }}>⊙</div>
          <div style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', lineHeight: 1.8 }}>
            Type a username and hit Probe<br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>AI will scour the web for matches</span>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        marginTop: 40, maxWidth: 420, textAlign: 'center',
        fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
        color: '#B8A898', letterSpacing: '0.03em', lineHeight: 1.7,
      }}>
        Results based on AI web search — accuracy varies.<br />
        Click "Visit ↗" to verify each platform directly.
      </div>
    </div>
  );
}
