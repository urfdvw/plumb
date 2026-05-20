import { useState, useCallback } from 'react'

const MAX_PHOTOS = 20

export default function useSession() {
  const [photos, setPhotos] = useState([])

  const addPhoto = useCallback((url) => {
    setPhotos(prev => {
      if (prev.length >= MAX_PHOTOS) {
        URL.revokeObjectURL(prev[0].url)
        return [...prev.slice(1), { url, id: Date.now() }]
      }
      return [...prev, { url, id: Date.now() }]
    })
  }, [])

  const removePhoto = useCallback((id) => {
    setPhotos(prev => {
      const p = prev.find(p => p.id === id)
      if (p) URL.revokeObjectURL(p.url)
      return prev.filter(p => p.id !== id)
    })
  }, [])

  return { photos, addPhoto, removePhoto }
}
