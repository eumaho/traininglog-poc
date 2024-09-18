import React from 'react';

const CenterScreen = ({ selectedDay, trainingData }) => {
  return (
    <div className="p-1 border"> {/* Bootstrap padding and border */}
      <h4>Dashboard</h4>
      <p>Please select a day to see activities.</p>
      {/* You can add more Bootstrap styling as needed */}
    </div>
  );
};

export default CenterScreen;
