import React, { useState } from "react";

export default function RatingModal({ open, onClose, onSubmit, hustler, task }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose}>&#10005;</button>
        <h2 className="text-xl font-bold mb-2">Rate {hustler.username} for "{task.title}"</h2>
        <div className="flex items-center gap-2 mb-4">
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              className={star <= rating ? "text-yellow-500 text-2xl cursor-pointer" : "text-gray-300 text-2xl cursor-pointer"}
              onClick={() => setRating(star)}
              role="img"
              aria-label={star + " star"}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Optional comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={() => onSubmit(rating, comment)}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}
