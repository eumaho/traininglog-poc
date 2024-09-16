// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MapPage from './MapPage'; // Import the main page component
import MapPage2 from './MapPage2'; // Import the map page 2 component
import './App.css'; // Import your global styles

const App = () => {
    return (
        <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <CssBaseline />
                <Header /> {/* Header component will handle navigation */}
                <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                    <Routes>
                    <Route path="/" element={<MapPage />} /> {/* Default route */}
                    <Route path="/map-page-1" element={<MapPage />} /> {/* Route for MapPage1 */}
                    <Route path="/map-page-2" element={<MapPage2 />} /> {/* Route for MapPage2 */}
                    </Routes>
                </Box>
                <Footer />
            </Box>
      </Router>
    );
};

// Simple Home Component
const Home = () => (
    <div>
        <h1>Welcome to GPX-Track1</h1>
        <p>Select a page from the menu.</p>
    </div>
);

export default App;
