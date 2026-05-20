export default function YawIndicator({ yaw, visible }) {
  if (!visible) return null
  const pct = ((yaw + 30) / 60) * 100

  return (
    <div style={{
      position: 'absolute', top: 12, left: '15%', right: '15%',
      height: 20, pointerEvents: 'none',
      opacity: visible ? 1 : 0, transition: 'opacity 0.2s'
    }}>
      {/* track */}
      <div style={{
        position: 'absolute', top: 9, left: 0, right: 0,
        height: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 1
      }} />
      {/* thumb */}
      <div style={{
        position: 'absolute', top: 4, left: `${pct}%`,
        width: 12, height: 12, borderRadius: '50%',
        background: '#4ADE80',
        transform: 'translateX(-50%)',
        boxShadow: '0 0 6px rgba(74,222,128,0.8)'
      }} />
      {/* center mark */}
      <div style={{
        position: 'absolute', top: 6, left: '50%',
        width: 2, height: 8, background: 'rgba(255,255,255,0.4)',
        transform: 'translateX(-50%)'
      }} />
      <span style={{
        position: 'absolute', top: -14, left: `${pct}%`, transform: 'translateX(-50%)',
        fontSize: 10, color: '#4ADE80', fontFamily: 'system-ui', fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}>
        {yaw >= 0 ? '+' : ''}{yaw.toFixed(1)}°
      </span>
    </div>
  )
}
