import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ value, size = "sm" }) {
  const rounded = Math.round(value * 2) / 2;
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className="flex items-center gap-1" title={`Average rating: ${value?.toFixed(2) || 'N/A'}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${sizeClasses[size]} ${
              star <= rounded 
                ? "text-yellow-500 fill-yellow-500" 
                : "text-neutral-300 dark:text-neutral-600"
            } transition-colors`}
          />
        ))}
      </div>
      {value && (
        <span className={`${textSizeClasses[size]} text-neutral-600 dark:text-neutral-400 font-medium`}>
          ({value.toFixed(1)})
        </span>
      )}
    </div>
  );
}