import { gpx } from '@mapbox/togeojson';
import { calculateDistance } from './distanceCalculator'; // Import the distance calculation utility



export const fetchGPXData = (map, callback, trackPointsRef) => {
  console.error('inside fetchGPXData-1');

  const onMapLoaded = () => {
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });

      map.setTerrain({ source: 'mapbox-dem', exaggeration: 2.5 });
    }

    console.error('inside fetchGPXData-2');

    // Fetch the GPX data
    fetch('/Early_morning_ride.gpx')
      .then((response) => response.text())
      .then((gpxData) => {
        const parser = new DOMParser();
        const gpxXml = parser.parseFromString(gpxData, 'application/xml');
        const geojson = gpx(gpxXml);

        // Extract track point data
        trackPointsRef.current = extractGPXData(gpxXml);

        if (!map.getSource('gpx-route')) {
          map.addSource('gpx-route', { type: 'geojson', data: geojson });

          map.addLayer({
            id: 'gpx-route',
            type: 'line',
            source: 'gpx-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#ff0000', 'line-width': 3 },
          });
        } else {
          // If source already exists, update it
          map.getSource('gpx-route').setData(geojson);
        }

        console.log('GPX data loaded and added to map.');
        callback();
      })
      .catch((error) => {
        console.error('Error loading GPX data:', error);
      });
  };

  // Check if the map is already loaded
  if (map.isStyleLoaded()) {
    onMapLoaded(); // Run the logic immediately if already loaded
  } else {
    map.on('load', onMapLoaded); // Otherwise, wait for the load event
  }
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
