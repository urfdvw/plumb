import { useState, useRef, useCallback } from 'react'

const MAX_YAW = 30
const MOMENTUM_DECAY = 0.90
const PX_PER_DEG = 8

export default function useYawGesture() {
  const [yaw, setYaw] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startXRef = useRef(null)
  const startYawRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(null)
  const rafRef = useRef(null)

  const clamp = v => Math.max(-MAX_YAW, Math.min(MAX_YAW, v))

  const stopMomentum = () => cancelAnimationFrame(rafRef.current)

  const startMomentum = useCallback(() => {
    function tick() {
      velocityRef.current *= MOMENTUM_DECAY
      if (Math.abs(velocityRef.current) < 0.05) return
      setYaw(y => clamp(y + velocityRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [])

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return
    stopMomentum()
    startXRef.current = e.touches[0].clientX
    lastXRef.current = e.touches[0].clientX
    startYawRef.current = yaw
    velocityRef.current = 0
    setSwiping(true)
  }, [yaw])

  const onTouchMove = useCallback((e) => {
    if (startXRef.current === null || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - startXRef.current
    velocityRef.current = (e.touches[0].clientX - lastXRef.current) / PX_PER_DEG
    lastXRef.current = e.touches[0].clientX
    setYaw(clamp(startYawRef.current + dx / PX_PER_DEG))
  }, [])

  const onTouchEnd = useCallback(() => {
    startXRef.current = null
    setSwiping(false)
    startMomentum()
  }, [startMomentum])

  return { yaw, swiping, onTouchStart, onTouchMove, onTouchEnd }
}
