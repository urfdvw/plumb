export default function ThumbnailStrip({ photos, onTap }) {
  if (photos.length === 0) {
    return (
      <div style={{
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#333', fontSize: 12, fontFamily: 'system-ui'
      }}>
        No photos yet
      </div>
    )
  }

  return (
    <div style={{
      height: 68, display: 'flex', alignItems: 'center',
      overflowX: 'auto', gap: 8, padding: '6px 16px',
      scrollbarWidth: 'none', flexShrink: 0
    }}>
      {[...photos].reverse().map(photo => (
        <img
          key={photo.id}
          src={photo.url}
          onClick={() => onTap(photo)}
          style={{
            height: 56, width: 56 * 1.33,
            objectFit: 'cover', borderRadius: 6,
            flexShrink: 0, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}
        />
      ))}
    </div>
  )
}
