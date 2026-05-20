import { useRef, useState, useEffect, useCallback } from 'react'
import useReprojection from '../hooks/useReprojection'
import useValidCrop from '../hooks/useValidCrop'
import CropOverlay from './CropOverlay'
import HorizonLine from './HorizonLine'
import YawIndicator from './YawIndicator'

export default function Viewfinder({
  videoRef, videoReady, rotation, f35mm, videoSize,
  showHorizon, roll, yaw, swiping,
  onTouchStart, onTouchMove, onTouchEnd,
  onCapture, onFocusPoint, onCropUpdate
}) {
  const canvasRef = useRef(null)
  const [crop, setCrop] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const { stateRef } = useReprojection({ canvasRef, videoRef, videoReady, rotation, f35mm })
  const { findCrop } = useValidCrop()

  // Update crop every 200ms
  useEffect(() => {
    let id
    function update() {
      const state = stateRef.current
      const canvas = canvasRef.current
      if (state && canvas && videoReady && canvas.width > 0) {
        const c = findCrop(state.gl, canvas.width, canvas.height)
        setCrop(c)
        setCanvasSize({ width: canvas.width, height: canvas.height })
        if (c) onCropUpdate?.(c)
      }
      id = setTimeout(update, 200)
    }
    update()
    return () => clearTimeout(id)
  }, [stateRef, findCrop, videoReady, onCropUpdate])

  const handleTap = useCallback((e) => {
    if (e.touches?.length > 1) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    onFocusPoint?.(clientX - rect.left, clientY - rect.top, rect.width, rect.height)
  }, [onFocusPoint])

  // Pinch-to-zoom state
  const pinchRef = useRef(null)
  function handleTouchStartInner(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = Math.sqrt(dx*dx + dy*dy)
    } else {
      onTouchStart(e)
    }
  }
  function handleTouchMoveInner(e) {
    if (e.touches.length === 2 && pinchRef.current) {
      // pinch handled by parent if needed
    } else {
      onTouchMove(e)
    }
  }
  function handleTouchEndInner(e) {
    pinchRef.current = null
    onTouchEnd(e)
  }

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }}
      onTouchStart={handleTouchStartInner}
      onTouchMove={handleTouchMoveInner}
      onTouchEnd={handleTouchEndInner}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <CropOverlay crop={crop} canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />
      {showHorizon && <HorizonLine roll={roll} />}
      <YawIndicator yaw={yaw} visible={swiping || Math.abs(yaw) > 0.5} />
    </div>
  )
}
