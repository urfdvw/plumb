import { useCallback } from 'react'

// Sample a pixel from the GL canvas and check if it's black (outside reprojected area)
function isBlack(gl, x, y, w, h) {
  const px = new Uint8Array(4)
  gl.readPixels(Math.round(x), Math.round(h - y - 1), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
  return px[0] === 0 && px[1] === 0 && px[2] === 0
}

// Check if a centered rectangle [cx±hw, cy±hh] has no black corners
function rectValid(gl, cx, cy, hw, hh, w, h) {
  return !isBlack(gl, cx - hw, cy - hh, w, h) &&
         !isBlack(gl, cx + hw - 1, cy - hh, w, h) &&
         !isBlack(gl, cx - hw, cy + hh - 1, w, h) &&
         !isBlack(gl, cx + hw - 1, cy + hh - 1, w, h)
}

export default function useValidCrop() {
  const findCrop = useCallback((gl, canvasWidth, canvasHeight) => {
    if (!gl) return null
    const cx = canvasWidth / 2
    const cy = canvasHeight / 2

    // Binary search for max scale such that corner pixels are not black
    let lo = 0.0, hi = 1.0
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2
      const hw = Math.floor(cx * mid)
      const hh = Math.floor(cy * mid)
      if (hw < 2 || hh < 2) { lo = mid; continue }
      if (rectValid(gl, cx, cy, hw, hh, canvasWidth, canvasHeight)) lo = mid
      else hi = mid
    }

    const scale = lo * 0.99 // slight inset for safety
    return {
      x: cx * (1 - scale),
      y: cy * (1 - scale),
      width: canvasWidth * scale,
      height: canvasHeight * scale,
      scale
    }
  }, [])

  return { findCrop }
}
