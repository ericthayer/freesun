# Weather Data Display - User Guide

## Overview

This application provides comprehensive aviation weather data for hot air ballooning operations, integrating directly with the Aviation Weather Center's official API. Access real-time METAR observations and TAF forecasts for airports across the United States.

## Features

### 1. Weather Dashboard (Home Screen)
**Automatic Location-Based Weather**

When you first visit the Weather section:
1. Click "Get My Location" button
2. Allow browser location access when prompted
3. The system automatically finds the nearest 5 airports
4. Current weather and forecasts display for each station
5. Ballooning suitability assessment included

**What You'll See:**
- Current temperature and conditions
- Wind speed and direction
- Visibility
- Flight category (VFR, MVFR, IFR, LIFR)
- Ballooning suitability rating
- Distance from your location

### 2. METAR/TAF Search Tab
**Manual Airport Weather Lookup**

Search for specific airports using ICAO codes:

**How to Search:**
1. Navigate to the "METAR/TAF" tab
2. Enter one or more airport codes (e.g., KAPA, KDEN, KBJC)
   - Separate multiple codes with commas
   - Codes are automatically formatted to uppercase
3. Select time period (Most Recent or Past 1-8 Hours)
4. Click "Search" or press Enter

**Understanding the Results:**

**METAR Section** (Current Observations):
- **Raw Text**: Complete official weather report
- **Decoded Information**: Human-readable translation including:
  - Station name and code
  - Observation time (local time)
  - Temperature (both Celsius and Fahrenheit)
  - Dewpoint
  - Wind direction and speed
  - Visibility
  - Altimeter setting
  - Flight category

**TAF Section** (Forecasts):
- **Raw Text**: Official terminal forecast
- **Issued Time**: When forecast was created
- **Valid Period**: Forecast start and end times
- **Forecast Changes**: Multiple time periods with predicted conditions

**Flight Category Colors:**
- **Green (VFR)**: Excellent conditions for ballooning
- **Blue (MVFR)**: Good conditions, minor restrictions
- **Orange (IFR)**: Marginal conditions, use caution
- **Red (LIFR)**: Poor conditions, not suitable

### 3. Weather Log Tab
**Track Your Flight History**

Record weather conditions for each balloon flight:

**Adding a Flight Log:**
1. Click "Add Flight Log" button
2. Enter flight information:
   - Date of flight
   - Location name
   - Airport code (optional but recommended)
   - Duration in minutes
   - Maximum altitude reached
   - Notes about conditions
3. Click "Add" to save

**Viewing Logs:**
- Filter by year using dropdown
- Sort by date, location, or duration
- Click column headers to change sort order
- Edit or delete your logs anytime
- View demo logs for examples (marked with DEMO badge)

**Demo Data:**
If not signed in, you'll see 15 sample flight logs demonstrating typical ballooning conditions across Colorado and New Mexico.

### 4. Launch Fields Tab
**Discover Balloon Launch Sites**

Explore and contribute launch field information:

**Viewing Launch Fields:**
- All fields displayed with key information
- Distance from your location (if GPS enabled)
- Elevation and coordinates
- Nearby airport code
- Available facilities
- Restrictions and contact information

**Searching:**
- Use search box to filter by name, description, or airport code
- Click "Get My Location" to sort by distance
- Demo fields marked with DEMO badge

**Adding a Launch Field:**
1. Click "Add Field" button
2. Enter complete information:
   - Field name
   - Description
   - GPS coordinates (latitude/longitude)
   - Elevation
   - Nearest airport code
   - Any restrictions
   - Available facilities (comma-separated)
   - Contact information
   - Public/Private designation
3. Click "Add" to save

**Demo Data:**
Non-authenticated users see 10 sample launch fields including popular sites like Boulder Reservoir, Chatfield State Park, and Albuquerque Balloon Fiesta Park.

## Understanding Aviation Weather

### ICAO Airport Codes
Four-letter identifiers for airports worldwide:
- **US Codes**: Start with 'K' (e.g., KDEN = Denver International)
- **Canada**: Start with 'C'
- **Mexico**: Start with 'M'

**Common Colorado Airports:**
- KAPA - Centennial (Denver area)
- KBJC - Rocky Mountain Metro (Broomfield)
- KBDU - Boulder Municipal
- KCOS - Colorado Springs
- KDEN - Denver International
- KFNL - Fort Collins
- KGXY - Greeley
- KLMO - Longmont

### METAR Terminology

**Time:**
- All times in UTC/Zulu (Z)
- Convert to local: Mountain Time = UTC - 7 (MDT) or UTC - 6 (MST)

**Wind:**
- Direction: Magnetic compass direction (360° = North)
- Speed: Knots (1 knot = 1.15 mph)
- Example: 27010KT = Wind from 270° (West) at 10 knots

**Visibility:**
- Measured in statute miles
- 10SM = 10+ miles
- P6SM = More than 6 miles

**Clouds:**
- SKC/CLR = Clear
- FEW = 1-2/8 coverage
- SCT = Scattered (3-4/8)
- BKN = Broken (5-7/8)
- OVC = Overcast (8/8)
- Number = Height in hundreds of feet (e.g., 250 = 25,000 ft)

**Temperature:**
- Celsius format
- M prefix = Minus (below zero)
- Example: 18/M02 = Temp 18°C, Dewpoint -2°C

### TAF Forecasts

**Validity Period:**
- Typically 24-30 hours
- Updated every 6 hours

