import React from 'react';
import { Box, Typography } from '@mui/material';
import WeekOverview from './components/WeekOverview'; // Adjust the path based on your file structure
import ActivityDetails from './components/ActivityDetails'; // Adjust the path based on your file structure

// Define training data
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

// Define week summaries data
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
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {/* Pass both trainingData and weekSummaries to WeekOverview */}
      <WeekOverview trainingData={trainingData} weekSummaries={weekSummaries} />
    </Box>
  );
};

export default Dashboard;
