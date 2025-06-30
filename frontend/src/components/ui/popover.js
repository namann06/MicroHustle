import * as React from "react"

export function Popover({ open, onOpenChange, children }) {
  // Only render PopoverContent when open is true
  // Pass onOpenChange to PopoverTrigger and PopoverContent via context
  const trigger = React.Children.toArray(children).find(
    child => child.type && child.type.displayName === 'PopoverTrigger'
  );
  const content = React.Children.toArray(children).find(
    child => child.type && child.type.displayName === 'PopoverContent'
  );
  return (
    <div className="relative">
      {trigger && React.cloneElement(trigger, { onOpenChange })}
      {open && content && React.cloneElement(content, { onOpenChange })}
    </div>
  );
}

export function PopoverTrigger({ asChild, children }) {
  return asChild ? children : <button>{children}</button>;
}

export function PopoverContent({ children, ...props }) {
  return (
    <div className="absolute z-10 bg-white shadow-md rounded-md p-4 mt-2" {...props}>
      {children}
    </div>
  );
}
