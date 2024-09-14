// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MapPage from './MapPage'; // Import the main page component
import './App.css'; // Import your global styles

const App = () => {
    return (
        <Router>
            <div>
                {/* Navigation Menu */}
                <nav className="navbar">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/map">Map Page</Link></li>
                    </ul>
                </nav>

                {/* Define Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/map" element={<MapPage />} />
                </Routes>
            </div>
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
