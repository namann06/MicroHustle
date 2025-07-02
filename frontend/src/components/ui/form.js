import * as React from "react"
import { Controller } from "react-hook-form"

export function Form({ children, ...props }) {
  // Only pass DOM props to <form>
  const { action, method, onSubmit, className, style } = props;
  return (
    <form action={action} method={method} onSubmit={onSubmit} className={className} style={style}>
      {children}
    </form>
  );
}

export function FormField({ name, control, render }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  )
}

export function FormItem({ children, ...props }) {
  return <div className="space-y-2" {...props}>{children}</div>
}

export function FormLabel({ children, ...props }) {
  return <label className="font-medium" {...props}>{children}</label>
}

export function FormControl({ children, ...props }) {
  return <div {...props}>{children}</div>
}

export function FormMessage({ children, ...props }) {
  return <div className="text-red-600 text-sm" {...props}>{children}</div>
}

export function FormDescription({ children, ...props }) {
  return <div className="text-gray-500 text-xs" {...props}>{children}</div>
}
