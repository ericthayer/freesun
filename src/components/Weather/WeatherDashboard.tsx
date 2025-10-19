import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import {
  getNearbyStations,
  getMetar,
  getTaf,
  celsiusToFahrenheit,
  getWindDirection,
  parseFlightCategory,
  MetarData,
  TafData
} from '../../services/aviationWeatherApi';
import {
  getCurrentLocation,
  getDefaultLocation,
  GeolocationError
} from '../../services/geolocation';
import {
  parseMetarConditions,
  evaluateBallooningConditions,
  formatMetarTime,
  formatTafPeriod
} from '../../utils/weatherParsers';

interface StationWeather {
  metar: MetarData;
  taf?: TafData;
  distance: number;
  conditions: ReturnType<typeof parseMetarConditions>;
  suitability: ReturnType<typeof evaluateBallooningConditions>;
}

const WeatherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [stationWeather, setStationWeather] = useState<StationWeather[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationWeather | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchWeatherData = async (lat: number, lon: number, locationLabel: string) => {
    setLoading(true);
    setError(null);

    try {
      const stations = await getNearbyStations(lat, lon, 100);

      if (stations.length === 0) {
        setError('No weather stations found nearby. Showing default Colorado stations.');
        return;
      }

      const stationIds = stations.map(s => s.stationId).slice(0, 5);
      const [metarData, tafData] = await Promise.all([
        getMetar(stationIds),
        getTaf(stationIds)
      ]);

      const weatherData: StationWeather[] = metarData.map(metar => {
        const station = stations.find(s => s.stationId === metar.stationId);
        const taf = tafData.find(t => t.stationId === metar.stationId);
        const conditions = parseMetarConditions(metar.rawText);
        const suitability = evaluateBallooningConditions(
          metar.temp,
          metar.windSpeed,
          metar.windGust,
          metar.visibility,
          metar.flightCategory
        );

        return {
          metar,
          taf,
          distance: station?.distance || 0,
          conditions,
          suitability
        };
      });

      setStationWeather(weatherData);
      setLocationName(locationLabel);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation({ lat: position.latitude, lon: position.longitude });
      await fetchWeatherData(
        position.latitude,
        position.longitude,
        'Your Location'
      );
    } catch (err) {
      const geoError = err as GeolocationError;
      setError(geoError.message);

      const defaultLoc = getDefaultLocation();
      setUserLocation({ lat: defaultLoc.latitude, lon: defaultLoc.longitude });
      await fetchWeatherData(
        defaultLoc.latitude,
        defaultLoc.longitude,
        defaultLoc.name
      );
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lon, locationName);
    }
  };

  useEffect(() => {
    handleGetLocation();

    const interval = setInterval(() => {
      if (userLocation) {
        fetchWeatherData(userLocation.lat, userLocation.lon, locationName);
      }
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'marginal': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return 'check_circle';
      case 'good': return 'thumb_up';
      case 'marginal': return 'warning';
      case 'poor': return 'cancel';
      default: return 'help';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Aviation Weather Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {locationName && `Showing weather for: ${locationName}`}
              {lastUpdate && ` • Last updated: ${formatMetarTime(lastUpdate.toISOString())}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Detect my location">
              <IconButton onClick={handleGetLocation} color="primary" disabled={loading}>
                <MaterialIcon icon="my_location" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh weather data">
              <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
                <MaterialIcon icon="refresh" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {stationWeather.length > 0 && (
        <Grid container spacing={3}>
          {stationWeather.map((station, index) => {
            const { metar, conditions, suitability, distance } = station;
            const tempF = metar.temp !== null ? celsiusToFahrenheit(metar.temp) : null;
            const flightCat = parseFlightCategory(metar.flightCategory);

            return (
              <Grid item xs={12} md={6} lg={4} key={`${metar.stationId}-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => setSelectedStation(station)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <MaterialIcon icon="flight" color="primary" fontSize="small" />
                          <Typography variant="h6" fontWeight="bold">
                            {metar.stationId}
                          </Typography>
                        </Box>
                        {metar.name && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {metar.name}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {distance.toFixed(1)} miles away
                        </Typography>
                      </Box>
                      {tempF !== null && (
                        <Typography variant="h3" color="primary.main" fontWeight="bold">
                          {Math.round(tempF)}°
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<MaterialIcon icon={getSuitabilityIcon(suitability.suitability)} />}
                        label={`Ballooning: ${suitability.suitability.toUpperCase()}`}
                        color={getSuitabilityColor(suitability.suitability) as any}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={flightCat.label}
                        color={flightCat.color as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <MaterialIcon icon={conditions.icon} color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {conditions.description}
                      </Typography>
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MaterialIcon icon="air" fontSize="small" />
                          <Typography variant="body2">
                            {metar.windSpeed !== null ? `${metar.windSpeed} kt` : 'N/A'}
                            {metar.windDir !== null && ` ${getWindDirection(metar.windDir)}`}
                          </Typography>
                        </Box>
                        {metar.windGust !== null && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <MaterialIcon icon="wind_power" fontSize="small" />
                            <Typography variant="body2">
                              Gusts {metar.windGust} kt
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MaterialIcon icon="visibility" fontSize="small" />
                          <Typography variant="body2">
                            {metar.visibility !== null ? `${metar.visibility} mi` : 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MaterialIcon icon="speed" fontSize="small" />
                          <Typography variant="body2">
                            {metar.altimeter !== null ? `${metar.altimeter.toFixed(2)}" Hg` : 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Observed: {formatMetarTime(metar.observationTime)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {stationWeather.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MaterialIcon icon="cloud_off" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Weather Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the location button to fetch weather data for your area
          </Typography>
          <Button
            variant="contained"
            startIcon={<MaterialIcon icon="my_location" />}
            onClick={handleGetLocation}
          >
            Get My Location
          </Button>
        </Paper>
      )}

      <Dialog
        open={selectedStation !== null}
        onClose={() => setSelectedStation(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedStation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MaterialIcon icon="flight" color="primary" />
                <Typography variant="h6">
                  {selectedStation.metar.stationId} - Detailed Weather
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<MaterialIcon icon="expand_more" />}>
                  <Typography variant="h6">METAR (Current Observations)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        m: 0
                      }}
                    >
                      {selectedStation.metar.rawText}
                    </Typography>
                  </Paper>
                  <Typography variant="subtitle2" gutterBottom>
                    Ballooning Suitability Assessment:
                  </Typography>
                  <Chip
                    icon={<MaterialIcon icon={getSuitabilityIcon(selectedStation.suitability.suitability)} />}
                    label={selectedStation.suitability.suitability.toUpperCase()}
                    color={getSuitabilityColor(selectedStation.suitability.suitability) as any}
                    sx={{ mb: 2 }}
                  />
                  {selectedStation.suitability.reasons.length > 0 && (
                    <Box sx={{ pl: 2 }}>
                      {selectedStation.suitability.reasons.map((reason, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                          • {reason}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>

              {selectedStation.taf && (
                <Accordion>
                  <AccordionSummary expandIcon={<MaterialIcon icon="expand_more" />}>
                    <Typography variant="h6">TAF (Terminal Aerodrome Forecast)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          m: 0
                        }}
                      >
                        {selectedStation.taf.rawText}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary">
                      Valid: {formatTafPeriod(selectedStation.taf.validTimeFrom, selectedStation.taf.validTimeTo)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedStation(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default WeatherDashboard;
