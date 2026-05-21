const DEFAULT_LENSES = [
  { label: 'Ultra', f35mm: 13 },
  { label: 'Wide',  f35mm: 24 },
  { label: 'Main',  f35mm: 28 },
  { label: 'Tele',  f35mm: 85 },
]

export default function LensChips({ lenses, currentF, currentDeviceId, onChange }) {
  const items = lenses?.length ? lenses : DEFAULT_LENSES

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '6px 16px', flexShrink: 0 }}>
      {items.map(({ label, f35mm, deviceId }) => {
        const active = deviceId ? deviceId === currentDeviceId : f35mm === currentF
        return (
          <button
            key={label}
            onClick={() => onChange({ f35mm, deviceId })}
            style={{
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${active ? '#4ADE80' : '#333'}`,
              background: active ? 'rgba(74,222,128,0.15)' : 'transparent',
              color: active ? '#4ADE80' : '#888',
              fontSize: 13, fontFamily: 'system-ui', fontWeight: 600,
              cursor: 'pointer', minHeight: 32, transition: 'all 0.15s'
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
