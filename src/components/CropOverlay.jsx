import { useEffect, useState } from 'react'

const ARM = 20
const THICKNESS = 2

// xDir=1 → arm extends right (left corner), xDir=-1 → arm extends left (right corner)
// yDir=1 → arm extends down (top corner), yDir=-1 → arm extends up (bottom corner)
function Bracket({ xDir, yDir, color }) {
  const s = { position: 'absolute', borderRadius: THICKNESS }
  return (
    <>
      <div style={{
        ...s,
        left: xDir > 0 ? 0 : -ARM,
        top: -THICKNESS / 2,
        width: ARM, height: THICKNESS,
        background: color,
      }} />
      <div style={{
        ...s,
        left: -THICKNESS / 2,
        top: yDir > 0 ? 0 : -ARM,
        width: THICKNESS, height: ARM,
        background: color,
      }} />
    </>
  )
}

export default function CropOverlay({ crop, canvasWidth, canvasHeight }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [crop?.scale])

  if (!crop || !canvasWidth) return null

  const { x, y, width, height } = crop
  const lx = v => `${(v / canvasWidth * 100).toFixed(2)}%`
  const ly = v => `${(v / canvasHeight * 100).toFixed(2)}%`

  const corners = [
    { px: x, py: y, xDir: 1, yDir: 1, color: '#fff' },
    { px: x + width, py: y, xDir: -1, yDir: 1, color: '#fff' },
    { px: x, py: y + height, xDir: 1, yDir: -1, color: '#4ADE80' },
    { px: x + width, py: y + height, xDir: -1, yDir: -1, color: '#4ADE80' },
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s'
    }}>
      {corners.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: lx(c.px), top: ly(c.py) }}>
          <Bracket xDir={c.xDir} yDir={c.yDir} color={c.color} />
        </div>
      ))}
    </div>
  )
}
