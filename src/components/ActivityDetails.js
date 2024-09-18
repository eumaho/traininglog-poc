import React from 'react';
import { Box, Typography } from '@mui/material';

const ActivityDetails = ({ selectedDay, trainingData }) => {
  if (!selectedDay) {
    return <Typography variant="body2">Please select a day to see activities.</Typography>;
  }

  const activities = trainingData.currentWeek?.[selectedDay] || trainingData.previousWeek?.[selectedDay];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activities for {selectedDay}
      </Typography>
      {activities ? (
        activities.map((activity, index) => (
          <Typography key={index} variant="body1">
            {activity.name} - {activity.duration} minutes
          </Typography>
        ))
      ) : (
        <Typography variant="body2">No activities found for this day.</Typography>
      )}
    </Box>
  );
};

export default ActivityDetails;
