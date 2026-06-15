import './UI.css';

export default function Loader({ text = 'Загрузка...', size = 'md' }) {
  return (
    <div className="loader-container">
      <div className={`loader-spinner ${size !== 'md' ? `loader-${size}` : ''}`} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}

export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text-sm" />
    </div>
  );
}
