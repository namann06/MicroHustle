import React, { useState } from 'react';

function Banner({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#101828' }}
    >
      {/* Vertical yellow lines background */}
      <div
        className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          {[...Array(12)].map((_, i) => (
            <rect
              key={i}
              x={`${(i / 18) * 150}%`}
              y="0"
              width="1"
              height="100%"
              fill="#FFD600"
              fillOpacity="0.08"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-4">
        <div className="bg-[#0c1425] px-8 py-6 rounded mb-2 bg-opacity-90 w-full max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center leading-tight mb-2 drop-shadow-lg">
          MICRO TASKS. REAL HUSTLERS.<br /> INSTANT COLLABORATION.
          </h1>
        </div>

        <div className="text-white text-center mb-6 text-lg">
        Find tasks, offer skills, and build real-world projects together.
        </div>

        <form onSubmit={handleSubmit} className="flex justify-center w-full max-w-xl">
          <input
            type="text"
            placeholder="Search Gigs"
            className="rounded-l-full px-6 py-3 w-full text-lg focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="bg-white rounded-r-full px-5 flex items-center justify-center"
          >
            <span role="img" aria-label="search" className="text-xl text-[#101828]">🔍</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Banner;
