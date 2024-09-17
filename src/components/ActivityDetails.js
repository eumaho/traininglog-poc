import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const ActivityDetails = ({ selectedDay, trainingData }) => {
  const { week, day } = selectedDay;
  const activities = trainingData[week] && trainingData[week][day] ? trainingData[week][day] : [];

  return (
    <Box sx={{ padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Activities on {day}, {week}
        </Typography>
        <List>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <ListItem key={index}>
                <ListItemText primary={activity.name} secondary={`Duration: ${activity.duration} mins`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No activities recorded for this day.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ActivityDetails;
