import { gpx } from '@mapbox/togeojson';
import { calculateDistance } from './distanceCalculator'; // Import the distance calculation utility

/**
 * Fetches and parses GPX data from a file, adds it to the map, and processes track points.
 * @param {Object} map - The Mapbox map instance.
 * @param {Function} setSelectedPoints - State setter for selected points.
 * @param {Object} trackPointsRef - Reference to track points array.
 */
/**
 * Fetches and parses GPX data from a file, adds it to the map, and processes track points.
 * @param {Object} map - The Mapbox map instance.
 * @param {Function} callback - Callback function to update the state.
 * @param {Object} trackPointsRef - Reference to track points array.
 */
export const fetchGPXData = (map, callback, trackPointsRef) => {
  if (!map) return;

  // Check if the source already exists
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14,
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 2.5 });
  }

  fetch('/Early_morning_ride.gpx')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch GPX file: ${response.statusText}`);
      }
      return response.text();
    })
    .then((gpxData) => {
      const parser = new DOMParser();
      const gpxXml = parser.parseFromString(gpxData, 'application/xml');

      if (!gpxXml) {
        console.error('Failed to parse GPX XML');
        return;
      }

      const geojson = gpx(gpxXml);
      trackPointsRef.current = extractGPXData(gpxXml);

      // Update map with new GPX data
      if (map.getSource('gpx-route')) {
        map.getSource('gpx-route').setData(geojson);
      } else {
        map.addSource('gpx-route', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'gpx-route',
          type: 'line',
          source: 'gpx-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ff0000', 'line-width': 3 },
        });
      }

      callback(); // Call callback to update state
    })
    .catch((error) => console.error('Error fetching or processing GPX file:', error));
};

/**
 * Extracts track point data from the GPX XML.
 * @param {Object} gpxXml - The parsed GPX XML document.
 * @returns {Array} An array of track points with relevant data.
 */
export const extractGPXData = (gpxXml) => {
  const trackPoints = [];
  const trkpts = gpxXml.getElementsByTagName('trkpt');

  if (trkpts.length === 0) {
    console.error('No track points found in the GPX data');
    return trackPoints;
  }

  console.log(`Found ${trkpts.length} track points`); // Debug log

  let cumulativeDistance = 0;
  const startTimeText = trkpts[0].getElementsByTagName('time')[0]?.textContent;
  if (!startTimeText) {
    console.error('No start time found in the GPX data');
    return trackPoints;
  }
  const startTime = new Date(startTimeText);

  for (let i = 0; i < trkpts.length; i++) {
    const lat = parseFloat(trkpts[i].getAttribute('lat'));
    const lon = parseFloat(trkpts[i].getAttribute('lon'));
    const ele = parseFloat(trkpts[i].getElementsByTagName('ele')[0]?.textContent || 0);
    const timeText = trkpts[i].getElementsByTagName('time')[0]?.textContent;

    if (!timeText) {
      console.warn(`No time found for track point ${i}, skipping this point`);
      continue;
    }
    const time = new Date(timeText);

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

    console.log(`Parsed track point ${i}:`, trackPoints[trackPoints.length - 1]); // Debug log each track point
  }

  console.log('Final parsed track points:', trackPoints); // Debug log all track points
  return trackPoints;
};


/**
 * Formats time since the start of the ride.
 * @param {number} timeMs - Time in milliseconds since the start.
 * @returns {string} Formatted time as mm:ss:ms.
 */
export const formatTimeSinceStart = (timeMs) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const milliseconds = String(timeMs % 1000).padStart(3, '0');
  return `${minutes}:${seconds}:${milliseconds}`;
};

/**
 * Highlights sections on the map based on the speed threshold.
 * @param {Object} map - The Mapbox map instance.
 * @param {number} speedThreshold - The speed threshold for highlighting.
 * @param {Array} trackPoints - Array of track points.
 */
export const highlightSections = (map, speedThreshold, trackPoints) => {
  const threshold = parseInt(speedThreshold, 10);
  if (isNaN(threshold)) return;

  const geojson = {
    type: 'FeatureCollection',
    features: trackPoints.map((point, index) => {
      const nextPoint = trackPoints[index + 1];
      return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: nextPoint ? [[point.lon, point.lat], [nextPoint.lon, nextPoint.lat]] : [] },
        properties: { speed: parseFloat(point.speed) }
      };
    })
  };

  map.getSource('gpx-route').setData(geojson);

  map.addLayer({
    id: 'gpx-route-highlight',
    type: 'line',
    source: 'gpx-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': [
        'case',
        ['>', ['get', 'speed'], threshold],
        '#0000FF', // Blue for sections above the speed threshold
        '#FF0000'  // Red for sections below the speed threshold
      ],
      'line-width': 3
    }
  });
};
