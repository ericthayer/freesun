# Aviation Weather API Integration

## Overview

This application integrates with the Aviation Weather Center's public API to provide real-time METAR (Meteorological Aerodrome Report) and TAF (Terminal Aerodrome Forecast) data for hot air ballooning operations.

## API Documentation

**Base URL:** `https://aviationweather.gov/api/data`

**API Specification:** https://aviationweather.gov/data/schema/openapi.yaml

### Authentication

The Aviation Weather Center API is publicly accessible and does not require authentication or API keys.

### Rate Limiting

While no explicit rate limits are documented, the application implements best practices:
- Caching responses where appropriate
- Batching multiple station requests into single API calls
- Limiting the number of concurrent requests
- Using reasonable timeout values (2-12 hours for data freshness)

## Endpoints Used

### 1. Station Information
**Endpoint:** `/api/data/stationinfo`

**Purpose:** Retrieve airport/station metadata including location coordinates and names.

**Query Parameters:**
- `ids`: Comma-separated ICAO station identifiers
- `bbox`: Bounding box coordinates (lon_min,lat_min,lon_max,lat_max)
- `format`: Response format (json, xml, csv)

**Example:**
```
GET /api/data/stationinfo?bbox=-106,-40,-104,41&format=json
```

**Response Fields:**
- `icaoId` / `stationId`: ICAO airport code
- `site` / `name`: Airport/station name
- `lat`: Latitude
- `lon`: Longitude

### 2. METAR Data
**Endpoint:** `/api/data/metar`

**Purpose:** Retrieve current weather observations from airports.

**Query Parameters:**
- `ids`: Comma-separated ICAO station identifiers (required)
- `format`: Response format (json, xml, raw) - default: raw
- `taf`: Include TAF data (boolean) - default: false
- `hours`: Hours back to search (1-8) - default: 1
- `date`: Specific date/time in ISO format

**Example:**
```
GET /api/data/metar?ids=KAPA,KDEN,KBJC&format=json&hours=2
```

**Response Fields:**
- `rawOb` / `rawText`: Raw METAR string
- `icaoId` / `stationId`: Airport code
- `reportTime` / `obsTime`: Observation timestamp (ISO 8601)
- `temp`: Temperature (°C)
- `dewp`: Dewpoint (°C)
- `wdir`: Wind direction (degrees)
- `wspd`: Wind speed (knots)
- `wgst`: Wind gust speed (knots)
- `visib`: Visibility (statute miles)
- `altim`: Altimeter setting (inHg)
- `fltcat`: Flight category (VFR, MVFR, IFR, LIFR)
- `lat`, `lon`: Station coordinates
- `name` / `site`: Station name

### 3. TAF Data
**Endpoint:** `/api/data/taf`

**Purpose:** Retrieve terminal aerodrome forecasts (future weather predictions).

**Query Parameters:**
- `ids`: Comma-separated ICAO station identifiers (required)
- `format`: Response format (json, xml, raw) - default: raw
- `metar`: Include METAR data (boolean)
- `hours`: Forecast period (typically 12 or 24)
- `time`: Filter by valid time or issue time

**Example:**
```
GET /api/data/taf?ids=KAPA,KDEN&format=json&hours=12
```

**Response Fields:**
- `rawTAF` / `rawText`: Raw TAF string
- `icaoId` / `stationId`: Airport code
- `issueTime` / `bulletinTime`: When forecast was issued
- `validTimeFrom`: Forecast start time
- `validTimeTo`: Forecast end time
- `lat`, `lon`: Station coordinates

## Implementation Details

### Core API Functions

#### `getNearbyStations(lat, lon, radiusMiles)`
Finds airports within a specified radius of a geographic location.

**Parameters:**
- `lat` (number): Latitude
- `lon` (number): Longitude
- `radiusMiles` (number): Search radius in miles (default: 50)

**Returns:** Array of Station objects with distance calculations

**Usage:**
```typescript
const stations = await getNearbyStations(40.0150, -105.2705, 50);
```

#### `getMetar(stationIds)`
Fetches current METAR observations for specified airports.

**Parameters:**
- `stationIds` (string[]): Array of ICAO airport codes

**Returns:** Array of MetarData objects

**Usage:**
```typescript
const metars = await getMetar(['KAPA', 'KDEN', 'KBJC']);
```

#### `getTaf(stationIds)`
Fetches TAF forecasts for specified airports.

**Parameters:**
- `stationIds` (string[]): Array of ICAO airport codes

**Returns:** Array of TafData objects

**Usage:**
```typescript
const tafs = await getTaf(['KAPA', 'KDEN']);
```

### Helper Functions

#### `celsiusToFahrenheit(celsius)`
Converts temperature from Celsius to Fahrenheit.

#### `getWindDirection(degrees)`
Converts wind direction degrees to compass direction (N, NE, E, etc.).

#### `parseFlightCategory(category)`
Interprets flight category codes with color coding and ballooning suitability.

**Flight Categories:**
- **VFR** (Visual Flight Rules): Ceiling > 3000 ft, Visibility > 5 mi - Excellent for ballooning
- **MVFR** (Marginal VFR): Ceiling 1000-3000 ft, Visibility 3-5 mi - Good for ballooning
- **IFR** (Instrument Flight Rules): Ceiling 500-1000 ft, Visibility 1-3 mi - Marginal, use caution
- **LIFR** (Low IFR): Ceiling < 500 ft, Visibility < 1 mi - Not suitable for ballooning

