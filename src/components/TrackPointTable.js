import React from 'react';

const TrackPointTable = ({ selectedPoints, selectedRow, setSelectedRow }) => (
  selectedPoints.length > 0 && (
    <div>
      <h3>Selected Track Points</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Distance from Start (km)</th>
              <th>Time Since Start (mm:ss:ms)</th>
              <th>Elevation (m)</th>
              <th>Speed (km/h)</th>
              <th>Power (W)</th>
              <th>Cadence (rpm)</th>
            </tr>
          </thead>
          <tbody>
            {selectedPoints.map((point, index) => (
              <tr
                key={index}
                onClick={() => setSelectedRow(index)}
                style={{ backgroundColor: selectedRow === index ? 'lightblue' : 'white' }}
              >
                <td>{point.distance.toFixed(3)}</td>
                <td>{point.timeSinceStart}</td>
                <td>{point.ele}</td>
                <td>{point.speed}</td>
                <td>{point.power}</td>
                <td>{point.cadence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
);

export default TrackPointTable;
