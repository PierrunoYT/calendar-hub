import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Event } from '../types/Event';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'created_at'>) => void;
  onDelete?: (event: Event) => void;
  selectedDate?: Date;
  event?: Event;
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  event
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const [color, setColor] = useState('#1976d2');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      // Split datetime into date and time
      const [eventStartDate, eventStartTime] = event.start_date.split('T');
      const [eventEndDate, eventEndTime] = event.end_date.split('T');
      setStartDate(eventStartDate);
      setEndDate(eventEndDate);
      setStartTime(eventStartTime?.slice(0, 5) || '09:00');
      setEndTime(eventEndTime?.slice(0, 5) || '17:00');
      setColor(event.color || '#1976d2');
    } else if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
      setStartTime('09:00');
      setEndTime('17:00');
    }
  }, [event, selectedDate]);

  const validateDates = () => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    return start < end;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) {
      alert('End time must be after start time');
      return;
    }
    onSave({
      title,
      description,
      start_date: `${startDate}T${startTime}:00`,
      end_date: `${endDate}T${endTime}:00`,
      color
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '500px'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                sx={{ flex: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                sx={{ flex: 1, minWidth: '150px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                sx={{ flex: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                sx={{ flex: 1, minWidth: '150px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {event && onDelete && (
            <Button onClick={() => { onClose(); onDelete(event); }} color="error">
              Delete
            </Button>
          )}
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const CalendarCell = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  cursor: 'pointer',
  overflow: 'hidden',
  borderRadius: '0',
  boxShadow: 'none',
  borderRight: '1px solid #e0e0e0',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const CalendarCellContent = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: '4px',
  display: 'flex',
  flexDirection: 'column',
});

const Calendar: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [startOfPeriod, setStartOfPeriod] = useState(() => {
    const today = new Date();
    // Set to first day of current month
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch events for both weeks
      const startDate = new Date(startOfPeriod);
      const endDate = new Date(startOfPeriod);
      endDate.setDate(endDate.getDate() + 13); // 2 weeks - 1 day

      const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
      
      const responses = await Promise.all([
        fetch(`http://localhost:3001/api/events/${startDate.getFullYear()}/${startMonth}`),
        ...(startMonth !== endMonth ? 
          [fetch(`http://localhost:3001/api/events/${endDate.getFullYear()}/${endMonth}`)] : 
          []
        )
      ]);

      const allData = await Promise.all(responses.map(r => r.json()));
      setEvents(allData.flat());
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startOfPeriod]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePreviousPeriod = () => {
    const newStart = new Date(startOfPeriod);
    newStart.setMonth(newStart.getMonth() - 1);
    setStartOfPeriod(newStart);
  };

  const handleNextPeriod = () => {
    const newStart = new Date(startOfPeriod);
    newStart.setMonth(newStart.getMonth() + 1);
    setStartOfPeriod(newStart);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
    try {
      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent 
        ? `http://localhost:3001/api/events/${selectedEvent.id}`
        : 'http://localhost:3001/api/events';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchEvents();
        setSelectedEvent(undefined);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await fetch(`http://localhost:3001/api/events/${event.id}`, {
        method: 'DELETE',
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStartDate = event.start_date.split('T')[0];
      const eventEndDate = event.end_date.split('T')[0];
      return eventStartDate <= dateStr && eventEndDate >= dateStr;
    });
  };

  const renderCalendarGrid = () => {
    const currentPeriod = new Date(startOfPeriod);
    const currentMonth = currentPeriod.getMonth();
    const currentYear = currentPeriod.getFullYear();
    
    // Get the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get the number of days in the previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Get the first day of the month (0-6, where 0 is Sunday)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Create the month container
    return (
      <Box>
        <Grid container sx={{
          width: '100%',
          margin: '0 auto',
          border: '1px solid #e0e0e0',
          borderBottom: 'none',
          borderRight: 'none',
          backgroundColor: '#ffffff',
        }}>
          {/* Week day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs={12/7} key={day}>
              <Box sx={{
                py: 1,
                borderRight: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.875rem',
              }}>
                {day}
              </Box>
            </Grid>
          ))}
          
          {/* Empty cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <Grid item xs={12/7} key={`empty-${index}`}>
              <CalendarCell sx={{ visibility: 'visible', backgroundColor: '#fafafa' }}>
                <CalendarCellContent>
                  <Typography sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                    {new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + index + 1).getDate()}
                  </Typography>
                </CalendarCellContent>
              </CalendarCell>
            </Grid>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(currentYear, currentMonth, index + 1);
            const dayEvents = getDayEvents(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <Grid item xs={12/7} key={date.toISOString()}>
                <CalendarCell 
                  onClick={() => handleDayClick(date)}
                  sx={{ 
                    ...(isToday && {
                      '& .date-number': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    })
                  }}
                >
                  <CalendarCellContent>
                    <Typography 
                      className="date-number"
                      sx={{ 
                        fontSize: '0.875rem',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    <Box sx={{ 
                      mt: 1,
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5
                    }}>
                      {dayEvents.map(event => (
                        <Box
                          key={event.id}
                          sx={{
                            backgroundColor: event.color || '#1976d2',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              filter: 'brightness(1.1)',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setDialogOpen(true);
                          }}
                        >
                          <Typography noWrap sx={{ fontWeight: 500 }}>
                            {event.title}
                          </Typography>
                          <Typography noWrap sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                            {event.start_date.split('T')[1].slice(0, 5)} - {event.end_date.split('T')[1].slice(0, 5)}
                            {event.start_date.split('T')[0] !== event.end_date.split('T')[0] && ' (+)'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CalendarCellContent>
                </CalendarCell>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const formatDateRange = () => {
    return new Date(startOfPeriod).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      p: 2,
      '@media print': {
        p: 0
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
      }}>
        <IconButton onClick={handlePreviousPeriod}>←</IconButton>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="h5">{formatDateRange()}</Typography>
          <Button onClick={() => {
            const today = new Date();
            setStartOfPeriod(new Date(today.getFullYear(), today.getMonth(), 1));
          }}>
            Today
          </Button>
        </Box>
        <IconButton onClick={handleNextPeriod}>→</IconButton>
      </Box>

      {isLoading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}>
          <CircularProgress />
        </Box>
      )}

      {renderCalendarGrid()}

      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedEvent(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate || undefined}
        event={selectedEvent}
      />
    </Box>
  );
};

export default Calendar; 