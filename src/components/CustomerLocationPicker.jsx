import { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { readAuthSession } from '../auth/session'
import { getDeliveryLocations, reverseGeocode, saveDeliveryLocation, searchLocations } from '../services/locationApi'
import './CustomerLocationPicker.css'

const markerIcon = L.divIcon({ className: 'customer-map-marker-wrap', html: '<span class="customer-map-marker"></span>', iconSize: [28, 36], iconAnchor: [14, 34] })
const storedLocation = () => { try { return JSON.parse(localStorage.getItem('dorkar-selected-location') || 'null') } catch { return null } }

function MapEvents({ onMove }) {
  useMapEvents({ click: event => onMove([Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6))]) })
  return null
}

function Recenter({ position }) {
  const map = useMap()
  useEffect(() => { map.setView(position, 16) }, [map, position])
  return null
}

const detailFields = [
  ['manualAddress', 'Street / area'], ['houseNumber', 'House number'], ['building', 'Building'], ['apartment', 'Apartment / unit'],
  ['floor', 'Floor'], ['landmark', 'Nearby landmark'],
]

export default function CustomerLocationPicker({ label = 'Delivery location', value, onSelect, compact = false, useStoredLocation = true, allowSave = true }) {
  const signedIn = allowSave && Boolean(readAuthSession()?.accessToken)
  const saved = storedLocation()
  const [point, setPoint] = useState(() => value?.latitude != null && value?.longitude != null ? [Number(value.latitude), Number(value.longitude)] : useStoredLocation && saved?.latitude != null ? [saved.latitude, saved.longitude] : null)
  const [address, setAddress] = useState(value?.formattedAddress || value?.address || (useStoredLocation ? saved?.formattedAddress || saved?.address : '') || '')
  const [parts, setParts] = useState(value?.addressComponents || {})
  const [details, setDetails] = useState(() => Object.fromEntries(detailFields.map(([key]) => [key, value?.[key] || (useStoredLocation ? saved?.[key] : '') || ''])))
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [savedLocations, setSavedLocations] = useState([])
  const [saveLabel, setSaveLabel] = useState('HOME')
  const position = useMemo(() => point || [20, 0], [point])

  const move = useCallback(next => { setPoint(next); setError('') }, [])
  useEffect(() => {
    if (!point) return undefined
    let active = true
    const controller = new AbortController()
    setBusy(true)
    const timer = window.setTimeout(() => reverseGeocode(point[0], point[1], 'bn,en', controller.signal)
      .then(result => {
        if (!active) return
        setAddress(result?.formattedAddress || '')
        setParts(result?.address || {})
      })
      .catch(reason => { if (active && reason.name !== 'AbortError') setError('Address lookup is unavailable. You can still confirm this map pin.') })
      .finally(() => { if (active) setBusy(false) }), 650)
    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [point])

  useEffect(() => { getDeliveryLocations().then(items => setSavedLocations(Array.isArray(items) ? items : [])).catch(() => {}) }, [])

  const useCurrentLocation = () => {
    setError('')
    if (!navigator.geolocation) { setError('This browser does not provide location access.'); return }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(result => {
      move([result.coords.latitude, result.coords.longitude])
      setBusy(false)
    }, () => { setBusy(false); setError('Could not read your location. Check permission or move the map pin.') }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 })
  }

  const search = async event => {
    event.preventDefault()
    if (!query.trim()) return
    setBusy(true); setError(''); setResults([])
    try { setResults(await searchLocations(query.trim())) }
    catch (reason) { setError(reason.message || 'Search is unavailable right now.') }
    finally { setBusy(false) }
  }

  const chooseSaved = location => {
    setAddress(location.address || '')
    setParts(location.addressComponents || {})
    setDetails(Object.fromEntries(detailFields.map(([key]) => [key, location[key] || ''])))
    if (location.latitude != null && location.longitude != null) move([Number(location.latitude), Number(location.longitude)])
    else setPoint(null)
  }

  const confirm = () => {
    if (!point) { setError('Search for a place, use your current location, or move the map pin first.'); return }
    if (!address && !details.manualAddress.trim() && !busy) { setError('No mapped address was found. Add the street or area manually before confirming.'); return }
    const selected = { latitude: point[0], longitude: point[1], address: address || details.manualAddress.trim(), formattedAddress: address, addressComponents: parts, ...details }
    localStorage.setItem('dorkar-selected-location', JSON.stringify(selected))
    window.dispatchEvent(new CustomEvent('dorkar-location-change', { detail: selected }))
    onSelect?.(selected)
  }

  const save = async () => {
    if (!point || (!address && !details.manualAddress.trim())) { setError('Choose a point and enter a mapped or manual street address before saving.'); return }
    setBusy(true); setError('')
    try {
      const item = { label: saveLabel, address: address || details.manualAddress.trim(), isDefault: savedLocations.length === 0, latitude: point[0], longitude: point[1], ...details }
      const created = await saveDeliveryLocation(item)
      setSavedLocations(current => [...current, created || item])
    } catch (reason) { setError(reason.message || 'Could not save this address.') }
    finally { setBusy(false) }
  }

  return <section className={`customer-location-picker${compact ? ' is-compact' : ''}`}>
    <header><div><span className="eyebrow">MAP LOCATION</span><h3>{label}</h3></div><button type="button" onClick={useCurrentLocation}>◎ Use current location</button></header>
    <div className="customer-location-search"><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') search(event) }} placeholder="Search an area, road, building, or landmark" aria-label="Search mapped places"/><button disabled={busy || !query.trim()} type="button" onClick={search}>Search</button></div>
    {results.length > 0 && <div className="customer-location-results" role="listbox" aria-label="Search results">{results.map((item, index) => <button type="button" key={`${item.latitude}-${item.longitude}-${index}`} onClick={() => { move([item.latitude, item.longitude]); setAddress(item.formattedAddress || ''); setParts(item.address || {}); setResults([]) }}>{item.placeName ? <b>{item.placeName}</b> : null}<span>{item.formattedAddress}</span></button>)}</div>}
    <div className="customer-location-map"><MapContainer center={position} zoom={point ? 16 : 2} scrollWheelZoom><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><MapEvents onMove={move}/>{point && <><Recenter position={point}/><Marker position={point} icon={markerIcon} draggable eventHandlers={{ dragend: event => { const p = event.target.getLatLng(); move([Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]) } }}/><CircleMarker center={point} radius={3} pathOptions={{ color: '#ef233c', fillColor: '#ef233c', fillOpacity: 1 }}/></>}</MapContainer><small>Tap the map or drag the pin to adjust the exact point.</small></div>
    <div className="customer-address-preview" aria-live="polite"><b>{busy ? 'Finding address…' : address || details.manualAddress || 'Choose a point to detect its mapped address'}</b>{point && <small>{point[0].toFixed(6)}, {point[1].toFixed(6)}</small>}{Object.entries(parts).filter(([, value]) => value).length > 0 && <small>{[['road','Road'],['neighbourhood','Neighbourhood'],['suburb','Suburb'],['ward','Ward'],['postcode','Postcode'],['city','City'],['district','District'],['division','Division'],['country','Country']].filter(([key]) => parts[key]).map(([key, name]) => `${name}: ${parts[key]}`).join(' · ')}</small>}</div>
    <div className="customer-address-details">{detailFields.map(([key, placeholder]) => <label key={key}><span>{placeholder}</span><input value={details[key]} onChange={event => setDetails(current => ({ ...current, [key]: event.target.value }))} placeholder={`Add ${placeholder.toLowerCase()} if needed`}/></label>)}</div>
    {savedLocations.length > 0 && <label className="customer-saved-select"><span>Reuse a saved address</span><select defaultValue="" onChange={event => { const item = savedLocations.find(location => String(location.id) === event.target.value); if (item) chooseSaved(item) }}><option value="">Choose saved address</option>{savedLocations.map(item => <option key={item.id} value={item.id}>{item.label} · {item.address}</option>)}</select></label>}
    {error && <p className="customer-location-error" role="alert">{error}</p>}
    <footer>{signedIn && <><label><span>Save as</span><select value={saveLabel} onChange={event => setSaveLabel(event.target.value)}><option value="HOME">Home</option><option value="WORK">Work</option><option value="OTHER">Other</option></select></label><button type="button" className="customer-location-save" onClick={save} disabled={busy || !point}>Save address</button></>}<button type="button" className="button primary" onClick={confirm} disabled={!point || busy}>Confirm {label.toLowerCase()}</button></footer>
  </section>
}
