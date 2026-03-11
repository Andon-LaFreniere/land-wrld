import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [formData, setFormData] = useState({ title: '', notes: '' });

  const fetchPoints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/points');
      if (!response.ok) return;
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
      console.error('Backend offline? Error:', err);
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

    map.current.on('click', (e) => {
      setSelectedCoords(e.lngLat);
      setSidebarOpen(true);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPoint = {
      user_id: "andon_dev",
      title: formData.title,
      notes: formData.notes,
      lng: selectedCoords.lng,
      lat: selectedCoords.lat
    };

    try {
      const response = await fetch('http://localhost:5000/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoint)
      });

      if (response.ok) {
        setSidebarOpen(false);
        setFormData({ title: '', notes: '' });
        fetchPoints();
      }
    } catch (err) {
  console.error("Error saving point:", err); // Now it's used!
  alert("Check the console for the error details.");
}
  };

  return (
    <div className="relative w-screen h-screen">
      {/* THE MAP DIV */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* THE SIDEBAR */}
      {sidebarOpen && (
        <div className="absolute top-4 left-4 h-[calc(100%-2rem)] w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 z-10 flex flex-col border border-gray-100 transition-all">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">New Point</h2>
          <p className="text-[10px] text-gray-400 font-mono mb-6 uppercase tracking-widest">
            {selectedCoords?.lat.toFixed(4)}N / {selectedCoords?.lng.toFixed(4)}W
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Location Title</label>
              <input 
                className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                placeholder="Name your discovery..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
              <textarea 
                className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 h-40 resize-none"
                placeholder="What's the story here?"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button type="submit" className="bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-xl mt-auto">
              Save to Globe
            </button>
            
            <button 
              type="button" 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 text-xs font-bold hover:text-red-500 transition-colors py-2 uppercase tracking-tighter"
            >
              Discard
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;