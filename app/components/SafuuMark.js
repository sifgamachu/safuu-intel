// ─────────────────────────────────────────────────────────────────────────
//  SAFUU Mark — the logo
//
//  The mark: a dark navy disc bisected by a vertical gold bar that rises
//  above and descends below the circle. The bar reads as a column (civic
//  pillar / institutional weight) and as the unredaction line of the
//  brand's "redacted truth, revealed" thesis.
//
//  Constructed on a 200x200 viewBox:
//   • Disc: r=72, centered at (100,100) — fills the middle 72% vertically
//   • Bar: 22 wide, 200 tall (full canvas) — extends above and below disc
//   • Bar offset: x=104..126, slightly right-of-center so the disc reads
//     as bisected, not perfectly halved (more dynamic)
//
//  Usage:
//   <SafuuMark size={36} />              // navbar default
//   <SafuuMark size={48} variant="ink" /> // dark on light bg
//   <SafuuMark size={120} bar="bold" />  // hero, slightly thicker bar
// ─────────────────────────────────────────────────────────────────────────

export function SafuuMark({
  size = 36,
  variant = 'default',  // 'default' | 'ink' | 'gold-on-dark'
  className = '',
  ariaLabel = 'SAFUU',
}) {
  // Color schemes
  const palette = {
    'default':       { disc: '#0F1626', bar: '#E8B530' }, // navy disc + gold bar (canonical)
    'ink':           { disc: '#0F1626', bar: '#E8B530' }, // for light/cream backgrounds
    'gold-on-dark':  { disc: '#F5EFD9', bar: '#E8B530' }, // cream disc + gold bar (for dark hero)
    'mono-gold':     { disc: '#E8B530', bar: '#E8B530' }, // single-color (favicon/brand stamp)
    'mono-cream':    { disc: '#F5EFD9', bar: '#F5EFD9' }, // single-color cream (dark bg)
  };
  const c = palette[variant] || palette.default;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="100" cy="100" r="72" fill={c.disc} />
      <rect x="104" y="0" width="22" height="200" fill={c.bar} />
    </svg>
  );
}

// Horizontal lockup: mark + wordmark side-by-side
export function SafuuLockup({
  size = 32,           // mark size; wordmark scales proportionally
  variant = 'default',
  showTagline = false,
  className = '',
}) {
  const wordmarkColor = variant === 'gold-on-dark' || variant === 'mono-cream'
    ? 'rgba(245, 239, 217, 0.95)'
    : '#0F1626';
  const taglineColor = variant === 'gold-on-dark' || variant === 'mono-cream'
    ? 'rgba(245, 239, 217, 0.55)'
    : 'rgba(15, 22, 38, 0.55)';

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}
    >
      <SafuuMark size={size} variant={variant} />
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