**Change Indicators:**
- FM = FROM - Rapid change at specified time
- TEMPO = TEMPORARY - Brief fluctuations
- PROB = PROBABILITY - Chance of conditions
- BECMG = BECOMING - Gradual change

### Flight Categories Explained

**VFR (Visual Flight Rules)**
- Ceiling above 3,000 feet
- Visibility greater than 5 miles
- **Ballooning**: Excellent conditions
- **Best for**: All experience levels

**MVFR (Marginal VFR)**
- Ceiling 1,000-3,000 feet
- Visibility 3-5 miles
- **Ballooning**: Good conditions
- **Best for**: Experienced pilots

**IFR (Instrument Flight Rules)**
- Ceiling 500-1,000 feet
- Visibility 1-3 miles
- **Ballooning**: Marginal, use extreme caution
- **Best for**: Should not fly balloons

**LIFR (Low IFR)**
- Ceiling below 500 feet
- Visibility less than 1 mile
- **Ballooning**: Not suitable, do not fly
- **Best for**: Grounded

### Ballooning Weather Guidelines

**Ideal Conditions:**
- Light winds (0-8 knots surface, 0-15 knots aloft)
- Good visibility (5+ miles)
- Stable atmosphere
- No precipitation
- No thunderstorms within 50 miles

**Marginal Conditions:**
- Moderate winds (8-12 knots)
- Visibility 3-5 miles
- Some cloud cover
- Gusty conditions

**Unsafe Conditions:**
- Strong winds (12+ knots)
- Low visibility (< 3 miles)
- Precipitation
- Thunderstorms
- Turbulence
- Fog
- Rapidly changing conditions

## Tips for Best Results

### Location Services
1. **Enable GPS**: Allow browser location access for automatic nearby airports
2. **Manual Search**: Know your local airport codes for quick lookups
3. **Multiple Stations**: Check 3-5 nearby airports for complete picture

### Weather Interpretation
1. **Current + Forecast**: Compare METAR with TAF for planning
2. **Time Awareness**: Note observation times - fresh data is crucial
3. **Multiple Sources**: Cross-reference nearby stations
4. **Trends**: Check past hours to see if conditions improving or deteriorating

### Flight Planning
1. **Morning Flights**: Check previous evening's TAF and current METAR
2. **Wind Direction**: Note surface vs. altitude winds for landing site planning
3. **Visibility**: Ensure adequate for safe landing site identification
4. **Backup Plans**: Have alternate fields in case conditions change

### Data Freshness
- **METAR**: Updated hourly at :50-:55 past the hour (more frequent if conditions change rapidly)
- **TAF**: Issued 4 times daily (typically 00Z, 06Z, 12Z, 18Z)
- **Special Reports**: SPECI issued for significant changes

## Troubleshooting

### "No Data Available"
**Possible Causes:**
- Invalid airport code (must be 4 letters)
- Station doesn't report weather
- Temporary API outage
- Network connectivity issue

**Solutions:**
- Verify correct ICAO code
- Try nearby alternative airport
- Wait a few minutes and retry
- Check aviationweather.gov directly

### "Location Access Denied"
**Solutions:**
- Check browser location permissions
- Use manual search instead
- Enter nearest airport code directly

### Stale Data
**Check:**
- Observation time in METAR
- Issue time in TAF
- If data is > 2 hours old, refresh page
- Some stations may have reporting delays

### Missing TAF
**Note:**
- Not all airports issue TAFs
- Typically only larger airports provide forecasts
- Use METAR from multiple stations to assess trends
- Consider regional forecasts from NWS

## Safety Notice

**⚠️ IMPORTANT AVIATION SAFETY DISCLAIMER**

This application provides weather information for planning purposes only:

1. **Not for Flight Operations**: Data is supplementary only
2. **Official Sources**: Always consult official aviation weather briefings
3. **Professional Judgment**: Weather data should not replace pilot judgment
4. **Currency**: Verify data freshness before any flight decision
5. **Limitations**: Weather can change rapidly; conditions may differ from forecasts
6. **Responsibility**: Pilot in command is solely responsible for flight safety

**For Official Briefings:**
- Aviation Weather Center: https://aviationweather.gov
- 1-800-WX-BRIEF (1-800-992-7433)
- Flight Service Station
- ForeFlight, Garmin Pilot, or similar aviation apps

## Data Source

All weather data sourced from:
**Aviation Weather Center (AWC)**
- Website: https://aviationweather.gov
- Agency: NOAA/National Weather Service
- API: Public, no authentication required
- Update Frequency: Real-time

## Support

### Getting Help
- Click the help icon (?) in METAR/TAF tab for quick reference
- Review this guide for detailed instructions
- Demo data available for exploring features

### Reporting Issues
- Verify data against aviationweather.gov
- Note specific airport codes and times
- Check network connectivity
- Contact support with details

## Quick Reference

### Common Actions
- **View nearby weather**: Click "Get My Location" on Weather Dashboard
- **Search airport**: Enter code in METAR/TAF tab
- **Log flight**: Add entry in Weather Log tab
- **Find launch site**: Browse Launch Fields tab
- **Get help**: Click ? icon for quick guide

### Keyboard Shortcuts
- **Enter**: Submit search in METAR/TAF tab
- **Tab**: Navigate between form fields
- **Esc**: Close dialogs

### Best Practices
1. Check weather 12-24 hours before flight
2. Verify conditions 2-3 hours before launch
3. Monitor conditions during flight preparation
4. Have alternate landing sites planned
5. Cancel if conditions marginal or deteriorating

---

**Remember:** Safety first! When in doubt, wait for better conditions. There's always another day to fly.
