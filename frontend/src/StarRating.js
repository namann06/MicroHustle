import React from "react";

export default function StarRating({ value }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span title={`Average rating: ${value?.toFixed(2) || 'N/A'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "text-yellow-400" : "text-gray-400"}>
          ★
        </span>
      ))}
      {value ? <span className="ml-1 text-xs text-white align-top">({value.toFixed(2)})</span> : null}
    </span>
  );
}
