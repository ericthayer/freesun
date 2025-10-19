import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FlightLog {
  id: string;
  flight_date: string;
  location: string;
  airport_code: string | null;
  duration_minutes: number;
  max_altitude_feet: number;
  weather_conditions: any;
  notes: string | null;
  created_at: string;
}

type OrderBy = 'flight_date' | 'location' | 'duration_minutes';
type Order = 'asc' | 'desc';

const WeatherLogTab: React.FC = () => {
  const { user } = useAuth();
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [orderBy, setOrderBy] = useState<OrderBy>('flight_date');
  const [order, setOrder] = useState<Order>('desc');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FlightLog | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    flight_date: new Date().toISOString().split('T')[0],
    location: '',
    airport_code: '',
    duration_minutes: 0,
    max_altitude_feet: 0,
    notes: ''
  });

  const availableYears = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    if (user) {
      fetchFlightLogs();
    }
  }, [user, selectedYear]);

  const fetchFlightLogs = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const yearStart = `${selectedYear}-01-01`;
      const yearEnd = `${selectedYear}-12-31`;

      const { data, error: fetchError } = await supabase
        .from('flight_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('flight_date', yearStart)
        .lte('flight_date', yearEnd)
        .order(orderBy, { ascending: order === 'asc' });

      if (fetchError) throw fetchError;

      setFlightLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching flight logs:', err);
      setError(err.message || 'Failed to fetch flight logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleAddLog = () => {
    setEditMode(false);
    setSelectedLog(null);
    setFormData({
      flight_date: new Date().toISOString().split('T')[0],
      location: '',
      airport_code: '',
      duration_minutes: 0,
      max_altitude_feet: 0,
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditLog = (log: FlightLog) => {
    setEditMode(true);
    setSelectedLog(log);
    setFormData({
      flight_date: log.flight_date,
      location: log.location,
      airport_code: log.airport_code || '',
      duration_minutes: log.duration_minutes,
      max_altitude_feet: log.max_altitude_feet,
      notes: log.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this flight log?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('flight_logs')
        .delete()
        .eq('id', logId);

      if (deleteError) throw deleteError;

      fetchFlightLogs();
    } catch (err: any) {
      console.error('Error deleting flight log:', err);
      setError(err.message || 'Failed to delete flight log');
    }
  };

  const handleSaveLog = async () => {
    if (!user) return;

    try {
      const logData = {
        user_id: user.id,
        flight_date: formData.flight_date,
        location: formData.location,
        airport_code: formData.airport_code || null,
        duration_minutes: formData.duration_minutes,
        max_altitude_feet: formData.max_altitude_feet,
        notes: formData.notes || null
      };

      if (editMode && selectedLog) {
        const { error: updateError } = await supabase
          .from('flight_logs')
          .update(logData)
          .eq('id', selectedLog.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('flight_logs')
          .insert([logData]);

        if (insertError) throw insertError;
      }

      setOpenDialog(false);
      fetchFlightLogs();
    } catch (err: any) {
      console.error('Error saving flight log:', err);
      setError(err.message || 'Failed to save flight log');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!user) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <MaterialIcon icon="login" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sign In Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please sign in to view and manage your flight logs
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">
            Flight Weather Logs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value as number)}
              >
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<MaterialIcon icon="add" />}
              onClick={handleAddLog}
            >
              Add Flight Log
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress />}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {flightLogs.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'flight_date'}
                    direction={orderBy === 'flight_date' ? order : 'asc'}
                    onClick={() => handleSort('flight_date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'location'}
                    direction={orderBy === 'location' ? order : 'asc'}
                    onClick={() => handleSort('location')}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
                <TableCell>Airport Code</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'duration_minutes'}
                    direction={orderBy === 'duration_minutes' ? order : 'asc'}
                    onClick={() => handleSort('duration_minutes')}
                  >
                    Duration
                  </TableSortLabel>
                </TableCell>
                <TableCell>Max Altitude</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flightLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.flight_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaterialIcon icon="location_on" fontSize="small" color="primary" />
                      {log.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {log.airport_code ? (
                      <Chip label={log.airport_code} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDuration(log.duration_minutes)}</TableCell>
                  <TableCell>{log.max_altitude_feet.toLocaleString()} ft</TableCell>
                  <TableCell>
                    {log.notes ? (
                      <Tooltip title={log.notes}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {log.notes}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditLog(log)}>
                        <MaterialIcon icon="edit" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteLog(log.id)}>
                        <MaterialIcon icon="delete" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MaterialIcon icon="flight" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Flight Logs for {selectedYear}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking your flights by adding your first log
          </Typography>
          <Button
            variant="contained"
            startIcon={<MaterialIcon icon="add" />}
            onClick={handleAddLog}
          >
            Add Flight Log
          </Button>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Flight Log' : 'Add Flight Log'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Flight Date"
              type="date"
              value={formData.flight_date}
              onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Airport Code (Optional)"
              value={formData.airport_code}
              onChange={(e) => setFormData({ ...formData, airport_code: e.target.value.toUpperCase() })}
              placeholder="KAPA"
              fullWidth
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Max Altitude (feet)"
              type="number"
              value={formData.max_altitude_feet}
              onChange={(e) => setFormData({ ...formData, max_altitude_feet: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLog} disabled={!formData.location}>
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeatherLogTab;
