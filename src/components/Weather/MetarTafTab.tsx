import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  IconButton,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import { getMetar, getTaf, MetarData, TafData, parseFlightCategory } from '../../services/aviationWeatherApi';
import { formatMetarTime } from '../../utils/weatherParsers';

interface MetarTafTabProps {
  defaultStationId?: string;
}

const MetarTafTab: React.FC<MetarTafTabProps> = ({ defaultStationId = '' }) => {
  const [stationId, setStationId] = useState(defaultStationId);
  const [timeFilter, setTimeFilter] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metarData, setMetarData] = useState<MetarData[]>([]);
  const [tafData, setTafData] = useState<TafData[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const handleSearch = async () => {
    if (!stationId.trim()) {
      setError('Please enter an airport code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stations = stationId.toUpperCase().split(',').map(s => s.trim());

      const [metars, tafs] = await Promise.all([
        getMetar(stations),
        getTaf(stations)
      ]);

      if (metars.length === 0) {
        setError('No METAR data found for the specified station(s)');
      }

      setMetarData(metars);
      setTafData(tafs);
    } catch (err) {
      console.error('Error fetching METAR/TAF:', err);
      setError('Failed to fetch weather data. Please check the airport code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const decodeMetar = (metar: MetarData) => {
    const decoded: string[] = [];

    decoded.push(`Station: ${metar.stationId}${metar.name ? ` (${metar.name})` : ''}`);
    decoded.push(`Observation Time: ${new Date(metar.observationTime).toLocaleString()}`);

    if (metar.temp !== null) {
      decoded.push(`Temperature: ${metar.temp}°C (${((metar.temp * 9/5) + 32).toFixed(0)}°F)`);
    }

    if (metar.dewpoint !== null) {
      decoded.push(`Dewpoint: ${metar.dewpoint}°C (${((metar.dewpoint * 9/5) + 32).toFixed(0)}°F)`);
    }

    if (metar.windSpeed !== null) {
      const windDir = metar.windDir !== null ? `${metar.windDir}°` : 'Variable';
      decoded.push(`Wind: ${windDir} at ${metar.windSpeed} knots`);

      if (metar.windGust !== null) {
        decoded.push(`Wind Gusts: ${metar.windGust} knots`);
      }
    }

    if (metar.visibility !== null) {
      decoded.push(`Visibility: ${metar.visibility} statute miles`);
    }

    if (metar.altimeter !== null) {
      decoded.push(`Altimeter: ${metar.altimeter.toFixed(2)} inHg`);
    }

    decoded.push(`Flight Category: ${metar.flightCategory}`);

    return decoded;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              METAR & TAF Search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter one or more ICAO airport codes (e.g., KAPA, KDEN, KBJC)
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowHelp(!showHelp)}
            color={showHelp ? 'primary' : 'default'}
            size="large"
          >
            <MaterialIcon icon="help" />
          </IconButton>
        </Box>

        <Collapse in={showHelp}>
          <Alert severity="info" sx={{ mb: 3 }} icon={<MaterialIcon icon="info" />}>
            <AlertTitle>Aviation Weather Help</AlertTitle>
            <Typography variant="body2" paragraph>
              <strong>METAR</strong> (Meteorological Aerodrome Report): Current weather observations updated hourly or when significant changes occur.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>TAF</strong> (Terminal Aerodrome Forecast): Weather forecast valid for 12-24 hours, updated every 6 hours.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>ICAO Codes</strong>: 4-letter airport identifiers. US codes typically start with 'K' (e.g., KDEN for Denver).
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Flight Categories:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 1, pl: 3 }}>
              <li><strong>VFR</strong> (Green): Ceiling {'>'} 3000 ft, Visibility {'>'} 5 mi - Excellent for ballooning</li>
              <li><strong>MVFR</strong> (Blue): Ceiling 1000-3000 ft, Visibility 3-5 mi - Good for ballooning</li>
              <li><strong>IFR</strong> (Orange): Ceiling 500-1000 ft, Visibility 1-3 mi - Marginal, use caution</li>
              <li><strong>LIFR</strong> (Red): Ceiling {'<'} 500 ft, Visibility {'<'} 1 mi - Not suitable for ballooning</li>
            </Box>
            <Typography variant="body2">
              <strong>Data Source:</strong> Aviation Weather Center (https://aviationweather.gov)
            </Typography>
          </Alert>
        </Collapse>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Airport Code(s)"
              placeholder="KAPA, KDEN"
              value={stationId}
              onChange={(e) => setStationId(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                startAdornment: <MaterialIcon icon="flight" sx={{ mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timeFilter}
                label="Time Period"
                onChange={(e) => setTimeFilter(e.target.value as number)}
                disabled={loading}
              >
                <MenuItem value={1}>Most Recent</MenuItem>
                <MenuItem value={1}>Past 1 Hour</MenuItem>
                <MenuItem value={2}>Past 2 Hours</MenuItem>
                <MenuItem value={3}>Past 3 Hours</MenuItem>
                <MenuItem value={4}>Past 4 Hours</MenuItem>
                <MenuItem value={5}>Past 5 Hours</MenuItem>
                <MenuItem value={6}>Past 6 Hours</MenuItem>
                <MenuItem value={7}>Past 7 Hours</MenuItem>
                <MenuItem value={8}>Past 8 Hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !stationId.trim()}
              startIcon={<MaterialIcon icon="search" />}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {metarData.length > 0 && (
        <Box>
          {metarData.map((metar, index) => {
            const taf = tafData.find(t => t.stationId === metar.stationId);
            const flightCat = parseFlightCategory(metar.flightCategory);

            return (
              <Card key={`${metar.stationId}-${index}`} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <MaterialIcon icon="flight" color="primary" />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {metar.stationId}
                        </Typography>
                        {metar.name && (
                          <Typography variant="body2" color="text.secondary">
                            {metar.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={flightCat.label}
                      color={flightCat.color as any}
                      icon={<MaterialIcon icon="cloud" />}
                    />
                  </Box>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<MaterialIcon icon="expand_more" />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MaterialIcon icon="description" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          METAR - Current Conditions
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            fontFamily: 'Courier New, monospace',
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            m: 0,
                            color: 'text.primary'
                          }}
                        >
                          {metar.rawText}
                        </Typography>
                      </Paper>

                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                        Decoded Information:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {decodeMetar(metar).map((line, idx) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                            • {line}
                          </Typography>
                        ))}
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                        Last Updated: {formatMetarTime(metar.observationTime)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  {taf && (
                    <Accordion>
                      <AccordionSummary expandIcon={<MaterialIcon icon="expand_more" />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MaterialIcon icon="schedule" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            TAF - Terminal Aerodrome Forecast
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              fontFamily: 'Courier New, monospace',
                              fontSize: '0.875rem',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              m: 0,
                              color: 'text.primary'
                            }}
                          >
                            {taf.rawText}
                          </Typography>
                        </Paper>

                        <Typography variant="caption" color="text.secondary">
                          Issued: {new Date(taf.issueTime).toLocaleString()}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Valid: {new Date(taf.validTimeFrom).toLocaleString()} to {new Date(taf.validTimeTo).toLocaleString()}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {metarData.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MaterialIcon icon="flight_takeoff" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Weather Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter an airport code above to view METAR and TAF data
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MetarTafTab;
