import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import * as XLSX from 'xlsx'; // Import the xlsx library

// Register necessary Chart.js components and plugins
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ElevationProfile = ({ trackPoints, onPointClick }) => {
  console.log('Track Points for Elevation Profile:', trackPoints);

  const elevationData = trackPoints.map((point) => point.ele);
  const speedData = trackPoints.map((point) => parseFloat(point.speed));
  const powerData = trackPoints.map((point) => point.power);
  const cadenceData = trackPoints.map((point) => point.cadence);

  // Calculate dynamic max values
  const maxElevation = Math.max(...elevationData) + 100;
  const maxSpeed = Math.max(...speedData) + 10;
  const maxPower = Math.max(...powerData) + 100;
  const maxCadence = Math.max(...cadenceData) + 20;

  const data = {
    labels: ['0 km', '0.1 km', '0.2 km', '0.3 km', '0.4 km', '0.5 km', '0.6 km', '0.7 km', '0.8 km', '0.9 km', '1.0 km'],
    datasets: [
      {
        label: 'Elevation (m)',
        data: elevationData,
        borderColor: '#808080', // Gray color for the elevation line
        backgroundColor: 'rgba(128, 128, 128, 0.2)', // Lighter gray for the fill
        borderWidth: 1,
        fill: true,
        tension: 0.4,
        pointRadius: 2, // Show small points for elevation data
        yAxisID: 'y-elevation',
      },
      {
        label: 'Speed (km/h)',
        data: speedData,
        borderColor: '#007BFF',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 0, // Hide points for speed data
        yAxisID: 'y-speed',
      },
      {
        label: 'Power (W)',
        data: powerData,
        borderColor: '#FFA500',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 0, // Hide points for power data
        yAxisID: 'y-power',
      },
      {
        label: 'Cadence (rpm)',
        data: cadenceData,
        borderColor: '#32CD32',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 0, // Hide points for cadence data
        yAxisID: 'y-cadence',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distance (km)',
        },
      },
      'y-elevation': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Elevation (m)',
        },
        min: 0,
        max: maxElevation, 
      },
      'y-speed': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Speed (km/h)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: maxSpeed,
      },
      'y-power': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Power (W)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: maxPower,
      },
      'y-cadence': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Cadence (rpm)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: maxCadence,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true, // Enable tooltips on hover
        callbacks: {
          title: (tooltipItems) => `Distance: ${tooltipItems[0].label}`,
          beforeBody: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const point = trackPoints[index];
            return `Elevation: ${point.ele} m\nSpeed: ${point.speed} km/h\nPower: ${point.power} W\nCadence: ${point.cadence} rpm`;
          },
          label: () => '', // No individual labels; using beforeBody for all info
        },
      },
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        const index = activeElements[0].index;
        const selectedPoint = trackPoints[index];
        if (selectedPoint) {
          onPointClick(selectedPoint);
        }
      }
    },
  };

  // Function to export data from the elevation profile graph
  const exportToExcel = () => {
    const dataForExport = trackPoints.map((point, index) => ({
      Distance: `${(index * 0.1).toFixed(1)} km`, // Convert to km representation for each 100m
      Elevation: point.ele,
      Speed: point.speed,
      Power: point.power,
      Cadence: point.cadence,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GPX Data');

    // Export to Excel
    XLSX.writeFile(workbook, 'GPX_Data.xlsx');
  };

  return (
    <div
      style={{
        height: '500px',
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        border: '1px solid #ddd',
        marginTop: '20px',
      }}
    >
      <button onClick={exportToExcel} style={{ marginBottom: '10px' }}>
        Export Elevation Profile Data to Excel
      </button>
      <div style={{ width: '800px', height: '250px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ElevationProfile;
