import React from 'react';
import { Box, Typography } from '@mui/material';

const WeekSummary = ({ summary }) => {
  return (
    <Box
      sx={{
        textAlign: 'left',
        padding: '10px',
        marginTop: '5px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px',
      }}
    >
      <Typography variant="body2">
        <strong>Hours of training:</strong> {summary.hoursOfTraining}
      </Typography>
      <Typography variant="body2">
        <strong>Days of training:</strong> {summary.daysOfTraining}
      </Typography>
      <Typography variant="body2">
        <strong>Total calories:</strong> {summary.totalCalories} kcal
      </Typography>
      <Typography variant="body2">
        <strong>Distance running:</strong> {summary.distanceRunning} km
      </Typography>
      <Typography variant="body2">
        <strong>Distance cycling:</strong> {summary.distanceCycling} km
      </Typography>
      <Typography variant="body2">
        <strong>Rest days:</strong> {summary.restDays.join(', ')}
      </Typography>
    </Box>
  );
};

export default WeekSummary;
