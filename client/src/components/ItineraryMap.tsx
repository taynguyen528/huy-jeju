import { useEffect, useMemo } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import type { ItineraryDay } from '../types'
import 'leaflet/dist/leaflet.css'

const colors = ['#d65f8d', '#ef7d32', '#6f55ae', '#168b83', '#2672bd', '#b26d16']

function FitItinerary({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 1) map.setView(positions[0], 12)
    if (positions.length > 1) map.fitBounds(latLngBounds(positions), { padding: [36, 36], maxZoom: 12 })
  }, [map, positions])
  return null
}

export function ItineraryMap({ days }: { days: ItineraryDay[] }) {
  const displayDays = useMemo(() => days.map((day, dayIndex) => ({
    ...day,
    color: colors[dayIndex % colors.length],
    mappedPlaces: day.places.filter((place) => place.latitude !== null && place.longitude !== null),
  })), [days])
  const mappedDays = useMemo(() => displayDays.filter((day) => day.mappedPlaces.length), [displayDays])
  const positions = useMemo(() => mappedDays.flatMap((day) => day.mappedPlaces.map((place) => [place.latitude!, place.longitude!] as [number, number])), [mappedDays])
  const unresolvedCount = days.reduce((count, day) => count + day.places.filter((place) => place.latitude === null || place.longitude === null).length, 0)

  if (!positions.length) return <p className="itinerary-map-empty">Map coordinates are not available for these places yet.</p>

  return <section className="itinerary-map-shell" aria-label="Itinerary map">
    <header>
      <strong>Trip map</strong>
      <span>Straight lines show the visit order, not driving directions.</span>
    </header>
    <div className="itinerary-map-legend">
      {displayDays.map((day) => <span key={day.day} className={day.mappedPlaces.length ? '' : 'is-unmapped'} title={day.mappedPlaces.length ? `${day.mappedPlaces.length} mapped places` : 'No coordinates found'}><i style={{ background: day.mappedPlaces.length ? day.color : '#aaa' }} />Day {day.day}{!day.mappedPlaces.length ? ' · unavailable' : ''}</span>)}
    </div>
    {unresolvedCount > 0 && <p className="itinerary-map-warning">{unresolvedCount} {unresolvedCount === 1 ? 'place is' : 'places are'} listed in the itinerary but could not be positioned on the map.</p>}
    <MapContainer className="itinerary-map" center={[33.38, 126.55]} zoom={9} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitItinerary positions={positions} />
      {mappedDays.map((day) => {
        const line = day.mappedPlaces.map((place) => [place.latitude!, place.longitude!] as [number, number])
        return <div key={day.day}>
          {line.length > 1 && <Polyline positions={line} pathOptions={{ color: day.color, weight: 4, opacity: .82, dashArray: '8 7' }} />}
          {day.mappedPlaces.map((place) => <Marker
            key={`${day.day}-${place.order}-${place.name}`}
            position={[place.latitude!, place.longitude!]}
            icon={divIcon({ className: 'itinerary-marker-wrap', html: `<span style="--marker-color:${day.color}"><b>D${day.day}.${place.order}</b></span>`, iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -38] })}
          >
            <Popup><strong>{place.name}</strong><br />Day {day.day}, stop {place.order}{place.address ? <><br /><small>{place.address}</small></> : null}</Popup>
          </Marker>)}
        </div>
      })}
    </MapContainer>
  </section>
}
