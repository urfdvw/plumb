import { useRef, useState } from 'react'

const FOCAL_PRESETS = [13, 24, 28, 50, 85]

export default function SettingsSheet({ open, onClose, settings, onChange }) {
  const startYRef = useRef(null)
  const [dragY, setDragY] = useState(0)

  function handleTouchStart(e) { startYRef.current = e.touches[0].clientY }
  function handleTouchMove(e) {
    const dy = e.touches[0].clientY - startYRef.current
    if (dy > 0) setDragY(dy)
  }
  function handleTouchEnd() {
    if (dragY > 80) onClose()
    else setDragY(0)
  }

  const set = (key, val) => onChange({ ...settings, [key]: val })

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#1a1a1a', borderRadius: '16px 16px 0 0',
        zIndex: 50, padding: '0 0 env(safe-area-inset-bottom,16px)',
        transform: open ? `translateY(${dragY}px)` : 'translateY(110%)',
        transition: dragY === 0 ? 'transform 0.35s cubic-bezier(0.32,0.72,0,1)' : 'none',
        maxHeight: '80vh', overflowY: 'auto'
      }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#444' }} />
        </div>

        <Section label="LENS">
          <Row label="35mm focal length">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number" min={10} max={500}
                value={settings.f35mm}
                onChange={e => set('f35mm', Number(e.target.value))}
                style={inputStyle}
              />
              <span style={{ color: '#666', fontSize: 13 }}>mm</span>
            </div>
          </Row>
          <Row label="Common">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FOCAL_PRESETS.map(f => (
                <button key={f} onClick={() => set('f35mm', f)}
                  style={{
                    padding: '4px 10px', borderRadius: 12,
                    border: `1px solid ${settings.f35mm === f ? '#4ADE80' : '#333'}`,
                    background: settings.f35mm === f ? 'rgba(74,222,128,0.1)' : 'transparent',
                    color: settings.f35mm === f ? '#4ADE80' : '#888',
                    fontSize: 12, cursor: 'pointer'
                  }}
                >{f}</button>
              ))}
            </div>
          </Row>
        </Section>

        <Section label="CORRECTION">
          <Row label="Auto-level">
            <Toggle value={settings.autoLevel} onChange={v => set('autoLevel', v)} />
          </Row>
          <Row label="Yaw fine-tune">
            <Toggle value={settings.yawEnabled} onChange={v => set('yawEnabled', v)} />
          </Row>
        </Section>

        <Section label="CAPTURE">
          <Row label="Save format">
            <div style={{ display: 'flex', gap: 8 }}>
              {['JPEG','PNG'].map(fmt => (
                <button key={fmt} onClick={() => set('format', fmt)} style={{
                  padding: '4px 12px', borderRadius: 12,
                  border: `1px solid ${settings.format === fmt ? '#4ADE80' : '#333'}`,
                  background: settings.format === fmt ? 'rgba(74,222,128,0.1)' : 'transparent',
                  color: settings.format === fmt ? '#4ADE80' : '#888',
                  fontSize: 12, cursor: 'pointer'
                }}>{fmt}</button>
              ))}
            </div>
          </Row>
        </Section>

        <Section label="ABOUT">
          <p style={{ color: '#555', fontSize: 13, margin: '4px 0' }}>Version 0.1.0-poc</p>
        </Section>
      </div>
    </>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '0 20px 8px' }}>
      <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, padding: '12px 0 8px', borderBottom: '1px solid #222' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
      <span style={{ color: '#ccc', fontSize: 14 }}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 26, borderRadius: 13,
      background: value ? '#4ADE80' : '#333',
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background 0.2s'
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s'
      }} />
    </button>
  )
}

const inputStyle = {
  width: 64, padding: '6px 8px', background: '#242424', border: '1px solid #333',
  borderRadius: 8, color: '#fff', fontSize: 14, textAlign: 'right',
  outline: 'none', fontVariantNumeric: 'tabular-nums'
}
