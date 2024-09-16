// src/components/Footer.js
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        backgroundColor: '#1976d2',
        color: 'white',
      }}
    >
      <Typography variant="body2">
        © 2024 My Company. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
