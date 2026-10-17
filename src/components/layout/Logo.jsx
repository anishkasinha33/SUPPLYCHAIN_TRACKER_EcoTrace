import { Link } from 'react-router-dom';

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="var(--accent)" />
      <path d="M5 22 C10 22 10 10 16 10 S22 22 27 22" fill="none" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="5" cy="22" r="2.6" fill="var(--signal)" />
      <circle cx="27" cy="22" r="2.6" fill="var(--on-accent)" />
    </svg>
  );
}

export function Logo({ to = '/', inverse = false }) {
  return (
    <Link to={to} className={`logo ${inverse ? 'logo--inverse' : ''}`} aria-label="EcoTrace home">
      <LogoMark />
      <span className="logo__word">EcoTrace</span>
    </Link>
  );
}
