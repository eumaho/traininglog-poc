import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { fetchGPXData } from './utils/gpxParser';
import ElevationProfile from './components/ElevationProfile';
import * as XLSX from 'xlsx'; // Import the xlsx library for exporting data
import './MapPage.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhvYmxlIiwiYSI6ImNtMTU4M3VtYjA2cm4ya3B6eWFza3A0ZWkifQ.rBrzLp-hjHcdSCI-FPBEUw';

const MapPage2 = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const trackPointsRef = useRef([]); 
  const [trackPoints, setTrackPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [showElevation, setShowElevation] = useState(false);
  const [selectedKm, setSelectedKm] = useState(1);
  const [maxKm, setMaxKm] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState([]); // Initialize selectedPoints state
  const markerRef = useRef(null); // Ref to store marker for clicked point
  const [interval, setInterval] = useState(''); // State for distance interval input

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-79.32856, 43.72353],
      zoom: 15,
    });

    mapRef.current = map; // Store the map instance in the ref

    // Ensure data is fetched after the map's style has fully loaded
    map.on('style.load', () => {
      loadGPXData();
    });

    return () => {
      map.remove(); // Clean up the map instance when the component is unmounted
    };
  }, []);

  const loadGPXData = () => {
    if (!mapRef.current) return;

    fetchGPXData(mapRef.current, () => {
      const totalDistanceKm = Math.ceil(trackPointsRef.current[trackPointsRef.current.length - 1].distance); 
      setMaxKm(totalDistanceKm);
      setTrackPoints([...trackPointsRef.current]);
      filterPointsByKm(1); 
    }, trackPointsRef);
  };

  const handleShowElevationProfile = () => {
    if (!showElevation) {
      setTrackPoints([]);
      loadGPXData(); 
    }
    setShowElevation((prevState) => !prevState); 
  };

  const filterPointsByKm = (km) => {
    const startKm = km - 1; 
    const endKm = startKm + 1;
    const pointsForKm = trackPoints.filter(
      (point) => point.distance >= startKm && point.distance < endKm
    );

    // Filter points for every 100m interval
    const intervalPoints = [];
    for (let i = 0; i <= 10; i++) {
      const targetDistance = startKm + (i * 0.1); 
      const closestPoint = findClosestPoint(pointsForKm, targetDistance);
      if (closestPoint) intervalPoints.push(closestPoint);
    }

    setFilteredPoints(intervalPoints);
    highlightSegmentOnMap(pointsForKm);
    moveToKmCenter(intervalPoints);
  };

  const findClosestPoint = (points, targetDistance) => {
    let closestPoint = null;
    let minDistance = Infinity;

    points.forEach((point) => {
      const distanceDiff = Math.abs(point.distance - targetDistance);
      if (distanceDiff < minDistance) {
        minDistance = distanceDiff;
        closestPoint = point;
      }
    });

    return closestPoint;
  };

  const highlightSegmentOnMap = (points) => {
    if (!mapRef.current || points.length === 0) return;

    if (mapRef.current.getSource('highlighted-segment')) {
      mapRef.current.removeLayer('highlighted-segment');
      mapRef.current.removeSource('highlighted-segment');
    }

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: points.map((point) => [point.lon, point.lat]),
          },
        },
      ],
    };

    mapRef.current.addSource('highlighted-segment', { type: 'geojson', data: geojson });
    mapRef.current.addLayer({
      id: 'highlighted-segment',
      type: 'line',
      source: 'highlighted-segment',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#0000FF', 'line-width': 4 },
    });
  };

  const moveToKmCenter = (points) => {
    if (!mapRef.current || points.length === 0) return;

    const firstPoint = points[0];
    mapRef.current.flyTo({
      center: [firstPoint.lon, firstPoint.lat],
      zoom: 15,
      speed: 1.2,
    });
  };

  const handleKmChange = (event) => {
    const km = Math.min(Math.max(parseInt(event.target.value, 10), 1), maxKm); 
    setSelectedKm(km);
    filterPointsByKm(km);
  };

  const handlePointClick = (point) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = new mapboxgl.Marker({ color: 'yellow', radius: 3 })
      .setLngLat([point.lon, point.lat])
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [point.lon, point.lat],
      zoom: 16,
      speed: 1.2,
    });
  };

  // Function to export the entire GPX data set
  const exportFullGPXData = () => {
    const distanceInterval = parseFloat(interval);
    let dataForExport = trackPointsRef.current;
  
    if (!isNaN(distanceInterval) && distanceInterval > 0) {
      const filteredData = [];
      let lastDistance = 0;
  
      dataForExport.forEach((point) => {
        if (point.distance >= lastDistance) {
          filteredData.push(point);
          lastDistance += distanceInterval / 1000; 
        }
      });
  
      dataForExport = filteredData;
    }
  
    const formattedData = dataForExport.map((point) => ({
      'Distance (km)': point.distance.toFixed(4), 
      Elevation: point.ele,
      Speed: point.speed,
      Power: point.power,
      Cadence: point.cadence,
      Time: new Date(point.time).toLocaleString(), 
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Full GPX Data');
  
    XLSX.writeFile(workbook, 'Full_GPX_Data.xlsx');
  };
  
  return (
    <div>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '50%', // Set the desired width
          height: '400px', // Set the desired height
          margin: '20px auto', // Center the map with some margin
          border: '1px solid #ddd' // Optional border for visibility
        }}
        className="map-container" />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleShowElevationProfile}>
          {showElevation ? 'Hide Elevation Profile' : 'Show Elevation Profile'}
        </button>
        <input
          type="number"
          placeholder="Distance Interval (m)"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          style={{ marginLeft: '10px', width: '150px' }}
        />
        <button onClick={exportFullGPXData} style={{ marginLeft: '10px' }}>
          Export Full GPX Data to Excel
        </button>
      </div>
      {showElevation && (
        <div>
          <label htmlFor="km-input">Enter Kilometer (1 - {maxKm}):</label>
          <input
            id="km-input"
            type="number"
            value={selectedKm}
            min="1"
            max={maxKm}
            onChange={handleKmChange}
          />
          <ElevationProfile trackPoints={filteredPoints} onPointClick={handlePointClick} />
        </div>
      )}
    </div>
  );
};

export default MapPage2;
