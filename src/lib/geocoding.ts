const GEOCODING_URL = 'https://nominatim.openstreetmap.org/search'
const GEOCODING_HEADERS = { 'User-Agent': 'HepiBites/1.0' }

export type GeocodeResult = {
  lat: number
  lng: number
  display_name: string
}

export async function geocodeAlamat(
  alamat: string,
  kota = 'Jombang',
  provinsi = 'Jawa Timur'
): Promise<GeocodeResult | null> {
  const query = encodeURIComponent(`${alamat}, ${kota}, ${provinsi}`)
  const url = `${GEOCODING_URL}?q=${query}&format=json&limit=1`

  try {
    const res = await fetch(url, { headers: GEOCODING_HEADERS })
    if (!res.ok) return null

    const data = await res.json()
    if (!data || data.length === 0) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    }
  } catch {
    return null
  }
}

export function shouldGeocode(
  alamat: string | null | undefined,
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (!alamat) return false
  if (lat && lng) return false
  return true
}
