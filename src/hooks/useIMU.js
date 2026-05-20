import { useState, useEffect, useRef } from 'react'

export default function useIMU() {
  const [orientation, setOrientation] = useState({ pitch: 0, roll: 0 })
  const [available, setAvailable] = useState(true)
  const [permissionState, setPermissionState] = useState('unknown') // unknown|granted|denied

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setAvailable(false)
      setPermissionState('denied')
      return
    }

    const handler = (e) => {
      if (e.beta == null) return
      const pitch = Math.max(-75, Math.min(75, e.beta))
      const roll = e.gamma ?? 0
      setOrientation({ pitch, roll })
    }

    const start = () => {
      window.addEventListener('deviceorientation', handler)
      setAvailable(true)
      setPermissionState('granted')
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') start()
          else { setAvailable(false); setPermissionState('denied') }
        })
        .catch(() => { setAvailable(false); setPermissionState('denied') })
    } else {
      start()
    }

    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  return { orientation, available, permissionState }
}
