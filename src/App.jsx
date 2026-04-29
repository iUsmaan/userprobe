import { useState, useRef, useEffect, useCallback } from 'react';
import { PLATFORMS, CATEGORIES, SERVER_PLATFORMS, BROWSER_PLATFORMS } from './platforms';
import { runBrowserChecks } from './browserCheck';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

const CATEGORY_COLORS = {
  'Social':       { bg: '#1a1f3a', accent: '#818cf8' },
  'Professional': { bg: '#0f2a1f', accent: '#34d399' },
  'Video':        { bg: '#2a1a1a', accent: '#f87171' },
  'Messaging':    { bg: '#1a2a1a', accent: '#4ade80' },
  'Gaming':       { bg: '#1a1a2a', accent: '#a78bfa' },
  'Dev/Creative': { bg: '#2a1a2a', accent: '#f472b6' },
};

function StatusDot({ status }) {
  if (status === 'checking') {
    return (
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #1e3a5f', borderTopColor: '#60a5fa', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
    );
  }
  if (status === 'available') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", fontWeight: 600, color: '#4ade80', letterSpacing: '0.06em' }}>AVAILABLE</span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
      </div>
    );
  }
  if (status === 'taken') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", fontWeight: 600, color: '#f87171', letterSpacing: '0.06em' }}>TAKEN</span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
      </div>
    );
  }
  return <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1e293b', flexShrink: 0 }} />;
}

function PlatformRow({ platform, username, status }) {
  const resolved = status === 'available' || status === 'taken';
  const catColor = CATEGORY_COLORS[platform.category] || CATEGORY_COLORS['Social'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 8,
      background: status === 'available' ? '#071a0f' : status === 'taken' ? '#1a0a0a' : '#0a0f1a',
      border: `1px solid ${status === 'available' ? '#14532d' : status === 'taken' ? '#450a0a' : '#0f1f3a'}`,
      transition: 'all 0.3s ease',
    }}>
      {/* Accent bar */}
      <div style={{ width: 3, height: 28, borderRadius: 2, background: platform.accent, opacity: resolved ? 1 : 0.3, flexShrink: 0 }} />

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: resolved ? '#e2e8f0' : '#475569', fontFamily: "'Space Grotesk'" }}>
          {platform.name}
        </span>
      </div>

      {/* Visit link */}
      {resolved && username && (
        <a
          href={platform.url(username)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10, color: '#60a5fa', textDecoration: 'none',
            padding: '3px 9px', borderRadius: 5,
            background: '#0c1f3a', border: '1px solid #1e3a5f',
            fontFamily: "'JetBrains Mono'", fontWeight: 500, flexShrink: 0,
            transition: 'opacity 0.2s',
          }}
        >↗</a>
      )}

      <StatusDot status={status} />
    </div>
  );
}

