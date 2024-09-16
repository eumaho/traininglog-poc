// src/components/Header.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import { Link } from 'react-router-dom'; // Use Link for routing

// Import the logo image
import logo from '../assets/TrainingLog.png'; 

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <img src={logo} alt="Logo" style={{ height: 16, marginRight: '16px' }} />

          {/* Hamburger Menu */}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'block', md: 'block' } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component={Link} to="/ride-summary-page">
                Ride Summary Page
              </MenuItem>
              <MenuItem onClick={handleMenuClose} component={Link} to="/map-page-1">
                MapPage1
              </MenuItem>
              <MenuItem onClick={handleMenuClose} component={Link} to="/map-page-2">
                MapPage2
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
