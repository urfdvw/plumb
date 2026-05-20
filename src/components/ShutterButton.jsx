import { useState } from 'react'

export default function ShutterButton({ onCapture }) {
  const [pressed, setPressed] = useState(false)

  function handlePress() {
    setPressed(true)
    onCapture()
    setTimeout(() => setPressed(false), 150)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 88, flexShrink: 0 }}>
      <button
        onPointerDown={handlePress}
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: pressed ? '#ddd' : '#fff',
          border: '3px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          transform: pressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.1s, background 0.1s',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.15)',
          outline: 'none'
        }}
      />
    </div>
  )
}
