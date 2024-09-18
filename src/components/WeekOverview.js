import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the DatePicker CSS
import dayjs from 'dayjs';
import './WeekOverview.css'; // Import the custom CSS

const WeekOverview = ({ onDayClick, trainingData }) => {
  const [selectedDay, setSelectedDay] = useState(new Date()); // Using a Date object for react-datepicker

  // Function to determine if the day has activities
  const isDayWithActivity = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return trainingData[formattedDate] !== undefined;
  };

  // Function to add a custom class to days with activities
  const highlightDayWithActivity = (date) => {
    return isDayWithActivity(date) ? 'day-with-activity' : ''; // Apply custom class if day has activities
  };

  useEffect(() => {
    const formattedDate = dayjs(selectedDay).format('YYYY-MM-DD');
    onDayClick(formattedDate); // Trigger the callback when the date changes
  }, [selectedDay, onDayClick]);

  return (
    <div className="p-1 border">
      <h6 className="week-overview-heading">Week Overview</h6>
      <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}>
        <DatePicker
          selected={selectedDay} // The currently selected date
          onChange={(date) => setSelectedDay(date)} // Handle date changes
          className="form-control" // Bootstrap styling
          dateFormat="yyyy-MM-dd" // Format the date
          showWeekNumbers // Enable week numbers
          calendarStartDay={1} // Optional: Set Monday as the start of the week
          inline // Shows the calendar inline
          dayClassName={highlightDayWithActivity} // Add class for days with activities
        />
      </div>
    </div>
  );
};

export default WeekOverview;
