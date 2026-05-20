const LENS_PRESETS = [
  { label: 'Ultra', f: 13 },
  { label: 'Wide', f: 24 },
  { label: 'Main', f: 28 },
  { label: 'Tele', f: 85 },
]

export default function LensChips({ currentF, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, justifyContent: 'center',
      padding: '6px 16px', flexShrink: 0
    }}>
      {LENS_PRESETS.map(({ label, f }) => {
        const active = currentF === f
        return (
          <button
            key={label}
            onClick={() => onChange(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
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
