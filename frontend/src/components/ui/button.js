import * as React from "react"

export function Button({ className = "", ...props }) {
  return (
    <button
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition ${className}`}
      {...props}
    />
  )
}
