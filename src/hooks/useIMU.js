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
      const betaRad = e.beta * Math.PI / 180
      const gammaRad = (e.gamma ?? 0) * Math.PI / 180
      // True camera elevation: arcsin(cos(β)·cos(γ))
      // The simplified (90-β) formula is wrong when γ is large — it forces |P|≥|R|
      // because tan(roll)=tan(pitch)·sin(γ), trapping roll inside pitch's range.
      const pitch = Math.asin(Math.cos(betaRad) * Math.cos(gammaRad)) * 180 / Math.PI
      const roll = Math.atan2(Math.cos(betaRad) * Math.sin(gammaRad), Math.sin(betaRad)) * 180 / Math.PI
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
