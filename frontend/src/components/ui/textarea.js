import * as React from "react"

export const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full bg-transparent border-0 outline-none resize-none text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none text-base ${className}`}
    {...props}
  />
))
Textarea.displayName = "Textarea"
