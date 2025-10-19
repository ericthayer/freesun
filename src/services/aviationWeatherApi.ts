const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/aviation-weather-proxy`;

export function validateIcaoCode(code: string): boolean {
  const icaoPattern = /^[A-Z]{4}$/;
  return icaoPattern.test(code.toUpperCase());
}

export function formatIcaoCode(code: string): string {
  return code.trim().toUpperCase();
}

async function proxyRequest(endpoint: string, params: Record<string, string>): Promise<any> {
  const url = new URL(PROXY_URL);
  url.searchParams.append('endpoint', endpoint);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export interface Station {
  stationId: string;
  name: string;
  lat: number;
  lon: number;
  distance?: number;
}

export interface MetarData {
  rawText: string;
  stationId: string;
  observationTime: string;
  temp: number | null;
  dewpoint: number | null;
  windDir: number | null;
  windSpeed: number | null;
  windGust: number | null;
  visibility: string | null;
  altimeter: number | null;
  flightCategory: string;
  lat: number;
  lon: number;
  name?: string;
}

export interface TafData {
  rawText: string;
  stationId: string;
  issueTime: string;
  validTimeFrom: string;
  validTimeTo: string;
  lat: number;
  lon: number;
}

export async function getNearbyStations(lat: number, lon: number, radiusMiles: number = 50): Promise<Station[]> {
  try {
    const bbox = `${lon - 1},${lat - 1},${lon + 1},${lat + 1}`;

    const stations = await proxyRequest('stationinfo', {
      ids: '',
      bbox: bbox,
      format: 'json'
    });

    if (!Array.isArray(stations)) {
      return [];
    }

    const stationsWithDistance = stations
      .map((station: any) => {
        const distance = calculateDistance(lat, lon, station.lat, station.lon);
        return {
          stationId: station.icaoId || station.stationId,
          name: station.site || station.name,
          lat: station.lat,
          lon: station.lon,
          distance
        };
      })
      .filter((station: Station) => station.distance !== undefined && station.distance <= radiusMiles)
      .sort((a: Station, b: Station) => (a.distance || 0) - (b.distance || 0));

    return stationsWithDistance.slice(0, 10);
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return [];
  }
}

export async function getMetar(stationIds: string[]): Promise<MetarData[]> {
  if (stationIds.length === 0) {
    return [];
  }

  const validStations = stationIds.filter(id => validateIcaoCode(id));
  if (validStations.length === 0) {
    throw new Error('No valid ICAO airport codes provided. Codes must be 4 letters (e.g., KAPA).');
  }

  try {
    const ids = validStations.map(formatIcaoCode).join(',');

    const data = await proxyRequest('metar', {
      ids: ids,
      format: 'json',
      hours: '2'
    });

    if (!Array.isArray(data)) {
      console.warn('METAR API returned non-array response:', data);
      return [];
    }

    if (data.length === 0) {
      console.warn('METAR API returned empty array for stations:', ids);
      return [];
    }

    console.log('METAR data received:', data.length, 'observations');

    return data.map((metar: any) => ({
      rawText: metar.rawOb || metar.rawText || '',
      stationId: metar.icaoId || metar.stationId || '',
      observationTime: metar.reportTime || metar.obsTime || '',
      temp: metar.temp !== undefined && metar.temp !== null ? parseFloat(metar.temp) : null,
      dewpoint: metar.dewp !== undefined && metar.dewp !== null ? parseFloat(metar.dewp) : null,
      windDir: metar.wdir !== undefined && metar.wdir !== null ? parseInt(metar.wdir) : null,
      windSpeed: metar.wspd !== undefined && metar.wspd !== null ? parseInt(metar.wspd) : null,
      windGust: metar.wgst !== undefined && metar.wgst !== null ? parseInt(metar.wgst) : null,
      visibility: metar.visib !== undefined ? String(metar.visib) : null,
      altimeter: metar.altim !== undefined && metar.altim !== null ? parseFloat(metar.altim) : null,
      flightCategory: metar.fltCat || metar.fltcat || 'UNKNOWN',
      lat: parseFloat(metar.lat) || 0,
      lon: parseFloat(metar.lon) || 0,
      name: metar.name || metar.site || ''
    }));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new Error('Request timeout. The Aviation Weather Center may be experiencing high traffic.');
      }
      throw error;
    }
    console.error('Error fetching METAR:', error);
    throw new Error('Failed to fetch METAR data. Please try again later.');
  }
}

export async function getTaf(stationIds: string[]): Promise<TafData[]> {
  if (stationIds.length === 0) {
    return [];
  }

  const validStations = stationIds.filter(id => validateIcaoCode(id));
  if (validStations.length === 0) {
    return [];
  }

  try {
    const ids = validStations.map(formatIcaoCode).join(',');

    const data = await proxyRequest('taf', {
      ids: ids,
      format: 'json',
      hours: '12'
    });

    if (!Array.isArray(data)) {
      console.warn('TAF API returned non-array response:', data);
      return [];
    }

    if (data.length === 0) {
      console.warn('TAF API returned empty array - not all airports issue TAFs');
      return [];
    }

    console.log('TAF data received:', data.length, 'forecasts');

    return data.map((taf: any) => ({
      rawText: taf.rawTAF || taf.rawText || '',
      stationId: taf.icaoId || taf.stationId || '',
      issueTime: taf.issueTime || taf.bulletinTime || '',
      validTimeFrom: taf.validTimeFrom || '',
      validTimeTo: taf.validTimeTo || '',
      lat: parseFloat(taf.lat) || 0,
      lon: parseFloat(taf.lon) || 0
    }));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.warn('TAF request timeout');
        return [];
      }
    }
    console.error('Error fetching TAF:', error);
    return [];
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function getWindDirection(degrees: number): string {
  if (degrees === null || degrees === undefined) return 'N/A';

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function parseFlightCategory(category: string): {
  label: string;
  color: 'success' | 'info' | 'warning' | 'error';
  suitability: string;
} {
  switch (category.toUpperCase()) {
    case 'VFR':
      return { label: 'VFR', color: 'success', suitability: 'Excellent for ballooning' };
    case 'MVFR':
      return { label: 'MVFR', color: 'info', suitability: 'Good for ballooning' };
    case 'IFR':
      return { label: 'IFR', color: 'warning', suitability: 'Marginal - use caution' };
    case 'LIFR':
      return { label: 'LIFR', color: 'error', suitability: 'Not suitable for ballooning' };
    default:
      return { label: 'UNKNOWN', color: 'info', suitability: 'Unknown conditions' };
  }
}
