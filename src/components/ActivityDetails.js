import React from 'react';
import { Box, Typography } from '@mui/material';

const ActivityDetails = ({ selectedDay, trainingData }) => {
  // If selectedDay is null or undefined, display a message or nothing
  if (!selectedDay) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No day selected. Please select a day to see the activity details.
        </Typography>
      </Box>
    );
  }

  const { week, day } = selectedDay;
  const activities = trainingData[week] && trainingData[week][day];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Activities for {day} ({week})
      </Typography>
      {activities ? (
        activities.map((activity, index) => (
          <Typography key={index} variant="body1">
            {activity.name} - {activity.duration} minutes
          </Typography>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">
          No activities for this day.
        </Typography>
      )}
    </Box>
  );
};

export default ActivityDetails;