## Data Parsing

### METAR Decoding

Raw METAR strings follow this format:
```
KAPA 191953Z 27008KT 10SM FEW250 18/M02 A3012 RMK AO2 SLP203 T01831022
```

Breaking down the components:
- `KAPA`: Station identifier
- `191953Z`: Day of month (19) and time (1953 UTC)
- `27008KT`: Wind from 270° at 8 knots
- `10SM`: Visibility 10 statute miles
- `FEW250`: Few clouds at 25,000 feet
- `18/M02`: Temperature 18°C, Dewpoint -2°C
- `A3012`: Altimeter 30.12 inHg

### TAF Decoding

Raw TAF strings include forecast periods:
```
TAF KAPA 192326Z 2000/2106 27010KT P6SM FEW250
     FM200400 27008KT P6SM FEW250
     FM201400 26012G18KT P6SM SCT250
```

Components:
- `TAF KAPA`: Terminal forecast for KAPA
- `192326Z`: Issued on day 19 at 2326 UTC
- `2000/2106`: Valid from day 20 00:00 to day 21 06:00 UTC
- `FM200400`: Forecast change from day 20 at 04:00 UTC
- Weather conditions follow METAR format for each period

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Caught and logged, returns empty arrays
2. **Invalid Station IDs**: API returns empty response, gracefully handled
3. **Missing Data Fields**: All numeric fields default to null if missing
4. **Malformed Responses**: Type checking ensures array responses

## Performance Optimization

### Caching Strategy
- Station information is fetched once per location query
- METAR data is considered valid for 2 hours
- TAF forecasts are valid for 12-24 hours
- Results are not cached in browser to ensure freshness

### Request Batching
- Multiple station IDs combined into single API calls
- Maximum 5-10 stations per request for optimal performance
- Reduces API load and improves response times

### Geographic Filtering
- Station queries use bounding boxes for efficient spatial queries
- Results limited to specified radius
- Sorted by distance for relevance

## Usage in Application

### Weather Dashboard
The main weather dashboard automatically:
1. Detects user's location via browser geolocation API
2. Finds nearest airports within 100 miles
3. Fetches METAR and TAF for top 5 closest stations
4. Displays current conditions and forecasts
5. Evaluates ballooning suitability based on weather

### METAR/TAF Search Tab
Users can manually:
1. Search for specific airport codes
2. Enter multiple airports (comma-separated)
3. Filter by time period (1-8 hours)
4. View both raw and decoded weather data
5. See detailed conditions for each station

## Aviation Weather Terminology

### Common Terms
- **METAR**: Current observation (updated hourly or more frequently)
- **TAF**: Forecast valid for 12-24 hours
- **ICAO Code**: 4-letter airport identifier (e.g., KAPA)
- **Zulu Time (Z)**: UTC time zone
- **Knots (KT)**: Wind speed unit (1 kt = 1.15 mph)
- **Flight Level**: Altitude in hundreds of feet
- **Statute Miles (SM)**: Visibility measurement

### Sky Conditions
- **SKC/CLR**: Clear sky
- **FEW**: 1-2 eighths cloud coverage
- **SCT**: Scattered (3-4 eighths)
- **BKN**: Broken (5-7 eighths)
- **OVC**: Overcast (8 eighths)

### Weather Phenomena
- **RA**: Rain
- **SN**: Snow
- **FG**: Fog
- **BR**: Mist
- **HZ**: Haze
- **TS**: Thunderstorm

## Best Practices

### For Developers
1. Always handle API errors gracefully
2. Display loading states during data fetch
3. Show timestamps with all weather data
4. Provide fallback for location access denial
5. Validate station IDs before API calls
6. Use TypeScript interfaces for type safety

### For Users
1. Verify data timestamp for freshness
2. Check multiple nearby stations for better coverage
3. Compare METAR (current) with TAF (forecast)
4. Consider wind, visibility, and ceiling for ballooning
5. Use VFR conditions as minimum for safe operations
6. Consult official sources for flight planning

## Resources

- **Aviation Weather Center**: https://aviationweather.gov
- **API Documentation**: https://aviationweather.gov/data/schema/openapi.yaml
- **METAR/TAF Guide**: https://www.weather.gov/media/wrh/mesowest/metar_decode_key.pdf
- **Flight Categories**: https://www.faa.gov/air_traffic/weather/asos

## Troubleshooting

### No Data Returned
- Verify airport code is valid ICAO identifier (4 letters)
- Check that station has weather reporting capability
- Some airports don't issue TAFs (typically smaller fields)
- Network connectivity issues

### Stale Data
- METAR updates typically hourly (30 minutes past)
- Special observations (SPECI) may be issued for significant changes
- TAF updated every 6 hours or as conditions change

### Missing Fields
- Not all stations report all parameters
- Some fields optional based on conditions
- Null values indicate data not available

## Support

For issues related to:
- **API Availability**: Check https://aviationweather.gov status
- **Data Accuracy**: Report to Aviation Weather Center
- **Application Bugs**: Contact development team
