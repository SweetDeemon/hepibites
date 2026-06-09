export const DEFAULT_CENTER = {
  lat: -7.5469,
  lng: 112.2384,
  zoom: 13,
}

export const GEOCODING_URL =
  'https://nominatim.openstreetmap.org/search?q=${alamat},Jombang,Jawa Timur&format=json&limit=1'

export const GEOCODING_HEADERS = {
  'User-Agent': 'HepiBites/1.0',
}
