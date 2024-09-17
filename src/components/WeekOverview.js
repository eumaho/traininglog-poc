import React, { useState } from 'react';
import { Box, Typography, IconButton, Grid, Badge, Paper } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ActivityDetails from './ActivityDetails';

const WeekOverview = ({ trainingData }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekDates = (offsetWeeks = 0) => {
    const now = new Date();
    const currentDate = new Date(now.setDate(now.getDate() - now.getDay() + 1 + offsetWeeks * 7));
    const firstDate = new Date(currentDate);
    const lastDate = new Date(currentDate.setDate(currentDate.getDate() + 6));

    const startOfYear = new Date(firstDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (firstDate - startOfYear + (startOfYear.getDay() + 1) * 86400000) / 86400000;
    const weekNumber = Math.ceil(pastDaysOfYear / 7);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      return date;
    });

    const monthLabel = getMonthLabel(firstDate, lastDate);

    return {
      firstDate,
      lastDate,
      weekNumber,
      weekDates,
      monthLabel,
    };
  };

  const getMonthLabel = (firstDate, lastDate) => {
    const firstMonth = firstDate.toLocaleString('default', { month: 'short' });
    const lastMonth = lastDate.toLocaleString('default', { month: 'short' });

    if (firstMonth === lastMonth) {
      return `${firstMonth}`; // Single month
    } else {
      return `${firstMonth}-${lastMonth}`; // Range of months
    }
  };

  const currentWeekDates = getWeekDates(currentWeekOffset);
  const previousWeekDates = getWeekDates(currentWeekOffset - 1);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handlePreviousWeekClick = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const handleNextWeekClick = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  const renderDay = (week, day, dayNumber) => {
    const hasTrainingSession = trainingData[week] && trainingData[week][day];

    return (
      <Grid
        item
        key={`${week}-${day}`}
        sx={{
          textAlign: 'center',
          margin: '0 1px',
          position: 'relative',
        }}
      >
        <Typography variant="caption" display="block" sx={{ margin: '0' }}>
          {day}
        </Typography>
        <IconButton
          onClick={() => handleDayClick({ week, day })}
          sx={{ padding: '0px', position: 'relative' }}
        >
          <Badge
            color="error"
            variant="dot"
            invisible={!hasTrainingSession}
            overlap="circular"
          >
            <CalendarTodayIcon />
          </Badge>
          <Typography
            variant="caption"
            display="block"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -30%)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              color: 'black',
              pointerEvents: 'none',
            }}
          >
            {dayNumber}
          </Typography>
        </IconButton>
      </Grid>
    );
  };

  const renderWeekLabel = (weekDates) => (
    <Typography
      variant="body2"
      sx={{
        fontSize: '1rem',
        marginBottom: '5px',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontWeight: 'bold', marginRight: '5px' }}>
        Week {weekDates.weekNumber},
      </span>
      <span style={{ margin: '0 5px', color: '#555' }}>
        {weekDates.monthLabel} {weekDates.firstDate.getFullYear()}
      </span>
    </Typography>
  );

  const renderWeek = (week, weekDates) => (
    <Box
      sx={{
        textAlign: 'center',
        margin: '0',
        padding: '0',
      }}
    >
      {renderWeekLabel(weekDates)}
      <Grid container justifyContent="center" alignItems="center" sx={{ gap: '1px' }}>
        {daysOfWeek.map((day, index) => renderDay(week, day, weekDates.weekDates[index].getDate()))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ padding: '0' }}>
      <Paper
        elevation={3}
        sx={{
          padding: '4px',
          marginBottom: '0',
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content',
          flexShrink: 1,
          margin: '0 auto',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <IconButton onClick={handlePreviousWeekClick} sx={{ padding: '0px' }}>
          <ChevronLeftIcon />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexGrow: 0,
            gap: '10px',
            flexWrap: 'wrap',
            margin: '0',
          }}
        >
          {renderWeek('previousWeek', previousWeekDates)}
          {renderWeek('currentWeek', currentWeekDates)}
        </Box>
        {currentWeekOffset < 0 && (
          <IconButton onClick={handleNextWeekClick} sx={{ padding: '0px' }}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Paper>

      {selectedDay && <ActivityDetails selectedDay={selectedDay} trainingData={trainingData} />}
    </Box>
  );
};

export default WeekOverview;
