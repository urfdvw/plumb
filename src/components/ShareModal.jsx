import { useRef, useState } from 'react'

export default function ShareModal({ photo, onClose, onDelete }) {
  const startYRef = useRef(null)
  const [dragY, setDragY] = useState(0)

  if (!photo) return null

  function handleTouchStart(e) { startYRef.current = e.touches[0].clientY }
  function handleTouchMove(e) {
    const dy = e.touches[0].clientY - startYRef.current
    if (dy > 0) setDragY(dy)
  }
  function handleTouchEnd() {
    if (dragY > 80) onClose()
    else setDragY(0)
  }

  async function handleShare() {
    try {
      const res = await fetch(photo.url)
      const blob = await res.blob()
      const file = new File([blob], `plumb-${photo.id}.jpg`, { type: blob.type })
      if (navigator.share) {
        await navigator.share({ files: [file], title: 'Plumb photo' })
      } else {
        const a = document.createElement('a')
        a.href = photo.url
        a.download = `plumb-${photo.id}.jpg`
        a.click()
      }
    } catch {}
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 100, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.25s' : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ width: 40, height: 4, borderRadius: 2, background: '#444', marginBottom: 16 }} />

      <img
        src={photo.url}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '100%', maxHeight: '70vh', borderRadius: 8,
          objectFit: 'contain', boxShadow: '0 4px 24px rgba(0,0,0,0.8)'
        }}
      />

      <div style={{ display: 'flex', gap: 16, marginTop: 24 }} onClick={e => e.stopPropagation()}>
        <button onClick={handleShare} style={btnStyle('#4ADE80', '#000')}>Share</button>
        <button onClick={() => { onDelete(photo.id); onClose() }} style={btnStyle('#ef4444', '#fff')}>Delete</button>
      </div>
    </div>
  )
}

function btnStyle(bg, color) {
  return {
    padding: '14px 28px', borderRadius: 12, border: 'none',
    background: bg, color, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', minWidth: 110
  }
}
