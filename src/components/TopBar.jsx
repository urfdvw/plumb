export default function TopBar({ pitch, roll, showHorizon, onToggleHorizon, onOpenSettings }) {
  const near = Math.abs(pitch) < 5 && Math.abs(roll) < 5
  const color = near ? '#4ADE80' : '#aaa'

  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', background: '#111', borderBottom: '1px solid #222',
      flexShrink: 0, zIndex: 10
    }}>
      <span style={{
        fontFamily: 'system-ui', fontSize: 12, fontVariantNumeric: 'tabular-nums',
        color, transition: 'color 0.3s', minWidth: 90
      }}>
        P {pitch >= 0 ? '+' : ''}{pitch.toFixed(1)}° R {roll >= 0 ? '+' : ''}{roll.toFixed(1)}°
      </span>

      <span style={{ fontFamily: 'system-ui', fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: 1 }}>
        Plumb
      </span>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onToggleHorizon}
          title="Toggle horizon line"
          style={{
            background: 'none', border: 'none', color: showHorizon ? '#4ADE80' : '#555',
            fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1
          }}
        >━</button>
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            background: 'none', border: 'none', color: '#aaa',
            fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1
          }}
        >⚙</button>
      </div>
    </div>
  )
}
