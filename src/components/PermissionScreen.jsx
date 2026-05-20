export default function PermissionScreen({ type, onRetry }) {
  const msgs = {
    camera: {
      title: 'Camera Access Needed',
      body: 'Plumb needs camera permission to show a live viewfinder. Please allow access in your browser settings and reload.',
      icon: '📷'
    },
    imu: {
      title: 'Motion Sensor Access',
      body: 'Tap below to allow motion sensor access for automatic level correction.',
      icon: '🔄'
    },
    webgl: {
      title: 'WebGL Not Available',
      body: 'Your browser or device does not support WebGL, which is required for real-time reprojection.',
      icon: '⚠️'
    }
  }

  const m = msgs[type] || msgs.camera

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20, padding: 32, textAlign: 'center'
    }}>
      <div style={{ fontSize: 64 }}>{m.icon}</div>
      <h2 style={{ margin: 0, fontFamily: 'system-ui', fontSize: 22 }}>{m.title}</h2>
      <p style={{ margin: 0, color: '#888', lineHeight: 1.5, maxWidth: 300 }}>{m.body}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: 12, padding: '14px 28px', borderRadius: 12,
          background: '#4ADE80', color: '#000', border: 'none',
          fontSize: 16, fontWeight: 600, cursor: 'pointer'
        }}>
          {type === 'imu' ? 'Allow Motion Access' : 'Reload'}
        </button>
      )}
    </div>
  )
}
