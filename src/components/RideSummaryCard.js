// RideSummaryCard.js

import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import StarIcon from '@mui/icons-material/Star';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import Map from './Map'; // Assume you have a Map component that shows the route

const RideSummaryCard = ({ ride }) => {
  return (
    <Card variant="outlined" sx={{ maxWidth: 600, margin: 'auto', mt: 2 }}>
      <CardContent>
        {/* User Info and Ride Title */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar alt={ride.userName} src={ride.userAvatar} sx={{ width: 56, height: 56 }} />
          <Box ml={2}>
            <Typography variant="h6">{ride.userName}</Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {ride.date} - {ride.location}
            </Typography>
          </Box>
        </Box>

        {/* Ride Details */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <DirectionsBikeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{ride.title}</Typography>
          </Box>
          <IconButton>
            <MapIcon />
          </IconButton>
        </Box>

        {/* Metrics Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2">
              <strong>{ride.distance}</strong> km
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2">
              <strong>{ride.elevationGain}</strong> m
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2">
              <strong>{ride.time}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Tooltip title="Achievements">
              <IconButton>
                <EmojiEventsIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{ride.achievements}</Typography>
          </Box>
        </Box>

        {/* Achievement Highlight */}
        {ride.achievementHighlight && (
          <Box bgcolor="#FFEB3B" p={1} mb={2}>
            <Typography variant="body2">{ride.achievementHighlight}</Typography>
          </Box>
        )}

        <Box height={200} mb={2}>
          <img src={ride.route} alt="Ride Route" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>

        {/* Kudos Section */}
        <Box display="flex" alignItems="center">
          <IconButton>
            <ThumbUpAltIcon />
          </IconButton>
          <Typography variant="body2">{ride.kudos} Kudos</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RideSummaryCard;
