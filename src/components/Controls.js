import React from 'react';

const Controls = ({ speedThreshold, setSpeedThreshold }) => (
  <div className="highlight-controls">
    <input
      type="number"
      value={speedThreshold}
      onChange={(e) => setSpeedThreshold(e.target.value)}
      placeholder="Enter speed (km/h)"
    />
    <button onClick={() => setSpeedThreshold(speedThreshold)}>
      Highlight sections with speed greater than
    </button>
  </div>
);

export default Controls;
