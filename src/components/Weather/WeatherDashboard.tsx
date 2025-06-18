import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';

interface WeatherData {
  location: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  humidity: number;
  pressure: number;
  conditions: string;
  flightSuitability: 'excellent' | 'good' | 'marginal' | 'poor';
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const WeatherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [weatherData] = useState<WeatherData[]>([
    {
      location: 'Boulder, CO',
      temperature: 72,
      windSpeed: 6,
      windDirection: 'SW',
      visibility: 10,
      humidity: 45,
      pressure: 30.15,
      conditions: 'Clear',
      flightSuitability: 'excellent'
    },
    {
      location: 'Denver, CO',
      temperature: 75,
      windSpeed: 12,
      windDirection: 'W',
      visibility: 8,
      humidity: 52,
      pressure: 30.12,
      conditions: 'Partly Cloudy',
      flightSuitability: 'good'
    },
    {
      location: 'Fort Collins, CO',
      temperature: 69,
      windSpeed: 18,
      windDirection: 'NW',
      visibility: 6,
      humidity: 38,
      pressure: 30.18,
      conditions: 'Windy',
      flightSuitability: 'marginal'
    }
  ]);

  const [alerts] = useState<WeatherAlert[]>([
    {
      id: '1',
      type: 'advisory',
      title: 'High Wind Advisory',
      description: 'Winds 15-25 mph with gusts up to 35 mph expected this afternoon.',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '2',
      type: 'watch',
      title: 'Thunderstorm Watch',
      description: 'Conditions favorable for thunderstorm development after 3 PM.',
      severity: 'high',
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

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
      case 'good': return 'check_circle';
      case 'marginal': return 'warning';
      case 'poor': return 'error';
      default: return 'cloud';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Weather Dashboard
          </Typography>
          <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
            <MaterialIcon icon="refresh" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Real-time weather conditions and flight suitability for Colorado regions
        </Typography>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {/* Weather Alerts */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Active Weather Alerts
        </Typography>
        {alerts.length > 0 ? (
          <List>
            {alerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemIcon>
                    <MaterialIcon icon="warning" color={getAlertColor(alert.severity)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          color={getAlertColor(alert.severity) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.timestamp.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="success">
            No active weather alerts for your area.
          </Alert>
        )}
      </Paper>

      {/* Weather Stations */}
      <Grid container spacing={3}>
        {weatherData.map((station) => (
          <Grid item xs={12} md={6} lg={4} key={station.location}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaterialIcon icon="location_on" color="primary" />
                      {station.location}
                    </Typography>
                    <Chip
                      icon={<MaterialIcon icon={getSuitabilityIcon(station.flightSuitability)} />}
                      label={`Flight: ${station.flightSuitability.toUpperCase()}`}
                      color={getSuitabilityColor(station.flightSuitability) as any}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {station.temperature}°F
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {station.conditions}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MaterialIcon icon="air" color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {station.windSpeed} mph {station.windDirection}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MaterialIcon icon="visibility" color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {station.visibility} mi
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MaterialIcon icon="thermostat" color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {station.humidity}% humidity
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MaterialIcon icon="speed" color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {station.pressure}" Hg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WeatherDashboard;