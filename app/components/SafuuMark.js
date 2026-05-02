// ─────────────────────────────────────────────────────────────────────────
//  SAFUU Mark — the logo
//
//  The mark: a dark navy disc bisected by a vertical gold bar that rises
//  above and descends below the circle. The bar reads as a column (civic
//  pillar / institutional weight) and as the unredaction line of the
//  brand's "redacted truth, revealed" thesis.
//
//  Constructed on a 200x200 viewBox:
//   • Disc: r=72, centered at (100,100)
//   • Bar:  22 wide, 200 tall (full canvas) — extends above and below disc
//   • Bar offset: x=104..126, slightly right-of-center so the disc reads
//     as bisected, not perfectly halved (more dynamic)
//
//  The canonical mark is DARK disc + GOLD bar. To stay visible against
//  dark page backgrounds, render with `tile` so it sits inside a small
//  cream chip — just like the presentation on the brand board.
//
//  Usage:
//   <SafuuMark size={36} tile />              // dark mark on cream chip — for dark navs
//   <SafuuMark size={120} />                   // dark mark, bare — for light bgs
//   <SafuuMark size={48} variant="mono-gold"/> // single-color stamp
// ─────────────────────────────────────────────────────────────────────────

export function SafuuMark({
  size = 36,
  variant = 'default',  // 'default' | 'mono-gold' | 'mono-cream' | 'inverse'
  tile = false,         // wrap in a cream rounded tile (for dark backgrounds)
  className = '',
  ariaLabel = 'SAFUU',
}) {
  const palette = {
    'default':     { disc: '#0F1626', bar: '#E8B530' }, // canonical — dark disc + gold bar
    'inverse':     { disc: '#F5EFD9', bar: '#E8B530' }, // for permanent dark bg use w/o tile
    'mono-gold':   { disc: '#E8B530', bar: '#E8B530' },
    'mono-cream':  { disc: '#F5EFD9', bar: '#F5EFD9' },
  };
  const c = palette[variant] || palette.default;

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="100" cy="100" r="72" fill={c.disc} />
      <rect x="104" y="0" width="22" height="200" fill={c.bar} />
    </svg>
  );

  if (!tile) return <span className={className}>{svg}</span>;

  // Cream chip — replicates the brand-board presentation
  const pad = Math.round(size * 0.18);
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5EFD9',
        padding: pad,
        borderRadius: Math.round(size * 0.16),
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(15,22,38,0.4)',
        flexShrink: 0,
      }}
    >
      {svg}
    </span>
  );
}

// Horizontal lockup: mark + wordmark side-by-side
export function SafuuLockup({
  size = 32,
  tile = false,
  showTagline = false,
  onDark = false,
  className = '',
}) {
  const wordmarkColor = onDark ? 'rgba(245, 239, 217, 0.95)' : '#0F1626';
  const taglineColor  = onDark ? 'rgba(245, 239, 217, 0.55)' : 'rgba(15, 22, 38, 0.55)';

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}
    >
      <SafuuMark size={size} tile={tile} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: size * 0.5,
          letterSpacing: size * 0.012,
          color: wordmarkColor,
        }}>SAFUU</span>
        {showTagline && (
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: size * 0.22,
            letterSpacing: size * 0.04,
            color: taglineColor,
            marginTop: size * 0.12,
            textTransform: 'uppercase',
          }}>Civic Accountability</span>
        )}
      </div>
    </div>
  );
}
