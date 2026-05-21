import { useState, useEffect, useRef } from 'react'

export default function useCamera(deviceId = null) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [videoSize, setVideoSize] = useState({ width: 1920, height: 1080 })
  const [cameraList, setCameraList] = useState([])

  async function enumerateCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setCameraList(devices.filter(d => d.kind === 'videoinput'))
    } catch {}
  }

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const videoConstraint = deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }

        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: false })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.onloadedmetadata = () => {
          if (cancelled) return
          setVideoSize({ width: video.videoWidth, height: video.videoHeight })
          video.play().then(() => {
            if (!cancelled) {
              setReady(true)
              enumerateCameras()
            }
          }).catch(e => { if (!cancelled) setError(e) })
        }
      } catch (err) {
        if (!cancelled) setError(err)
      }
    }

    setReady(false)
    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [deviceId])

  function setFocusPoint(x, y, canvasW, canvasH) {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      track.applyConstraints({
        advanced: [{ pointsOfInterest: [{ x: x / canvasW, y: y / canvasH }], focusMode: 'manual' }]
      }).catch(() => {})
    } catch {}
  }

  function setZoom(value) {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try { track.applyConstraints({ advanced: [{ zoom: value }] }).catch(() => {}) } catch {}
  }

  return { videoRef, ready, error, videoSize, setFocusPoint, setZoom, cameraList }
}
