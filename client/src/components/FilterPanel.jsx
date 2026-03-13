import { useState } from 'react';

export default function FilterPanel({ user, onFilterChange }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    spot_type: '',
    mine: false,
    is_public: '',
    sort: 'newest'
  });

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const reset = { spot_type: '', mine: false, is_public: '', sort: 'newest' };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
      >
        {open ? '✕ Close' : '⚙ Filters'}
      </button>

      {/* Panel */}
      <div className={`absolute top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl z-10 flex flex-col p-6 gap-5 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <h2 className="text-xl font-bold text-gray-800 mt-10">Filter Spots</h2>

        {/* Spot Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">Spot Type</label>
          <select
            className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
            value={filters.spot_type}
            onChange={(e) => handleChange('spot_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="skatepark">Skatepark</option>
            <option value="street">Street Spot</option>
            <option value="diy">DIY</option>
            <option value="transition">Transition</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date Sort */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">Sort By</label>
          <select
            className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Logged in only filters */}
        {user && (
          <>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase">My Spots Only</label>
              <button
                onClick={() => handleChange('mine', !filters.mine)}
                className={`w-10 h-6 rounded-full transition-colors ${filters.mine ? 'bg-black' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${filters.mine ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Visibility</label>
              <select
                className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
                value={filters.is_public}
                onChange={(e) => handleChange('is_public', e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Public Only</option>
                <option value="false">My Private Spots</option>
              </select>
            </div>
          </>
        )}

        <button
          onClick={handleReset}
          className="mt-auto text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-tighter transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </>
  );
}