function CategorySection({ category, platforms, username, results }) {
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS['Social'];
  const catPlatforms = platforms.filter(p => p.category === category);
  if (catPlatforms.length === 0) return null;

  const available = catPlatforms.filter(p => results[p.id] === 'available').length;
  const taken = catPlatforms.filter(p => results[p.id] === 'taken').length;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor.accent }} />
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {category}
        </span>
        {(available > 0 || taken > 0) && (
          <span style={{ fontSize: 10, color: '#334155', fontFamily: "'JetBrains Mono'" }}>
            {available > 0 && <span style={{ color: '#4ade80' }}>{available} free</span>}
            {available > 0 && taken > 0 && <span style={{ color: '#334155' }}> · </span>}
            {taken > 0 && <span style={{ color: '#f87171' }}>{taken} taken</span>}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {catPlatforms.map(p => (
          <PlatformRow key={p.id} platform={p} username={username} status={results[p.id] || 'idle'} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const setResult = useCallback((id, status) => {
    setResults(prev => ({ ...prev, [id]: status }));
    setCheckedCount(prev => prev + 1);
  }, []);

  const probe = useCallback(async () => {
    const name = username.trim().toLowerCase();
    if (!name || isChecking) return;

    setIsChecking(true);
    setHasSearched(true);
    setCheckedCount(0);

    // Set all to checking
    const init = {};
    PLATFORMS.forEach(p => { init[p.id] = 'checking'; });
    setResults(init);

    // ── Fire server + browser checks simultaneously ──
    const serverPromise = fetch('/api/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name }),
    }).then(r => r.json()).then(data => {
      if (data.results) {
        Object.entries(data.results).forEach(([id, status]) => {
          setResult(id, status);
        });
      }
    }).catch(() => {
      SERVER_PLATFORMS.forEach(p => setResult(p.id, 'available'));
    });

    const browserPromise = runBrowserChecks(BROWSER_PLATFORMS, name).then(browserResults => {
      Object.entries(browserResults).forEach(([id, status]) => {
        setResult(id, status);
      });
    }).catch(() => {
      BROWSER_PLATFORMS.forEach(p => setResult(p.id, 'available'));
    });

    await Promise.all([serverPromise, browserPromise]);
    setIsChecking(false);
  }, [username, isChecking, setResult]);

  const totalAvailable = Object.values(results).filter(s => s === 'available').length;
  const totalTaken = Object.values(results).filter(s => s === 'taken').length;
  const progress = Math.round((checkedCount / PLATFORMS.length) * 100);
  const allDone = hasSearched && !isChecking;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#060b14',
      fontFamily: "'Space Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '44px 16px 80px',
    }}>
      <style>{`
        ${FONTS}
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        input::placeholder { color: #1e3a5f; }
        input:focus { outline: none; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a:hover { opacity: 0.7; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060b14; }
        ::-webkit-scrollbar-thumb { background: #0f1f3a; border-radius: 2px; }
      `}</style>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #0f2a4a, #1a4a8a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px #1a4a8a44',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5" stroke="#60a5fa" strokeWidth="1.5"/>
            <line x1="12" y1="12" x2="16" y2="16" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontSize: 20, fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.02em' }}>UserProbe</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 480 }}>
        <h1 style={{
          fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 300,
          color: '#e2e8f0', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12,
        }}>
          One search.<br />
          <span style={{ fontWeight: 700, color: '#60a5fa' }}>25 platforms.</span>
        </h1>
        <p style={{ fontSize: 13, color: '#334155', fontFamily: "'JetBrains Mono'", lineHeight: 1.7 }}>
          Direct checks. No AI. No guessing. Results in seconds.
        </p>
      </div>

      {/* Search */}
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#0a0f1a', borderRadius: 14,
        border: `1.5px solid ${isChecking ? '#1e3a5f' : '#0f1f3a'}`,
        padding: '4px 4px 4px 18px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: isChecking ? '0 0 30px #1a4a8a22' : 'none',
        marginBottom: 12,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        <span style={{ fontSize: 16, color: '#1e3a5f', fontFamily: "'JetBrains Mono'", fontWeight: 600, userSelect: 'none' }}>@</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="enter username…"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9._\-]/g, ''))}
          onKeyDown={e => e.key === 'Enter' && probe()}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 16, fontFamily: "'Space Grotesk'",
            color: '#e2e8f0', fontWeight: 400, padding: '12px 0',
          }}
        />
        <button
          onClick={probe}
          disabled={!username.trim() || isChecking}
          style={{
            padding: '11px 26px', borderRadius: 10,
            background: !username.trim() || isChecking
              ? '#0a0f1a'
              : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            color: !username.trim() || isChecking ? '#1e3a5f' : '#fff',
            border: `1px solid ${!username.trim() || isChecking ? '#0f1f3a' : '#2563eb'}`,
            cursor: !username.trim() || isChecking ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'",
            letterSpacing: '0.04em', transition: 'all 0.25s ease',
            boxShadow: !username.trim() || isChecking ? 'none' : '0 0 20px #2563eb33',
            whiteSpace: 'nowrap',
          }}
        >
          {isChecking ? `${progress}%` : 'PROBE'}
        </button>
      </div>

      {/* Progress bar */}
      {isChecking && (
        <div style={{ width: '100%', maxWidth: 520, height: 2, background: '#0a0f1a', borderRadius: 1, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
            borderRadius: 1, transition: 'width 0.4s ease',
            boxShadow: '0 0 8px #2563eb88',
          }} />
        </div>
      )}
      {!isChecking && hasSearched && <div style={{ height: 14 }} />}

      {/* Summary */}
      {allDone && (
        <div style={{
          display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap',
          justifyContent: 'center', animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#071a0f', border: '1px solid #14532d',
            padding: '8px 16px', borderRadius: 8,
          }}>
            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 20, fontFamily: "'JetBrains Mono'" }}>{totalAvailable}</span>
            <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 500, fontFamily: "'JetBrains Mono'" }}>available</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1a0a0a', border: '1px solid #450a0a',
            padding: '8px 16px', borderRadius: 8,
          }}>
            <span style={{ color: '#f87171', fontWeight: 700, fontSize: 20, fontFamily: "'JetBrains Mono'" }}>{totalTaken}</span>
            <span style={{ fontSize: 12, color: '#f87171', fontWeight: 500, fontFamily: "'JetBrains Mono'" }}>taken</span>
          </div>
        </div>
      )}

      {/* Results by category */}
      {hasSearched && (
        <div style={{ width: '100%', maxWidth: 520 }}>
          {CATEGORIES.map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              platforms={PLATFORMS}
              username={username.trim().toLowerCase()}
              results={results}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#0f2a4a', animation: 'glow 3s ease infinite' }}>⊙</div>
          <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono'", color: '#0f2a4a', letterSpacing: '0.08em', lineHeight: 1.8 }}>
            Type a username and hit PROBE<br />
            <span style={{ fontSize: 10, opacity: 0.7 }}>25 direct checks in parallel</span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 48, textAlign: 'center',
        fontSize: 10, fontFamily: "'JetBrains Mono'",
        color: '#0f1f3a', letterSpacing: '0.05em', lineHeight: 1.8,
      }}>
        Direct checks · No AI · No guessing<br />
        Click ↗ to visit any profile directly
      </div>
    </div>
  );
}
