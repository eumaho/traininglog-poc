import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import WeekOverview from './components/WeekOverview'; // Import the new WeekOverview component
import ActivityDetails from './components/ActivityDetails';
import dayjs from 'dayjs';

// Updated training data structure using 'YYYY-MM-DD' as keys
const trainingData = {
  '2024-09-09': [{ name: 'Cycling', duration: 60 }],
  '2024-09-11': [{ name: 'Running', duration: 30 }],
  '2024-09-13': [{ name: 'Yoga', duration: 45 }],
  '2024-09-17': [{ name: 'Swimming', duration: 40 }],
  '2024-09-19': [{ name: 'Gym Workout', duration: 50 }],
};

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day); // Set the clicked day in 'YYYY-MM-DD' format
  };

  return (
    <Box sx={{ padding: 4, display: 'flex', justifyContent: 'space-between' }}>
      {/* Main content on the left */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Activity Details Component */}
        <ActivityDetails selectedDay={selectedDay} trainingData={trainingData} />
      </Box>

      {/* WeekOverview (DateCalendar) on the right */}
      <Box sx={{ minWidth: '250px', marginLeft: '20px' }}>
        <WeekOverview trainingData={trainingData} onDayClick={handleDayClick} />
      </Box>
    </Box>
  );
};

export default Dashboard;
