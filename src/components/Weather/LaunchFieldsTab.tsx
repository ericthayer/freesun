import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import DemoBanner from '../common/DemoBanner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentLocation, GeolocationError } from '../../services/geolocation';

interface LaunchField {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  elevation_feet: number;
  airport_code: string | null;
  restrictions: string | null;
  facilities: string[] | null;
  contact_info: string | null;
  is_public: boolean;
  created_by: string | null;
  distance?: number;
  is_demo?: boolean;
}

const LaunchFieldsTab: React.FC = () => {
  const { user } = useAuth();
  const [launchFields, setLaunchFields] = useState<LaunchField[]>([]);
  const [filteredFields, setFilteredFields] = useState<LaunchField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<LaunchField | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    elevation_feet: 0,
    airport_code: '',
    restrictions: '',
    facilities: '',
    contact_info: '',
    is_public: true
  });

  useEffect(() => {
    fetchLaunchFields();
    handleGetLocation();
  }, []);

  useEffect(() => {
    filterFields();
  }, [searchQuery, launchFields, userLocation]);

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation({ lat: position.latitude, lon: position.longitude });
    } catch (err) {
      console.log('Location access denied or unavailable');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const fetchLaunchFields = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('launch_fields')
        .select('*');

      if (user) {
        query = query.or(`created_by.eq.${user.id},is_demo.eq.true,is_public.eq.true`);
        setIsDemoMode(false);
      } else {
        query = query.eq('is_demo', true);
        setIsDemoMode(true);
      }

      const { data, error: fetchError } = await query.order('name');

      if (fetchError) throw fetchError;

      setLaunchFields(data || []);
    } catch (err: any) {
      console.error('Error fetching launch fields:', err);
      setError(err.message || 'Failed to fetch launch fields');
    } finally {
      setLoading(false);
    }
  };

  const filterFields = () => {
    let filtered = [...launchFields];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(field =>
        field.name.toLowerCase().includes(query) ||
        field.description?.toLowerCase().includes(query) ||
        field.airport_code?.toLowerCase().includes(query)
      );
    }

    if (userLocation) {
      filtered = filtered.map(field => ({
        ...field,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parseFloat(field.latitude.toString()),
          parseFloat(field.longitude.toString())
        )
      }));

      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredFields(filtered);
  };

  const handleAddField = () => {
    setEditMode(false);
    setSelectedField(null);
    setFormData({
      name: '',
      description: '',
      latitude: userLocation?.lat || 0,
      longitude: userLocation?.lon || 0,
      elevation_feet: 0,
      airport_code: '',
      restrictions: '',
      facilities: '',
      contact_info: '',
      is_public: true
    });
    setOpenDialog(true);
  };

  const handleEditField = (field: LaunchField) => {
    setEditMode(true);
    setSelectedField(field);
    setFormData({
      name: field.name,
      description: field.description || '',
      latitude: parseFloat(field.latitude.toString()),
      longitude: parseFloat(field.longitude.toString()),
      elevation_feet: field.elevation_feet,
      airport_code: field.airport_code || '',
      restrictions: field.restrictions || '',
      facilities: field.facilities?.join(', ') || '',
      contact_info: field.contact_info || '',
      is_public: field.is_public
    });
    setOpenDialog(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this launch field?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('launch_fields')
        .delete()
        .eq('id', fieldId);

      if (deleteError) throw deleteError;

      fetchLaunchFields();
    } catch (err: any) {
      console.error('Error deleting launch field:', err);
      setError(err.message || 'Failed to delete launch field');
    }
  };

  const handleSaveField = async () => {
    try {
      const facilitiesArray = formData.facilities
        ? formData.facilities.split(',').map(f => f.trim()).filter(f => f)
        : [];

      const fieldData = {
        name: formData.name,
        description: formData.description || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        elevation_feet: formData.elevation_feet,
        airport_code: formData.airport_code || null,
        restrictions: formData.restrictions || null,
        facilities: facilitiesArray.length > 0 ? facilitiesArray : null,
        contact_info: formData.contact_info || null,
        is_public: formData.is_public,
        created_by: user?.id || null,
        is_demo: false
      };

      if (editMode && selectedField) {
        if (selectedField.is_demo) {
          setError('Demo records cannot be edited. Sign up to create your own records.');
          return;
        }

        const { error: updateError } = await supabase
          .from('launch_fields')
          .update(fieldData)
          .eq('id', selectedField.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('launch_fields')
          .insert([fieldData]);

        if (insertError) throw insertError;
      }

      setOpenDialog(false);
      fetchLaunchFields();
    } catch (err: any) {
      console.error('Error saving launch field:', err);
      setError(err.message || 'Failed to save launch field');
    }
  };

  return (
    <Box>
      {isDemoMode && <DemoBanner />}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">
            Launch Fields
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MaterialIcon icon="search" fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <Tooltip title="Get my location">
              <IconButton onClick={handleGetLocation} color="primary">
                <MaterialIcon icon="my_location" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<MaterialIcon icon="add" />}
              onClick={handleAddField}
            >
              Add Field
            </Button>
          </Box>
        </Box>

        {!userLocation && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Enable location access to see distances from your current position
          </Alert>
        )}

        {loading && <LinearProgress />}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Paper>

      {filteredFields.length > 0 ? (
        <Grid container spacing={3}>
          {filteredFields.map((field) => (
            <Grid item xs={12} md={6} lg={4} key={field.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {field.name}
                        </Typography>
                        {field.is_demo && (
                          <Chip label="DEMO" size="small" color="info" variant="outlined" />
                        )}
                      </Box>
                      {field.distance !== undefined && (
                        <Chip
                          icon={<MaterialIcon icon="near_me" />}
                          label={`${field.distance.toFixed(1)} mi away`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                    {!field.is_public && (
                      <Chip label="Private" size="small" color="warning" />
                    )}
                  </Box>

                  {field.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {field.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaterialIcon icon="location_on" fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {field.latitude.toFixed(4)}°, {field.longitude.toFixed(4)}°
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaterialIcon icon="landscape" fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Elevation: {field.elevation_feet.toLocaleString()} ft
                      </Typography>
                    </Box>

                    {field.airport_code && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MaterialIcon icon="flight" fontSize="small" color="primary" />
                        <Typography variant="body2">
                          Nearest Airport: {field.airport_code}
                        </Typography>
                      </Box>
                    )}

                    {field.restrictions && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MaterialIcon icon="warning" fontSize="small" color="warning" />
                        <Typography variant="body2" color="warning.main">
                          {field.restrictions}
                        </Typography>
                      </Box>
                    )}

                    {field.facilities && field.facilities.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Facilities:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {field.facilities.map((facility, idx) => (
                            <Chip key={idx} label={facility} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEditField(field)}>
                      <MaterialIcon icon="edit" fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <MaterialIcon icon="delete" fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MaterialIcon icon="map" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Launch Fields Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Try a different search term' : 'Be the first to add a launch field'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<MaterialIcon icon="add" />}
              onClick={handleAddField}
            >
              Add Launch Field
            </Button>
          )}
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Launch Field' : 'Add Launch Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Field Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  required
                  inputProps={{ step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  required
                  inputProps={{ step: 0.0001 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Elevation (feet)"
              type="number"
              value={formData.elevation_feet}
              onChange={(e) => setFormData({ ...formData, elevation_feet: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Nearest Airport Code"
              value={formData.airport_code}
              onChange={(e) => setFormData({ ...formData, airport_code: e.target.value.toUpperCase() })}
              placeholder="KAPA"
              fullWidth
            />
            <TextField
              label="Restrictions"
              value={formData.restrictions}
              onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Facilities (comma-separated)"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              placeholder="Parking, Restrooms, Picnic Area"
              fullWidth
            />
            <TextField
              label="Contact Information"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
              }
              label="Make this field public (visible to all users)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveField} disabled={!formData.name}>
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LaunchFieldsTab;
