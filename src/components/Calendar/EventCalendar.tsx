import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MaterialIcon from '../common/MaterialIcon';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'flight' | 'training' | 'maintenance' | 'meeting';
  description: string;
  location: string;
  attendees: string[];
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

const EventCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Morning Flight Training',
      date: new Date(2024, 11, 15, 6, 0),
      time: '06:00 AM',
      type: 'training',
      description: 'Basic flight training for new crew members',
      location: 'Boulder Launch Site',
      attendees: ['John Pilot', 'Sarah Chen', 'New Trainee'],
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Sunrise Scenic Flight',
      date: new Date(2024, 11, 16, 6, 30),
      time: '06:30 AM',
      type: 'flight',
      description: 'Commercial scenic flight over Rocky Mountains',
      location: 'Denver Launch Field',
      attendees: ['John Pilot', 'Mike Rodriguez'],
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Equipment Maintenance',
      date: new Date(2024, 11, 18, 14, 0),
      time: '02:00 PM',
      type: 'maintenance',
      description: 'Quarterly balloon and equipment inspection',
      location: 'Hangar',
      attendees: ['Mike Rodriguez', 'Emma Thompson'],
      status: 'confirmed'
    },
    {
      id: '4',
      title: 'Safety Meeting',
      date: new Date(2024, 11, 20, 19, 0),
      time: '07:00 PM',
      type: 'meeting',
      description: 'Monthly safety review and planning meeting',
      location: 'Club House',
      attendees: ['All Crew'],
      status: 'scheduled'
    }
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'flight': return 'flight';
      case 'training': return 'school';
      case 'maintenance': return 'build';
      case 'meeting': return 'event';
      default: return 'event';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'flight': return 'primary';
      case 'training': return 'secondary';
      case 'maintenance': return 'warning';
      case 'meeting': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'scheduled': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDaysInMonth = (date: Dayjs) => {
    const firstDay = date.startOf('month');
    const lastDay = date.endOf('month');
    const startDate = firstDay.startOf('week');
    const endDate = lastDay.endOf('week');
    
    const days = [];
    let current = startDate;
    
    while (current.isBefore(endDate) || current.isSame(endDate)) {
      days.push(current);
      current = current.add(1, 'day');
    }
    
    return days;
  };

  const getEventsForDate = (date: Dayjs) => {
    return events.filter(event => 
      dayjs(event.date).isSame(date, 'day')
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setOpenDialog(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setOpenDialog(true);
  };

  const days = getDaysInMonth(currentDate);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              Event Calendar
            </Typography>
            <Button
              variant="contained"
              startIcon={<MaterialIcon icon="add" />}
              onClick={handleAddEvent}
            >
              Add Event
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Schedule and manage flights, training sessions, and maintenance
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Calendar Grid */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              {/* Calendar Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={handlePreviousMonth}>
                  <MaterialIcon icon="chevron_left" />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                  {currentDate.format('MMMM YYYY')}
                </Typography>
                <IconButton onClick={handleNextMonth}>
                  <MaterialIcon icon="chevron_right" />
                </IconButton>
              </Box>

              {/* Calendar Days */}
              <Grid container spacing={1}>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Grid item xs key={day} sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      {day}
                    </Typography>
                  </Grid>
                ))}

                {/* Calendar Days */}
                {weeks.map((week, weekIndex) => (
                  week.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = day.isSame(currentDate, 'month');
                    const isToday = day.isSame(dayjs(), 'day');

                    return (
                      <Grid item xs key={day.format('YYYY-MM-DD')} sx={{ minHeight: 120 }}>
                        <Card
                          sx={{
                            height: 120,
                            p: 1,
                            cursor: 'pointer',
                            opacity: isCurrentMonth ? 1 : 0.5,
                            border: isToday ? 2 : 0,
                            borderColor: isToday ? 'primary.main' : 'transparent',
                            '&:hover': {
                              boxShadow: 2,
                            },
                          }}
                          onClick={() => setSelectedDate(day)}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={isToday ? 'bold' : 'normal'}
                            color={isToday ? 'primary.main' : 'text.primary'}
                            sx={{ mb: 1 }}
                          >
                            {day.format('D')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {dayEvents.slice(0, 2).map((event) => (
                              <Chip
                                key={event.id}
                                label={event.title}
                                size="small"
                                color={getEventColor(event.type) as any}
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            ))}
                            {dayEvents.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{dayEvents.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Event List */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List>
                {events
                  .filter(event => dayjs(event.date).isAfter(dayjs().subtract(1, 'day')))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 10)
                  .map((event, index) => (
                    <React.Fragment key={event.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <MaterialIcon icon={getEventIcon(event.type)} />
                              <Typography variant="subtitle2" fontWeight="bold">
                                {event.title}
                              </Typography>
                              <Chip
                                label={event.status}
                                size="small"
                                color={getStatusColor(event.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {dayjs(event.date).format('MMM D, YYYY')} at {event.time}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {event.location}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleEditEvent(event)} size="small">
                            <MaterialIcon icon="edit" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < 9 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Add/Edit Event Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Event Title"
                fullWidth
                defaultValue={editingEvent?.title || ''}
              />
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  label="Event Type"
                  defaultValue={editingEvent?.type || 'flight'}
                >
                  <MenuItem value="flight">Flight</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                label="Date"
                value={editingEvent ? dayjs(editingEvent.date) : dayjs()}
                onChange={(date) => setSelectedDate(date)}
              />
              <TextField
                label="Time"
                type="time"
                fullWidth
                defaultValue={editingEvent?.time || '09:00'}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Location"
                fullWidth
                defaultValue={editingEvent?.location || ''}
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={editingEvent?.description || ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              {editingEvent ? 'Update' : 'Create'} Event
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EventCalendar;