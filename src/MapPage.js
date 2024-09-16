import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { gpx } from '@mapbox/togeojson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVectorSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './MapPage.css';
import { fetchGPXData, extractGPXData, highlightSections } from './utils/gpxParser';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhvYmxlIiwiYSI6ImNtMHdiNmp1dDBiZHAyanB3eGFsOHVxejAifQ.rw5lt1bT5x0av6vyKh1lbQ';

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  const markerRef = useRef(null); 
  const [selectedPoints, setSelectedPoints] = useState([]); // Initialize selectedPoints correctly
  const [selectedRow, setSelectedRow] = useState(null); 
  const [speedThreshold, setSpeedThreshold] = useState(''); 
  const [thresholdToHighlight, setThresholdToHighlight] = useState(null); // State to control when to highlight

  const trackPointsRef = useRef([]); 

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-79.328560, 43.723530],
      zoom: 15,
      pitch: 60,
      bearing: 90
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      modes: {
        ...MapboxDraw.modes,
        draw_rectangle: MapboxDraw.modes.draw_polygon, 
      },
      controls: {}
    });
    map.addControl(draw);
    drawRef.current = draw;

    fetchGPXData(map, setSelectedPoints, trackPointsRef);

    map.on('click', (e) => handleMapClick(e, map, trackPointsRef.current));

    // Handle the selection of a rectangle
    map.on('draw.create', (e) => handleSelection(e, trackPointsRef.current));
    map.on('draw.update', (e) => handleSelection(e, trackPointsRef.current));
    map.on('draw.delete', () => setSelectedPoints([])); 

    return () => {
      map.remove();
    };
  }, []); 

  useEffect(() => {
    if (thresholdToHighlight !== null) {
      highlightSections(mapRef.current, thresholdToHighlight, trackPointsRef.current);
    }
  }, [thresholdToHighlight]); 

  const handleHighlightClick = () => {
    const threshold = parseInt(speedThreshold, 10);
    if (isNaN(threshold)) {
      alert('Please enter a valid number.');
      return;
    }
    setThresholdToHighlight(threshold); // Update state to trigger highlighting
  };

  const handleMapClick = (e, map, trackPoints) => {
    const clickedLngLat = e.lngLat;
    const clickedPoint = [clickedLngLat.lng, clickedLngLat.lat]; 

    const nearestPoint = findNearestPoint(trackPoints, clickedPoint);

    if (nearestPoint) {
      const { lat, lon, speed, power, cadence, ele } = nearestPoint;
      const elevation = ele.toFixed(2);
      const htmlContent = `Elevation: ${elevation} meters<br>Speed: ${speed} km/h<br>Power: ${power} W<br>Cadence: ${cadence} rpm`;

      tooltipRef.current
        .setLngLat(clickedLngLat) 
        .setHTML(htmlContent)
        .addTo(map);
    } else {
      tooltipRef.current.remove(); 
    }
  };

  const findNearestPoint = (trackPoints, clickedPoint) => {
    const [clickedLng, clickedLat] = clickedPoint;
    let nearestPoint = null;
    let minDistance = Infinity;

    trackPoints.forEach((point) => {
      const distance = Math.sqrt(
        Math.pow(point.lon - clickedLng, 2) + Math.pow(point.lat - clickedLat, 2)
      );

      if (distance < minDistance && distance < 0.0005) { 
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  };

  const handleRowClick = (index) => {
    setSelectedRow(index); 
    const point = selectedPoints[index];

    if (point && mapRef.current) {
      const { lon, lat } = point;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({ center: [lon, lat], zoom: 16 });
    }
  };

  const activateRectangleTool = () => {
    drawRef.current.changeMode('draw_rectangle'); // Set the mode to draw rectangle
  };

  const deleteSelected = () => {
    drawRef.current.deleteAll();
    setSelectedPoints([]); 
    setSelectedRow(null); 
    if (markerRef.current) markerRef.current.remove(); 
  };

  // Function to handle the selection of track points within a drawn rectangle
  const handleSelection = (e, trackPoints) => {
    const selectedArea = e.features[0];
    const selectedPolygon = selectedArea.geometry.coordinates[0];

    const pointsWithinSelection = trackPoints.filter((point) =>
      isPointInPolygon([point.lon, point.lat], selectedPolygon)
    );

    setSelectedPoints(pointsWithinSelection);
  };

  const isPointInPolygon = (point, vs) => {
    const x = point[0], y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];

      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const adjustMap = (direction) => {
    const map = mapRef.current;
    if (!map) return;

    switch (direction) {
      case 'left':
        map.rotateTo(map.getBearing() - 15); 
        break;
      case 'right':
        map.rotateTo(map.getBearing() + 15); 
        break;
      case 'up':
        map.setPitch(Math.min(map.getPitch() + 10, 85)); 
        break;
      case 'down':
        map.setPitch(Math.max(map.getPitch() - 10, 0)); 
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <h2>Map Page</h2>
      <div ref={mapContainerRef} className="map-container" />

      {/* Controls for Highlighting Sections */}
      <div className="highlight-controls">
        <input
          type="number"
          value={speedThreshold}
          onChange={(e) => setSpeedThreshold(e.target.value)}
          placeholder="Enter speed (km/h)"
        />
        <button onClick={handleHighlightClick}>
          Highlight sections with speed greater than
        </button>
      </div>

      {/* Add buttons to control the map dynamically */}
      <div className="map-controls">
        <button onClick={() => adjustMap('left')}>Rotate Left</button>
        <button onClick={() => adjustMap('right')}>Rotate Right</button>
        <button onClick={() => adjustMap('up')}>Tilt Up</button>
        <button onClick={() => adjustMap('down')}>Tilt Down</button>
        <button onClick={activateRectangleTool}>
          <FontAwesomeIcon icon={faVectorSquare} /> Draw Rectangle
        </button>
        <button onClick={deleteSelected}>
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Rectangle
        </button>
      </div>

      {selectedPoints.length > 0 && (
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
                    onClick={() => handleRowClick(index)}
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
      )}
    </div>
  );
};

export default MapPage;
