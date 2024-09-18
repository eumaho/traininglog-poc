import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CenterScreen from './components/CenterScreen';
import RightSideScreen from './components/RightSideScreen';
import dayjs from 'dayjs';

// Sample training data
const trainingData = {
  '2024-09-09': [{ name: 'Cycling', duration: 60 }],
  '2024-09-11': [{ name: 'Running', duration: 30 }],
  '2024-09-13': [{ name: 'Yoga', duration: 45 }],
  '2024-09-17': [{ name: 'Swimming', duration: 40 }],
  '2024-09-19': [{ name: 'Gym Workout', duration: 50 }],
};

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day); // Set the clicked day in 'YYYY-MM-DD' format
  };

  return (
    <div className="container-fluid p-1 border"> {/* Bootstrap container-fluid with 1px padding and border */}
      {/* AppBar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div className="container-fluid">
          <span className="navbar-brand">TrainingLog</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="row mt-1"> {/* Bootstrap row */}
        {/* Center Screen for Activity Details */}
        <div className="col-lg-10 col-md-9 col-sm-12 p-1 border"> {/* Wider Bootstrap column for CenterScreen */}
          <CenterScreen selectedDay={selectedDay} trainingData={trainingData} />
        </div>

        {/* Right Side Screen for Week Overview */}
        <div className="col-lg-2 col-md-3 col-sm-12 p-1 border"> {/* Slimmer Bootstrap column for RightSideScreen */}
          <RightSideScreen trainingData={trainingData} onDayClick={handleDayClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
