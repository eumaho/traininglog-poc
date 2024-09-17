import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import WeekOverview from './components/WeekOverview';
import ActivityDetails from './components/ActivityDetails';

const trainingData = {
  previousWeek: {
    Mon: [{ name: 'Cycling', duration: 60 }],
    Wed: [{ name: 'Running', duration: 30 }],
    Fri: [{ name: 'Yoga', duration: 45 }],
  },
  currentWeek: {
    Tue: [{ name: 'Swimming', duration: 40 }],
    Thu: [{ name: 'Gym Workout', duration: 50 }],
  },
};

const weekSummaries = {
  currentWeek: {
    hoursOfTraining: '15h 37m',
    daysOfTraining: 4,
    totalCalories: 6890,
    distanceRunning: 17.94,
    distanceCycling: 256.73,
    restDays: ['Mon', 'Fri'],
  },
  previousWeek: {
    hoursOfTraining: '12h 20m',
    daysOfTraining: 3,
    totalCalories: 5020,
    distanceRunning: 10.5,
    distanceCycling: 180.4,
    restDays: ['Tue', 'Thu', 'Sun'],
  },
};

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Container to align both WeekOverview and ActivityDetails */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center align all content
          width: '100%',
          margin: '0 auto', // Center the container horizontally
        }}
      >
        {/* WeekOverview and ActivityDetails components */}
        <Box
          sx={{
            display: 'inline-flex', // Use inline-flex to wrap the content size
            flexDirection: 'column', // Keep both components in a column layout
            padding: '0px', // Remove extra padding
            justifyContent: 'center', // Center content horizontally
          }}
        >
          {/* WeekOverview Component */}
          <WeekOverview
            trainingData={trainingData}
            weekSummaries={weekSummaries}
            onDayClick={handleDayClick}
          />

          {/* ActivityDetails Component with extra space on top */}
          <Box
            sx={{
              marginTop: '30px', // Add 30px space above ActivityDetails
            }}
          >
            <ActivityDetails selectedDay={selectedDay} trainingData={trainingData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
