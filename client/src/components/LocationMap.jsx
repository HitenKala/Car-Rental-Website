import React from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { buildGoogleMapsUrl, DEFAULT_MAP_CENTER, sanitizeCoordinates } from '../utils/locationMap'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const LocationMap = ({
  coordinates,
  title = 'Pickup location',
  subtitle = '',
  height = 320,
  zoom = 13,
}) => {
  const markerPosition = sanitizeCoordinates(coordinates)

  if (!markerPosition) return null

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200'>
      <MapContainer
        center={markerPosition || DEFAULT_MAP_CENTER}
        zoom={zoom}
        scrollWheelZoom={false}
        className='w-full'
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={markerPosition}>
          <Popup>
            <div className='space-y-1'>
              <p className='font-semibold text-slate-900'>{title}</p>
              {subtitle ? <p className='text-sm text-slate-600'>{subtitle}</p> : null}
              <a
                href={buildGoogleMapsUrl({ label: `${title} ${subtitle}`.trim(), coordinates: markerPosition })}
                target='_blank'
                rel='noreferrer'
                className='text-sm font-medium text-blue-600'
              >
                Open in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default LocationMap
