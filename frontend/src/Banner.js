import React, { useState } from 'react';

function Banner({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  return (
    <div
    className="w-full min-h-screen flex flex-col items-center justify-center overflow-hidden p-0 m-0"
    style={{ background: '#101828' }}
  >
    {/* Full-screen vertical yellow lines */}
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ width: '100vw', height: '100vh' }}
    >
      <svg width="100vw" height="100vh" className="absolute top-0 left-0">
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x={`${(i / 25) * 220}%`}
            y="0"
            width="1"
            height="100%"
            fill="#FFD600"
            fillOpacity="0.1"
          />
        ))}
      </svg>
    </div>

    <div className="relative z-10 w-full px-0">
      <div className="bg-[#0c1425] px-8 py-6 rounded-none mb-4 bg-opacity-90 w-full">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center leading-tight mb-2 drop-shadow-lg">
          MICRO TASKS. REAL HUSTLERS.<br /> INSTANT COLLABORATION.
        </h1>
      </div>

      <div className="text-white text-center mb-6 text-lg w-full">
        Find tasks, offer skills, and build real-world projects together.
      </div>

      <form
  onSubmit={handleSubmit}
  className="flex w-full justify-center px-2"
>
  <div className="flex w-full max-w-sm mx-auto">
    <input
      type="text"
      placeholder="Search Gigs"
      className="rounded-l-full px-4 py-2 w-full text-sm focus:outline-none"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <button
      type="submit"
      className="bg-white rounded-r-full px-4 py-2 flex items-center justify-center"
    >
      <span role="img" aria-label="search" className="text-lg text-[#101828]">🔍</span>
    </button>
  </div>
</form>

    </div>
  </div>
  
  );
}
export default Banner;
