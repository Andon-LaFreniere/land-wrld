import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FilterPanel from './components/FilterPanel';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ user }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    spot_type: '',
    is_public:true
  });

  const fetchSpots = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.spot_type) params.append('spot_type', filters.spot_type);
      if (filters.mine) params.append('mine', 'true');
      if (filters.mine && user) params.append('user_id', user.id);

      if (filters.is_public === 'false' && user) {
        params.append('is_public', 'false');
        params.append('user_id', user.id);
      }

      if (filters.sort) params.append('sort', filters.sort);

      const response = await fetch(
        `http://localhost:3001/api/spots?${params.toString()}`
      );

      if (!response.ok) return;

      const spots = await response.json();

      // remove old markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      spots.forEach((spot) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; padding: 4px;">
            <h3 style="margin:0 0 4px;font-size:14px;font-weight:bold;">
              ${spot.title}
            </h3>
            <p style="margin:0 0 4px;font-size:12px;color:#666;">
              ${spot.description || ''}
            </p>
            <span style="font-size:11px;background:#000;color:#fff;padding:2px 8px;border-radius:99px;">
              ${spot.spot_type || 'unknown'}
            </span>
          </div>
        `);

        const marker = new mapboxgl.Marker({ color: '#bb0000' })
          .setLngLat([spot.longitude, spot.latitude])
          .setPopup(popup)
          .addTo(map.current);

        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          marker.togglePopup();
        });

        markersRef.current.push(marker);
      });

    } catch (err) {
      console.error('Error fetching spots:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-83.0125, 40.0],
        zoom: 12
      });

      map.current.on('style.load', () => {
        map.current.setProjection('globe');
        map.current.setFog({});
        fetchSpots();
      });
    }

    const handleClick = (e) => {
      if (!user) return;
      setSelectedCoords(e.lngLat);
      setSidebarOpen(true);
    };

    map.current.on('click', handleClick);

    return () => {
      map.current?.off('click', handleClick);
    };
  }, [user, fetchSpots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoords || !user) return;

    const newSpot = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      spot_type: formData.spot_type,
      is_public: formData.is_public
    };

    try {
      const response = await fetch('http://localhost:3001/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpot)
      });

      if (response.ok) {
        setSidebarOpen(false);
        setFormData({ title: '', description: '', spot_type: '' });
        fetchSpots();
      }
    } catch (err) {
      console.error('Error saving spot:', err);
    }
  };

  return (
    <div className="relative w-screen h-screen">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      <FilterPanel
        user={user}
        onFilterChange={(filters) => fetchSpots(filters)}
      />

      {sidebarOpen && (
        <div className="absolute top-4 left-4 h-[calc(100%-2rem)] w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 z-10 flex flex-col border border-gray-100 transition-all">

          <h2 className="text-2xl font-bold text-gray-800 mb-1">New Spot</h2>

          <p className="text-[10px] text-gray-400 font-mono mb-6 uppercase tracking-widest">
            {selectedCoords
              ? `${selectedCoords.lat.toFixed(4)}N / ${selectedCoords.lng.toFixed(4)}W`
              : ''}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Location Title
              </label>
              <input
                className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                placeholder="Name this spot..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Description
              </label>
              <textarea
                className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 h-40 resize-none"
                placeholder="What's the spot like?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Spot Type
              </label>
              <select
                className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                value={formData.spot_type}
                onChange={(e) =>
                  setFormData({ ...formData, spot_type: e.target.value })
                }
                required
              >
                <option value="">Select a type...</option>
                <option value="skatepark">Skatepark</option>
                <option value="street">Street Spot</option>
                <option value="diy">DIY</option>
                <option value="transition">Transition</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
  <label className="text-[10px] font-black text-gray-400 uppercase">Public Spot</label>
  <button
    type="button"
    onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
    className={`w-10 h-6 rounded-full transition-colors ${formData.is_public ? 'bg-black' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${formData.is_public ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
</div>

            <button
              type="submit"
              className="bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-xl mt-auto"
            >
              Save Spot
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