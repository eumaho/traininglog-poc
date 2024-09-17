import React from 'react';
import { Box, Typography } from '@mui/material';
import WeekOverview from './components/WeekOverview'; // Adjust the path based on your file structure
import ActivityDetails from './components/ActivityDetails'; // Adjust the path based on your file structure

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

const Dashboard = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <WeekOverview trainingData={trainingData} />
    </Box>
  );
};

export default Dashboard;
