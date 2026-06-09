'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { DEFAULT_CENTER } from '@/lib/map-config'
import type L from 'leaflet'

import 'leaflet/dist/leaflet.css'

type Mitra = {
  id: string
  nama: string
  alamat: string | null
  no_hp: string | null
  lat: number | null
  lng: number | null
  status: string
}

export default function MapClient() {
  const [mitra, setMitra] = useState<Mitra[]>([])
  const [leaflet, setLeaflet] = useState<typeof L | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/mitra').then((r) => r.json()),
      import('leaflet'),
    ]).then(([data, L]) => {
      if (data.success) setMitra(data.data)
      setLeaflet(L.default ?? L)
    })
  }, [])

  const marked = mitra.filter((m) => m.lat && m.lng)

  if (!leaflet) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900">
        Memuat peta...
      </div>
    )
  }

  return (
    <MapContainer
      center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
      zoom={DEFAULT_CENTER.zoom}
      className="h-[500px] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {marked.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat!, m.lng!]}
          icon={leaflet.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{m.nama}</p>
              {m.alamat && <p className="text-zinc-500">{m.alamat}</p>}
              {m.no_hp && <p className="text-zinc-500">{m.no_hp}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
