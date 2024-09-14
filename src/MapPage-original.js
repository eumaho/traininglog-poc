import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { gpx } from '@mapbox/togeojson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVectorSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; 
import './MapPage.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhvYmxlIiwiYSI6ImNtMHdiNmp1dDBiZHAyanB3eGFsOHVxejAifQ.rw5lt1bT5x0av6vyKh1lbQ';

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  const markerRef = useRef(null); 
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); 
  const [speedThreshold, setSpeedThreshold] = useState(''); 

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

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.terrain-rgb',
        'tileSize': 512,
        'maxzoom': 14
      });

      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2.5 });

      fetch('/Early_morning_ride.gpx')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(gpxData => {
          const parser = new DOMParser();
          const gpxXml = parser.parseFromString(gpxData, 'application/xml');

          if (gpxXml.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Failed to parse GPX data. The file may not be well-formed XML.');
          }

          const geojson = gpx(gpxXml);

          if (!geojson || !geojson.features || geojson.features.length === 0) {
            throw new Error('Failed to parse GPX data or GPX file is empty');
          }

          trackPointsRef.current = extractGPXData(gpxXml);

          map.addSource('gpx-route', {
            'type': 'geojson',
            'data': geojson
          });

          map.addLayer({
            'id': 'gpx-route',
            'type': 'line',
            'source': 'gpx-route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#ff0000', // Set the initial color to red
              'line-width': [
                'interpolate', ['linear'], ['zoom'],
                10, 2,   // At zoom level 10, line width is 2 pixels
                14, 4,   // At zoom level 14, line width is 4 pixels
                18, 6    // At zoom level 18, line width is 6 pixels
              ]
            }
          });

          const bounds = geojson.features[0].geometry.coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(geojson.features[0].geometry.coordinates[0], geojson.features[0].geometry.coordinates[0])
          );

          map.fitBounds(bounds, {
            padding: 20,
            pitch: map.getPitch(),
            bearing: map.getBearing(),
            maxZoom: 16,
            linear: true
          });

          map.on('draw.create', (e) => handleSelection(e, trackPointsRef.current));
          map.on('draw.update', (e) => handleSelection(e, trackPointsRef.current));
          map.on('draw.delete', () => setSelectedPoints([])); 
        })
        .catch(error => console.error('Error loading GPX file:', error));
    });

    map.on('click', (e) => handleMapClick(e, map, trackPointsRef.current));

    return () => {
      map.remove();
    };
  }, []); // Removed speedThreshold dependency to prevent redrawing on input

  const extractGPXData = (gpxXml) => {
    const trackPoints = [];
    const trkpts = gpxXml.getElementsByTagName('trkpt');
    let cumulativeDistance = 0; 
    const startTime = new Date(trkpts[0].getElementsByTagName('time')[0].textContent); 

    for (let i = 0; i < trkpts.length; i++) {
      const lat = parseFloat(trkpts[i].getAttribute('lat'));
      const lon = parseFloat(trkpts[i].getAttribute('lon'));
      const ele = parseFloat(trkpts[i].getElementsByTagName('ele')[0]?.textContent || 0);
      const time = new Date(trkpts[i].getElementsByTagName('time')[0]?.textContent);

      const power = parseFloat(trkpts[i].getElementsByTagName('power')[0]?.textContent || '0');
      const cadence = parseFloat(trkpts[i].getElementsByTagName('gpxtpx:cad')[0]?.textContent || '0');

      const timeSinceStartMs = time - startTime; 
      const timeSinceStartFormatted = formatTimeSinceStart(timeSinceStartMs); 

      let distance = 0;
      if (i > 0) {
        const prevPoint = trackPoints[i - 1];
        distance = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
        cumulativeDistance += distance; 
      }

      let speed = 0;
      if (i > 0) {
        const prevPoint = trackPoints[i - 1];
        const timeDiff = (time - prevPoint.time) / 1000; 
        speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0; 
      }

      trackPoints.push({
        lat,
        lon,
        ele,
        time,
        power,
        cadence,
        timeSinceStart: timeSinceStartFormatted,
        distance: cumulativeDistance / 1000, 
        speed: speed.toFixed(2) 
      });
    }

    return trackPoints;
  };

  const formatTimeSinceStart = (timeMs) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const milliseconds = String(timeMs % 1000).padStart(3, '0');
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  const handleHighlightClick = () => {
    const threshold = parseInt(speedThreshold, 10);
    if (isNaN(threshold)) {
      alert('Please enter a valid number.');
      return;
    }

    const geojson = {
      type: 'FeatureCollection',
      features: trackPointsRef.current.map((point, index) => {
        const nextPoint = trackPointsRef.current[index + 1];
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: nextPoint ? [[point.lon, point.lat], [nextPoint.lon, nextPoint.lat]] : []
          },
          properties: {
            speed: parseFloat(point.speed),
          }
        };
      })
    };

    const lineLayer = mapRef.current.getLayer('gpx-route');
    if (lineLayer) {
      mapRef.current.removeLayer('gpx-route');
    }

    mapRef.current.addLayer({
      id: 'gpx-route',
      type: 'line',
      source: 'gpx-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': [
          'case',
          ['>', ['get', 'speed'], threshold],
          '#0000FF', // Blue for sections above the speed threshold
          '#FF0000'  // Red for sections below the speed threshold
        ],
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2,   // At zoom level 10, line width is 2 pixels
          14, 4,   // At zoom level 14, line width is 4 pixels
          18, 6    // At zoom level 18, line width is 6 pixels
        ]
      }
    });

    mapRef.current.getSource('gpx-route').setData(geojson);
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; 
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 

    return distance;
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
    drawRef.current.changeMode('draw_rectangle');
  };

  const deleteSelected = () => {
    drawRef.current.deleteAll();
    setSelectedPoints([]); 
    setSelectedRow(null); 
    if (markerRef.current) markerRef.current.remove(); 
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
