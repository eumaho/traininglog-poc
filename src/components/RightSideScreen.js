import React from 'react';
import WeekOverview from './WeekOverview';

const RightSideScreen = ({ trainingData, onDayClick }) => {
  return (
    <div className="p-1 border"> {/* Bootstrap padding and border */}
      <WeekOverview trainingData={trainingData} onDayClick={onDayClick} />
    </div>
  );
};

export default RightSideScreen;
