import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const DHAKA_CENTER = [23.8103, 90.4125]

function PickLocation({ enabled, onChange }) {
  useMapEvents({
    click(event) {
      if (enabled) onChange({ latitude: Number(event.latlng.lat.toFixed(6)), longitude: Number(event.latlng.lng.toFixed(6)) })
    },
  })
  return null
}

function KeepMapCentered({ position, zoom }) {
  const map = useMap()
  useEffect(() => { map.setView(position, zoom) }, [map, position, zoom])
  return null
}

export default function RestaurantLocationMap({ latitude, longitude, onChange, editable = false, height = 300 }) {
  const hasLocation = latitude !== '' && latitude != null && longitude !== '' && longitude != null
    && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
  const position = hasLocation ? [Number(latitude), Number(longitude)] : DHAKA_CENTER

  return <div className={`restaurant-location-map ${editable ? 'is-editable' : ''}`} style={{ height }}>
    <MapContainer center={position} zoom={hasLocation ? 16 : 11} scrollWheelZoom={editable} dragging={editable} doubleClickZoom={editable} zoomControl={editable}>
      <KeepMapCentered position={position} zoom={hasLocation ? 16 : 11}/>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <PickLocation enabled={editable} onChange={onChange || (() => {})}/>
      {hasLocation && <CircleMarker center={position} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#ef233c', fillOpacity: 1 }}/>}
    </MapContainer>
    {!hasLocation && <div className="restaurant-location-map-empty">Restaurant coordinates have not been set.</div>}
    {editable && <span className="restaurant-location-map-hint">Click the map to place or move the restaurant pin.</span>}
  </div>
}

