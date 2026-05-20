export default function Skeleton({ width = '100%', height = '1rem', rounded = false, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: '#e0e9e4',
        borderRadius: rounded ? '100px' : '6px',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height="1.2rem" width="60%" />
      <Skeleton height="0.9rem" width="90%" />
      <Skeleton height="0.9rem" width="80%" />
      <Skeleton height="0.9rem" width="70%" />
      <Skeleton height="8px" rounded />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Skeleton height="2.5rem" style={{ borderRadius: '8px 8px 0 0' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #e0e9e4' }}>
          <Skeleton height="1rem" width="5%" />
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="1rem" width="15%" />
          <Skeleton height="1rem" width="15%" />
          <Skeleton height="1rem" width="15%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 250 }) {
  return <Skeleton height={`${height}px`} style={{ borderRadius: '10px' }} />;
}
