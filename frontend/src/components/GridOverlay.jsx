import React from "react";

export default function GridOverlay({ show }) {
  if (!show) return null;

  // IMPORTANT: Must match the logic in App.js gridClick (6x6)
  const cols = 6;
  const rows = 6;
  const total = cols * rows;

  return (
    <div
      id="grid-overlay"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2147483647, // Max Z-Index to force it on top of iframe/modals
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          // High contrast: Thick Red Border
          className="border-2 border-red-600 flex items-center justify-center pointer-events-none bg-red-500/10"
        >
          {/* Number Badge */}
          <span className="bg-white text-red-700 font-extrabold px-3 py-1 rounded shadow-lg text-3xl border-2 border-red-600 z-50">
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
