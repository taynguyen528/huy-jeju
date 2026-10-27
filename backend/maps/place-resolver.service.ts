import { Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service.js'

export type ResolvedPlace = {
  order: number
  name: string
  latitude: number | null
  longitude: number | null
  address: string | null
  source: 'database' | 'geoapify' | 'nominatim' | 'unresolved'
}

type PlaceRow = { name: string; latitude: number | null; longitude: number | null; address: string | null; source?: string; updated_at?: string }
type InputDay = { day: number; title: string; mainPlaces: string[] }

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

@Injectable()
export class PlaceResolverService {
  private lastNominatimRequest = 0

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async resolveDays(days: InputDay[]) {
    const memo = new Map<string, ResolvedPlace>()
    const resolvedDays = []

    for (const day of days) {
      const places: ResolvedPlace[] = []
      for (const [index, name] of day.mainPlaces.entries()) {
        const key = name.toLocaleLowerCase('en-US')
        let place = memo.get(key)
        if (!place) {
          place = await this.resolvePlace(name, index + 1)
          memo.set(key, place)
        }
        places.push({ ...place, order: index + 1 })
      }
      resolvedDays.push({ day: day.day, title: day.title, places })
    }

    return resolvedDays
  }

  private async resolvePlace(name: string, order: number): Promise<ResolvedPlace> {
    const local = this.database.connection.prepare(`
      SELECT name, latitude, longitude, address, 'database' AS source
      FROM destinations
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND (lower(name) = lower(?) OR lower(name) LIKE '%' || lower(?) || '%' OR lower(?) LIKE '%' || lower(name) || '%')
      ORDER BY CASE WHEN lower(name) = lower(?) THEN 0 ELSE 1 END, length(name)
      LIMIT 1
    `).get(name, name, name, name) as PlaceRow | undefined
    if (local) return this.toPlace(local, order, name)

    const cached = this.database.connection.prepare(`
      SELECT name, latitude, longitude, address, source, updated_at FROM geocoded_places WHERE query = ?
    `).get(name) as PlaceRow | undefined
    if (cached && cached.source !== 'unresolved') return this.toPlace(cached, order, name)
    if (cached) this.database.connection.prepare('DELETE FROM geocoded_places WHERE query = ?').run(name)

    const geoapify = await this.resolveWithGeoapify(name)
    if (geoapify) {
      this.cache(name, geoapify)
      return this.toPlace(geoapify, order, name)
    }

    try {
      const elapsed = Date.now() - this.lastNominatimRequest
      if (elapsed < 1100) await pause(1100 - elapsed)
      this.lastNominatimRequest = Date.now()

      const query = new URLSearchParams({ q: `${name}, Jeju-do, South Korea`, format: 'jsonv2', limit: '1', countrycodes: 'kr' })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
        headers: {
          'User-Agent': 'JejuItinerary/0.36 (local educational project)',
          'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`Nominatim returned ${response.status}`)
      const results = await response.json() as Array<{ lat?: string; lon?: string; display_name?: string; name?: string }>
      const result = results[0]
      const latitude = Number(result?.lat)
      const longitude = Number(result?.lon)
      const row: PlaceRow = Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { name: result.name || name, latitude, longitude, address: result.display_name || null, source: 'nominatim' }
        : { name, latitude: null, longitude: null, address: null, source: 'unresolved' }
      if (row.source !== 'unresolved') this.cache(name, row)
      return this.toPlace(row, order, name)
    } catch (error) {
      console.warn(`Unable to geocode ${name}:`, error)
      const row: PlaceRow = { name, latitude: null, longitude: null, address: null, source: 'unresolved' }
      return this.toPlace(row, order, name)
    }
  }

  private async resolveWithGeoapify(name: string): Promise<PlaceRow | null> {
    const apiKey = process.env.GEOAPIFY_API_KEY?.trim()
    if (!apiKey) return null

    try {
      const query = new URLSearchParams({
        text: `${name}, Jeju, South Korea`,
        filter: 'countrycode:kr',
        bias: 'proximity:126.55,33.38',
        lang: 'en',
        limit: '1',
        apiKey,
      })
      const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${query}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`Geoapify returned ${response.status}`)
      const payload = await response.json() as {
        features?: Array<{ properties?: { name?: string; formatted?: string; lat?: number; lon?: number } }>
      }
      const properties = payload.features?.[0]?.properties
      if (!properties || !Number.isFinite(properties.lat) || !Number.isFinite(properties.lon)) return null
      return {
        name: properties.name || name,
        latitude: properties.lat!,
        longitude: properties.lon!,
        address: properties.formatted || null,
        source: 'geoapify',
      }
    } catch (error) {
      console.warn(`Unable to geocode ${name} with Geoapify:`, error)
      return null
    }
  }

  private cache(query: string, row: PlaceRow) {
    this.database.connection.prepare(`
      INSERT INTO geocoded_places (query, name, latitude, longitude, address, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(query) DO UPDATE SET name = excluded.name, latitude = excluded.latitude,
        longitude = excluded.longitude, address = excluded.address, source = excluded.source, updated_at = excluded.updated_at
    `).run(query, row.name, row.latitude, row.longitude, row.address, row.source || 'unresolved', new Date().toISOString())
  }

  private toPlace(row: PlaceRow, order: number, fallbackName: string): ResolvedPlace {
    const source = row.source === 'database' || row.source === 'geoapify' || row.source === 'nominatim' ? row.source : 'unresolved'
    return { order, name: row.name || fallbackName, latitude: row.latitude, longitude: row.longitude, address: row.address, source }
  }
}
