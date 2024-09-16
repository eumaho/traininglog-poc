// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import MapPage from './MapPage'; // Import the main page component
import MapPage2 from './MapPage2';
import RideSummaryPage from './RideSummaryPage';

const App = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <Header /> {/* Header component will handle navigation */}
        <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
          <Routes>
            <Route path="/ride-summary-page" element={<RideSummaryPage />} /> {/* Route for MapPage2 */}
            <Route path="/map-page-1" element={<MapPage />} /> {/* Route for MapPage1 */}
            <Route path="/map-page-2" element={<MapPage2 />} /> {/* Route for MapPage2 */}
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
};

export default App;
