import { useState, useEffect, useRef } from 'react'

export default function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [videoSize, setVideoSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.onloadedmetadata = () => {
          if (cancelled) return
          setVideoSize({ width: video.videoWidth, height: video.videoHeight })
          video.play().then(() => setReady(true)).catch(setError)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      setReady(false)
    }
  }, [facingMode])

  function setFocusPoint(x, y, canvasW, canvasH) {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const caps = track.getCapabilities()
    if (!caps.focusMode) return
    try {
      track.applyConstraints({
        advanced: [{
          pointsOfInterest: [{ x: x / canvasW, y: y / canvasH }],
          focusMode: 'manual'
        }]
      }).catch(() => {})
    } catch {}
  }

  return { videoRef, ready, error, videoSize, setFocusPoint }
}
