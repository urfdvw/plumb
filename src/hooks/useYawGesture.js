import { useState, useRef, useCallback } from 'react'

const MAX_YAW = 30
const MAX_PAN_Y = 400   // CSS pixels
const MOMENTUM_DECAY = 0.90
const PX_PER_DEG = 8
const DIR_THRESHOLD = 8 // px before axis is locked

export default function useYawGesture() {
  const [yaw, setYaw] = useState(0)
  const [panY, setPanY] = useState(0)
  const [swiping, setSwiping] = useState(false)

  const startXRef = useRef(null)
  const startYRef = useRef(null)
  const startYawRef = useRef(0)
  const startPanYRef = useRef(0)
  const panYRef = useRef(0)       // mirrors panY state for use in callbacks
  const velocityRef = useRef(0)
  const lastXRef = useRef(null)
  const dirRef = useRef(null)     // 'h' | 'v' | null
  const rafRef = useRef(null)

  const clampYaw = v => Math.max(-MAX_YAW, Math.min(MAX_YAW, v))
  const clampPanY = v => Math.max(-MAX_PAN_Y, Math.min(MAX_PAN_Y, v))

  const stopMomentum = () => cancelAnimationFrame(rafRef.current)

  const startMomentum = useCallback(() => {
    function tick() {
      velocityRef.current *= MOMENTUM_DECAY
      if (Math.abs(velocityRef.current) < 0.05) return
      setYaw(y => clampYaw(y + velocityRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [])

  const updatePanY = useCallback((v) => {
    panYRef.current = v
    setPanY(v)
  }, [])

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return
    stopMomentum()
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    lastXRef.current = e.touches[0].clientX
    startYawRef.current = yaw
    startPanYRef.current = panYRef.current
    dirRef.current = null
    velocityRef.current = 0
    setSwiping(true)
  }, [yaw])

  const onTouchMove = useCallback((e) => {
    if (startXRef.current === null || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - startXRef.current
    const dy = e.touches[0].clientY - startYRef.current

    if (!dirRef.current && (Math.abs(dx) > DIR_THRESHOLD || Math.abs(dy) > DIR_THRESHOLD)) {
      dirRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
    }

    if (dirRef.current === 'h') {
      velocityRef.current = -(e.touches[0].clientX - lastXRef.current) / PX_PER_DEG
      lastXRef.current = e.touches[0].clientX
      setYaw(clampYaw(startYawRef.current - dx / PX_PER_DEG))
    } else if (dirRef.current === 'v') {
      updatePanY(clampPanY(startPanYRef.current + dy))
    }
  }, [updatePanY])

  const onTouchEnd = useCallback(() => {
    startXRef.current = null
    setSwiping(false)
    if (dirRef.current === 'h') startMomentum()
    dirRef.current = null
  }, [startMomentum])

  return { yaw, panY, swiping, onTouchStart, onTouchMove, onTouchEnd }
}
