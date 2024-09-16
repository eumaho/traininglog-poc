// RideSummaryPage.js
import React from 'react';
import RideSummaryCard from './components/RideSummaryCard'; // Import the RideSummaryCard component

const RideSummaryPage = () => {
  // Generate random data for a fictitious person
  const randomRideData = {
    userName: 'John Doe',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Example avatar from randomuser.me
    date: '14 September 2024 at 07:45',
    location: 'Toronto, Ontario',
    title: 'Morning Adventure Ride',
    distance: (Math.random() * 100 + 20).toFixed(2), // Random distance between 20 km to 120 km
    elevationGain: Math.floor(Math.random() * 1000 + 100), // Random elevation gain between 100 m to 1100 m
    time: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`, // Random time between 0h to 4h
    achievements: Math.floor(Math.random() * 50), // Random achievements count
    achievementHighlight: 'Congrats! You just became 5th on the Downtown Sprint!', // Example achievement highlight
    route: '../assets/my-ride.png', // Path to the ride image
    kudos: Math.floor(Math.random() * 100), // Random kudos count
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ride Summary</h1>
      <RideSummaryCard ride={randomRideData} />
    </div>
  );
};

export default RideSummaryPage;
