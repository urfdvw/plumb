import { useState, useRef, useCallback, useEffect } from 'react'
import useIMU from './hooks/useIMU'
import useCamera from './hooks/useCamera'
import useSession from './hooks/useSession'
import useYawGesture from './hooks/useYawGesture'
import { buildRotation } from './lib/rotationMatrix'
import Viewfinder from './components/Viewfinder'
import TopBar from './components/TopBar'
import LensChips from './components/LensChips'
import ThumbnailStrip from './components/ThumbnailStrip'
import ShutterButton from './components/ShutterButton'
import ShareModal from './components/ShareModal'
import SettingsSheet from './components/SettingsSheet'
import PermissionScreen from './components/PermissionScreen'

const DEFAULT_SETTINGS = {
  f35mm: 28,
  autoLevel: true,
  yawEnabled: true,
  format: 'JPEG'
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showHorizon, setShowHorizon] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const cropRef = useRef(null)

  const { orientation, available: imuAvailable } = useIMU()
  const [manualPitch, setManualPitch] = useState(0)
  const [manualRoll, setManualRoll] = useState(0)
  const [selectedCameraId, setSelectedCameraId] = useState(null)
  const { videoRef, ready: cameraReady, error: cameraError, videoSize, setFocusPoint, cameraList } = useCamera(selectedCameraId)
  const { photos, addPhoto, removePhoto } = useSession()
  const { yaw, panY, swiping, onTouchStart, onTouchMove, onTouchEnd } = useYawGesture()

  // Map available cameras to lens chips (back cameras only, up to 4)
  const LENS_LABELS = ['Ultra', 'Wide', 'Main', 'Tele']
  const LENS_F35 = [13, 24, 28, 85]
  const backCameras = cameraList.filter(c =>
    !c.label.toLowerCase().includes('front') && !c.label.includes('user')
  )
  const lenses = backCameras.length > 1
    ? backCameras.slice(0, 4).map((cam, i) => ({
        label: LENS_LABELS[i] ?? `Cam${i + 1}`,
        f35mm: LENS_F35[i] ?? 28,
        deviceId: cam.deviceId
      }))
    : null  // null → LensChips uses hardcoded defaults (focal-length-only mode)

  const rawPitch = imuAvailable ? orientation.pitch : manualPitch
  const rawRoll = imuAvailable ? orientation.roll : manualRoll
  const pitch = settings.autoLevel ? rawPitch : 0
  const roll = settings.autoLevel ? rawRoll : 0
  const activeYaw = settings.yawEnabled ? yaw : 0
  const rotation = buildRotation(-pitch, roll, activeYaw)

  const handleCapture = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const crop = cropRef.current
    const offscreen = document.createElement('canvas')

    if (crop) {
      offscreen.width = Math.round(crop.width)
      offscreen.height = Math.round(crop.height)
      const ctx = offscreen.getContext('2d')
      ctx.drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
    } else {
      offscreen.width = canvas.width
      offscreen.height = canvas.height
      offscreen.getContext('2d').drawImage(canvas, 0, 0)
    }

    const mime = settings.format === 'PNG' ? 'image/png' : 'image/jpeg'
    offscreen.toBlob(blob => {
      if (blob) addPhoto(URL.createObjectURL(blob))
    }, mime, 0.92)
  }, [addPhoto, settings.format])

  // Portrait-only enforcement
  const [landscape, setLandscape] = useState(() => window.innerWidth > window.innerHeight)
  useEffect(() => {
    function check() { setLandscape(window.innerWidth > window.innerHeight) }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (landscape) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 48 }}>↻</span>
        <p style={{ fontFamily: 'system-ui', color: '#888' }}>Please use portrait mode</p>
      </div>
    )
  }

  if (cameraError) {
    return <PermissionScreen type="camera" onRetry={() => location.reload()} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <TopBar
        pitch={rawPitch}
        roll={rawRoll}
        showHorizon={showHorizon}
        onToggleHorizon={() => setShowHorizon(v => !v)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Hidden video element for camera feed */}
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

      <Viewfinder
        videoRef={videoRef}
        videoReady={cameraReady}
        rotation={rotation}
        f35mm={settings.f35mm}
        videoSize={videoSize}
        showHorizon={showHorizon}
        roll={roll}
        yaw={activeYaw}
        panY={panY}
        swiping={swiping}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onCapture={handleCapture}
        onFocusPoint={setFocusPoint}
        onCropUpdate={c => { cropRef.current = c }}
      />

      <div style={{
        background: '#111', borderTop: '1px solid #222',
        flexShrink: 0, display: 'flex', flexDirection: 'column'
      }}>
        <ShutterButton onCapture={handleCapture} />
        <LensChips
          lenses={lenses}
          currentF={settings.f35mm}
          currentDeviceId={selectedCameraId}
          onChange={({ f35mm, deviceId }) => {
            setSettings(s => ({ ...s, f35mm }))
            if (deviceId) setSelectedCameraId(deviceId)
          }}
        />
        <ThumbnailStrip photos={photos} onTap={setSelectedPhoto} />
      </div>

      <ShareModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDelete={removePhoto}
      />

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onChange={setSettings}
      />

      {/* IMU fallback sliders */}
      {!imuAvailable && settings.autoLevel && (
        <div style={{
          position: 'absolute', bottom: 160, left: 16, right: 16,
          background: 'rgba(26,26,26,0.9)', borderRadius: 12, padding: 16, zIndex: 20
        }}>
          <p style={{ color: '#888', fontSize: 12, margin: '0 0 8px', fontFamily: 'system-ui' }}>
            Motion sensors unavailable — adjust manually:
          </p>
          <Slider label="Pitch" value={manualPitch} min={-75} max={75} onChange={setManualPitch} />
          <Slider label="Roll" value={manualRoll} min={-45} max={45} onChange={setManualRoll} />
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ color: '#aaa', fontSize: 12, width: 36, fontFamily: 'system-ui' }}>{label}</span>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange?.(Number(e.target.value))}
        style={{ flex: 1 }} />
      <span style={{ color: '#aaa', fontSize: 12, width: 36, textAlign: 'right', fontFamily: 'system-ui', fontVariantNumeric: 'tabular-nums' }}>
        {value?.toFixed(0)}°
      </span>
    </div>
  )
}
