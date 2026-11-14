'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  lat?: number
  lng?: number
  readOnly?: boolean
  onConfirm: (lat: number, lng: number, note: string) => void
}

export default function MapPicker({ lat, lng, readOnly, onConfirm }: Props) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [note, setNote] = useState('')
  const [pinLat, setPinLat] = useState(lat ?? 8.4542)
  const [pinLng, setPinLng] = useState(lng ?? 124.6319)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    if (mapRef.current) return

    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView([pinLat, pinLng], 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const marker = L.marker([pinLat, pinLng], { draggable: !readOnly }).addTo(map)
      mapRef.current = map
      markerRef.current = marker

      if (!readOnly) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setPinLat(pos.lat)
          setPinLng(pos.lng)
        })
        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng)
          setPinLat(e.latlng.lat)
          setPinLng(e.latlng.lng)
        })
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-0" />
      {!readOnly && (
        <div className="mt-2 space-y-2">
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add a note (e.g. 'Near SM City main entrance')"
            className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
          />
          <button onClick={() => onConfirm(pinLat, pinLng, note)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            📍 Confirm Meetup Location
          </button>
          <p className="text-xs text-gray-400 text-center">Drag the pin or tap the map to set location</p>
        </div>
      )}
    </div>
  )
}
