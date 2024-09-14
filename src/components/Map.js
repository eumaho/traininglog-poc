import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { gpx } from '@mapbox/togeojson';
import { fetchGPXData, highlightSections } from '../utils/gpxParser';
import { calculateDistance } from '../utils/distanceCalculator';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhvYmxlIiwiYSI6ImNtMHdiNmp1dDBiZHAyanB3eGFsOHVxejAifQ.rw5lt1bT5x0av6vyKh1lbQ';

const Map = ({ speedThreshold, setSelectedPoints, selectedRow, setSelectedRow }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  const markerRef = useRef(null); 

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

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (speedThreshold) {
      highlightSections(mapRef.current, speedThreshold, trackPointsRef.current);
    }
  }, [speedThreshold]);

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

  return <div ref={mapContainerRef} className="map-container" />;
};

export default Map;
