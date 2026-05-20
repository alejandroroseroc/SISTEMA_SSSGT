export default function EmptyState({
  icon = '📋',
  title = 'Sin datos',
  description = '',
  actionLabel = '',
  onAction = null,
}) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--texto-suave)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--texto)', marginBottom: 8, fontFamily: 'DM Serif Display, serif' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.92rem', maxWidth: 380, margin: '0 auto 24px' }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
