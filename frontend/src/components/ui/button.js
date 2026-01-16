import * as React from "react"

export function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
