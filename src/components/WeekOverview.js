import React, { useState } from 'react';
import { Box, Typography, IconButton, Grid, Badge, Paper } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ActivityDetails from './ActivityDetails';

const WeekOverview = ({ trainingData }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // Offset to determine which weeks are shown
  const [selectedDay, setSelectedDay] = useState(null); // State to keep track of selected day

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekDates = (offsetWeeks = 0) => {
    const now = new Date();
    const currentDate = new Date(now.setDate(now.getDate() - now.getDay() + 1 + offsetWeeks * 7));
    const firstDate = new Date(currentDate);
    const lastDate = new Date(currentDate.setDate(currentDate.getDate() + 6));

    const formattedFirstDate = `${firstDate.getDate().toString().padStart(2, '0')}/${firstDate.toLocaleString('default', { month: 'short' })}`;
    const formattedLastDate = `${lastDate.getDate().toString().padStart(2, '0')}/${lastDate.toLocaleString('default', { month: 'short' })}`;

    const startOfYear = new Date(firstDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (firstDate - startOfYear + (startOfYear.getDay() + 1) * 86400000) / 86400000;
    const weekNumber = Math.ceil(pastDaysOfYear / 7);

    return {
      firstDate: formattedFirstDate,
      lastDate: formattedLastDate,
      weekNumber,
    };
  };

  // Get the dates for the current and previous weeks based on the current offset
  const currentWeekDates = getWeekDates(currentWeekOffset);
  const previousWeekDates = getWeekDates(currentWeekOffset - 1);

  const handleDayClick = (day) => {
    setSelectedDay(day); // Set the selected day when a day is clicked
  };

  const handlePreviousWeekClick = () => {
    setCurrentWeekOffset(currentWeekOffset - 1); // Navigate to the previous week
  };

  const handleNextWeekClick = () => {
    setCurrentWeekOffset(currentWeekOffset + 1); // Navigate to the next week
  };

  const renderDay = (week, day) => {
    const hasTrainingSession = trainingData[week] && trainingData[week][day];

    return (
      <Grid
        item
        key={`${week}-${day}`}
        sx={{
          textAlign: 'center',
          margin: '0 1px', // Minimize horizontal margin
        }}
      >
        <Typography
          variant="caption"
          display="block"
          sx={{ margin: '0' }} // Remove margin around Typography
        >
          {day}
        </Typography>
        <IconButton
          onClick={() => handleDayClick({ week, day })}
          sx={{ padding: '0px' }} // Keep padding at 0px for IconButton
        >
          <Badge
            color="error"
            variant="dot"
            invisible={!hasTrainingSession}
            overlap="circular"
          >
            <CalendarTodayIcon />
          </Badge>
        </IconButton>
      </Grid>
    );
  };

  const renderWeek = (week, weekLabel) => (
    <Box
      sx={{
        textAlign: 'center',
        margin: '0', // Remove margin around the week container
        padding: '0', // Remove padding within the week container
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontSize: '0.9rem', marginBottom: '2px', padding: '0' }} // Minimize margin and padding
      >
        {weekLabel}
      </Typography>
      <Grid container justifyContent="center" alignItems="center" sx={{ gap: '1px' }}> {/* Minimize gap between day items */}
        {daysOfWeek.map((day) => renderDay(week, day))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ padding: '0' }}> {/* Remove outer padding */}
      <Paper
        elevation={3}
        sx={{
          padding: '4px', // Minimize padding around Paper
          marginBottom: '0',
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content', // Use fit-content to size the component based on its content
          flexShrink: 1,
          margin: '0 auto', // Center the component
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left arrow for navigating to previous weeks */}
        <IconButton onClick={handlePreviousWeekClick} sx={{ padding: '0px' }}>
          <ChevronLeftIcon />
        </IconButton>

        {/* Container for the week groups */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexGrow: 0, // Set flexGrow to 0 to prevent expansion
            gap: '10px', // Adjust gap between week groups
            flexWrap: 'wrap',
            margin: '0', // Remove margin
          }}
        >
          {/* Previous week on the left */}
          {renderWeek(
            'previousWeek',
            `${new Date().getFullYear()}, Week ${previousWeekDates.weekNumber} from ${previousWeekDates.firstDate} to ${previousWeekDates.lastDate}`
          )}
          {/* Current week on the right */}
          {renderWeek(
            'currentWeek',
            `${new Date().getFullYear()}, Week ${currentWeekDates.weekNumber} from ${currentWeekDates.firstDate} to ${currentWeekDates.lastDate}`
          )}
        </Box>

        {/* Right arrow for navigating to next weeks */}
        {currentWeekOffset < 0 && (
          <IconButton onClick={handleNextWeekClick} sx={{ padding: '0px' }}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Paper>

      {/* Display activities for the selected day */}
      {selectedDay && <ActivityDetails selectedDay={selectedDay} trainingData={trainingData} />}
    </Box>
  );
};

export default WeekOverview;
