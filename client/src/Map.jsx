import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // 1. Define the function FIRST
  const fetchPoints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/points');
      const points = await response.json();

      points.forEach((point) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${point.title}</h3><p>${point.notes}</p>`
        );

        new mapboxgl.Marker({ color: '#bb0000' })
          .setLngLat(point.geometry.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      });
    } catch (err) {
      console.error('Error fetching points:', err);
    }
  };

useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      projection: 'globe',
      center: [-83.0125, 40.0000], 
      zoom: 12
    });

    map.current.on('style.load', () => {
      map.current.setFog({});
      fetchPoints();
    });

    // --- ADD THIS CLICK LISTENER ---
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;

      // Simple prompts for data collection
      const title = prompt("Enter a title for this location:");
      if (!title) return; // Cancel if no title

      const notes = prompt("Enter some notes:");

      // Prepare the data
      const newPoint = {
        user_id: "andon_dev", // We'll swap this for Clerk later
        title: title,
        notes: notes,
        lng: lng,
        lat: lat
      };

      // Send it to your Node.js server
      try {
        const response = await fetch('http://localhost:5000/api/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPoint)
        });

        if (response.ok) {
          // Refresh the markers to show the new one immediately
          fetchPoints();
        }
      } catch (err) {
        console.error("Error saving point:", err);
      }
    });
    // -------------------------------

  }, []);

  return <div ref={mapContainer} style={{ width: '100vw', height: '100vh' }} />;
};

export default Map;